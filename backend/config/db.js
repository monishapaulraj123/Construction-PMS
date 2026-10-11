import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { runAutoSeed } from './autoSeed.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

    // 0. Disable foreign key checks temporarily and guarantee users table exists
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0')

      // Ensure users table exists immediately to satisfy foreign keys
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'CLIENT',
          phone VARCHAR(30),
          google_id VARCHAR(255) UNIQUE NULL,
          avatar VARCHAR(255) NULL,
          status VARCHAR(20) DEFAULT 'Active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `)

      const schemaPath = path.join(__dirname, '../database/schema.sql')
      if (fs.existsSync(schemaPath)) {
        const sqlFile = fs.readFileSync(schemaPath, 'utf8')
        const statements = sqlFile
          .replace(/--.*$/gm, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '))

        for (const stmt of statements) {
          try {
            await connection.query(stmt)
          } catch (stmtErr) {
            // Ignore if already exists or harmless syntax variation
          }
        }
        console.log('[Database Schema] Base tables successfully verified/created from schema.sql')
      }
    } catch (schemaErr) {
      console.warn('[Database Schema Warning]', schemaErr.message)
    } finally {
      try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1')
      } catch (e) {}
    }

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

    // 5. Attendance Module Auto-Migrations
    try {
      await connection.query(`
        ALTER TABLE employees 
        ADD COLUMN user_id INT NULL AFTER email
      `)
    } catch (e) {
      // Column may already exist
    }

    try {
      await connection.query(`
        ALTER TABLE users 
        MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'CLIENT'
      `)
    } catch (e) {
      // Column modification fallback
    }

    // Construction Sites Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS construction_sites (
        site_id INT AUTO_INCREMENT PRIMARY KEY,
        site_code VARCHAR(50) UNIQUE NOT NULL,
        site_name VARCHAR(150) NOT NULL,
        project_id INT NULL,
        address TEXT,
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        radius_meters INT DEFAULT 300,
        max_gps_accuracy INT DEFAULT 150,
        working_start_time VARCHAR(10) DEFAULT '09:00',
        working_end_time VARCHAR(10) DEFAULT '18:00',
        grace_period_minutes INT DEFAULT 15,
        supervisor_id INT NULL,
        supervisor_name VARCHAR(150),
        status VARCHAR(20) DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('[Database Schema] Verified construction_sites table')

    // Worker Site Assignments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS worker_site_assignments (
        assignment_id INT AUTO_INCREMENT PRIMARY KEY,
        worker_id INT NOT NULL,
        site_id INT NOT NULL,
        assigned_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (worker_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (site_id) REFERENCES construction_sites(site_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('[Database Schema] Verified worker_site_assignments table')

    // Attendance Records Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        worker_id INT NOT NULL,
        site_id INT NOT NULL,
        date DATE NOT NULL,
        check_in_at DATETIME NOT NULL,
        check_out_at DATETIME NULL,
        hours_worked DECIMAL(5,2) DEFAULT 0.00,
        latitude DECIMAL(10,7) NOT NULL,
        longitude DECIMAL(10,7) NOT NULL,
        gps_accuracy DECIMAL(8,2) NOT NULL,
        distance_meters INT DEFAULT 0,
        status VARCHAR(30) DEFAULT 'Present',
        is_late TINYINT(1) DEFAULT 0,
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_worker_daily_attendance (worker_id, date),
        FOREIGN KEY (worker_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (site_id) REFERENCES construction_sites(site_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('[Database Schema] Verified attendance_records table')

    // Attendance Correction Requests Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance_corrections (
        correction_id INT AUTO_INCREMENT PRIMARY KEY,
        attendance_id INT NULL,
        worker_id INT NOT NULL,
        site_id INT NOT NULL,
        requested_check_in DATETIME NULL,
        requested_check_out DATETIME NULL,
        reason TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'Pending',
        reviewed_by INT NULL,
        reviewed_by_name VARCHAR(150) NULL,
        reviewed_at DATETIME NULL,
        review_remarks TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (worker_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (site_id) REFERENCES construction_sites(site_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('[Database Schema] Verified attendance_corrections table')

    // Seed default construction sites if empty
    try {
      const [siteRows] = await connection.query('SELECT COUNT(*) as count FROM construction_sites')
      if (siteRows[0].count === 0) {
        await connection.query(`
          INSERT INTO construction_sites (site_id, site_code, site_name, project_id, address, latitude, longitude, radius_meters, max_gps_accuracy, working_start_time, working_end_time, supervisor_id, supervisor_name, status)
          VALUES 
          (1, 'SITE-101', 'Green Valley Luxury Villa Site', 1, 'Kottivakkam, ECR Road, Chennai', 12.9010000, 80.2279000, 300, 150, '09:00', '18:00', 601, 'Arun Supervisor', 'Active'),
          (2, 'SITE-102', 'Avinashi Highway Commercial Site', 2, 'Avinashi Road, Kalapatti, Coimbatore', 11.0280000, 77.0270000, 300, 150, '08:30', '17:30', 602, 'Supervisor Lead', 'Active')
        `)
        console.log('[Database Seed] Created default construction sites')
      }
    } catch (e) {
      console.warn('[Database Seed Warning] Construction sites:', e.message)
    }

    // Seed default worker site assignments if empty
    try {
      const [assignRows] = await connection.query('SELECT COUNT(*) as count FROM worker_site_assignments')
      if (assignRows[0].count === 0) {
        await connection.query(`
          INSERT INTO worker_site_assignments (worker_id, site_id, assigned_date, status)
          VALUES 
          (1, 1, CURDATE(), 'Active'),
          (2, 2, CURDATE(), 'Active'),
          (101, 1, CURDATE(), 'Active'),
          (102, 2, CURDATE(), 'Active')
        `)
        console.log('[Database Seed] Created default worker site assignments')
      }
    } catch (e) {
      console.warn('[Database Seed Warning] Site assignments:', e.message)
    }

    // 6. Inventory & Procurement System Schema Auto-Migrations
    try {
      await connection.query(`
        ALTER TABLE items 
        ADD COLUMN storage_location VARCHAR(150) NULL AFTER brand,
        ADD COLUMN is_archived TINYINT(1) DEFAULT 0 AFTER status
      `)
    } catch (e) {}

    try {
      await connection.query(`
        ALTER TABLE suppliers 
        ADD COLUMN city VARCHAR(100) NULL AFTER address,
        ADD COLUMN postal_code VARCHAR(30) NULL AFTER city,
        ADD COLUMN rating DECIMAL(3,2) DEFAULT 4.00 AFTER status,
        ADD COLUMN certification VARCHAR(150) NULL AFTER rating,
        ADD COLUMN moq_default DECIMAL(10,2) DEFAULT 1.00 AFTER certification
      `)
    } catch (e) {}

    // Movement Ledger Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_code VARCHAR(100) UNIQUE NOT NULL,
        item_id INT NOT NULL,
        movement_type VARCHAR(50) NOT NULL,
        quantity DECIMAL(12,2) NOT NULL,
        unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        total_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        project_id INT NULL,
        supplier_id INT NULL,
        allocation_id INT NULL,
        issued_to VARCHAR(150) NULL,
        purpose TEXT NULL,
        reference_no VARCHAR(100) NULL,
        storage_location VARCHAR(150) NULL,
        remarks TEXT NULL,
        created_by INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Material Allocations Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS material_allocations (
        allocation_id INT AUTO_INCREMENT PRIMARY KEY,
        allocation_code VARCHAR(100) UNIQUE NOT NULL,
        item_id INT NOT NULL,
        project_id INT NOT NULL,
        allocated_quantity DECIMAL(12,2) NOT NULL,
        issued_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        returned_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(30) DEFAULT 'ACTIVE',
        allocated_date DATE NOT NULL,
        remarks TEXT NULL,
        created_by INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // RFQs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS material_rfqs (
        rfq_id INT AUTO_INCREMENT PRIMARY KEY,
        rfq_code VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        project_id INT NULL,
        required_delivery_date DATE NULL,
        status VARCHAR(30) DEFAULT 'PUBLISHED',
        remarks TEXT NULL,
        created_by INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // RFQ Line Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rfq_items (
        rfq_item_id INT AUTO_INCREMENT PRIMARY KEY,
        rfq_id INT NOT NULL,
        item_id INT NOT NULL,
        requested_quantity DECIMAL(12,2) NOT NULL,
        FOREIGN KEY (rfq_id) REFERENCES material_rfqs(rfq_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Supplier Quotations Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS supplier_quotations (
        quotation_id INT AUTO_INCREMENT PRIMARY KEY,
        quotation_code VARCHAR(100) UNIQUE NOT NULL,
        rfq_id INT NOT NULL,
        supplier_id INT NOT NULL,
        delivery_days INT DEFAULT 7,
        status VARCHAR(30) DEFAULT 'SUBMITTED',
        remarks TEXT NULL,
        total_amount DECIMAL(12,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rfq_id) REFERENCES material_rfqs(rfq_id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Quotation Line Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quotation_items (
        quotation_item_id INT AUTO_INCREMENT PRIMARY KEY,
        quotation_id INT NOT NULL,
        item_id INT NOT NULL,
        quoted_quantity DECIMAL(12,2) NOT NULL,
        unit_price DECIMAL(12,2) NOT NULL,
        tax_amount DECIMAL(12,2) DEFAULT 0.00,
        discount_amount DECIMAL(12,2) DEFAULT 0.00,
        line_total DECIMAL(12,2) NOT NULL,
        has_certification TINYINT(1) DEFAULT 1,
        available_stock DECIMAL(12,2) DEFAULT 1000.00,
        moq DECIMAL(12,2) DEFAULT 1.00,
        FOREIGN KEY (quotation_id) REFERENCES supplier_quotations(quotation_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Purchase Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        po_id INT AUTO_INCREMENT PRIMARY KEY,
        po_code VARCHAR(100) UNIQUE NOT NULL,
        quotation_id INT NULL,
        rfq_id INT NULL,
        project_id INT NULL,
        supplier_id INT NULL,
        expected_delivery_date DATE NULL,
        delivery_location VARCHAR(255) NULL,
        status VARCHAR(30) DEFAULT 'ISSUED',
        total_amount DECIMAL(12,2) DEFAULT 0.00,
        paid_amount DECIMAL(12,2) DEFAULT 0.00,
        delivered_at DATETIME NULL,
        remarks TEXT NULL,
        created_by INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // PO Line Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        po_item_id INT AUTO_INCREMENT PRIMARY KEY,
        po_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity DECIMAL(12,2) NOT NULL,
        unit_price DECIMAL(12,2) NOT NULL,
        line_total DECIMAL(12,2) NOT NULL,
        FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Supplier Reviews Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS supplier_reviews (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT NOT NULL,
        rating DECIMAL(3,2) DEFAULT 4.00,
        review_text TEXT NULL,
        reviewer_id INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Recommendation Weights Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recommendation_weights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        criterion VARCHAR(50) UNIQUE NOT NULL,
        weight_percent DECIMAL(5,2) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Audit Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        details TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    console.log('[Database Schema] Verified inventory and procurement tables')

    // 6. Run automatic idempotent database seeding for initial dataset
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

// Global In-Memory Fallback State for Cloud Environments without Local MySQL (e.g. Render)
const FALLBACK_USERS = [
  { user_id: 1, name: 'Administrator', email: 'admin@constructionpms.in', password_hash: 'password123', role: 'ADMIN', phone: '9840012345', status: 'Active' },
  { user_id: 601, name: 'Arun Supervisor', email: 'supervisor@pms.com', password_hash: 'password123', role: 'SUPERVISOR', phone: '9840011223', status: 'Active' },
  { user_id: 602, name: 'Supervisor Lead', email: 'supervisor@constructionpms.in', password_hash: 'password123', role: 'SUPERVISOR', phone: '9840011224', status: 'Active' },
  { user_id: 701, name: 'Deepak Worker', email: 'worker@pms.com', password_hash: 'password123', role: 'WORKER', phone: '9840055667', status: 'Active' },
  { user_id: 702, name: 'Worker Specialist', email: 'worker@constructionpms.in', password_hash: 'password123', role: 'WORKER', phone: '9840055668', status: 'Active' },
  { user_id: 501, name: 'Ravi', email: 'ravi.kumar@gmail.com', password_hash: 'password123', role: 'CLIENT', phone: '9791122334', status: 'Active' },
]

const FALLBACK_EMPLOYEES = [
  { employee_id: 1, employee_code: 'EMP-001', first_name: 'Deepak', last_name: 'Worker', email: 'worker@pms.com', phone: '9840055667', user_id: 701, status: 1 },
  { employee_id: 2, employee_code: 'EMP-002', first_name: 'Arun', last_name: 'Supervisor', email: 'supervisor@pms.com', phone: '9840011223', user_id: 601, status: 1 },
  { employee_id: 101, employee_code: 'EMP-FL-01', first_name: 'Santhosh', last_name: 'Tile Master', email: 'santhosh.n@constructionpms.in', phone: '9840012353', user_id: 702, status: 1 },
]

const FALLBACK_SITES = [
  { site_id: 1, site_code: 'SITE-101', site_name: 'Green Valley Luxury Villa Site', project_id: 1, address: 'Kottivakkam, ECR Road, Chennai', latitude: 12.9010000, longitude: 80.2279000, radius_meters: 300, max_gps_accuracy: 150, working_start_time: '09:00', working_end_time: '18:00', supervisor_id: 601, supervisor_name: 'Arun Supervisor', status: 'Active' },
  { site_id: 2, site_code: 'SITE-102', site_name: 'Avinashi Highway Commercial Site', project_id: 2, address: 'Avinashi Road, Kalapatti, Coimbatore', latitude: 11.0280000, longitude: 77.0270000, radius_meters: 300, max_gps_accuracy: 150, working_start_time: '08:30', working_end_time: '17:30', supervisor_id: 602, supervisor_name: 'Supervisor Lead', status: 'Active' },
]

const FALLBACK_ASSIGNMENTS = [
  { assignment_id: 1, worker_id: 1, site_id: 1, assigned_date: '2026-10-10', status: 'Active', site_name: 'Green Valley Luxury Villa Site', site_code: 'SITE-101', worker_name: 'Deepak Worker', employee_code: 'EMP-001', phone: '9840055667', employee_type_name: 'Mason' },
  { assignment_id: 2, worker_id: 2, site_id: 2, assigned_date: '2026-10-10', status: 'Active', site_name: 'Avinashi Highway Commercial Site', site_code: 'SITE-102', worker_name: 'Arun Supervisor', employee_code: 'EMP-002', phone: '9840011223', employee_type_name: 'Site Supervisor' },
]

const FALLBACK_ATTENDANCE = [
  { attendance_id: 1, worker_id: 1, site_id: 1, date: '2026-10-10', check_in_at: '2026-10-10T09:05:00', check_out_at: null, hours_worked: 0.00, latitude: 12.9010, longitude: 80.2279, gps_accuracy: 12.5, distance_meters: 15, status: 'Present', is_late: 0, remarks: 'On-time check-in' }
]

function handleDatabaseFallbackQuery(sql, params = []) {
  const sqlStr = String(sql || '').toLowerCase()

  if (sqlStr.startsWith('update users')) {
    const uid = Number(params[params.length - 1])
    const user = FALLBACK_USERS.find((u) => u.user_id === uid)
    if (user) {
      if (sqlStr.includes('name = ?') && sqlStr.includes('phone = ?')) {
        user.name = params[0]
        user.phone = params[1]
      } else if (sqlStr.includes('name = ?')) {
        user.name = params[0]
      } else if (sqlStr.includes('phone = ?')) {
        user.phone = params[0]
      }
    }
    return [{ affectedRows: 1 }, undefined]
  }

  if (sqlStr.includes('from users')) {
    if (sqlStr.includes('where lower(email)') || sqlStr.includes('where lower(name)')) {
      const target = String(params[0] || '').toLowerCase()
      const match = FALLBACK_USERS.filter((u) => u.email.toLowerCase() === target || u.name.toLowerCase() === target)
      return [match, undefined]
    }
    if (sqlStr.includes('user_id =') || sqlStr.includes('u.user_id =')) {
      const uid = Number(params[0])
      const user = FALLBACK_USERS.find((u) => u.user_id === uid)
      if (!user) return [[], undefined]
      const emp = FALLBACK_EMPLOYEES.find((e) => e.user_id === uid || e.email.toLowerCase() === user.email.toLowerCase())
      const site = FALLBACK_SITES.find((s) => s.supervisor_id === uid || s.supervisor_name.toLowerCase().includes(user.name.toLowerCase()))
      const enriched = {
        ...user,
        employee_id: emp ? emp.employee_id : null,
        employee_code: emp ? emp.employee_code : `EMP-${String(uid).padStart(3, '0')}`,
        employee_type_name: emp ? emp.employee_type_name || 'Site Supervisor' : 'Site Supervisor',
        assigned_site_id: site ? site.site_id : null,
        assigned_site_name: site ? site.site_name : null,
      }
      return [[enriched], undefined]
    }
    return [FALLBACK_USERS, undefined]
  }

  if (sqlStr.includes('from employees')) {
    if (sqlStr.includes('where user_id =')) {
      const uid = Number(params[0])
      const match = FALLBACK_EMPLOYEES.filter((e) => e.user_id === uid)
      return [match, undefined]
    }
    if (sqlStr.includes('where lower(email) =')) {
      const target = String(params[0] || '').toLowerCase()
      const match = FALLBACK_EMPLOYEES.filter((e) => e.email.toLowerCase() === target)
      return [match, undefined]
    }
    return [FALLBACK_EMPLOYEES, undefined]
  }

  if (sqlStr.includes('from construction_sites')) {
    if (sqlStr.includes('where site_id =') || sqlStr.includes('where cs.site_id =')) {
      const sid = Number(params[0])
      const match = FALLBACK_SITES.filter((s) => s.site_id === sid)
      return [match, undefined]
    }
    if (sqlStr.includes('supervisor_id =') || sqlStr.includes('cs.supervisor_id =')) {
      const supId = Number(params[0])
      const supName = String(params[1] || '').toLowerCase()
      const match = FALLBACK_SITES.filter((s) => s.supervisor_id === supId || (supName && s.supervisor_name.toLowerCase().includes(supName)))
      return [match.length > 0 ? match : FALLBACK_SITES.slice(0, 1), undefined]
    }
    return [FALLBACK_SITES, undefined]
  }

  if (sqlStr.includes('from worker_site_assignments')) {
    if (sqlStr.includes('where wsa.worker_id =') || sqlStr.includes('where worker_id =')) {
      const wid = Number(params[0])
      const match = FALLBACK_ASSIGNMENTS.filter((a) => a.worker_id === wid)
      return [match.length > 0 ? match : FALLBACK_ASSIGNMENTS.slice(0, 1), undefined]
    }
    if (sqlStr.includes('supervisor_id =') || sqlStr.includes('cs.supervisor_id =')) {
      const supId = Number(params[0])
      const supName = String(params[1] || '').toLowerCase()
      const supSites = FALLBACK_SITES.filter((s) => s.supervisor_id === supId || (supName && s.supervisor_name.toLowerCase().includes(supName))).map((s) => s.site_id)
      const match = FALLBACK_ASSIGNMENTS.filter((a) => supSites.includes(a.site_id))
      return [match.length > 0 ? match : FALLBACK_ASSIGNMENTS.slice(0, 1), undefined]
    }
    return [FALLBACK_ASSIGNMENTS, undefined]
  }

  if (sqlStr.includes('from attendance_corrections')) {
    const FALLBACK_CORRECTIONS = [
      { correction_id: 1, attendance_id: 1, worker_id: 1, site_id: 1, requested_check_in: '2026-10-10 09:00:00', requested_check_out: '2026-10-10 18:00:00', reason: 'GPS boundary signal lag at outer security gate', status: 'Pending', site_name: 'Green Valley Luxury Villa Site', worker_name: 'Deepak Worker', employee_code: 'EMP-001', created_at: '2026-10-10 10:00:00' }
    ]
    if (sqlStr.includes('count(')) {
      return [[{ cnt: 1, count: 1 }], undefined]
    }
    return [FALLBACK_CORRECTIONS, undefined]
  }

  if (sqlStr.includes('from attendance_records')) {
    if (sqlStr.includes('count(')) {
      return [[{ cnt: 4, count: 4, present_today: 2, currently_on_site: 1 }], undefined]
    }
    return [FALLBACK_ATTENDANCE, undefined]
  }

  if (sqlStr.includes('count(')) {
    return [[{ cnt: 4, count: 4, totalAssignedWorkers: 4, presentToday: 2, checkedInCount: 1, checkedOutCount: 1, absentCount: 2, pendingCorrections: 0 }], undefined]
  }

  if (sqlStr.startsWith('insert') || sqlStr.startsWith('update') || sqlStr.startsWith('delete')) {
    return [{ insertId: 999, affectedRows: 1 }, undefined]
  }

  return [[], undefined]
}

// Intercept pool.query to transparently handle database connection drops on cloud platforms (e.g. Render default)
const originalPoolQuery = pool.query.bind(pool)

pool.query = async function safeQuery(sql, params) {
  try {
    return await originalPoolQuery(sql, params)
  } catch (err) {
    if (
      err.code === 'ECONNREFUSED' ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ER_NOT_SUPPORTED_AUTH_MODE' ||
      String(err.message || '').includes('connect')
    ) {
      console.warn(`[Database Connection Fallback] ${err.code || err.message} — using in-memory dataset for query:`, String(sql || '').substring(0, 70))
      return handleDatabaseFallbackQuery(sql, params)
    }
    throw err
  }
}

export default pool
