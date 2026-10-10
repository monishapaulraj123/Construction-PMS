import db from '../config/db.js'

export async function getAllConstructionStages(req, res) {
  try {
    const { search, status } = req.query
    let query = 'SELECT * FROM construction_stages WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (stage_name LIKE ? OR stage_code LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
      query += ' AND status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY stage_sequence ASC, stage_id ASC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[ConstructionStages Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching construction stages.' })
  }
}

export async function createConstructionStage(req, res) {
  try {
    const { stage_code, stage_name, stage_sequence, description, status } = req.body

    const code = stage_code || `STG-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      'INSERT INTO construction_stages (stage_code, stage_name, stage_sequence, description, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [code, stage_name, stage_sequence || 1, description || '', isStatus ? 1 : 0, req.user?.user_id || 1]
    )

    const [created] = await db.query('SELECT * FROM construction_stages WHERE stage_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create ConstructionStage Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create construction stage.' })
  }
}

export async function updateConstructionStage(req, res) {
  try {
    const { id } = req.params
    const { stage_code, stage_name, stage_sequence, description, status } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      'UPDATE construction_stages SET stage_code = ?, stage_name = ?, stage_sequence = ?, description = ?, status = ?, updated_by = ? WHERE stage_id = ?',
      [stage_code, stage_name, stage_sequence || 1, description || '', isStatus ? 1 : 0, req.user?.user_id || 1, id]
    )

    const [updated] = await db.query('SELECT * FROM construction_stages WHERE stage_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update ConstructionStage Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update construction stage.' })
  }
}

export async function deleteConstructionStage(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM construction_stages WHERE stage_id = ?', [id])
    return res.json({ success: true, message: 'Construction stage deleted successfully.' })
  } catch (error) {
    console.error('[Delete ConstructionStage Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete construction stage.' })
  }
}
