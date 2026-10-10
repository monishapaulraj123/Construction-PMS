import db from '../config/db.js'

export async function getAllTransactions(req, res) {
  try {
    const { search, buyer_id, seller_id, status } = req.query
    let query = 'SELECT * FROM transactions WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (property_name LIKE ? OR transaction_code LIKE ? OR buyer_name LIKE ? OR seller_name LIKE ?)'
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

    query += ' ORDER BY transaction_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Transactions Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching transactions.' })
  }
}

export async function createTransaction(req, res) {
  try {
    const {
      transaction_code, request_id, property_id, property_name, buyer_id, buyer_name,
      buyer_contact, seller_id, seller_name, seller_contact, agreed_amount, payment_status,
      advance_amount, transaction_date, document_reference, status, admin_verification, remarks,
    } = req.body

    const code = transaction_code || `TXN-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`
    const date = transaction_date || new Date().toISOString().split('T')[0]

    const [result] = await db.query(
      `INSERT INTO transactions 
      (transaction_code, request_id, property_id, property_name, buyer_id, buyer_name, buyer_contact, 
       seller_id, seller_name, seller_contact, agreed_amount, payment_status, advance_amount, 
       transaction_date, document_reference, status, admin_verification, remarks) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, request_id || null, property_id || null, property_name || '', buyer_id || null,
        buyer_name || '', buyer_contact || '', seller_id || null, seller_name || '', seller_contact || '',
        agreed_amount || 0, payment_status || 'Advance Paid', advance_amount || 0, date,
        document_reference || '', status || 'Transaction Processing', admin_verification || 'Approved', remarks || '',
      ]
    )

    const [created] = await db.query('SELECT * FROM transactions WHERE transaction_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Transaction Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create transaction.' })
  }
}

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params
    const { payment_status, advance_amount, status, admin_verification, remarks } = req.body

    await db.query(
      `UPDATE transactions SET 
       payment_status = COALESCE(?, payment_status), 
       advance_amount = COALESCE(?, advance_amount), 
       status = COALESCE(?, status), 
       admin_verification = COALESCE(?, admin_verification), 
       remarks = COALESCE(?, remarks) 
       WHERE transaction_id = ?`,
      [payment_status, advance_amount, status, admin_verification, remarks, id]
    )

    const [updated] = await db.query('SELECT * FROM transactions WHERE transaction_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Transaction Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update transaction.' })
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM transactions WHERE transaction_id = ?', [id])
    return res.json({ success: true, message: 'Transaction deleted successfully.' })
  } catch (error) {
    console.error('[Delete Transaction Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete transaction.' })
  }
}
