import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const poolConfig = {
  host: (process.env.DB_HOST || 'localhost').trim(),
  user: (process.env.DB_USER || 'root').trim(),
  password: (process.env.DB_PASSWORD || '').trim(),
  database: (process.env.DB_NAME || 'construction_realestate_db').trim(),
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
}

if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  }
}

export async function runInventoryMigration() {
  console.log('====================================================')
  console.log('📦 Starting Safe & Idempotent Inventory Migration')
  console.log(`🎯 Target Host: ${poolConfig.host}:${poolConfig.port}`)
  console.log(`🗄️  Database:   ${poolConfig.database}`)
  console.log(`👤 User:       ${poolConfig.user}`)
  console.log('====================================================')

  let connection
  try {
    const pool = mysql.createPool(poolConfig)
    connection = await pool.getConnection()
    console.log('✅ Connected successfully to MySQL database.')

    // 1. Safe Column Verification & Alteration on items table
    console.log('\n[1/5] Verifying items table columns...')
    const [itemStorageCol] = await connection.query(`
      SELECT COUNT(*) as cnt 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'items' 
        AND COLUMN_NAME = 'storage_location'
    `)
    if (itemStorageCol[0].cnt === 0) {
      await connection.query(`ALTER TABLE items ADD COLUMN storage_location VARCHAR(150) NULL AFTER brand`)
      console.log('  + Added column items.storage_location')
    } else {
      console.log('  ✓ Column items.storage_location already exists')
    }

    const [itemArchivedCol] = await connection.query(`
      SELECT COUNT(*) as cnt 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'items' 
        AND COLUMN_NAME = 'is_archived'
    `)
    if (itemArchivedCol[0].cnt === 0) {
      await connection.query(`ALTER TABLE items ADD COLUMN is_archived TINYINT(1) DEFAULT 0 AFTER status`)
      console.log('  + Added column items.is_archived')
    } else {
      console.log('  ✓ Column items.is_archived already exists')
    }

    // 2. Safe Column Verification & Alteration on suppliers table
    console.log('\n[2/5] Verifying suppliers table columns...')
    const supplierColsToAdd = [
      { name: 'city', def: 'VARCHAR(100) NULL AFTER address' },
      { name: 'postal_code', def: 'VARCHAR(30) NULL AFTER city' },
      { name: 'rating', def: 'DECIMAL(3,2) DEFAULT 4.50 AFTER status' },
      { name: 'certification', def: 'VARCHAR(150) NULL AFTER rating' },
      { name: 'moq_default', def: 'DECIMAL(10,2) DEFAULT 1.00 AFTER certification' }
    ]

    for (const col of supplierColsToAdd) {
      const [colCheck] = await connection.query(`
        SELECT COUNT(*) as cnt 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'suppliers' 
          AND COLUMN_NAME = ?
      `, [col.name])

      if (colCheck[0].cnt === 0) {
        await connection.query(`ALTER TABLE suppliers ADD COLUMN ${col.name} ${col.def}`)
        console.log(`  + Added column suppliers.${col.name}`)
      } else {
        console.log(`  ✓ Column suppliers.${col.name} already exists`)
      }
    }

    // 3. Ensure Inventory Tables Exist
    console.log('\n[3/5] Verifying inventory & procurement tables...')
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
    console.log('  ✓ Tables inventory_transactions and material_allocations verified')

    // 4. Idempotently Seed Categories & Suppliers
    console.log('\n[4/5] Verifying item categories and suppliers master records...')
    const categories = [
      { code: 'CAT-01', name: 'Cement', desc: 'OPC, PPC and structural cement' },
      { code: 'CAT-02', name: 'Steel', desc: 'TMT bars, structural steel' },
      { code: 'CAT-03', name: 'Bricks', desc: 'Clay bricks and blocks' },
      { code: 'CAT-04', name: 'Sand', desc: 'River sand and M-sand' },
      { code: 'CAT-05', name: 'Electrical', desc: 'Wires, switches and conduits' }
    ]

    for (const cat of categories) {
      await connection.query(`
        INSERT INTO item_categories (category_code, category_name, description, status)
        VALUES (?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE 
          category_name = VALUES(category_name),
          description = VALUES(description)
      `, [cat.code, cat.name, cat.desc])
    }
    console.log(`  ✓ Verified ${categories.length} item categories`)

    const suppliers = [
      { code: 'SUP-01', name: 'Sri Balaji Cement Traders', phone: '9840112233', city: 'Chennai', supplied: 'Cement, Bricks' },
      { code: 'SUP-02', name: 'Chennai Steel House', phone: '9840223344', city: 'Chennai', supplied: 'TMT Steel Bars' },
      { code: 'SUP-03', name: 'Voltage Electricals', phone: '9840334455', city: 'Coimbatore', supplied: 'Copper Wires, Switchgear' },
      { code: 'SUP-04', name: 'AquaFlow Pipes & Fittings', phone: '9840445566', city: 'Chennai', supplied: 'River Sand, CPVC' }
    ]

    for (const sup of suppliers) {
      await connection.query(`
        INSERT INTO suppliers (supplier_code, supplier_name, phone, city, supplied_materials, status)
        VALUES (?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE 
          supplier_name = VALUES(supplier_name),
          phone = VALUES(phone),
          city = VALUES(city)
      `, [sup.code, sup.name, sup.phone, sup.city, sup.supplied])
    }
    console.log(`  ✓ Verified ${suppliers.length} suppliers`)

    // 5. Idempotently Seed 5 Baseline Materials with Dynamic Foreign Keys
    console.log('\n[5/5] Idempotently inserting 5 approved baseline materials...')
    const baselineMaterials = [
      {
        code: 'ITM-001',
        name: 'OPC 53 Grade Cement',
        categoryCode: 'CAT-01',
        supplierCode: 'SUP-01',
        brand: 'UltraTech',
        unit: 'Bag (50kg)',
        unitPrice: 420.00,
        stockQty: 480,
        minStock: 200,
        location: 'Main Warehouse - Bay A'
      },
      {
        code: 'ITM-002',
        name: 'TMT Bar 12mm Fe500',
        categoryCode: 'CAT-02',
        supplierCode: 'SUP-02',
        brand: 'Tata Tiscon',
        unit: 'Kg',
        unitPrice: 68.00,
        stockQty: 1600,
        minStock: 2000,
        location: 'Yard - Sector 2'
      },
      {
        code: 'ITM-003',
        name: 'Red Clay Brick',
        categoryCode: 'CAT-03',
        supplierCode: 'SUP-01',
        brand: 'Local Kiln',
        unit: 'Piece',
        unitPrice: 8.00,
        stockQty: 8500,
        minStock: 5000,
        location: 'Open Yard - Bay B'
      },
      {
        code: 'ITM-004',
        name: 'River Sand',
        categoryCode: 'CAT-04',
        supplierCode: 'SUP-04',
        brand: 'River Bed Gold',
        unit: 'Cubic Ft',
        unitPrice: 55.00,
        stockQty: 920,
        minStock: 800,
        location: 'Aggregates Pit 1'
      },
      {
        code: 'ITM-005',
        name: 'Copper Wire 2.5mm',
        categoryCode: 'CAT-05',
        supplierCode: 'SUP-03',
        brand: 'Polycab',
        unit: 'Meter',
        unitPrice: 24.00,
        stockQty: 1450,
        minStock: 1000,
        location: 'Warehouse Rack 3'
      }
    ]

    let insertedCount = 0
    let existingCount = 0

    for (const mat of baselineMaterials) {
      // Dynamic lookup of category_id and supplier_id
      const [catRow] = await connection.query(`SELECT category_id FROM item_categories WHERE category_code = ?`, [mat.categoryCode])
      const categoryId = catRow[0]?.category_id || null

      const [supRow] = await connection.query(`SELECT supplier_id FROM suppliers WHERE supplier_code = ?`, [mat.supplierCode])
      const supplierId = supRow[0]?.supplier_id || null

      // Check if material already exists by item_code
      const [existingMat] = await connection.query(`SELECT item_id, item_code, stock_quantity FROM items WHERE item_code = ?`, [mat.code])

      let itemId
      if (existingMat.length > 0) {
        itemId = existingMat[0].item_id
        existingCount++
        console.log(`  ✓ Material ${mat.code} (${mat.name}) already exists with ID ${itemId}. Stock untouched.`)
      } else {
        const [insertResult] = await connection.query(`
          INSERT INTO items 
          (item_code, item_name, category_id, brand, storage_location, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status, is_archived, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1)
        `, [mat.code, mat.name, categoryId, mat.brand, mat.location, mat.unit, mat.unitPrice, mat.stockQty, mat.minStock, supplierId])

        itemId = insertResult.insertId
        insertedCount++
        console.log(`  + Inserted material ${mat.code} (${mat.name}) with ID ${itemId}`)
      }

      // Idempotently create opening stock ledger transaction if absent
      const txnCode = `TXN-OPEN-${mat.code}`
      const [existingTxn] = await connection.query(`SELECT transaction_id FROM inventory_transactions WHERE transaction_code = ?`, [txnCode])

      if (existingTxn.length === 0 && mat.stockQty > 0) {
        await connection.query(`
          INSERT INTO inventory_transactions 
          (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, storage_location, remarks, created_by)
          VALUES (?, ?, 'STOCK_IN', ?, ?, ?, ?, 'Opening Baseline Stock Balance', 1)
        `, [txnCode, itemId, mat.stockQty, mat.unitPrice, mat.stockQty * mat.unitPrice, mat.location])
        console.log(`    + Created opening stock transaction ${txnCode}`)
      }
    }

    // Final Verification Counts
    const [finalItemCount] = await connection.query(`SELECT COUNT(*) as cnt FROM items WHERE (is_archived = 0 OR is_archived IS NULL)`)
    const [finalTxnCount] = await connection.query(`SELECT COUNT(*) as cnt FROM inventory_transactions`)

    console.log('\n====================================================')
    console.log('🎉 Inventory Migration Completed Successfully!')
    console.log(`📊 Materials Inserted: ${insertedCount}`)
    console.log(`📊 Materials Preserved: ${existingCount}`)
    console.log(`📊 Total Active Materials in DB: ${finalItemCount[0].cnt}`)
    console.log(`📊 Total Ledger Transactions in DB: ${finalTxnCount[0].cnt}`)
    console.log('====================================================')

    await pool.end()
    return true
  } catch (err) {
    console.error('\n❌ Migration Failed with Error:', err.message)
    if (err.code === 'ENOTFOUND') {
      console.error('⚠️  Reason: Database hostname could not be resolved (DNS NXDOMAIN).')
      console.error('👉 Action Required: Ensure your Aiven MySQL cloud instance is Powered ON and running.')
    }
    if (connection) {
      try { connection.release() } catch (e) {}
    }
    throw err
  }
}

// Allow direct CLI execution: node backend/database/migrate_inventory.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runInventoryMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
