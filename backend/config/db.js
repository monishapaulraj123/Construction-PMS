import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { runAutoSeed } from './autoSeed.js'

dotenv.config()

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'construction_realestate_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  }
}

const pool = mysql.createPool(poolConfig)

// Quick connection test helper and schema auto-migration
export async function testConnection() {
  let connection
  try {
    connection = await pool.getConnection()
    console.log(`[Database] Connected successfully to MySQL database '${process.env.DB_NAME || 'construction_realestate_db'}'`)

    // 1. Ensure google_id and avatar columns exist in users table
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN google_id VARCHAR(255) UNIQUE NULL AFTER phone,
        ADD COLUMN avatar VARCHAR(255) NULL AFTER google_id
      `)
      console.log('[Database Schema] Added google_id and avatar columns to users table')
    } catch (e) {
      // Columns may already exist (e.g., ER_DUP_FIELDNAME)
    }

    // 2. Ensure password_hash allows NULL for OAuth users
    try {
      await connection.query(`ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL`)
    } catch (e) {
      // Ignore if already nullable
    }

    // 3. Ensure recently_accessed table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recently_accessed (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(100) NOT NULL,
        resource_name VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL,
        accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY user_resource_unique (user_id, resource_type, resource_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('[Database Schema] Verified recently_accessed table')

    // 4. Ensure notifications table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('[Database Schema] Verified notifications table')

    // 5. Run automatic idempotent database seeding for initial dataset
    await runAutoSeed()

    return true
  } catch (err) {
    console.error('[Database Connection Error]', err.message)
    return false
  } finally {
    if (connection) {
      try { connection.release() } catch (e) {}
    }
  }
}

export default pool
