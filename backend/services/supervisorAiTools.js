import db from '../config/db.js'

/**
 * Supervisor AI Tool Layer: Authorized Database Access Functions
 * Enforces strict Supervisor Role-Based Access Control (RBAC).
 * Identity is ALWAYS derived from authenticated token (user.user_id), NEVER client parameters.
 */

// 1. Fetch Supervisor's Assigned Construction Site
export async function getSupervisorAssignedSite(user) {
  if (!user || !user.user_id) return null

  try {
    const [rows] = await db.query(
      `SELECT cs.site_id, cs.site_code, cs.site_name, cs.address, cs.latitude, cs.longitude,
              cs.radius_meters, cs.max_gps_accuracy, cs.working_start_time, cs.working_end_time,
              cs.supervisor_id, cs.supervisor_name, cs.status, p.project_name
       FROM construction_sites cs
       LEFT JOIN projects p ON cs.project_id = p.project_id
       WHERE (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?)) AND cs.status = 'Active'
       ORDER BY cs.site_id ASC LIMIT 1`,
      [user.user_id, user.name || '']
    )

    if (rows && rows.length > 0) return rows[0]
    return null
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorAssignedSite Error:', err.message)
    return null
  }
}

// 2. Fetch Workers Assigned to Supervisor's Site
export async function getSupervisorAssignedWorkers(siteId, user) {
  if (!siteId || !user) return []

  try {
    // Resolve supervisor's employee_id to exclude them from worker list
    const [supEmpRows] = await db.query(
      'SELECT employee_id FROM employees WHERE user_id = ? OR LOWER(email) = ?',
      [user.user_id, (user.email || '').toLowerCase()]
    )
    const supEmpId = supEmpRows && supEmpRows.length > 0 ? supEmpRows[0].employee_id : null

    const [workers] = await db.query(
      `SELECT wsa.assignment_id, wsa.worker_id, wsa.site_id, wsa.assigned_date, wsa.status as assignment_status,
              e.employee_code, e.first_name, e.last_name, e.phone, e.employee_type_name
       FROM worker_site_assignments wsa
       JOIN employees e ON wsa.worker_id = e.employee_id
       WHERE wsa.site_id = ? AND wsa.status = 'Active' AND (? IS NULL OR wsa.worker_id != ?)
       ORDER BY e.first_name ASC`,
      [siteId, supEmpId, supEmpId || 0]
    )

    if (!workers || !Array.isArray(workers)) return []

    return workers.map((w) => ({
      worker_id: w.worker_id,
      employee_code: w.employee_code || `EMP-${w.worker_id}`,
      worker_name: `${w.first_name || ''} ${w.last_name || ''}`.trim() || 'Worker',
      employee_type_name: w.employee_type_name || 'Worker',
      phone: w.phone || '',
      assigned_date: w.assigned_date ? new Date(w.assigned_date).toISOString().split('T')[0] : '',
      status: w.assignment_status || 'Active',
    }))
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorAssignedWorkers Error:', err.message)
    return []
  }
}

// 3. Fetch Today's Live Workforce Attendance for Supervisor's Site
export async function getSupervisorSiteAttendanceToday(siteId, user, targetDate = null) {
  if (!siteId || !user) {
    return {
      site: null,
      date: targetDate || new Date().toISOString().split('T')[0],
      totalAssigned: 0,
      presentCount: 0,
      checkedInCount: 0,
      checkedOutCount: 0,
      absentCount: 0,
      workers: [],
    }
  }

  const todayDate = targetDate || new Date().toISOString().split('T')[0]

  try {
    const assignedWorkers = await getSupervisorAssignedWorkers(siteId, user)

    const [attRows] = await db.query(
      `SELECT ar.attendance_id, ar.worker_id, ar.date, ar.check_in_at, ar.check_out_at,
              ar.hours_worked, ar.distance_meters, ar.status, ar.is_late, ar.remarks
       FROM attendance_records ar
       WHERE ar.site_id = ? AND ar.date = ?`,
      [siteId, todayDate]
    )

    const attMap = new Map()
    if (attRows && Array.isArray(attRows)) {
      for (const r of attRows) {
        attMap.set(r.worker_id, r)
      }
    }

    let presentCount = 0
    let checkedInCount = 0
    let checkedOutCount = 0
    let absentCount = 0

    const detailedWorkers = assignedWorkers.map((w) => {
      const rec = attMap.get(w.worker_id)
      let status = 'Absent'
      let checkInTime = null
      let checkOutTime = null

      if (rec) {
        checkInTime = rec.check_in_at
        checkOutTime = rec.check_out_at
        if (rec.check_out_at) {
          status = 'Checked Out'
          checkedOutCount++
          presentCount++
        } else if (rec.check_in_at) {
          status = 'Checked In'
          checkedInCount++
          presentCount++
        } else {
          status = rec.status || 'Present'
          presentCount++
        }
      } else {
        absentCount++
      }

      return {
        ...w,
        today_status: status,
        check_in_at: checkInTime,
        check_out_at: checkOutTime,
        hours_worked: rec ? rec.hours_worked : 0,
        distance_meters: rec ? rec.distance_meters : null,
        is_late: rec ? rec.is_late : 0,
      }
    })

    return {
      date: todayDate,
      totalAssigned: assignedWorkers.length,
      presentCount,
      checkedInCount,
      checkedOutCount,
      absentCount,
      workers: detailedWorkers,
    }
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorSiteAttendanceToday Error:', err.message)
    return {
      date: todayDate,
      totalAssigned: 0,
      presentCount: 0,
      checkedInCount: 0,
      checkedOutCount: 0,
      absentCount: 0,
      workers: [],
    }
  }
}

