import db from '../config/db.js'

// Helper: Audit logger
async function logAudit(userId, action, module, details) {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, module, details) VALUES (?, ?, ?, ?)`,
      [userId || null, action, module, typeof details === 'object' ? JSON.stringify(details) : details]
    )
  } catch (e) {
    console.error('[Audit Log Error]', e.message)
  }
}

// 1. GET /api/inventory/dashboard
export async function getDashboardMetrics(req, res) {
  try {
    // Total Active Items
    const [totalItemsRows] = await db.query(
      `SELECT COUNT(*) as cnt FROM items WHERE (is_archived = 0 OR is_archived IS NULL)`
    )
    const totalActiveItems = totalItemsRows[0]?.cnt || 0

    // Total Stock Value
    const [totalValueRows] = await db.query(
      `SELECT SUM(stock_quantity * unit_price) as total_val FROM items WHERE (is_archived = 0 OR is_archived IS NULL)`
    )
    const totalStockValue = Number(totalValueRows[0]?.total_val || 0)

    // Low Stock Count (0 < stock <= min_stock)
    const [lowStockRows] = await db.query(
      `SELECT COUNT(*) as cnt FROM items 
       WHERE (is_archived = 0 OR is_archived IS NULL) AND stock_quantity > 0 AND stock_quantity <= min_stock_level`
    )
    const lowStockCount = lowStockRows[0]?.cnt || 0

    // Out of Stock Count (stock <= 0)
    const [outOfStockRows] = await db.query(
      `SELECT COUNT(*) as cnt FROM items 
       WHERE (is_archived = 0 OR is_archived IS NULL) AND stock_quantity <= 0`
    )
    const outOfStockCount = outOfStockRows[0]?.cnt || 0

    // Critical Shortage Alerts (Top 10 items with stock <= min_stock_level ordered by stock/min_level ratio)
    const [alertRows] = await db.query(
      `SELECT i.item_id, i.item_code, i.item_name, i.unit, i.stock_quantity, i.min_stock_level, i.unit_price,
              c.category_name, s.supplier_name,
              CASE 
                WHEN i.stock_quantity <= 0 THEN 0
                ELSE ROUND((i.stock_quantity / NULLIF(i.min_stock_level, 0)), 2)
              END as shortage_ratio
       FROM items i
       LEFT JOIN item_categories c ON i.category_id = c.category_id
       LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
       WHERE (i.is_archived = 0 OR i.is_archived IS NULL) AND i.stock_quantity <= i.min_stock_level
       ORDER BY shortage_ratio ASC, i.stock_quantity ASC
       LIMIT 10`
    )

    // Recent 10 Movements
    const [recentMovements] = await db.query(
      `SELECT t.*, i.item_code, i.item_name, i.unit, p.project_name, s.supplier_name
       FROM inventory_transactions t
       JOIN items i ON t.item_id = i.item_id
       LEFT JOIN projects p ON t.project_id = p.project_id
       LEFT JOIN suppliers s ON t.supplier_id = s.supplier_id
       ORDER BY t.transaction_id DESC
       LIMIT 10`
    )

    // Category Valuation Breakdown
    const [categoryValuations] = await db.query(
      `SELECT c.category_id, COALESCE(c.category_name, 'Uncategorized') as category_name,
              COUNT(i.item_id) as item_count,
              SUM(i.stock_quantity) as total_units,
              SUM(i.stock_quantity * i.unit_price) as category_value
       FROM items i
       LEFT JOIN item_categories c ON i.category_id = c.category_id
       WHERE (i.is_archived = 0 OR i.is_archived IS NULL)
       GROUP BY c.category_id, c.category_name
       ORDER BY category_value DESC`
    )

    return res.json({
      success: true,
      metrics: {
        totalActiveItems,
        totalStockValue,
        lowStockCount,
        outOfStockCount,
      },
      alerts: alertRows,
      recentMovements,
      categoryValuations,
    })
  } catch (error) {
    console.error('[Inventory Dashboard Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching inventory dashboard.' })
  }
}

// 2. GET /api/inventory/materials
export async function getMaterials(req, res) {
  try {
    const { search, category_id, supplier_id, location, stock_health, sortBy, sortOrder } = req.query

    let query = `
      SELECT i.*, c.category_name, s.supplier_name,
             (i.stock_quantity * i.unit_price) as stock_value,
             CASE
               WHEN i.stock_quantity <= 0 THEN 'OUT_OF_STOCK'
               WHEN i.stock_quantity <= i.min_stock_level THEN 'LOW_STOCK'
               ELSE 'HEALTHY'
             END as stock_health
      FROM items i
      LEFT JOIN item_categories c ON i.category_id = c.category_id
      LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
      WHERE (i.is_archived = 0 OR i.is_archived IS NULL)
    `
    const params = []

    if (search) {
      query += ' AND (i.item_name LIKE ? OR i.item_code LIKE ? OR i.brand LIKE ? OR i.storage_location LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (category_id) {
      query += ' AND i.category_id = ?'
      params.push(category_id)
    }

    if (supplier_id) {
      query += ' AND i.supplier_id = ?'
      params.push(supplier_id)
    }

    if (location) {
      query += ' AND i.storage_location LIKE ?'
      params.push(`%${location}%`)
    }

    if (stock_health) {
      if (stock_health === 'OUT_OF_STOCK') query += ' AND i.stock_quantity <= 0'
      else if (stock_health === 'LOW_STOCK') query += ' AND i.stock_quantity > 0 AND i.stock_quantity <= i.min_stock_level'
      else if (stock_health === 'HEALTHY' || stock_health === 'IN_STOCK') query += ' AND i.stock_quantity > i.min_stock_level'
    }

    // Allowlist sort columns
    const allowedSort = {
      name: 'i.item_name',
      code: 'i.item_code',
      quantity: 'i.stock_quantity',
      price: 'i.unit_price',
      stock_value: '(i.stock_quantity * i.unit_price)',
      updated: 'i.created_at',
      id: 'i.item_id',
    }

    const sortColumn = allowedSort[sortBy] || 'i.item_id'
    const direction = String(sortOrder || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    query += ` ORDER BY ${sortColumn} ${direction}`

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Get Materials Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching material catalog.' })
  }
}

// 3. POST /api/inventory/materials (Create Material)
export async function createMaterial(req, res) {
  try {
    const { item_code, item_name, category_id, brand, storage_location, unit, unit_price, stock_quantity, min_stock_level, supplier_id } = req.body

    if (!item_name) {
      return res.status(400).json({ success: false, error: 'Material name is required.' })
    }

    const code = item_code || `ITM-${Date.now().toString().slice(-6)}`
    const qty = Math.max(0, Number(stock_quantity) || 0)
    const price = Math.max(0, Number(unit_price) || 0)
    const minLevel = Math.max(0, Number(min_stock_level) || 0)

    const [result] = await db.query(
      `INSERT INTO items 
       (item_code, item_name, category_id, brand, storage_location, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status, is_archived, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)`,
      [code, item_name, category_id || null, brand || '', storage_location || 'Main Warehouse', unit || 'Unit', price, qty, minLevel, supplier_id || null, req.user?.user_id || 1]
    )

    // Log opening balance if stock_quantity > 0
    if (qty > 0) {
      const txnCode = `TXN-INIT-${Date.now().toString().slice(-6)}`
      await db.query(
        `INSERT INTO inventory_transactions 
         (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, storage_location, remarks, created_by)
         VALUES (?, ?, 'STOCK_IN', ?, ?, ?, ?, 'Opening Stock Balance', ?)`,
        [txnCode, result.insertId, qty, price, qty * price, storage_location || 'Main Warehouse', req.user?.user_id || 1]
      )
    }

    await logAudit(req.user?.user_id, 'CREATE_MATERIAL', 'INVENTORY', { item_id: result.insertId, item_name, item_code: code })

    const [created] = await db.query(
      `SELECT i.*, c.category_name, s.supplier_name FROM items i LEFT JOIN item_categories c ON i.category_id = c.category_id LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id WHERE i.item_id = ?`,
      [result.insertId]
    )

    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Material Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create material.' })
  }
}

// 4. PUT /api/inventory/materials/:id (Update Material)
export async function updateMaterial(req, res) {
  try {
    const { id } = req.params
    const { item_code, item_name, category_id, brand, storage_location, unit, unit_price, min_stock_level, supplier_id, status } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false' ? 1 : 0

    await db.query(
      `UPDATE items SET 
       item_code = ?, item_name = ?, category_id = ?, brand = ?, storage_location = ?,
       unit = ?, unit_price = ?, min_stock_level = ?, supplier_id = ?, status = ?
       WHERE item_id = ?`,
      [item_code, item_name, category_id || null, brand || '', storage_location || 'Main Warehouse', unit || 'Unit', Number(unit_price) || 0, Number(min_stock_level) || 0, supplier_id || null, isStatus, id]
    )

    await logAudit(req.user?.user_id, 'UPDATE_MATERIAL', 'INVENTORY', { item_id: id, item_name })

    const [updated] = await db.query(
      `SELECT i.*, c.category_name, s.supplier_name FROM items i LEFT JOIN item_categories c ON i.category_id = c.category_id LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id WHERE i.item_id = ?`,
      [id]
    )

    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Material Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update material.' })
  }
}

// 5. DELETE /api/inventory/materials/:id (Safe Soft-Delete / Archive)
export async function archiveMaterial(req, res) {
  try {
    const { id } = req.params
    await db.query(`UPDATE items SET is_archived = 1, status = 0 WHERE item_id = ?`, [id])
    await logAudit(req.user?.user_id, 'ARCHIVE_MATERIAL', 'INVENTORY', { item_id: id })
    return res.json({ success: true, message: 'Material archived successfully.' })
  } catch (error) {
    console.error('[Archive Material Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to archive material.' })
  }
}

// 6. POST /api/inventory/stock-in (Transactional Stock In)
export async function stockIn(req, res) {
  let connection
  try {
    const { item_id, quantity, unit_cost, supplier_id, storage_location, reference_no, remarks, movement_type } = req.body

    const qty = Number(quantity)
    if (!item_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Valid material and positive quantity are required.' })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Row Lock Material
    const [rows] = await connection.query(`SELECT * FROM items WHERE item_id = ? AND (is_archived = 0 OR is_archived IS NULL) FOR UPDATE`, [item_id])
    if (rows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Material not found or archived.' })
    }

    const item = rows[0]
    const currentStock = Number(item.stock_quantity) || 0
    const newStock = currentStock + qty
    const cost = unit_cost !== undefined && unit_cost !== null && !isNaN(Number(unit_cost)) ? Number(unit_cost) : Number(item.unit_price)
    const totalCost = qty * cost
    const loc = storage_location || item.storage_location || 'Main Warehouse'
    const type = movement_type || 'STOCK_IN'
    const ref = reference_no || 'MANUAL-STOCK-IN'

    // Update Material Stock & Price
    await connection.query(
      `UPDATE items SET stock_quantity = ?, unit_price = ?, storage_location = ? WHERE item_id = ?`,
      [newStock, cost, loc, item_id]
    )

    // Insert Movement Transaction
    const txnCode = `TXN-IN-${Date.now().toString().slice(-6)}`
    await connection.query(
      `INSERT INTO inventory_transactions 
       (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, supplier_id, reference_no, storage_location, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [txnCode, item_id, type, qty, cost, totalCost, supplier_id || item.supplier_id || null, ref, loc, remarks || 'Stock Intake', req.user?.user_id || 1]
    )

    await connection.commit()
    await logAudit(req.user?.user_id, 'STOCK_IN', 'INVENTORY', { item_id, qty, newStock, txnCode })

    return res.json({
      success: true,
      message: `Successfully received ${qty} ${item.unit} into stock.`,
      transaction_code: txnCode,
      new_stock: newStock,
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Stock In Error]', error)
    return res.status(500).json({ success: false, error: 'Transactional stock-in failed.' })
  } finally {
    if (connection) connection.release()
  }
}

