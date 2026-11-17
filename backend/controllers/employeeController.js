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
    const [existing] = await db.query('SELECT * FROM employees WHERE employee_id = ?', [id])
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found.' })
    }
    const current = existing[0]

    const {
      employee_code, employee_type_id, employee_type_name, first_name, last_name,
      phone, email, aadhaar_number, pan_number, bank_name, account_number, ifsc_code, micr_code,
      city, district, state, service, specialization, service_rate, rate_unit, availability,
      current_project_name, current_work, current_progress, experience_years, qualification,
      gender, employment_status, profile_image, status,
    } = req.body

    const finalCode = employee_code !== undefined ? employee_code : current.employee_code
    const finalTypeId = employee_type_id !== undefined ? employee_type_id : current.employee_type_id
    const finalTypeName = employee_type_name !== undefined ? employee_type_name : current.employee_type_name
    const finalFirstName = first_name !== undefined ? first_name : current.first_name
    const finalLastName = last_name !== undefined ? last_name : current.last_name
    const finalPhone = phone !== undefined ? phone : current.phone
    const finalEmail = email !== undefined ? email : current.email
    const finalAadhaar = aadhaar_number !== undefined ? aadhaar_number : current.aadhaar_number
    const finalPan = pan_number !== undefined ? pan_number : current.pan_number
    const finalBank = bank_name !== undefined ? bank_name : current.bank_name
    const finalAccount = account_number !== undefined ? account_number : current.account_number
    const finalIfsc = ifsc_code !== undefined ? ifsc_code : current.ifsc_code
    const finalMicr = micr_code !== undefined ? micr_code : current.micr_code
    const finalCity = city !== undefined ? city : current.city
    const finalDistrict = district !== undefined ? district : current.district
    const finalState = state !== undefined ? state : current.state
    const finalService = service !== undefined ? service : current.service
    const finalSpec = specialization !== undefined ? specialization : current.specialization
    const finalRate = service_rate !== undefined ? service_rate : current.service_rate
    const finalRateUnit = rate_unit !== undefined ? rate_unit : current.rate_unit
    const finalAvail = availability !== undefined ? availability : current.availability
    const finalProj = current_project_name !== undefined ? current_project_name : current.current_project_name
    const finalWork = current_work !== undefined ? current_work : current.current_work
    const finalProgress = current_progress !== undefined ? current_progress : current.current_progress
    const finalExp = experience_years !== undefined ? experience_years : current.experience_years
    const finalQual = qualification !== undefined ? qualification : current.qualification
    const finalGender = gender !== undefined ? gender : current.gender
    const finalEmpStatus = employment_status !== undefined ? employment_status : current.employment_status
    const finalProfileImg = profile_image !== undefined ? profile_image : current.profile_image
    const finalStatus = status !== undefined ? (status !== false && status !== 0 && status !== 'false' ? 1 : 0) : current.status

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
        finalCode, finalTypeId, finalTypeName, finalFirstName, finalLastName,
        finalPhone, finalEmail, finalAadhaar, finalPan, finalBank, finalAccount,
        finalIfsc, finalMicr, finalCity, finalDistrict, finalState, finalService, finalSpec,
        finalRate, finalRateUnit, finalAvail, finalProj, finalWork,
        finalProgress, finalExp, finalQual, finalGender, finalEmpStatus,
        finalProfileImg, finalStatus, req.user?.user_id || 1, id,
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
    await db.query('DELETE FROM attendance_corrections WHERE worker_id = ?', [id])
    await db.query('DELETE FROM attendance_records WHERE worker_id = ?', [id])
    await db.query('DELETE FROM worker_site_assignments WHERE worker_id = ?', [id])
    await db.query('DELETE FROM employee_assignments WHERE employee_id = ?', [id])
    await db.query('UPDATE services SET assigned_person_id = NULL WHERE assigned_person_id = ?', [id])
    await db.query('DELETE FROM employees WHERE employee_id = ?', [id])
    return res.json({ success: true, message: 'Employee deleted successfully.' })
  } catch (error) {
    console.error('[Delete Employee Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete employee.' })
  }
}