// 4. Fetch Supervisor's Own Today Attendance
export async function getSupervisorOwnTodayAttendance(user, targetDate = null) {
  if (!user || !user.user_id) return null

  const todayDate = targetDate || new Date().toISOString().split('T')[0]

  try {
    const [empRows] = await db.query(
      'SELECT employee_id, employee_code, first_name, last_name FROM employees WHERE user_id = ? OR LOWER(email) = ?',
      [user.user_id, (user.email || '').toLowerCase()]
    )

    if (!empRows || empRows.length === 0) {
      return {
        date: todayDate,
        hasRecord: false,
        status: 'Unmarked',
        message: 'Supervisor employee record is not linked.',
      }
    }

    const supervisorEmployee = empRows[0]

    const [attRows] = await db.query(
      `SELECT ar.*, cs.site_name
       FROM attendance_records ar
       JOIN construction_sites cs ON ar.site_id = cs.site_id
       WHERE ar.worker_id = ? AND ar.date = ?
       LIMIT 1`,
      [supervisorEmployee.employee_id, todayDate]
    )

    if (!attRows || attRows.length === 0) {
      return {
        date: todayDate,
        employee_code: supervisorEmployee.employee_code,
        name: `${supervisorEmployee.first_name} ${supervisorEmployee.last_name || ''}`.trim(),
        hasRecord: false,
        status: 'Not Checked In',
        check_in_at: null,
        check_out_at: null,
        hours_worked: 0,
      }
    }

    const rec = attRows[0]
    return {
      date: todayDate,
      employee_code: supervisorEmployee.employee_code,
      name: `${supervisorEmployee.first_name} ${supervisorEmployee.last_name || ''}`.trim(),
      site_name: rec.site_name,
      hasRecord: true,
      status: rec.check_out_at ? 'Checked Out' : rec.check_in_at ? 'Checked In' : rec.status || 'Present',
      check_in_at: rec.check_in_at,
      check_out_at: rec.check_out_at,
      hours_worked: rec.hours_worked || 0,
      distance_meters: rec.distance_meters,
    }
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorOwnTodayAttendance Error:', err.message)
    return null
  }
}

// 5. Fetch Supervisor's Personal Attendance History
export async function getSupervisorOwnAttendanceHistory(user, { startDate, endDate, status, limit = 15 } = {}) {
  if (!user || !user.user_id) return []

  try {
    const [empRows] = await db.query(
      'SELECT employee_id FROM employees WHERE user_id = ? OR LOWER(email) = ?',
      [user.user_id, (user.email || '').toLowerCase()]
    )
    if (!empRows || empRows.length === 0) return []

    const supEmpId = empRows[0].employee_id
    let sql = `
      SELECT ar.date, ar.check_in_at, ar.check_out_at, ar.hours_worked, ar.status, ar.distance_meters, ar.is_late, cs.site_name
      FROM attendance_records ar
      JOIN construction_sites cs ON ar.site_id = cs.site_id
      WHERE ar.worker_id = ?
    `
    const params = [supEmpId]

    if (startDate) {
      sql += ' AND ar.date >= ?'
      params.push(startDate)
    }
    if (endDate) {
      sql += ' AND ar.date <= ?'
      params.push(endDate)
    }
    if (status) {
      sql += ' AND ar.status = ?'
      params.push(status)
    }

    sql += ' ORDER BY ar.date DESC, ar.check_in_at DESC LIMIT ?'
    params.push(Number(limit) || 15)

    const [rows] = await db.query(sql, params)
    return rows || []
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorOwnAttendanceHistory Error:', err.message)
    return []
  }
}

