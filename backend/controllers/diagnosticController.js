import dns from 'dns'
import net from 'net'
import mysql from 'mysql2/promise'
import { poolConfig } from '../config/db.js'

/**
 * Middleware to protect diagnostic endpoints with a secret token
 * stored in process.env.DB_DIAGNOSTIC_TOKEN.
 * Never hardcodes or exposes the token.
 */
export function verifyDiagnosticToken(req, res, next) {
  const configuredToken = process.env.DB_DIAGNOSTIC_TOKEN ? process.env.DB_DIAGNOSTIC_TOKEN.trim() : null

  if (!configuredToken) {
    return res.status(403).json({
      success: false,
      error: 'Diagnostic endpoint disabled: DB_DIAGNOSTIC_TOKEN environment variable is not configured.',
      code: 'DIAGNOSTIC_TOKEN_NOT_CONFIGURED',
      hint: 'Configure DB_DIAGNOSTIC_TOKEN in Render environment variables to enable this endpoint.'
    })
  }

  // Accept token from 'x-diagnostic-token' header, 'Authorization: Bearer <token>', or '?token=' query parameter
  const authHeader = req.headers['authorization']
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null
  const headerToken = req.headers['x-diagnostic-token'] ? String(req.headers['x-diagnostic-token']).trim() : null
  const queryToken = req.query.token ? String(req.query.token).trim() : null

  const providedToken = headerToken || bearerToken || queryToken

  if (!providedToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Diagnostic token required.',
      code: 'TOKEN_REQUIRED',
      hint: 'Pass token via x-diagnostic-token header, Authorization: Bearer <token>, or ?token=<token>'
    })
  }

  if (providedToken !== configuredToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid diagnostic token.',
      code: 'INVALID_TOKEN'
    })
  }

  next()
}

/**
 * Helper to sanitize error messages so that credentials/passwords are never leaked
 */
function sanitizeErrorMessage(msg) {
  if (!msg) return 'Unknown error'
  // Remove password patterns like :password@ or password=xyz
  return String(msg)
    .replace(/(:)([^:@/]+)(@)/g, '$1***$3')
    .replace(/(password=)([^;&\s]+)/gi, '$1***')
}

/**
 * Check 1: DNS Resolution
 */
async function checkDns(host) {
  const startTime = Date.now()
  try {
    const addresses = await dns.promises.lookup(host, { all: true })
    const durationMs = Date.now() - startTime
    return {
      status: 'PASSED',
      duration_ms: durationMs,
      resolved_addresses: addresses.map((a) => ({
        address: a.address,
        family: a.family === 6 ? 'IPv6' : 'IPv4',
      })),
    }
  } catch (err) {
    const durationMs = Date.now() - startTime
    return {
      status: 'FAILED',
      duration_ms: durationMs,
      error_code: err.code || 'DNS_LOOKUP_FAILED',
      message: sanitizeErrorMessage(err.message),
    }
  }
}

/**
 * Check 2: Raw TCP Socket Connectivity
 */
async function checkTcp(host, port, timeoutMs = 5000) {
  const startTime = Date.now()
  return new Promise((resolve) => {
    const socket = new net.Socket()
    let resolved = false

    socket.setTimeout(timeoutMs)

    socket.on('connect', () => {
      if (resolved) return
      resolved = true
      const durationMs = Date.now() - startTime
      socket.destroy()
      resolve({
        status: 'PASSED',
        duration_ms: durationMs,
        message: `TCP socket successfully established to ${host}:${port}`,
      })
    })

    socket.on('timeout', () => {
      if (resolved) return
      resolved = true
      const durationMs = Date.now() - startTime
      socket.destroy()
      resolve({
        status: 'FAILED',
        duration_ms: durationMs,
        error_code: 'ETIMEDOUT',
        message: `TCP socket connection timed out after ${timeoutMs}ms`,
      })
    })

    socket.on('error', (err) => {
      if (resolved) return
      resolved = true
      const durationMs = Date.now() - startTime
      socket.destroy()
      resolve({
        status: 'FAILED',
        duration_ms: durationMs,
        error_code: err.code || 'TCP_CONNECT_FAILED',
        message: sanitizeErrorMessage(err.message),
      })
    })

    socket.connect(port, host)
  })
}

/**
 * Check 3 & 4: MySQL TLS Handshake, Authentication, and Database Accessibility
 * STRICTLY READ-ONLY. NO WRITE OPERATIONS.
 */
