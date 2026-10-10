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

export default pool
