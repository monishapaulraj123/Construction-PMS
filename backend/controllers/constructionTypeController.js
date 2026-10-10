import db from '../config/db.js'

export async function getAllConstructionTypes(req, res) {
  try {
    const { search, status } = req.query
    let query = 'SELECT * FROM construction_types WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (construction_type_name LIKE ? OR construction_type_code LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
      query += ' AND status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY construction_type_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[ConstructionTypes Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching construction types.' })
  }
}

export async function createConstructionType(req, res) {
  try {
    const { construction_type_code, construction_type_name, description, status } = req.body

    const code = construction_type_code || `CT-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      'INSERT INTO construction_types (construction_type_code, construction_type_name, description, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [code, construction_type_name, description || '', isStatus ? 1 : 0, req.user?.user_id || 1]
    )

    const [created] = await db.query('SELECT * FROM construction_types WHERE construction_type_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create ConstructionType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create construction type.' })
  }
}

export async function updateConstructionType(req, res) {
  try {
    const { id } = req.params
    const { construction_type_code, construction_type_name, description, status } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      'UPDATE construction_types SET construction_type_code = ?, construction_type_name = ?, description = ?, status = ?, updated_by = ? WHERE construction_type_id = ?',
      [construction_type_code, construction_type_name, description || '', isStatus ? 1 : 0, req.user?.user_id || 1, id]
    )

    const [updated] = await db.query('SELECT * FROM construction_types WHERE construction_type_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update ConstructionType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update construction type.' })
  }
}

export async function deleteConstructionType(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM construction_types WHERE construction_type_id = ?', [id])
    return res.json({ success: true, message: 'Construction type deleted successfully.' })
  } catch (error) {
    console.error('[Delete ConstructionType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete construction type.' })
  }
}