// 7. POST /api/inventory/stock-out (Transactional Stock Out)
export async function stockOut(req, res) {
  let connection
  try {
    const { item_id, quantity, project_id, issued_to, purpose, reference_no, remarks } = req.body

    const qty = Number(quantity)
    if (!item_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Valid material and positive issue quantity are required.' })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Row Lock Material
    const [rows] = await connection.query(`SELECT * FROM items WHERE item_id = ? AND (is_archived = 0 OR is_archived IS NULL) FOR UPDATE`, [item_id])
    if (rows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Material not found or archived.' })
    }

    const item = rows[0]
    const currentStock = Number(item.stock_quantity) || 0

    if (qty > currentStock) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        error: `Insufficient stock! Requested: ${qty} ${item.unit}, Available: ${currentStock} ${item.unit}.`,
      })
    }

    const newStock = currentStock - qty
    const unitPrice = Number(item.unit_price) || 0
    const totalCost = qty * unitPrice
    const ref = reference_no || 'MATERIAL-ISSUE'

    // Deduct Stock
    await connection.query(`UPDATE items SET stock_quantity = ? WHERE item_id = ?`, [newStock, item_id])

    // Insert Movement Transaction
    const txnCode = `TXN-OUT-${Date.now().toString().slice(-6)}`
    await connection.query(
      `INSERT INTO inventory_transactions 
       (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, project_id, issued_to, purpose, reference_no, remarks, created_by)
       VALUES (?, ?, 'STOCK_OUT', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [txnCode, item_id, qty, unitPrice, totalCost, project_id || null, issued_to || 'Site Engineer', purpose || 'Construction Use', ref, remarks || 'Material Issued', req.user?.user_id || 1]
    )

    await connection.commit()
    await logAudit(req.user?.user_id, 'STOCK_OUT', 'INVENTORY', { item_id, qty, newStock, txnCode })

    return res.json({
      success: true,
      message: `Successfully issued ${qty} ${item.unit}.`,
      transaction_code: txnCode,
      remaining_stock: newStock,
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Stock Out Error]', error)
    return res.status(500).json({ success: false, error: 'Transactional stock-out failed.' })
  } finally {
    if (connection) connection.release()
  }
}

// 8. GET /api/inventory/allocations
export async function getAllocations(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT a.*, i.item_name, i.item_code, i.unit, i.unit_price, i.stock_quantity as central_stock,
              p.project_code, p.project_name
       FROM material_allocations a
       JOIN items i ON a.item_id = i.item_id
       JOIN projects p ON a.project_id = p.project_id
       ORDER BY a.allocation_id DESC`
    )
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Get Allocations Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch allocations.' })
  }
}

