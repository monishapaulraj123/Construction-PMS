import db from '../config/db.js'

export async function getAllItems(req, res) {
  try {
    const { search, category_id, supplier_id, status } = req.query
    let query = `
      SELECT i.*, c.category_name, s.supplier_name 
      FROM items i 
      LEFT JOIN item_categories c ON i.category_id = c.category_id 
      LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id 
      WHERE 1=1
    `
    const params = []

    if (search) {
      query += ' AND (i.item_name LIKE ? OR i.item_code LIKE ? OR i.brand LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (category_id) {
      query += ' AND i.category_id = ?'
      params.push(category_id)
    }

    if (supplier_id) {
      query += ' AND i.supplier_id = ?'
      params.push(supplier_id)
    }

    if (status !== undefined && status !== '') {
      query += ' AND i.status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY i.item_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Items Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching items.' })
  }
}

export async function createItem(req, res) {
  try {
    const { item_code, item_name, category_id, brand, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status } = req.body

    const code = item_code || `ITM-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      `INSERT INTO items 
      (item_code, item_name, category_id, brand, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, item_name, category_id || null, brand || '', unit || 'Unit', unit_price || 0, stock_quantity || 0, min_stock_level || 0, supplier_id || null, isStatus ? 1 : 0, req.user?.user_id || 1]
    )

    const [created] = await db.query(
      `SELECT i.*, c.category_name, s.supplier_name 
       FROM items i 
       LEFT JOIN item_categories c ON i.category_id = c.category_id 
       LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id 
       WHERE i.item_id = ?`,
      [result.insertId]
    )
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Item Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create item.' })
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params
    const { item_code, item_name, category_id, brand, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      `UPDATE items SET 
       item_code = ?, item_name = ?, category_id = ?, brand = ?, unit = ?, 
       unit_price = ?, stock_quantity = ?, min_stock_level = ?, supplier_id = ?, status = ?, updated_by = ? 
       WHERE item_id = ?`,
      [item_code, item_name, category_id || null, brand || '', unit || 'Unit', unit_price || 0, stock_quantity || 0, min_stock_level || 0, supplier_id || null, isStatus ? 1 : 0, req.user?.user_id || 1, id]
    )

    const [updated] = await db.query(
      `SELECT i.*, c.category_name, s.supplier_name 
       FROM items i 
       LEFT JOIN item_categories c ON i.category_id = c.category_id 
       LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id 
       WHERE i.item_id = ?`,
      [id]
    )
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Item Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update item.' })
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM items WHERE item_id = ?', [id])
    return res.json({ success: true, message: 'Item deleted successfully.' })
  } catch (error) {
    console.error('[Delete Item Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete item.' })
  }
}
