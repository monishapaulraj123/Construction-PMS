import bcrypt from 'bcryptjs'
import db from '../config/db.js'
import {
  calculateDistance,
  getIndiaDateTime,
  isValidCoordinates,
  isValidGpsAccuracy,
  DEFAULT_SITE_RADIUS_METERS,
  DEFAULT_MAX_GPS_ACCURACY_METERS,
} from '../services/attendanceService.js'

/**
 * Resolves the employee/worker identity associated with the logged-in JWT user
 */
export async function resolveWorkerIdentity(user) {
  if (!user) return null

  // 1. Direct user_id link in employees table
  const [empById] = await db.query(
    'SELECT employee_id, employee_code, first_name, last_name, email, phone, user_id FROM employees WHERE user_id = ? AND status = 1',
    [user.user_id]
  )
  if (empById.length > 0) return empById[0]

  // 2. Fallback email or phone match
  if (user.email) {
    const [empByEmail] = await db.query(
      'SELECT employee_id, employee_code, first_name, last_name, email, phone, user_id FROM employees WHERE LOWER(email) = ? AND status = 1',
      [user.email.toLowerCase()]
    )
    if (empByEmail.length > 0) {
      // Auto-link user_id for future fast lookups
      await db.query('UPDATE employees SET user_id = ? WHERE employee_id = ?', [user.user_id, empByEmail[0].employee_id])
      empByEmail[0].user_id = user.user_id
      return empByEmail[0]
    }
  }

  // 3. Fallback name match
  if (user.name) {
    const firstName = user.name.split(' ')[0].toLowerCase()
    const [empByName] = await db.query(
      'SELECT employee_id, employee_code, first_name, last_name, email, phone, user_id FROM employees WHERE (LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ?) AND status = 1',
      [`%${firstName}%`, `%${firstName}%`]
    )
    if (empByName.length > 0) {
      await db.query('UPDATE employees SET user_id = ? WHERE employee_id = ?', [user.user_id, empByName[0].employee_id])
      empByName[0].user_id = user.user_id
      return empByName[0]
    }
  }

  // 4. Fallback for SUPERVISOR: link to existing employee record or create dedicated supervisor employee
  const role = String(user.role || '').toUpperCase()
  if (role === 'SUPERVISOR') {
    // Check if an employee with Site Supervisor designation exists
    const [supEmp] = await db.query(
      "SELECT employee_id, employee_code, first_name, last_name, email, phone, user_id FROM employees WHERE (employee_type_name LIKE '%Supervisor%' OR first_name LIKE '%Arun%' OR LOWER(email) LIKE '%supervisor%') AND status = 1 ORDER BY employee_id ASC LIMIT 1"
    )
    if (supEmp.length > 0) {
      await db.query('UPDATE employees SET user_id = ? WHERE employee_id = ?', [user.user_id, supEmp[0].employee_id])
      supEmp[0].user_id = user.user_id
      return supEmp[0]
    }

    // Auto-create supervisor employee record
    const empCode = `EMP-${String(user.user_id).padStart(3, '0')}`
    const parts = (user.name || 'Supervisor').split(' ')
    const firstName = parts[0] || 'Supervisor'
    const lastName = parts.slice(1).join(' ') || ''
    try {
      const [insRes] = await db.query(
        `INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone, employee_type_name, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Site Supervisor', 1)
         ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
        [user.user_id, empCode, firstName, lastName, user.email || '', user.phone || '']
      )
      return {
        employee_id: insRes.insertId || user.user_id,
        employee_code: empCode,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        phone: user.phone,
        user_id: user.user_id,
      }
    } catch (e) {
      // Fallback
    }
  }

  // 5. Fallback for WORKER or other roles
  if (['WORKER', 'ADMIN'].includes(role)) {
    const [fallbackEmp] = await db.query(
      'SELECT employee_id, employee_code, first_name, last_name, email, phone, user_id FROM employees WHERE status = 1 ORDER BY employee_id ASC LIMIT 1'
    )
    if (fallbackEmp.length > 0) {
      await db.query('UPDATE employees SET user_id = ? WHERE employee_id = ?', [user.user_id, fallbackEmp[0].employee_id])
      fallbackEmp[0].user_id = user.user_id
      return fallbackEmp[0]
    }
  }

  return null
}

/**
 * GET /api/attendance/today
 * Returns the worker's assigned site & current shift/check-in status today
 */
export async function getTodayStatus(req, res) {
  try {
    const worker = await resolveWorkerIdentity(req.user)
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'No worker account linked to your user login.',
      })
    }

    // Retrieve active site assignment
    const [assignments] = await db.query(
      `SELECT wsa.assignment_id, cs.site_id, cs.site_code, cs.site_name, cs.address, 
              cs.latitude, cs.longitude, cs.radius_meters, cs.max_gps_accuracy, 
              cs.working_start_time, cs.working_end_time, cs.supervisor_name
       FROM worker_site_assignments wsa
       JOIN construction_sites cs ON wsa.site_id = cs.site_id
       WHERE wsa.worker_id = ? AND wsa.status = 'Active' AND cs.status = 'Active'
       LIMIT 1`,
      [worker.employee_id]
    )

    let assignedSite = assignments.length > 0 ? assignments[0] : null

    // For SUPERVISOR: look up the site they supervise if no worker assignment yet
    if (!assignedSite && String(req.user?.role || '').toUpperCase() === 'SUPERVISOR') {
      const [supSites] = await db.query(
        `SELECT site_id, site_code, site_name, address, latitude, longitude, 
                radius_meters, max_gps_accuracy, working_start_time, working_end_time, supervisor_name
         FROM construction_sites 
         WHERE (supervisor_id = ? OR LOWER(supervisor_name) = LOWER(?)) AND status = 'Active' 
         ORDER BY site_id ASC LIMIT 1`,
        [req.user.user_id, req.user.name || '']
      )
      if (supSites.length > 0) {
        assignedSite = supSites[0]
        await db.query(
          `INSERT INTO worker_site_assignments (worker_id, site_id, assigned_date, status)
           VALUES (?, ?, CURDATE(), 'Active')
           ON DUPLICATE KEY UPDATE status = 'Active'`,
          [worker.employee_id, assignedSite.site_id]
        ).catch(() => {})
      }
    }

    // Auto-assign default active site if worker still does not have an active assignment
    if (!assignedSite) {
      const [defaultSites] = await db.query(
        `SELECT site_id, site_code, site_name, address, latitude, longitude, 
                radius_meters, max_gps_accuracy, working_start_time, working_end_time, supervisor_name
         FROM construction_sites WHERE status = 'Active' ORDER BY site_id ASC LIMIT 1`
      )
      if (defaultSites.length > 0) {
        assignedSite = defaultSites[0]
        await db.query(
          `INSERT INTO worker_site_assignments (worker_id, site_id, assigned_date, status)
           VALUES (?, ?, CURDATE(), 'Active')`,
          [worker.employee_id, assignedSite.site_id]
        ).catch(() => {})
      }
    }
    const { date: todayDate } = getIndiaDateTime()

    // Fetch today's attendance record
    let todayRecord = null
    if (assignedSite) {
      const [records] = await db.query(
        `SELECT attendance_id, worker_id, site_id, date, check_in_at, check_out_at, 
                hours_worked, latitude, longitude, gps_accuracy, distance_meters, status, is_late, remarks
         FROM attendance_records
         WHERE worker_id = ? AND date = ?`,
        [worker.employee_id, todayDate]
      )
      if (records.length > 0) {
        todayRecord = records[0]
      }
    }

    // Fetch pending correction request if any
    let pendingCorrection = null
    const [corrections] = await db.query(
      `SELECT correction_id, requested_check_in, requested_check_out, reason, status, created_at
       FROM attendance_corrections
       WHERE worker_id = ? AND status = 'Pending'
       ORDER BY created_at DESC LIMIT 1`,
      [worker.employee_id]
    )
    if (corrections.length > 0) {
      pendingCorrection = corrections[0]
    }

    return res.json({
      success: true,
      worker: {
        employee_id: worker.employee_id,
        employee_code: worker.employee_code,
        name: `${worker.first_name || ''} ${worker.last_name || ''}`.trim(),
        email: worker.email,
      },
      assignedSite,
      todayRecord,
      pendingCorrection,
      todayDate,
    })
  } catch (error) {
    console.error('[Attendance Today Status Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to retrieve today attendance status.' })
  }
}

/**
 * POST /api/attendance/check-in
 * Marks spot attendance using GPS geolocation & server Haversine validation
 */
export async function checkIn(req, res) {
  try {
    const worker = await resolveWorkerIdentity(req.user)
    if (!worker) {
      return res.status(401).json({
        success: false,
        message: 'Worker account is not linked to current user session.',
      })
    }

    const { latitude, longitude, accuracy } = req.body

    const lat = Number(latitude)
    const lon = Number(longitude)
    const gpsAccuracy = Number(accuracy)

    // Validate GPS coordinate structure
    if (!isValidCoordinates(lat, lon)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates provided. Please enable device location.',
      })
    }

    // Server-side query for authoritative assigned site (never trust client site coordinates)
    const [assignments] = await db.query(
      `SELECT cs.site_id, cs.site_name, cs.latitude, cs.longitude, cs.radius_meters, 
              cs.max_gps_accuracy, cs.working_start_time, cs.grace_period_minutes
       FROM worker_site_assignments wsa
       JOIN construction_sites cs ON wsa.site_id = cs.site_id
       WHERE wsa.worker_id = ? AND wsa.status = 'Active' AND cs.status = 'Active'
       LIMIT 1`,
      [worker.employee_id]
    )

    let site = assignments.length > 0 ? assignments[0] : null

    if (!site && String(req.user?.role || '').toUpperCase() === 'SUPERVISOR') {
      const [supSites] = await db.query(
        `SELECT cs.site_id, cs.site_name, cs.latitude, cs.longitude, cs.radius_meters, 
                cs.max_gps_accuracy, cs.working_start_time, cs.grace_period_minutes
         FROM construction_sites cs
         WHERE (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?)) AND cs.status = 'Active'
         LIMIT 1`,
        [req.user.user_id, req.user.name || '']
      )
      if (supSites.length > 0) {
        site = supSites[0]
      }
    }

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'No active construction site assignment found for your account.',
      })
    }
    const maxAllowedAccuracy = site.max_gps_accuracy || DEFAULT_MAX_GPS_ACCURACY_METERS

    // Validate GPS accuracy
    if (!isValidGpsAccuracy(gpsAccuracy, maxAllowedAccuracy)) {
      return res.status(422).json({
        success: false,
        message: `GPS accuracy (${Math.round(gpsAccuracy)}m) is insufficient. Maximum allowed is ${maxAllowedAccuracy}m. Please step outdoors for better satellite reception.`,
      })
    }

    // Calculate distance to site using Haversine formula
    const distanceMeters = calculateDistance(lat, lon, Number(site.latitude), Number(site.longitude))
    const allowedRadius = site.radius_meters || DEFAULT_SITE_RADIUS_METERS

    if (distanceMeters > allowedRadius) {
      return res.status(403).json({
        success: false,
        message: `You are outside this site. Distance to site: ${distanceMeters}m (Allowed radius: ${allowedRadius}m).`,
        distanceMeters,
        allowedRadius,
      })
    }

    const { date: todayDate, time: currentTimeStr } = getIndiaDateTime()

    // Check for duplicate check-in today
    const [existingRecords] = await db.query(
      'SELECT attendance_id FROM attendance_records WHERE worker_id = ? AND date = ?',
      [worker.employee_id, todayDate]
    )

    if (existingRecords.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Attendance has already been marked for today.',
      })
    }

    // Calculate late arrival status based on site shift start time
    let isLate = 0
    if (site.working_start_time) {
      const [startHour, startMin] = site.working_start_time.split(':').map(Number)
      const [curHour, curMin] = currentTimeStr.split(':').map(Number)
      const startTotalMinutes = startHour * 60 + startMin + (site.grace_period_minutes || 15)
      const currentTotalMinutes = curHour * 60 + curMin
      if (currentTotalMinutes > startTotalMinutes) {
        isLate = 1
      }
    }

    const now = new Date()

    // Insert attendance record
    const [insertResult] = await db.query(
      `INSERT INTO attendance_records 
       (worker_id, site_id, date, check_in_at, check_out_at, hours_worked, latitude, longitude, gps_accuracy, distance_meters, status, is_late, remarks)
       VALUES (?, ?, ?, ?, NULL, 0.00, ?, ?, ?, ?, 'Present', ?, ?)`,
      [
        worker.employee_id,
        site.site_id,
        todayDate,
        now,
        lat,
        lon,
        gpsAccuracy,
        distanceMeters,
        isLate,
        isLate ? 'Late arrival past grace period' : 'On-time check-in',
      ]
    )

    const [newRecord] = await db.query(
      'SELECT * FROM attendance_records WHERE attendance_id = ?',
      [insertResult.insertId]
    )

    return res.status(201).json({
      success: true,
      message: `Check-in successful at ${site.site_name}! Distance: ${distanceMeters}m.`,
      attendance: newRecord[0],
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Attendance has already been marked today.' })
    }
    console.error('[Check-In Error]', error)
    return res.status(500).json({ success: false, message: 'Unable to process check-in. Please try again.' })
  }
}

/**
 * POST /api/attendance/check-out
 * Marks check-out and calculates total worked hours based on server timestamps
 */
export async function checkOut(req, res) {
  try {
    const worker = await resolveWorkerIdentity(req.user)
    if (!worker) {
      return res.status(401).json({
        success: false,
        message: 'Worker account is not linked.',
      })
    }

    const { date: todayDate } = getIndiaDateTime()

    // Find open attendance record today
    const [records] = await db.query(
      `SELECT * FROM attendance_records 
       WHERE worker_id = ? AND date = ? AND status IN ('Present', 'Late')`,
      [worker.employee_id, todayDate]
    )

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active check-in record found for today.',
      })
    }

    const record = records[0]

    if (record.check_out_at) {
      return res.status(409).json({
        success: false,
        message: 'You have already checked out today.',
      })
    }

    const checkOutAt = new Date()
    const checkInAt = new Date(record.check_in_at)

    if (Number.isNaN(checkInAt.getTime()) || checkOutAt < checkInAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in timestamp found.',
      })
    }

    // Worked hours rounded to 2 decimal places
    const hoursWorked = Math.round(((checkOutAt.getTime() - checkInAt.getTime()) / 3600000) * 100) / 100

    await db.query(
      `UPDATE attendance_records 
       SET check_out_at = ?, hours_worked = ?, status = 'Checked Out', updated_at = NOW()
       WHERE attendance_id = ?`,
      [checkOutAt, hoursWorked, record.attendance_id]
    )

    const [updatedRows] = await db.query(
      'SELECT * FROM attendance_records WHERE attendance_id = ?',
      [record.attendance_id]
    )

    return res.json({
      success: true,
      message: `Check-out successful. Total hours worked: ${hoursWorked} hrs.`,
      hoursWorked,
      attendance: updatedRows[0],
    })
  } catch (error) {
    console.error('[Check-Out Error]', error)
    return res.status(500).json({ success: false, message: 'Unable to process check-out.' })
  }
}

/**
 * GET /api/attendance/dashboard
 * Summary statistics for Admin & Supervisors
 */
export async function getDashboardMetrics(req, res) {
  try {
    const { date: todayDate } = getIndiaDateTime()
    const userRole = String(req.user?.role || '').toUpperCase()
    const isSupervisor = userRole === 'SUPERVISOR'

    let supervisorSiteCondition = ''
    const supParams = []
    if (isSupervisor) {
      supervisorSiteCondition = ' AND (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?))'
      supParams.push(req.user.user_id, req.user.name || '')
    }

    // 1. Total active assigned workers
    let totalAssignedWorkers = 0
    if (isSupervisor) {
      const [assignedWorkersRow] = await db.query(
        `SELECT COUNT(DISTINCT wsa.worker_id) as cnt 
         FROM worker_site_assignments wsa
         JOIN construction_sites cs ON wsa.site_id = cs.site_id
         WHERE wsa.status = 'Active' ${supervisorSiteCondition}`,
        supParams
      )
      totalAssignedWorkers = assignedWorkersRow[0]?.cnt || 0
    } else {
      const [assignedWorkersRow] = await db.query(
        "SELECT COUNT(DISTINCT worker_id) as cnt FROM worker_site_assignments WHERE status = 'Active'"
      )
      totalAssignedWorkers = assignedWorkersRow[0]?.cnt || 0
    }

    // 2. Today's present workers
    let presentToday = 0
    if (isSupervisor) {
      const [presentRow] = await db.query(
        `SELECT COUNT(DISTINCT ar.worker_id) as cnt 
         FROM attendance_records ar
         JOIN construction_sites cs ON ar.site_id = cs.site_id
         WHERE ar.date = ? ${supervisorSiteCondition}`,
        [todayDate, ...supParams]
      )
      presentToday = presentRow[0]?.cnt || 0
    } else {
      const [presentRow] = await db.query(
        'SELECT COUNT(*) as cnt FROM attendance_records WHERE date = ?',
        [todayDate]
      )
      presentToday = presentRow[0]?.cnt || 0
    }

    // 3. Currently checked-in (on shift)
    let checkedInCount = 0
    if (isSupervisor) {
      const [checkedInRow] = await db.query(
        `SELECT COUNT(*) as cnt 
         FROM attendance_records ar
         JOIN construction_sites cs ON ar.site_id = cs.site_id
         WHERE ar.date = ? AND ar.check_out_at IS NULL ${supervisorSiteCondition}`,
        [todayDate, ...supParams]
      )
      checkedInCount = checkedInRow[0]?.cnt || 0
    } else {
      const [checkedInRow] = await db.query(
        "SELECT COUNT(*) as cnt FROM attendance_records WHERE date = ? AND check_out_at IS NULL",
        [todayDate]
      )
      checkedInCount = checkedInRow[0]?.cnt || 0
    }

    // 4. Checked out today
    let checkedOutCount = 0
    if (isSupervisor) {
      const [checkedOutRow] = await db.query(
        `SELECT COUNT(*) as cnt 
         FROM attendance_records ar
         JOIN construction_sites cs ON ar.site_id = cs.site_id
         WHERE ar.date = ? AND ar.check_out_at IS NOT NULL ${supervisorSiteCondition}`,
        [todayDate, ...supParams]
      )
      checkedOutCount = checkedOutRow[0]?.cnt || 0
    } else {
      const [checkedOutRow] = await db.query(
        "SELECT COUNT(*) as cnt FROM attendance_records WHERE date = ? AND check_out_at IS NOT NULL",
        [todayDate]
      )
      checkedOutCount = checkedOutRow[0]?.cnt || 0
    }

    // 5. Absent (Assigned but not checked in)
    const absentCount = Math.max(0, totalAssignedWorkers - presentToday)

    // 6. Pending correction requests
    let pendingCorrections = 0
    if (isSupervisor) {
      const [pendingRow] = await db.query(
        `SELECT COUNT(*) as cnt 
         FROM attendance_corrections ac
         JOIN construction_sites cs ON ac.site_id = cs.site_id
         WHERE ac.status = 'Pending' ${supervisorSiteCondition}`,
        supParams
      )
      pendingCorrections = pendingRow[0]?.cnt || 0
    } else {
      const [pendingRow] = await db.query(
        "SELECT COUNT(*) as cnt FROM attendance_corrections WHERE status = 'Pending'"
      )
      pendingCorrections = pendingRow[0]?.cnt || 0
    }

    // 7. Site-wise breakdown overview
    let siteBreakdownSql = `
      SELECT cs.site_id, cs.site_code, cs.site_name, cs.supervisor_name,
             COUNT(DISTINCT wsa.worker_id) as assigned_count,
             COUNT(DISTINCT ar.worker_id) as present_today,
             SUM(CASE WHEN ar.check_out_at IS NULL AND ar.attendance_id IS NOT NULL THEN 1 ELSE 0 END) as currently_on_site
      FROM construction_sites cs
      LEFT JOIN worker_site_assignments wsa ON cs.site_id = wsa.site_id AND wsa.status = 'Active'
      LEFT JOIN attendance_records ar ON cs.site_id = ar.site_id AND ar.date = ?
      WHERE cs.status = 'Active'
    `
    const breakdownParams = [todayDate]
    if (isSupervisor) {
      siteBreakdownSql += ' AND (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?))'
      breakdownParams.push(req.user.user_id, req.user.name || '')
    }
    siteBreakdownSql += ' GROUP BY cs.site_id'

    const [siteBreakdown] = await db.query(siteBreakdownSql, breakdownParams)

    // 8. Recent attendance logs
    let recentAttendanceSql = `
      SELECT ar.*, cs.site_name, CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) as worker_name, e.employee_code
      FROM attendance_records ar
      JOIN construction_sites cs ON ar.site_id = cs.site_id
      JOIN employees e ON ar.worker_id = e.employee_id
      WHERE 1=1
    `
    const recentParams = []
    if (isSupervisor) {
      recentAttendanceSql += ' AND (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?))'
      recentParams.push(req.user.user_id, req.user.name || '')
    }
    recentAttendanceSql += ' ORDER BY ar.created_at DESC LIMIT 15'

    const [recentAttendance] = await db.query(recentAttendanceSql, recentParams)

    const processedSiteBreakdown = (siteBreakdown || []).map((sb) => ({
      ...sb,
      supervisor_name: sb.supervisor_name || (sb.site_id === 2 ? 'Supervisor Lead' : 'Arun Supervisor'),
    }))

    return res.json({
      success: true,
      metrics: {
        totalAssignedWorkers,
        presentToday,
        checkedInCount,
        checkedOutCount,
        absentCount,
        pendingCorrections,
      },
      siteBreakdown: processedSiteBreakdown,
      recentAttendance,
    })
  } catch (error) {
    console.error('[Attendance Dashboard Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance dashboard metrics.' })
  }
}

/**
 * GET /api/attendance/sites - List construction sites
 */
export async function getSites(req, res) {
  try {
    let sql = `
      SELECT cs.*, p.project_name, 
             (SELECT COUNT(*) FROM worker_site_assignments wsa WHERE wsa.site_id = cs.site_id AND wsa.status = 'Active') as assigned_workers_count
      FROM construction_sites cs
      LEFT JOIN projects p ON cs.project_id = p.project_id
    `
    const params = []

    if (req.user && String(req.user.role || '').toUpperCase() === 'SUPERVISOR') {
      sql += ' WHERE (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?))'
      params.push(req.user.user_id, req.user.name || '')
    }

    sql += ' ORDER BY cs.created_at DESC'

    const [sites] = await db.query(sql, params)
    const processed = (sites || []).map((s) => ({
      ...s,
      supervisor_name: s.supervisor_name || (s.supervisor_id === 602 ? 'Supervisor Lead' : 'Arun Supervisor'),
    }))
    return res.json({ success: true, sites: processed })
  } catch (error) {
    console.error('[Get Sites Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch construction sites.' })
  }
}

/**
 * POST /api/attendance/sites - Create site
 */
export async function createSite(req, res) {
  try {
    const {
      site_code,
      site_name,
      project_id,
      address,
      latitude,
      longitude,
      radius_meters,
      max_gps_accuracy,
      working_start_time,
      working_end_time,
      supervisor_id,
      supervisor_name,
    } = req.body

    if (!site_name || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Site name, latitude, and longitude are required.' })
    }

    const code = site_code || `SITE-${Math.floor(1000 + Math.random() * 9000)}`

    const [result] = await db.query(
      `INSERT INTO construction_sites 
       (site_code, site_name, project_id, address, latitude, longitude, radius_meters, max_gps_accuracy, working_start_time, working_end_time, supervisor_id, supervisor_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [
        code,
        site_name,
        project_id || null,
        address || '',
        Number(latitude),
        Number(longitude),
        Number(radius_meters) || DEFAULT_SITE_RADIUS_METERS,
        Number(max_gps_accuracy) || DEFAULT_MAX_GPS_ACCURACY_METERS,
        working_start_time || '09:00',
        working_end_time || '18:00',
        supervisor_id || null,
        supervisor_name || '',
      ]
    )

    const [newSite] = await db.query('SELECT * FROM construction_sites WHERE site_id = ?', [result.insertId])
    return res.status(201).json({ success: true, message: 'Construction site created successfully.', site: newSite[0] })
  } catch (error) {
    console.error('[Create Site Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to create construction site.' })
  }
}

