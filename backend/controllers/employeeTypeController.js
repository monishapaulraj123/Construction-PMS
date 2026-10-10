import db from '../config/db.js'

export async function getAllEmployeeTypes(req, res) {
  try {
    const { search, status } = req.query
    let query = 'SELECT * FROM employee_types WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (employee_type_name LIKE ? OR employee_type_code LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
      query += ' AND status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY employee_type_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[EmployeeTypes Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching employee types.' })
  }
}

export async function createEmployeeType(req, res) {
  try {
    const { employee_type_code, employee_type_name, description, status } = req.body

    const code = employee_type_code || `ET-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      'INSERT INTO employee_types (employee_type_code, employee_type_name, description, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [code, employee_type_name, description || '', isStatus ? 1 : 0, req.user?.user_id || 1]
    )

    const [created] = await db.query('SELECT * FROM employee_types WHERE employee_type_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create EmployeeType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create employee type.' })
  }
}

export async function updateEmployeeType(req, res) {
  try {
    const { id } = req.params
    const { employee_type_code, employee_type_name, description, status } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      'UPDATE employee_types SET employee_type_code = ?, employee_type_name = ?, description = ?, status = ?, updated_by = ? WHERE employee_type_id = ?',
      [employee_type_code, employee_type_name, description || '', isStatus ? 1 : 0, req.user?.user_id || 1, id]
    )

    const [updated] = await db.query('SELECT * FROM employee_types WHERE employee_type_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update EmployeeType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update employee type.' })
  }
}

export async function deleteEmployeeType(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM employee_types WHERE employee_type_id = ?', [id])
    return res.json({ success: true, message: 'Employee type deleted successfully.' })
  } catch (error) {
    console.error('[Delete EmployeeType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete employee type.' })
  }
}
