import db from '../config/db.js'

export async function getAllServices(req, res) {
  try {
    const { search, status } = req.query
    let query = `
      SELECT s.*, e.first_name, e.last_name, e.phone AS person_phone 
      FROM services s 
      LEFT JOIN employees e ON s.assigned_person_id = e.employee_id 
      WHERE 1=1
    `
    const params = []

    if (search) {
      query += ' AND (s.service_name LIKE ? OR s.service_code LIKE ? OR s.category LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
      query += ' AND s.status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY s.service_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Services Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching services.' })
  }
}

export async function createService(req, res) {
  try {
    const { service_code, service_name, description, category, rate_per_unit, unit, assigned_person_id, assigned_person_name, status } = req.body

    const code = service_code || `SRV-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      `INSERT INTO services 
      (service_code, service_name, description, category, rate_per_unit, unit, assigned_person_id, assigned_person_name, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, service_name, description || '', category || 'General', rate_per_unit || 0, unit || 'Sq. Ft', assigned_person_id || null, assigned_person_name || '', isStatus ? 1 : 0, req.user?.user_id || 1]
    )

    const [created] = await db.query('SELECT * FROM services WHERE service_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Service Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create service.' })
  }
}

export async function updateService(req, res) {
  try {
    const { id } = req.params
    const { service_code, service_name, description, category, rate_per_unit, unit, assigned_person_id, assigned_person_name, status } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      `UPDATE services SET 
       service_code = ?, service_name = ?, description = ?, category = ?, rate_per_unit = ?, 
       unit = ?, assigned_person_id = ?, assigned_person_name = ?, status = ?, updated_by = ? 
       WHERE service_id = ?`,
      [service_code, service_name, description || '', category || 'General', rate_per_unit || 0, unit || 'Sq. Ft', assigned_person_id || null, assigned_person_name || '', isStatus ? 1 : 0, req.user?.user_id || 1, id]
    )

    const [updated] = await db.query('SELECT * FROM services WHERE service_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Service Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update service.' })
  }
}

export async function deleteService(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM services WHERE service_id = ?', [id])
    return res.json({ success: true, message: 'Service deleted successfully.' })
  } catch (error) {
    console.error('[Delete Service Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete service.' })
  }
}