async function checkMySQL(config, timeoutMs = 6000) {
  const startTime = Date.now()
  let connection
  try {
    const connConfig = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl,
      connectTimeout: timeoutMs,
    }

    connection = await mysql.createConnection(connConfig)
    const handshakeDurationMs = Date.now() - startTime

    // 1. Basic Ping & Server Metadata (Read-Only)
    const [pingResult] = await connection.query(
      `SELECT 1 AS ping, CURRENT_TIMESTAMP() AS server_time, VERSION() AS mysql_version, DATABASE() AS current_database`
    )

    // 2. Count Tables in Schema (Read-Only)
    const [tableCountRows] = await connection.query(
      `SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()`
    )

    // 3. Inspect Specific Inventory & Procurement Tables (Read-Only)
    const [tablesList] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN ('items', 'item_categories', 'suppliers', 'inventory_transactions', 'material_allocations', 'users')
    `)

    let itemCount = null
    const hasItemsTable = tablesList.some((t) => t.TABLE_NAME === 'items')
    if (hasItemsTable) {
      try {
        const [itemRows] = await connection.query(`SELECT COUNT(*) as cnt FROM items`)
        itemCount = itemRows[0]?.cnt ?? 0
      } catch (e) {
        itemCount = `Query error: ${e.message}`
      }
    }

    await connection.end()

    return {
      authentication: {
        status: 'PASSED',
        duration_ms: handshakeDurationMs,
        message: 'MySQL TLS handshake and authentication succeeded',
      },
      database_access: {
        status: 'PASSED',
        current_database: pingResult[0]?.current_database || config.database,
        server_time: pingResult[0]?.server_time,
        mysql_version: pingResult[0]?.mysql_version,
        total_tables_in_schema: tableCountRows[0]?.count || 0,
        detected_target_tables: tablesList.map((t) => t.TABLE_NAME),
        items_record_count: itemCount,
      },
    }
  } catch (err) {
    const durationMs = Date.now() - startTime
    if (connection) {
      try {
        await connection.end()
      } catch (e) {}
    }

    return {
      authentication: {
        status: 'FAILED',
        duration_ms: durationMs,
        error_code: err.code || 'MYSQL_AUTH_FAILED',
        message: sanitizeErrorMessage(err.message),
      },
      database_access: {
        status: 'FAILED',
        error_code: err.code || 'DATABASE_INACCESSIBLE',
        message: `Database check failed: ${sanitizeErrorMessage(err.message)}`,
      },
    }
  }
}

/**
 * Controller: GET /api/diagnostics/database
 */
export async function getDatabaseDiagnostics(req, res) {
  try {
    const host = poolConfig.host
    const port = poolConfig.port

    // Sanitized configuration view (NEVER return password or connection string)
    const sanitizedConfig = {
      host: poolConfig.host,
      port: poolConfig.port,
      database: poolConfig.database,
      user: poolConfig.user,
      has_password: Boolean(poolConfig.password && poolConfig.password.length > 0),
      ssl_enabled: Boolean(poolConfig.ssl),
      ssl_reject_unauthorized: poolConfig.ssl ? poolConfig.ssl.rejectUnauthorized : null,
    }

    // Run Check 1: DNS Resolution
    const dnsResult = await checkDns(host)

    // Run Check 2: TCP Connectivity
    let tcpResult
    if (dnsResult.status === 'PASSED') {
      tcpResult = await checkTcp(host, port)
    } else {
      tcpResult = {
        status: 'SKIPPED',
        reason: `Skipped because DNS resolution failed with ${dnsResult.error_code}`,
      }
    }

    // Run Check 3 & 4: MySQL Authentication and Database Accessibility
    let mysqlResult
    if (dnsResult.status === 'PASSED' && tcpResult.status === 'PASSED') {
      mysqlResult = await checkMySQL(poolConfig)
    } else {
      mysqlResult = {
        authentication: {
          status: 'SKIPPED',
          reason: dnsResult.status !== 'PASSED' ? 'DNS resolution failed' : 'TCP connectivity failed',
        },
        database_access: {
          status: 'SKIPPED',
          reason: dnsResult.status !== 'PASSED' ? 'DNS resolution failed' : 'TCP connectivity failed',
        },
      }
    }

    // Compute Overall Verdict
    let overallStatus = 'HEALTHY'
    let rootCause = null
    let recommendation = 'Database connection and schema access verified successfully.'

    if (dnsResult.status === 'FAILED') {
      overallStatus = 'OFFLINE_DNS_FAILURE'
      rootCause = `DNS Host Unresolvable (${dnsResult.error_code})`
      recommendation = `The configured database hostname '${host}' cannot be resolved through DNS. Verify that your Aiven MySQL service is Powered ON in the Aiven Console.`
    } else if (tcpResult.status === 'FAILED') {
      overallStatus = 'OFFLINE_TCP_FAILURE'
      rootCause = `TCP Port Unreachable (${tcpResult.error_code})`
      recommendation = `Cannot establish a TCP socket to ${host}:${port}. Verify firewall / network rules and verify the active port in Aiven Console.`
    } else if (mysqlResult.authentication?.status === 'FAILED') {
      overallStatus = 'AUTH_OR_TLS_FAILURE'
      rootCause = `MySQL Handshake Error (${mysqlResult.authentication.error_code})`
      recommendation = `TCP succeeded but MySQL handshake or credentials failed. Verify DB_USER, DB_PASSWORD, and DB_SSL configuration.`
    } else if (mysqlResult.database_access?.status === 'FAILED') {
      overallStatus = 'DATABASE_ACCESS_FAILURE'
      rootCause = `Database Schema Error (${mysqlResult.database_access.error_code})`
      recommendation = `Authenticated, but schema '${poolConfig.database}' is inaccessible. Verify DB_NAME.`
    }

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      endpoint: '/api/diagnostics/database',
      service: 'Construction PMS Production Database Diagnostic',
      sanitized_configuration: sanitizedConfig,
      diagnostic_checks: {
        dns_resolution: dnsResult,
        tcp_connectivity: tcpResult,
        mysql_authentication: mysqlResult.authentication,
        database_accessibility: mysqlResult.database_access,
      },
      verdict: {
        overall_status: overallStatus,
        is_database_connected: overallStatus === 'HEALTHY',
        root_cause: rootCause,
        recommendation: recommendation,
      },
    })
  } catch (error) {
    console.error('[Diagnostic Endpoint Error]', error)
    return res.status(500).json({
      success: false,
      error: 'Unexpected error executing database diagnostics: ' + sanitizeErrorMessage(error.message),
      code: 'DIAGNOSTIC_EXECUTION_ERROR',
    })
  }
}
