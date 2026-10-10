import db from '../config/db.js'

export async function getAllPayments(req, res) {
  try {
    const { search, project_id, client_id, payment_type, status } = req.query
    let query = 'SELECT * FROM payments WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (payment_number LIKE ? OR project_name LIKE ? OR client_name LIKE ? OR category LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (project_id) {
      query += ' AND project_id = ?'
      params.push(project_id)
    }

    if (client_id) {
      query += ' AND client_id = ?'
      params.push(client_id)
    }

    if (payment_type) {
      query += ' AND payment_type = ?'
      params.push(payment_type)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY payment_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Payments Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching payments.' })
  }
}

export async function createPayment(req, res) {
  try {
    const {
      payment_number, project_id, project_name, client_id, client_name,
      payment_type, category, amount, payment_date, payment_mode, status, description,
    } = req.body

    const num = payment_number || `PAY-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`
    const date = payment_date || new Date().toISOString().split('T')[0]
    const payStatus = status || (payment_type === 'Income' ? 'Received' : 'Paid')

    const [result] = await db.query(
      `INSERT INTO payments 
      (payment_number, project_id, project_name, client_id, client_name, payment_type, 
       category, amount, payment_date, payment_mode, status, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        num, project_id || null, project_name || '', client_id || null, client_name || '',
        payment_type || 'Income', category || 'General', amount || 0, date,
        payment_mode || 'Bank Transfer', payStatus, description || '',
      ]
    )

    const [created] = await db.query('SELECT * FROM payments WHERE payment_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Payment Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create payment.' })
  }
}

export async function updatePayment(req, res) {
  try {
    const { id } = req.params
    const { category, amount, payment_date, payment_mode, status, description } = req.body

    await db.query(
      `UPDATE payments SET 
       category = COALESCE(?, category), 
       amount = COALESCE(?, amount), 
       payment_date = COALESCE(?, payment_date), 
       payment_mode = COALESCE(?, payment_mode), 
       status = COALESCE(?, status), 
       description = COALESCE(?, description) 
       WHERE payment_id = ?`,
      [category, amount, payment_date, payment_mode, status, description, id]
    )

    const [updated] = await db.query('SELECT * FROM payments WHERE payment_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Payment Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update payment.' })
  }
}

export async function deletePayment(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM payments WHERE payment_id = ?', [id])
    return res.json({ success: true, message: 'Payment deleted successfully.' })
  } catch (error) {
    console.error('[Delete Payment Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete payment.' })
  }
}