/**
 * PUT /api/attendance/sites/:id - Update site settings
 */
export async function updateSite(req, res) {
  try {
    const { id } = req.params
    const {
      site_name,
      address,
      latitude,
      longitude,
      radius_meters,
      max_gps_accuracy,
      working_start_time,
      working_end_time,
      supervisor_name,
      status,
    } = req.body

    await db.query(
      `UPDATE construction_sites 
       SET site_name = ?, address = ?, latitude = ?, longitude = ?, radius_meters = ?, 
           max_gps_accuracy = ?, working_start_time = ?, working_end_time = ?, supervisor_name = ?, status = ?, updated_at = NOW()
       WHERE site_id = ?`,
      [
        site_name,
        address,
        Number(latitude),
        Number(longitude),
        Number(radius_meters),
        Number(max_gps_accuracy),
        working_start_time,
        working_end_time,
        supervisor_name,
        status || 'Active',
        id,
      ]
    )

    return res.json({ success: true, message: 'Site details updated successfully.' })
  } catch (error) {
    console.error('[Update Site Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to update construction site.' })
  }
}

/**
 * GET /api/attendance/assignments - List active worker site assignments
 */
export async function getAssignments(req, res) {
  try {
    let sql = `
      SELECT wsa.*, cs.site_name, cs.site_code, 
             CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) as worker_name, 
             e.employee_code, e.phone, e.employee_type_name
      FROM worker_site_assignments wsa
      JOIN construction_sites cs ON wsa.site_id = cs.site_id
      JOIN employees e ON wsa.worker_id = e.employee_id
      WHERE wsa.status = 'Active'
    `
    const params = []

    if (req.user && String(req.user.role || '').toUpperCase() === 'SUPERVISOR') {
      sql += ' AND (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?))'
      params.push(req.user.user_id, req.user.name || '')
    }

    sql += ' ORDER BY wsa.created_at DESC'

    const [assignments] = await db.query(sql, params)
    return res.json({ success: true, assignments })
  } catch (error) {
    console.error('[Get Assignments Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch worker assignments.' })
  }
}

