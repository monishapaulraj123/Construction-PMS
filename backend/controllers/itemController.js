import db from '../config/db.js'

const ITEM_IMAGE_MAP = {
  'ITM-001': '/images/categories/cement.jpg',
  'ITM-01': '/images/categories/cement.jpg',
  'ITM-002': '/images/categories/steel.jpg',
  'ITM-02': '/images/categories/steel.jpg',
  'ITM-003': '/images/categories/bricks.jpg',
  'ITM-03': '/images/categories/bricks.jpg',
  'ITM-004': '/images/categories/sand.jpg',
  'ITM-04': '/images/categories/sand.jpg',
  'ITM-005': '/images/categories/electrical.jpg',
  'ITM-05': '/images/categories/electrical.jpg',
}

function getItemImage(item) {
  const code = (item.item_code || '').toUpperCase()
  if (ITEM_IMAGE_MAP[code]) return ITEM_IMAGE_MAP[code]

  const cat = (item.category_name || '').toLowerCase()
  const name = (item.item_name || item.material_name || '').toLowerCase()

  if (cat.includes('brick') || name.includes('brick')) return '/images/categories/bricks.jpg'
  if (cat.includes('sand') || name.includes('sand')) return '/images/categories/sand.jpg'
  if (cat.includes('steel') || cat.includes('tmt') || name.includes('steel') || name.includes('rebar')) return '/images/categories/steel.jpg'
  if (cat.includes('cement') || name.includes('cement') || name.includes('portland')) return '/images/categories/cement.jpg'
  if (cat.includes('elect') || name.includes('wire') || name.includes('cable')) return '/images/categories/electrical.jpg'
  if (cat.includes('plumb') || name.includes('pipe') || name.includes('valve')) return '/images/categories/plumbing.jpg'
  if (cat.includes('tile') || name.includes('tile')) return '/images/categories/tiles.jpg'
  if (cat.includes('paint') || name.includes('paint')) return '/images/categories/paint.jpg'

  if (item.category_image && !item.category_image.includes('undefined')) return item.category_image
  if (item.image && !item.image.includes('undefined')) return item.image
  if (item.image_url && !item.image_url.includes('undefined')) return item.image_url
  return '/images/categories/cement.jpg'
}

export async function getAllItems(req, res) {
  try {
    const { search, category_id, supplier_id, status } = req.query
    let query = `
      SELECT i.*, c.category_name, c.image as category_image, s.supplier_name 
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

    query += ' ORDER BY i.item_id ASC'

    const [rows] = await db.query(query, params)
    const enriched = (rows || []).map((r) => {
      const img = getItemImage(r)
      return {
        ...r,
        material_name: r.item_name,
        quantity_inhand: Number(r.stock_quantity ?? 0),
        unit_of_measure: r.unit || 'Unit',
        standard_rate: Number(r.unit_price ?? 0),
        minimum_stock_level: Number(r.min_stock_level ?? 0),
        image: img,
        image_url: img,
      }
    })
    return res.json({ success: true, data: enriched })
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
    // Clean up dependent child rows first to satisfy foreign key constraints
    await db.query('DELETE FROM inventory_transactions WHERE item_id = ?', [id])
    await db.query('DELETE FROM material_allocations WHERE item_id = ?', [id])
    await db.query('DELETE FROM quotation_items WHERE item_id = ?', [id])
    await db.query('DELETE FROM rfq_items WHERE item_id = ?', [id])
    await db.query('DELETE FROM purchase_order_items WHERE item_id = ?', [id])
    await db.query('DELETE FROM items WHERE item_id = ?', [id])
    return res.json({ success: true, message: 'Item deleted successfully.' })
  } catch (error) {
    console.error('[Delete Item Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete item.' })
  }
}
