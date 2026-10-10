import db from '../config/db.js'

export async function getAllNegotiations(req, res) {
  try {
    const { search, buyer_id, seller_id, status } = req.query
    let query = 'SELECT * FROM negotiations WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (property_name LIKE ? OR negotiation_code LIKE ? OR buyer_name LIKE ? OR seller_name LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (buyer_id) {
      query += ' AND buyer_id = ?'
      params.push(buyer_id)
    }

    if (seller_id) {
      query += ' AND seller_id = ?'
      params.push(seller_id)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY negotiation_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Negotiations Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching negotiations.' })
  }
}

export async function updateNegotiation(req, res) {
  try {
    const { id } = req.params
    const { counter_offer, final_agreed_price, status, remarks } = req.body

    await db.query(
      `UPDATE negotiations SET 
       counter_offer = COALESCE(?, counter_offer), 
       final_agreed_price = COALESCE(?, final_agreed_price), 
       status = COALESCE(?, status), 
       remarks = COALESCE(?, remarks) 
       WHERE negotiation_id = ?`,
      [counter_offer, final_agreed_price, status, remarks, id]
    )

    const [updated] = await db.query('SELECT * FROM negotiations WHERE negotiation_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Negotiation Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update negotiation.' })
  }
}