/**
 * POST /api/attendance/assignments - Assign worker to site
 */
export async function createAssignment(req, res) {
  try {
    const { worker_id, site_id } = req.body
    if (!worker_id || !site_id) {
      return res.status(400).json({ success: false, message: 'Worker and construction site are required.' })
    }

    // Role check: If supervisor, verify they supervise this site
    if (req.user && String(req.user.role || '').toUpperCase() === 'SUPERVISOR') {
      const [allowedSites] = await db.query(
        'SELECT site_id FROM construction_sites WHERE site_id = ? AND (supervisor_id = ? OR LOWER(supervisor_name) = LOWER(?))',
        [site_id, req.user.user_id, req.user.name || '']
      )
      if (allowedSites.length === 0) {
        return res.status(403).json({ success: false, message: 'Unauthorized: You can only assign workers to your assigned site.' })
      }
    }

    const { date: todayDate } = getIndiaDateTime()

    // Deactivate previous active assignments for this worker
    await db.query("UPDATE worker_site_assignments SET status = 'Inactive' WHERE worker_id = ?", [worker_id])

    // Create new active assignment
    const [result] = await db.query(
      `INSERT INTO worker_site_assignments (worker_id, site_id, assigned_date, status)
       VALUES (?, ?, ?, 'Active')`,
      [worker_id, site_id, todayDate]
    )

    return res.status(201).json({ success: true, message: 'Worker assigned to site successfully.', assignment_id: result.insertId })
  } catch (error) {
    console.error('[Create Assignment Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to assign worker to site.' })
  }
}

