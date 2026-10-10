import db from '../config/db.js'

export async function getAllSellRequests(req, res) {
  try {
    const { search, seller_id, status } = req.query
    let query = 'SELECT * FROM sell_requests WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (property_name LIKE ? OR request_code LIKE ? OR seller_name LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (seller_id) {
      query += ' AND seller_id = ?'
      params.push(seller_id)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY sell_request_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[SellRequests Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching sell requests.' })
  }
}

export async function createSellRequest(req, res) {
  try {
    const {
      request_code, property_id, property_name, survey_number, location,
      district, state, pincode, area, unit, expected_rate, expected_total,
      seller_id, seller_name, seller_phone, seller_email, status, remarks,
      submitted_date, document_url,
    } = req.body

    const code = request_code || `REQ-SEL-${200 + Math.floor(Math.random() * 900)}`
    const date = submitted_date || new Date().toISOString().split('T')[0]

    const [result] = await db.query(
      `INSERT INTO sell_requests 
      (request_code, property_id, property_name, survey_number, location, district, state, 
       pincode, area, unit, expected_rate, expected_total, seller_id, seller_name, seller_phone, 
       seller_email, status, remarks, submitted_date, document_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, property_id || null, property_name || '', survey_number || '', location || '',
        district || '', state || '', pincode || '', area || 0, unit || 'Sq. Ft', expected_rate || 0,
        expected_total || 0, seller_id || req.user?.user_id || 201, seller_name || req.user?.name || 'Client',
        seller_phone || req.user?.phone || '', seller_email || req.user?.email || '', status || 'Under Verification',
        remarks || '', date, document_url || '',
      ]
    )

    const [created] = await db.query('SELECT * FROM sell_requests WHERE sell_request_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create SellRequest Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to submit sell request.' })
  }
}

export async function updateSellRequestStatus(req, res) {
  try {
    const { id } = req.params
    const { status, remarks } = req.body

    await db.query(
      `UPDATE sell_requests SET 
       status = COALESCE(?, status), 
       remarks = COALESCE(?, remarks) 
       WHERE sell_request_id = ?`,
      [status, remarks, id]
    )

    const [updated] = await db.query('SELECT * FROM sell_requests WHERE sell_request_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update SellRequest Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update sell request.' })
  }
}

export async function deleteSellRequest(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM sell_requests WHERE sell_request_id = ?', [id])
    return res.json({ success: true, message: 'Sell request deleted successfully.' })
  } catch (error) {
    console.error('[Delete SellRequest Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete sell request.' })
  }
}