// 6. Fetch Site Attendance History / Report for Authorized Site
export async function getSupervisorSiteAttendanceReport(siteId, user, { startDate, endDate, status, limit = 25 } = {}) {
  if (!siteId || !user) return []

  try {
    let sql = `
      SELECT ar.date, e.employee_code, CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) as worker_name,
             ar.check_in_at, ar.check_out_at, ar.hours_worked, ar.status, ar.distance_meters, ar.is_late, cs.site_name
      FROM attendance_records ar
      JOIN employees e ON ar.worker_id = e.employee_id
      JOIN construction_sites cs ON ar.site_id = cs.site_id
      WHERE ar.site_id = ?
    `
    const params = [siteId]

    if (startDate) {
      sql += ' AND ar.date >= ?'
      params.push(startDate)
    }
    if (endDate) {
      sql += ' AND ar.date <= ?'
      params.push(endDate)
    }
    if (status) {
      sql += ' AND ar.status = ?'
      params.push(status)
    }

    sql += ' ORDER BY ar.date DESC, ar.check_in_at DESC LIMIT ?'
    params.push(Number(limit) || 25)

    const [rows] = await db.query(sql, params)
    return rows || []
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorSiteAttendanceReport Error:', err.message)
    return []
  }
}

// 7. Fetch Active & Pending Work Assignments for Supervisor's Site
export async function getSupervisorWorkAssignments(siteId, user) {
  if (!siteId || !user) return []

  try {
    const [rows] = await db.query(
      `SELECT wsa.assignment_id, wsa.assigned_date, wsa.status,
              e.employee_code, CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) as worker_name,
              e.employee_type_name, e.phone, cs.site_name
       FROM worker_site_assignments wsa
       JOIN employees e ON wsa.worker_id = e.employee_id
       JOIN construction_sites cs ON wsa.site_id = cs.site_id
       WHERE wsa.site_id = ?
       ORDER BY wsa.assigned_date DESC`,
      [siteId]
    )
    return rows || []
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorWorkAssignments Error:', err.message)
    return []
  }
}

// 8. Fetch Worker Attendance Correction Requests for Supervisor's Site
export async function getSupervisorCorrectionRequests(siteId, user) {
  if (!siteId || !user) return []

  try {
    const [rows] = await db.query(
      `SELECT ac.correction_id, ac.requested_check_in, ac.requested_check_out, ac.reason, ac.status,
              ac.review_remarks, ac.created_at, cs.site_name,
              CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) as worker_name, e.employee_code
       FROM attendance_corrections ac
       JOIN construction_sites cs ON ac.site_id = cs.site_id
       JOIN employees e ON ac.worker_id = e.employee_id
       WHERE ac.site_id = ?
       ORDER BY ac.created_at DESC LIMIT 15`,
      [siteId]
    )
    return rows || []
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorCorrectionRequests Error:', err.message)
    return []
  }
}

// 9. Fetch Authenticated Supervisor's Profile Information
export async function getSupervisorProfile(user) {
  if (!user || !user.user_id) return null

  try {
    const [rows] = await db.query(
      `SELECT u.user_id, u.name, u.email, u.role, u.phone, u.status,
              e.employee_id, e.employee_code, e.employee_type_name,
              cs.site_id, cs.site_name, cs.address as site_address
       FROM users u
       LEFT JOIN employees e ON (e.user_id = u.user_id OR LOWER(e.email) = LOWER(u.email))
       LEFT JOIN construction_sites cs ON (cs.supervisor_id = u.user_id OR LOWER(cs.supervisor_name) = LOWER(u.name))
       WHERE u.user_id = ?
       LIMIT 1`,
      [user.user_id]
    )
    return rows && rows.length > 0 ? rows[0] : user
  } catch (err) {
    console.error('[Supervisor AI Tool] getSupervisorProfile Error:', err.message)
    return user
  }
}