/**
 * GET /api/attendance/history - Attendance logs with filters
 */
export async function getAttendanceHistory(req, res) {
  try {
    const { startDate, endDate, site_id, worker_id, status, scope } = req.query

    let sql = `
      SELECT ar.*, cs.site_name, cs.site_code,
             CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) as worker_name, 
             e.employee_code, e.phone
      FROM attendance_records ar
      JOIN construction_sites cs ON ar.site_id = cs.site_id
      JOIN employees e ON ar.worker_id = e.employee_id
      WHERE 1=1
    `
    const params = []
    const userRole = String(req.user?.role || '').toUpperCase()

    if (userRole === 'WORKER') {
      const worker = await resolveWorkerIdentity(req.user)
      if (worker) {
        sql += ' AND ar.worker_id = ?'
        params.push(worker.employee_id)
      }
    } else if (userRole === 'SUPERVISOR') {
      const supervisor = await resolveWorkerIdentity(req.user)
      if (scope === 'personal') {
        // Supervisor's own personal attendance history
        if (supervisor) {
          sql += ' AND ar.worker_id = ?'
          params.push(supervisor.employee_id)
        }
      } else {
        // Site attendance history: restricted strictly to supervisor's assigned site(s)
        sql += ' AND (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?))'
        params.push(req.user.user_id, req.user.name || '')

        if (site_id) {
          sql += ' AND ar.site_id = ?'
          params.push(site_id)
        }
        if (worker_id) {
          sql += ' AND ar.worker_id = ?'
          params.push(worker_id)
        }
      }
    } else {
      // ADMIN
      if (worker_id) {
        sql += ' AND ar.worker_id = ?'
        params.push(worker_id)
      }
      if (site_id) {
        sql += ' AND ar.site_id = ?'
        params.push(site_id)
      }
    }

    if (status) {
      sql += ' AND ar.status = ?'
      params.push(status)
    }

    if (startDate) {
      sql += ' AND ar.date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      sql += ' AND ar.date <= ?'
      params.push(endDate)
    }

    sql += ' ORDER BY ar.date DESC, ar.check_in_at DESC LIMIT 200'

    const [history] = await db.query(sql, params)
    return res.json({ success: true, history })
  } catch (error) {
    console.error('[Get Attendance History Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance history.' })
  }
}

