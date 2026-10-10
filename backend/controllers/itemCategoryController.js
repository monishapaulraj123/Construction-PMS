import db from '../config/db.js'

export async function getAllItemCategories(req, res) {
  try {
    const { search, status } = req.query
    let query = `
      SELECT c.*, COUNT(i.item_id) AS items_count 
      FROM item_categories c 
      LEFT JOIN items i ON c.category_id = i.category_id 
      WHERE 1=1
    `
    const params = []

    if (search) {
      query += ' AND (c.category_name LIKE ? OR c.category_code LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
      query += ' AND c.status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' GROUP BY c.category_id ORDER BY c.category_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[ItemCategories Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching item categories.' })
  }
}

export async function createItemCategory(req, res) {
  try {
    const { category_code, category_name, description, icon, image, status } = req.body

    const code = category_code || `CAT-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      'INSERT INTO item_categories (category_code, category_name, description, icon, image, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [code, category_name, description || '', icon || 'Package', image || '/images/categories/cement.jpg', isStatus ? 1 : 0, req.user?.user_id || 1]
    )

    const [created] = await db.query('SELECT *, 0 AS items_count FROM item_categories WHERE category_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create ItemCategory Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create item category.' })
  }
}

export async function updateItemCategory(req, res) {
  try {
    const { id } = req.params
    const { category_code, category_name, description, icon, image, status } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      'UPDATE item_categories SET category_code = ?, category_name = ?, description = ?, icon = ?, image = ?, status = ?, updated_by = ? WHERE category_id = ?',
      [category_code, category_name, description || '', icon || 'Package', image || '', isStatus ? 1 : 0, req.user?.user_id || 1, id]
    )

    const [updated] = await db.query('SELECT * FROM item_categories WHERE category_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update ItemCategory Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update item category.' })
  }
}

export async function deleteItemCategory(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM item_categories WHERE category_id = ?', [id])
    return res.json({ success: true, message: 'Item category deleted successfully.' })
  } catch (error) {
    console.error('[Delete ItemCategory Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete item category.' })
  }
}
