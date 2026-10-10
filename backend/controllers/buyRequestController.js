import db from '../config/db.js'

export async function getAllBuyRequests(req, res) {
  try {
    const { search, buyer_id, property_id, status } = req.query
    let query = 'SELECT * FROM buy_requests WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (property_name LIKE ? OR request_code LIKE ? OR buyer_name LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (buyer_id) {
      query += ' AND buyer_id = ?'
      params.push(buyer_id)
    }

    if (property_id) {
      query += ' AND property_id = ?'
      params.push(property_id)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY request_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[BuyRequests Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching buy requests.' })
  }
}

export async function createBuyRequest(req, res) {
  try {
    const {
      request_code, property_id, property_name, buyer_id, buyer_name,
      buyer_email, buyer_phone, budget, requirements, status, current_stage,
      submitted_date, verification_status,
    } = req.body

    const code = request_code || `REQ-BUY-${100 + Math.floor(Math.random() * 900)}`
    const date = submitted_date || new Date().toISOString().split('T')[0]

    const [result] = await db.query(
      `INSERT INTO buy_requests 
      (request_code, property_id, property_name, buyer_id, buyer_name, buyer_email, buyer_phone, 
       budget, requirements, status, current_stage, submitted_date, verification_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, property_id || null, property_name || '', buyer_id || req.user?.user_id || 501,
        buyer_name || req.user?.name || 'Client', buyer_email || req.user?.email || '',
        buyer_phone || req.user?.phone || '', budget || 0, requirements || '',
        status || 'Submitted', current_stage || 'Submitted', date, verification_status || 'Under Review',
      ]
    )

    const [created] = await db.query('SELECT * FROM buy_requests WHERE request_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create BuyRequest Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to submit buy request.' })
  }
}

export async function updateBuyRequestStatus(req, res) {
  try {
    const { id } = req.params
    const { status, current_stage, verification_status } = req.body

    await db.query(
      `UPDATE buy_requests SET 
       status = COALESCE(?, status), 
       current_stage = COALESCE(?, current_stage), 
       verification_status = COALESCE(?, verification_status) 
       WHERE request_id = ?`,
      [status, current_stage, verification_status, id]
    )

    const [updated] = await db.query('SELECT * FROM buy_requests WHERE request_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update BuyRequest Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update buy request.' })
  }
}

export async function deleteBuyRequest(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM buy_requests WHERE request_id = ?', [id])
    return res.json({ success: true, message: 'Buy request deleted successfully.' })
  } catch (error) {
    console.error('[Delete BuyRequest Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete buy request.' })
  }
}