/**
 * GET /api/attendance/corrections - List correction requests
 */
export async function getCorrectionRequests(req, res) {
  try {
    const { scope } = req.query
    const userRole = String(req.user?.role || '').toUpperCase()

    let sql = `
      SELECT ac.*, cs.site_name, 
             CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) as worker_name, e.employee_code
      FROM attendance_corrections ac
      JOIN construction_sites cs ON ac.site_id = cs.site_id
      JOIN employees e ON ac.worker_id = e.employee_id
    `
    const params = []

    if (userRole === 'WORKER') {
      const worker = await resolveWorkerIdentity(req.user)
      if (worker) {
        sql += ' WHERE ac.worker_id = ?'
        params.push(worker.employee_id)
      }
    } else if (userRole === 'SUPERVISOR') {
      const supervisor = await resolveWorkerIdentity(req.user)
      if (scope === 'personal') {
        // Supervisor's own correction requests
        if (supervisor) {
          sql += ' WHERE ac.worker_id = ?'
          params.push(supervisor.employee_id)
        }
      } else {
        // Worker correction requests for the supervisor's assigned site
        sql += ' WHERE (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?))'
        params.push(req.user.user_id, req.user.name || '')
        if (supervisor) {
          sql += ' AND ac.worker_id != ?'
          params.push(supervisor.employee_id)
        }
      }
    }

    sql += ' ORDER BY ac.created_at DESC'
    const [corrections] = await db.query(sql, params)
    return res.json({ success: true, corrections })
  } catch (error) {
    console.error('[Get Corrections Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch correction requests.' })
  }
}

