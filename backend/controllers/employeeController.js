import db from '../config/db.js'

export async function getAllEmployees(req, res) {
  try {
    const { search, employee_type_id, status } = req.query
    let query = `
      SELECT e.*, et.employee_type_name AS master_type_name 
      FROM employees e 
      LEFT JOIN employee_types et ON e.employee_type_id = et.employee_type_id 
      WHERE 1=1
    `
    const params = []

    if (search) {
      query += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ? OR e.phone LIKE ? OR e.service LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (employee_type_id) {
      query += ' AND e.employee_type_id = ?'
      params.push(employee_type_id)
    }

    if (status !== undefined && status !== '') {
      query += ' AND e.status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY e.employee_id DESC'

    const [rows] = await db.query(query, params)
    const formatted = rows.map((r) => {
      let projList = r.completed_projects_list
      if (typeof projList === 'string') {
        try { projList = JSON.parse(projList) } catch (e) { projList = [] }
      }
      let taskList = r.completed_tasks_list
      if (typeof taskList === 'string') {
        try { taskList = JSON.parse(taskList) } catch (e) { taskList = [] }
      }
      return {
        ...r,
        completed_projects_list: Array.isArray(projList) ? projList : [],
        completed_tasks_list: Array.isArray(taskList) ? taskList : [],
      }
    })
    return res.json({ success: true, data: formatted })
  } catch (error) {
    console.error('[Employees Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching employees.' })
  }
}

export async function createEmployee(req, res) {
  try {
    const {
      employee_code, employee_type_id, employee_type_name, first_name, last_name,
      phone, email, aadhaar_number, pan_number, bank_name, account_number, ifsc_code, micr_code,
      city, district, state, service, specialization, service_rate, rate_unit, availability,
      current_project_name, current_work, current_progress, experience_years, qualification,
      gender, employment_status, profile_image, status,
    } = req.body

    const code = employee_code || `EMP-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      `INSERT INTO employees 
      (employee_code, employee_type_id, employee_type_name, first_name, last_name, phone, email, 
       aadhaar_number, pan_number, bank_name, account_number, ifsc_code, micr_code, city, district, state, 
       service, specialization, service_rate, rate_unit, availability, current_project_name, current_work, 
       current_progress, experience_years, qualification, gender, employment_status, profile_image, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, employee_type_id || null, employee_type_name || '', first_name, last_name || '',
        phone || '', email || '', aadhaar_number || '', pan_number || '', bank_name || '',
        account_number || '', ifsc_code || '', micr_code || '', city || '', district || '', state || '',
        service || '', specialization || '', service_rate || 0, rate_unit || 'Day', availability || 'Available',
        current_project_name || '', current_work || '', current_progress || 0, experience_years || 0,
        qualification || '', gender || 'Male', employment_status || 'Permanent', profile_image || '', isStatus ? 1 : 0, req.user?.user_id || 1,
      ]
    )

    const [created] = await db.query('SELECT * FROM employees WHERE employee_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Employee Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create employee.' })
  }
}

export async function updateEmployee(req, res) {
  try {
    const { id } = req.params
    const {
      employee_code, employee_type_id, employee_type_name, first_name, last_name,
      phone, email, aadhaar_number, pan_number, bank_name, account_number, ifsc_code, micr_code,
      city, district, state, service, specialization, service_rate, rate_unit, availability,
      current_project_name, current_work, current_progress, experience_years, qualification,
      gender, employment_status, profile_image, status,
    } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      `UPDATE employees SET 
       employee_code = ?, employee_type_id = ?, employee_type_name = ?, first_name = ?, last_name = ?, 
       phone = ?, email = ?, aadhaar_number = ?, pan_number = ?, bank_name = ?, account_number = ?, 
       ifsc_code = ?, micr_code = ?, city = ?, district = ?, state = ?, service = ?, specialization = ?, 
       service_rate = ?, rate_unit = ?, availability = ?, current_project_name = ?, current_work = ?, 
       current_progress = ?, experience_years = ?, qualification = ?, gender = ?, employment_status = ?, 
       profile_image = ?, status = ?, updated_by = ? 
       WHERE employee_id = ?`,
      [
        employee_code, employee_type_id || null, employee_type_name || '', first_name, last_name || '',
        phone || '', email || '', aadhaar_number || '', pan_number || '', bank_name || '', account_number || '',
        ifsc_code || '', micr_code || '', city || '', district || '', state || '', service || '', specialization || '',
        service_rate || 0, rate_unit || 'Day', availability || 'Available', current_project_name || '', current_work || '',
        current_progress || 0, experience_years || 0, qualification || '', gender || 'Male', employment_status || 'Permanent',
        profile_image || '', isStatus ? 1 : 0, req.user?.user_id || 1, id,
      ]
    )

    const [updated] = await db.query('SELECT * FROM employees WHERE employee_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Employee Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update employee.' })
  }
}

export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM employees WHERE employee_id = ?', [id])
    return res.json({ success: true, message: 'Employee deleted successfully.' })
  } catch (error) {
    console.error('[Delete Employee Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete employee.' })
  }
}
