import bcrypt from 'bcryptjs'
import db from '../config/db.js'

export async function getAllClients(req, res) {
  try {
    const { search, status } = req.query
    let query = 'SELECT * FROM clients WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (client_name LIKE ? OR client_code LIKE ? OR company_name LIKE ? OR phone LIKE ? OR city LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
      query += ' AND status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY client_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Clients Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching clients.' })
  }
}

export async function createClient(req, res) {
  try {
    const {
      client_code, client_name, client_type, company_name, contact_person,
      phone, alternate_phone, email, password, address_line1, address_line2,
      city, district, state, pincode, status,
    } = req.body

    const code = client_code || `CLI-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    let user_id = null

    // If client email provided, create corresponding user record for login
    if (email) {
      const [existingUser] = await db.query('SELECT user_id FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()])
      if (existingUser.length > 0) {
        user_id = existingUser[0].user_id
      } else {
        const hash = await bcrypt.hash(password || 'password123', 10)
        const [userRes] = await db.query(
          'INSERT INTO users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
          [client_name, email.trim().toLowerCase(), hash, 'CLIENT', phone || '', 'Active']
        )
        user_id = userRes.insertId
      }
    }

    const [result] = await db.query(
      `INSERT INTO clients 
      (client_code, client_name, client_type, company_name, contact_person, phone, alternate_phone, 
       email, user_id, address_line1, address_line2, city, district, state, pincode, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, client_name, client_type || 'Individual', company_name || '', contact_person || '',
        phone || '', alternate_phone || '', email || '', user_id, address_line1 || '', address_line2 || '',
        city || '', district || '', state || '', pincode || '', isStatus ? 1 : 0, req.user?.user_id || 1,
      ]
    )

    const [created] = await db.query('SELECT * FROM clients WHERE client_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Client Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create client.' })
  }
}

export async function updateClient(req, res) {
  try {
    const { id } = req.params
    const {
      client_code, client_name, client_type, company_name, contact_person,
      phone, alternate_phone, email, address_line1, address_line2,
      city, district, state, pincode, status,
    } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      `UPDATE clients SET 
       client_code = ?, client_name = ?, client_type = ?, company_name = ?, contact_person = ?, 
       phone = ?, alternate_phone = ?, email = ?, address_line1 = ?, address_line2 = ?, 
       city = ?, district = ?, state = ?, pincode = ?, status = ?, updated_by = ? 
       WHERE client_id = ?`,
      [
        client_code, client_name, client_type || 'Individual', company_name || '', contact_person || '',
        phone || '', alternate_phone || '', email || '', address_line1 || '', address_line2 || '',
        city || '', district || '', state || '', pincode || '', isStatus ? 1 : 0, req.user?.user_id || 1, id,
      ]
    )

    const [updated] = await db.query('SELECT * FROM clients WHERE client_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Client Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update client.' })
  }
}

export async function deleteClient(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM clients WHERE client_id = ?', [id])
    return res.json({ success: true, message: 'Client deleted successfully.' })
  } catch (error) {
    console.error('[Delete Client Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete client.' })
  }
}