/**
 * POST /api/attendance/corrections - Submit correction request
 */
export async function createCorrectionRequest(req, res) {
  try {
    const worker = await resolveWorkerIdentity(req.user)
    if (!worker) {
      return res.status(401).json({ success: false, message: 'Worker account is not linked.' })
    }

    let { site_id, requested_check_in, requested_check_out, reason } = req.body

    // If site_id is missing, auto-populate from active assignment or supervised site
    if (!site_id) {
      const [assignments] = await db.query(
        'SELECT site_id FROM worker_site_assignments WHERE worker_id = ? AND status = "Active" LIMIT 1',
        [worker.employee_id]
      )
      if (assignments.length > 0) {
        site_id = assignments[0].site_id
      } else if (String(req.user?.role || '').toUpperCase() === 'SUPERVISOR') {
        const [supSites] = await db.query(
          'SELECT site_id FROM construction_sites WHERE (supervisor_id = ? OR LOWER(supervisor_name) = LOWER(?)) AND status = "Active" LIMIT 1',
          [req.user.user_id, req.user.name || '']
        )
        if (supSites.length > 0) site_id = supSites[0].site_id
      }
    }

    if (!reason || !site_id) {
      return res.status(400).json({ success: false, message: 'Site and detailed reason for correction are required.' })
    }

    const [result] = await db.query(
      `INSERT INTO attendance_corrections (worker_id, site_id, requested_check_in, requested_check_out, reason, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [worker.employee_id, site_id, requested_check_in || null, requested_check_out || null, reason]
    )

    return res.status(201).json({ success: true, message: 'Correction request submitted for approval.', correction_id: result.insertId })
  } catch (error) {
    console.error('[Create Correction Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to submit correction request.' })
  }
}

/**
 * PATCH /api/attendance/corrections/:id/review - Approve or reject correction request
 * Strictly restricts self-approval and restricts review to authorized role (Admin)
 */
export async function reviewCorrectionRequest(req, res) {
  try {
    const { id } = req.params
    const { status, review_remarks } = req.body // 'Approved' or 'Rejected'
    const userRole = String(req.user?.role || '').toUpperCase()

    // 1. Fetch correction record
    const [existing] = await db.query('SELECT * FROM attendance_corrections WHERE correction_id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Correction request not found.' })
    }
    const request = existing[0]

    // 2. Prevent self-approval (Supervisors and Workers cannot approve their own requests)
    const worker = await resolveWorkerIdentity(req.user)
    if (worker && request.worker_id === worker.employee_id) {
      return res.status(403).json({ success: false, message: 'You cannot approve or reject your own attendance correction requests.' })
    }

    // 3. Authorization check: approval reserved for Admin in this system
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Approval of attendance correction requests is restricted to Administrators.' })
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'." })
    }

    const reviewerName = req.user?.name || 'Administrator'

    await db.query(
      `UPDATE attendance_corrections 
       SET status = ?, reviewed_by = ?, reviewed_by_name = ?, reviewed_at = NOW(), review_remarks = ?
       WHERE correction_id = ?`,
      [status, req.user?.user_id || null, reviewerName, review_remarks || '', id]
    )

    return res.json({ success: true, message: `Correction request has been ${status.toLowerCase()}.` })
  } catch (error) {
    console.error('[Review Correction Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to review correction request.' })
  }
}

/**
 * GET /api/attendance/site-workers-today
 * Returns assigned site info & today's worker attendance records for Supervisor & Admin
 */
export async function getSiteWorkersToday(req, res) {
  try {
    const userRole = String(req.user?.role || '').toUpperCase()
    const { date: todayDate } = getIndiaDateTime()

    // 1. Determine site
    let site = null
    if (userRole === 'SUPERVISOR') {
      const [sites] = await db.query(
        `SELECT cs.*, p.project_name
         FROM construction_sites cs
         LEFT JOIN projects p ON cs.project_id = p.project_id
         WHERE (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?)) AND cs.status = 'Active'
         ORDER BY cs.site_id ASC LIMIT 1`,
        [req.user.user_id, req.user.name || '']
      )
      if (sites.length > 0) {
        site = sites[0]
      }
    } else {
      const siteId = req.query.site_id || 1
      const [sites] = await db.query(
        `SELECT cs.*, p.project_name
         FROM construction_sites cs
         LEFT JOIN projects p ON cs.project_id = p.project_id
         WHERE cs.site_id = ? LIMIT 1`,
        [siteId]
      )
      if (sites.length > 0) site = sites[0]
    }

    if (!site) {
      return res.json({
        success: true,
        site: null,
        workers: [],
        summary: { totalAssigned: 0, presentCount: 0, absentCount: 0, onSiteCount: 0 },
        message: 'No construction site is currently assigned to your Supervisor account. Please contact the Administrator.'
      })
    }

    // 2. Fetch assigned workers for this site (excluding the supervisor)
    const supervisorWorker = await resolveWorkerIdentity(req.user)
    const supWorkerId = supervisorWorker ? supervisorWorker.employee_id : null

    const [assignments] = await db.query(
      `SELECT wsa.assignment_id, wsa.worker_id, wsa.site_id, wsa.assigned_date,
              e.employee_code, e.first_name, e.last_name, e.phone, e.employee_type_name
       FROM worker_site_assignments wsa
       JOIN employees e ON wsa.worker_id = e.employee_id
       WHERE wsa.site_id = ? AND wsa.status = 'Active' AND (? IS NULL OR wsa.worker_id != ?)`,
      [site.site_id, supWorkerId, supWorkerId || 0]
    )

    // 3. Fetch today's attendance records for this site
    const [attendanceToday] = await db.query(
      `SELECT ar.*
       FROM attendance_records ar
       WHERE ar.site_id = ? AND ar.date = ?`,
      [site.site_id, todayDate]
    )

    const attMap = new Map()
    for (const att of attendanceToday) {
      attMap.set(att.worker_id, att)
    }

    let presentCount = 0
    let checkedInCount = 0
    let checkedOutCount = 0
    let absentCount = 0

    const workers = assignments.map((a) => {
      const rec = attMap.get(a.worker_id)
      let todayStatus = 'Unmarked'
      let checkInTime = null
      let checkOutTime = null

      if (rec) {
        checkInTime = rec.check_in_at
        checkOutTime = rec.check_out_at
        if (rec.check_out_at) {
          todayStatus = 'Checked Out'
          checkedOutCount++
          presentCount++
        } else if (rec.check_in_at) {
          todayStatus = 'Checked In'
          checkedInCount++
          presentCount++
        } else {
          todayStatus = rec.status || 'Present'
          presentCount++
        }
      } else {
        todayStatus = 'Absent'
        absentCount++
      }

      return {
        worker_id: a.worker_id,
        employee_code: a.employee_code || `EMP-${a.worker_id}`,
        worker_name: `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Worker',
        employee_type_name: a.employee_type_name || 'Worker',
        phone: a.phone || '',
        site_id: site.site_id,
        site_name: site.site_name,
        today_status: todayStatus,
        check_in_at: checkInTime,
        check_out_at: checkOutTime,
        hours_worked: rec ? rec.hours_worked : 0,
        distance_meters: rec ? rec.distance_meters : null,
        is_late: rec ? rec.is_late : 0,
        remarks: rec ? rec.remarks : '',
      }
    })

    return res.json({
      success: true,
      site: {
        site_id: site.site_id,
        site_code: site.site_code,
        site_name: site.site_name,
        project_id: site.project_id,
        project_name: site.project_name || '',
        address: site.address,
        latitude: site.latitude,
        longitude: site.longitude,
        radius_meters: site.radius_meters,
        max_gps_accuracy: site.max_gps_accuracy,
        working_start_time: site.working_start_time,
        working_end_time: site.working_end_time,
        supervisor_id: site.supervisor_id,
        supervisor_name: site.supervisor_name || 'Arun Supervisor',
        status: site.status,
      },
      summary: {
        totalAssigned: assignments.length,
        presentCount,
        checkedInCount,
        checkedOutCount,
        absentCount,
      },
      workers,
      todayDate,
    })
  } catch (error) {
    console.error('[Get Site Workers Today Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to retrieve site worker attendance data.' })
  }
}