// 9. POST /api/inventory/allocate (Create Project Allocation)
export async function createAllocation(req, res) {
  let connection
  try {
    const { item_id, project_id, allocated_quantity, remarks } = req.body

    const qty = Number(allocated_quantity)
    if (!item_id || !project_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Material, project, and positive quantity are required.' })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Lock Material
    const [itemRows] = await connection.query(`SELECT * FROM items WHERE item_id = ? AND (is_archived = 0 OR is_archived IS NULL) FOR UPDATE`, [item_id])
    if (itemRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Material not found.' })
    }

    const item = itemRows[0]
    const centralStock = Number(item.stock_quantity) || 0

    if (qty > centralStock) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        error: `Allocation quantity (${qty} ${item.unit}) exceeds available central stock (${centralStock} ${item.unit}).`,
      })
    }

    const alcCode = `ALC-${Date.now().toString().slice(-6)}`
    const todayStr = new Date().toISOString().split('T')[0]

    // Create Allocation
    const [alcResult] = await connection.query(
      `INSERT INTO material_allocations 
       (allocation_code, item_id, project_id, allocated_quantity, issued_quantity, returned_quantity, status, allocated_date, remarks, created_by)
       VALUES (?, ?, ?, ?, 0.00, 0.00, 'ACTIVE', ?, ?, ?)`,
      [alcCode, item_id, project_id, qty, todayStr, remarks || 'Project Allocation', req.user?.user_id || 1]
    )

    // Record TRANSFER movement ledger entry
    const txnCode = `TXN-TRF-${Date.now().toString().slice(-6)}`
    await connection.query(
      `INSERT INTO inventory_transactions 
       (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, project_id, allocation_id, reference_no, remarks, created_by)
       VALUES (?, ?, 'TRANSFER', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [txnCode, item_id, qty, item.unit_price, qty * item.unit_price, project_id, alcResult.insertId, alcCode, remarks || 'Project Allocation Transfer', req.user?.user_id || 1]
    )

    await connection.commit()
    await logAudit(req.user?.user_id, 'CREATE_ALLOCATION', 'INVENTORY', { allocation_code: alcCode, qty })

    return res.status(201).json({
      success: true,
      message: `Successfully allocated ${qty} ${item.unit} to project.`,
      allocation_code: alcCode,
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Create Allocation Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create allocation.' })
  } finally {
    if (connection) connection.release()
  }
}

// 10. POST /api/inventory/allocations/issue (Issue Material from Allocation)
export async function issueFromAllocation(req, res) {
  let connection
  try {
    const { allocation_id, issue_quantity, recipient, remarks } = req.body

    const qty = Number(issue_quantity)
    if (!allocation_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Valid allocation and positive issue quantity are required.' })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Lock Allocation Row
    const [alcRows] = await connection.query(`SELECT * FROM material_allocations WHERE allocation_id = ? FOR UPDATE`, [allocation_id])
    if (alcRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Allocation record not found.' })
    }

    const alc = alcRows[0]
    const allocated = Number(alc.allocated_quantity)
    const issued = Number(alc.issued_quantity)
    const unissued = allocated - issued

    if (qty > unissued) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        error: `Requested issue quantity (${qty}) exceeds remaining unissued allocation (${unissued}).`,
      })
    }

    // Lock Material Row
    const [itemRows] = await connection.query(`SELECT * FROM items WHERE item_id = ? FOR UPDATE`, [alc.item_id])
    if (itemRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Material record not found.' })
    }

    const item = itemRows[0]
    const physicalStock = Number(item.stock_quantity) || 0

    if (qty > physicalStock) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        error: `Requested issue quantity (${qty} ${item.unit}) exceeds available physical central stock (${physicalStock} ${item.unit}).`,
      })
    }

    // Update Allocation issued_quantity
    const newIssued = issued + qty
    await connection.query(`UPDATE material_allocations SET issued_quantity = ? WHERE allocation_id = ?`, [newIssued, allocation_id])

    // Deduct physical central stock
    const newStock = physicalStock - qty
    await connection.query(`UPDATE items SET stock_quantity = ? WHERE item_id = ?`, [newStock, alc.item_id])

    // Write STOCK_OUT transaction
    const txnCode = `TXN-ISS-${Date.now().toString().slice(-6)}`
    await connection.query(
      `INSERT INTO inventory_transactions 
       (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, project_id, allocation_id, issued_to, reference_no, remarks, created_by)
       VALUES (?, ?, 'STOCK_OUT', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [txnCode, alc.item_id, qty, item.unit_price, qty * item.unit_price, alc.project_id, allocation_id, recipient || 'Site Team', alc.allocation_code, remarks || 'Issued from Allocation', req.user?.user_id || 1]
    )

    await connection.commit()
    await logAudit(req.user?.user_id, 'ISSUE_ALLOCATION', 'INVENTORY', { allocation_id, qty, newIssued })

    return res.json({
      success: true,
      message: `Successfully issued ${qty} ${item.unit} from allocation.`,
      issued_quantity: newIssued,
      remaining_unissued: allocated - newIssued,
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Issue Allocation Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to issue material from allocation.' })
  } finally {
    if (connection) connection.release()
  }
}

// 11. POST /api/inventory/allocations/return (Site Material Return with Safeguard Fix)
export async function returnFromSite(req, res) {
  let connection
  try {
    const { allocation_id, return_quantity, remarks } = req.body

    const qty = Number(return_quantity)
    if (!allocation_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Valid allocation and positive return quantity are required.' })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Lock Allocation Row
    const [alcRows] = await connection.query(`SELECT * FROM material_allocations WHERE allocation_id = ? FOR UPDATE`, [allocation_id])
    if (alcRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Allocation record not found.' })
    }

    const alc = alcRows[0]
    const oldAllocated = Number(alc.allocated_quantity)
    const oldIssued = Number(alc.issued_quantity)
    const oldReturned = Number(alc.returned_quantity)

    // SAFEGUARD FIX: Check unreturned issued quantity
    const eligibleToReturn = oldIssued - oldReturned
    if (qty > eligibleToReturn) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        error: `Cannot return ${qty} units! Maximum returnable quantity actually issued and unreturned is ${eligibleToReturn}.`,
      })
    }

    // Lock Material Row
    const [itemRows] = await connection.query(`SELECT * FROM items WHERE item_id = ? FOR UPDATE`, [alc.item_id])
    if (itemRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Material record not found.' })
    }

    const item = itemRows[0]
    const oldCentralStock = Number(item.stock_quantity) || 0

    // Reference PDF Arithmetic:
    const newReturned = oldReturned + qty
    const newAllocated = Math.max(0, oldAllocated - qty)
    const newCentralStock = oldCentralStock + qty

    // Update Allocation
    await connection.query(
      `UPDATE material_allocations SET returned_quantity = ?, allocated_quantity = ? WHERE allocation_id = ?`,
      [newReturned, newAllocated, allocation_id]
    )

    // Increase Central Stock
    await connection.query(`UPDATE items SET stock_quantity = ? WHERE item_id = ?`, [newCentralStock, alc.item_id])

    // Write RETURN ledger transaction
    const txnCode = `TXN-RET-${Date.now().toString().slice(-6)}`
    await connection.query(
      `INSERT INTO inventory_transactions 
       (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, project_id, allocation_id, reference_no, remarks, created_by)
       VALUES (?, ?, 'RETURN', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [txnCode, alc.item_id, qty, item.unit_price, qty * item.unit_price, alc.project_id, allocation_id, alc.allocation_code, remarks || 'Site Material Return', req.user?.user_id || 1]
    )

    await connection.commit()
    await logAudit(req.user?.user_id, 'SITE_RETURN', 'INVENTORY', { allocation_id, qty, newCentralStock })

    return res.json({
      success: true,
      message: `Successfully returned ${qty} ${item.unit} to central stock.`,
      returned_quantity: newReturned,
      new_allocated: newAllocated,
      new_central_stock: newCentralStock,
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Return Material Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to process site material return.' })
  } finally {
    if (connection) connection.release()
  }
}

// 12. GET /api/inventory/transactions (Movement Ledger)
export async function getTransactions(req, res) {
  try {
    const { item_id, project_id, movement_type } = req.query
    let query = `
      SELECT t.*, i.item_name, i.item_code, i.unit, p.project_name, s.supplier_name
      FROM inventory_transactions t
      JOIN items i ON t.item_id = i.item_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      LEFT JOIN suppliers s ON t.supplier_id = s.supplier_id
      WHERE 1=1
    `
    const params = []

    if (item_id) {
      query += ' AND t.item_id = ?'
      params.push(item_id)
    }
    if (project_id) {
      query += ' AND t.project_id = ?'
      params.push(project_id)
    }
    if (movement_type) {
      query += ' AND t.movement_type = ?'
      params.push(movement_type)
    }

    query += ' ORDER BY t.transaction_id DESC LIMIT 100'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Get Transactions Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch transaction history.' })
  }
}

// 13. GET /api/inventory/reports
export async function getReports(req, res) {
  try {
    // 1. Stock Valuation Report
    const [valuationRows] = await db.query(
      `SELECT i.item_id, i.item_code, i.item_name, i.unit, i.stock_quantity, i.unit_price, i.storage_location,
              (i.stock_quantity * i.unit_price) as stock_value,
              c.category_name, s.supplier_name,
              CASE
                WHEN i.stock_quantity <= 0 THEN 'OUT_OF_STOCK'
                WHEN i.stock_quantity <= i.min_stock_level THEN 'LOW_STOCK'
                ELSE 'HEALTHY'
              END as stock_status
       FROM items i
       LEFT JOIN item_categories c ON i.category_id = c.category_id
       LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
       WHERE (i.is_archived = 0 OR i.is_archived IS NULL)
       ORDER BY stock_value DESC`
    )

    // 2. Project Consumption Report
    const [consumptionRows] = await db.query(
      `SELECT p.project_id, p.project_code, p.project_name,
              COUNT(DISTINCT t.item_id) as distinct_materials_used,
              SUM(t.quantity) as total_quantity_issued,
              SUM(t.total_cost) as total_consumed_value
       FROM inventory_transactions t
       JOIN projects p ON t.project_id = p.project_id
       WHERE t.movement_type = 'STOCK_OUT'
       GROUP BY p.project_id, p.project_code, p.project_name
       ORDER BY total_consumed_value DESC`
    )

    // 3. Category Summary Report
    const [categoryRows] = await db.query(
      `SELECT COALESCE(c.category_name, 'Uncategorized') as category_name,
              COUNT(i.item_id) as material_count,
              SUM(i.stock_quantity) as total_units,
              SUM(i.stock_quantity * i.unit_price) as total_valuation
       FROM items i
       LEFT JOIN item_categories c ON i.category_id = c.category_id
       WHERE (i.is_archived = 0 OR i.is_archived IS NULL)
       GROUP BY c.category_id, c.category_name
       ORDER BY total_valuation DESC`
    )

    // 4. Stock Health Summary (Counts for Donut Chart)
    const [healthRows] = await db.query(
      `SELECT 
         SUM(CASE WHEN stock_quantity > min_stock_level THEN 1 ELSE 0 END) as healthy_count,
         SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_count,
         SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock_count
       FROM items
       WHERE (is_archived = 0 OR is_archived IS NULL)`
    )

    const healthSummary = healthRows[0] || { healthy_count: 0, low_stock_count: 0, out_of_stock_count: 0 }

    return res.json({
      success: true,
      valuationReport: valuationRows,
      projectConsumptionReport: consumptionRows,
      categorySummaryReport: categoryRows,
      stockHealthSummary: healthSummary,
    })
  } catch (error) {
    console.error('[Get Inventory Reports Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to generate inventory reports.' })
  }
}
