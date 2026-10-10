import db from '../config/db.js'

export async function getAllSuppliers(req, res) {
  try {
    const { search, status } = req.query
    let query = 'SELECT * FROM suppliers WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (supplier_name LIKE ? OR supplier_code LIKE ? OR contact_person LIKE ? OR city LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
      query += ' AND status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY supplier_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Suppliers Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching suppliers.' })
  }
}

export async function createSupplier(req, res) {
  try {
    const {
      supplier_code, supplier_name, contact_person, phone, email,
      city, district, state, gst_number, address, rating, supplied_materials, status,
    } = req.body

    const code = supplier_code || `SUP-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      `INSERT INTO suppliers 
      (supplier_code, supplier_name, contact_person, phone, email, city, district, state, gst_number, address, rating, supplied_materials, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, supplier_name, contact_person || '', phone || '', email || '',
        city || '', district || '', state || '', gst_number || '', address || '',
        rating || 4.5, supplied_materials || '', isStatus ? 1 : 0, req.user?.user_id || 1,
      ]
    )

    const [created] = await db.query('SELECT * FROM suppliers WHERE supplier_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Supplier Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create supplier.' })
  }
}

export async function updateSupplier(req, res) {
  try {
    const { id } = req.params
    const {
      supplier_code, supplier_name, contact_person, phone, email,
      city, district, state, gst_number, address, rating, supplied_materials, status,
    } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      `UPDATE suppliers SET 
       supplier_code = ?, supplier_name = ?, contact_person = ?, phone = ?, email = ?, 
       city = ?, district = ?, state = ?, gst_number = ?, address = ?, rating = ?, 
       supplied_materials = ?, status = ?, updated_by = ? 
       WHERE supplier_id = ?`,
      [
        supplier_code, supplier_name, contact_person || '', phone || '', email || '',
        city || '', district || '', state || '', gst_number || '', address || '', rating || 4.5,
        supplied_materials || '', isStatus ? 1 : 0, req.user?.user_id || 1, id,
      ]
    )

    const [updated] = await db.query('SELECT * FROM suppliers WHERE supplier_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Supplier Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update supplier.' })
  }
}

export async function deleteSupplier(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM suppliers WHERE supplier_id = ?', [id])
    return res.json({ success: true, message: 'Supplier deleted successfully.' })
  } catch (error) {
    console.error('[Delete Supplier Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete supplier.' })
  }
}