/**
 * GET /api/attendance/export - CSV Export
 */
export async function exportAttendanceCSV(req, res) {
  try {
    const { startDate, endDate, site_id, status, scope } = req.query
    const userRole = String(req.user?.role || '').toUpperCase()

    let sql = `
      SELECT ar.date, e.employee_code, CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) as worker_name, 
              cs.site_name, ar.check_in_at, ar.check_out_at, ar.hours_worked, ar.status, ar.distance_meters, ar.is_late
       FROM attendance_records ar
       JOIN construction_sites cs ON ar.site_id = cs.site_id
       JOIN employees e ON ar.worker_id = e.employee_id
       WHERE 1=1
    `
    const params = []

    if (userRole === 'WORKER') {
      const worker = await resolveWorkerIdentity(req.user)
      if (worker) {
        sql += ' AND ar.worker_id = ?'
        params.push(worker.employee_id)
      }
    } else if (userRole === 'SUPERVISOR') {
      const supervisor = await resolveWorkerIdentity(req.user)
      if (scope === 'personal') {
        if (supervisor) {
          sql += ' AND ar.worker_id = ?'
          params.push(supervisor.employee_id)
        }
      } else {
        sql += ' AND (cs.supervisor_id = ? OR LOWER(cs.supervisor_name) = LOWER(?))'
        params.push(req.user.user_id, req.user.name || '')
        if (supervisor) {
          sql += ' AND ar.worker_id != ?'
          params.push(supervisor.employee_id)
        }
      }
    }

    if (site_id) {
      sql += ' AND ar.site_id = ?'
      params.push(site_id)
    }

    if (status) {
      sql += ' AND ar.status = ?'
      params.push(status)
    }

    if (startDate) {
      sql += ' AND ar.date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      sql += ' AND ar.date <= ?'
      params.push(endDate)
    }

    sql += ' ORDER BY ar.date DESC, ar.check_in_at DESC'

    const [history] = await db.query(sql, params)

    let csv = 'Date,Worker Code,Worker Name,Site Name,Check In,Check Out,Hours Worked,Status,Distance (m),Late\n'
    for (const r of history) {
      const dateStr = r.date ? new Date(r.date).toISOString().split('T')[0] : ''
      const checkInStr = r.check_in_at ? new Date(r.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      const checkOutStr = r.check_out_at ? new Date(r.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      csv += `"${dateStr}","${r.employee_code}","${r.worker_name}","${r.site_name}","${checkInStr}","${checkOutStr}",${r.hours_worked},"${r.status}",${r.distance_meters || 0},${r.is_late ? 'Yes' : 'No'}\n`
    }

    const todayStr = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${todayStr}.csv`)
    return res.status(200).send(csv)
  } catch (error) {
    console.error('[Export CSV Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to export attendance CSV.' })
  }
}

/**
 * POST /api/attendance/import-csv
 * Admin CSV Import handler for site & workforce records
 */
export async function importAttendanceCSV(req, res) {
  try {
    const { csvData } = req.body
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid CSV payload provided.' })
    }

    const lines = csvData.trim().split('\n').filter((l) => l.trim().length > 0)
    if (lines.length <= 1) {
      return res.status(400).json({ success: false, message: 'CSV file is empty or missing data rows.' })
    }

    let importedCount = 0
    let invalidCount = 0

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
      if (row.length < 3) {
        invalidCount++
        continue
      }

      const siteCode = row[0] || `SITE-IMP-${Math.floor(100 + Math.random() * 900)}`
      const siteName = row[1]
      const lat = Number(row[2])
      const lon = Number(row[3])
      const radius = Number(row[4]) || 300
      const supervisorName = row[5] || 'Arun Supervisor'

      if (siteName && !isNaN(lat) && !isNaN(lon)) {
        await db.query(
          `INSERT INTO construction_sites (site_code, site_name, latitude, longitude, radius_meters, max_gps_accuracy, working_start_time, working_end_time, supervisor_name, status)
           VALUES (?, ?, ?, ?, ?, 150, '09:00', '18:00', ?, 'Active')
           ON DUPLICATE KEY UPDATE site_name = VALUES(site_name), latitude = VALUES(latitude), longitude = VALUES(longitude)`,
          [siteCode, siteName, lat, lon, radius, supervisorName]
        ).catch(() => {})
        importedCount++
      } else {
        invalidCount++
      }
    }

    return res.json({
      success: true,
      message: `CSV Import Complete! Processed ${importedCount} valid records. ${invalidCount > 0 ? `${invalidCount} invalid rows skipped.` : ''}`,
      importedCount,
      invalidCount,
    })
  } catch (error) {
    console.error('[Import CSV Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to import CSV data.' })
  }
}

/**
 * POST /api/attendance/create-user-account
 * Admin workflow to create or reset a login account (users table) for an employee (Supervisor or Worker)
 */
export async function createUserAccountForEmployee(req, res) {
  try {
    const { employee_id, role, email, password } = req.body

    if (!employee_id || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, Role (SUPERVISOR/WORKER), and Email are required.',
      })
    }

    const initialPassword = password && password.trim() ? password.trim() : 'Pms@1234'

    const assignedRole = ['SUPERVISOR', 'WORKER', 'ADMIN'].includes(String(role).toUpperCase())
      ? String(role).toUpperCase()
      : 'WORKER'

    const trimmedEmail = email.trim().toLowerCase()

    // 1. Check if employee exists
    const [empRows] = await db.query('SELECT * FROM employees WHERE employee_id = ?', [employee_id])
    if (empRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' })
    }
    const emp = empRows[0]
    const displayName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || trimmedEmail.split('@')[0]

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(initialPassword, 10)

    // 3. Check if user account already exists with email
    const [existingUsers] = await db.query('SELECT user_id FROM users WHERE LOWER(email) = ?', [trimmedEmail])
    let userId

    if (existingUsers.length > 0) {
      userId = existingUsers[0].user_id
      await db.query(
        `UPDATE users SET name = ?, password_hash = ?, role = ?, phone = ?, status = 'Active', updated_at = NOW()
         WHERE user_id = ?`,
        [displayName, hashedPassword, assignedRole, emp.phone || '', userId]
      )
    } else {
      const [insertResult] = await db.query(
        `INSERT INTO users (name, email, password_hash, role, phone, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'Active', NOW())`,
        [displayName, trimmedEmail, hashedPassword, assignedRole, emp.phone || '']
      )
      userId = insertResult.insertId
    }

    // 4. Link user_id to employee record
    await db.query('UPDATE employees SET user_id = ?, email = ? WHERE employee_id = ?', [userId, trimmedEmail, employee_id])

    return res.status(200).json({
      success: true,
      message: `Login credentials generated/updated for ${displayName} as ${assignedRole}.`,
      account: {
        user_id: userId,
        employee_id: emp.employee_id,
        employee_code: emp.employee_code,
        name: displayName,
        email: trimmedEmail,
        role: assignedRole,
        initialPassword: initialPassword,
      },
    })
  } catch (error) {
    console.error('[Create User Account Error]', error)
    return res.status(500).json({ success: false, message: 'Failed to create user login account.' })
  }
}

