import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  getSupervisorAssignedSite,
  getSupervisorAssignedWorkers,
  getSupervisorSiteAttendanceToday,
  getSupervisorOwnTodayAttendance,
  getSupervisorOwnAttendanceHistory,
  getSupervisorSiteAttendanceReport,
  getSupervisorWorkAssignments,
  getSupervisorCorrectionRequests,
  getSupervisorProfile,
} from './supervisorAiTools.js'

/**
 * Intelligent Date Entity Extractor for Natural-Language Attendance Queries
 */
function extractDateRange(queryText) {
  const text = (queryText || '').toLowerCase()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Relative dates
  if (text.includes('today') || text.includes('இன்று')) {
    return { startDate: todayStr, endDate: todayStr, label: 'today' }
  }

  if (text.includes('yesterday') || text.includes('நேற்று')) {
    const yest = new Date(today)
    yest.setDate(yest.getDate() - 1)
    const yestStr = yest.toISOString().split('T')[0]
    return { startDate: yestStr, endDate: yestStr, label: 'yesterday' }
  }

  if (text.includes('this week') || text.includes('இந்த வாரம்')) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    return { startDate: weekStart.toISOString().split('T')[0], endDate: todayStr, label: 'this week' }
  }

  if (text.includes('last 7 days') || text.includes('past 7 days')) {
    const past7 = new Date(today)
    past7.setDate(today.getDate() - 7)
    return { startDate: past7.toISOString().split('T')[0], endDate: todayStr, label: 'the last 7 days' }
  }

  // ISO dates: YYYY-MM-DD
  const isoDates = text.match(/\b\d{4}-\d{2}-\d{2}\b/g)
  if (isoDates && isoDates.length === 1) {
    return { startDate: isoDates[0], endDate: isoDates[0], label: isoDates[0] }
  } else if (isoDates && isoDates.length >= 2) {
    return { startDate: isoDates[0], endDate: isoDates[1], label: `${isoDates[0]} to ${isoDates[1]}` }
  }

  return { startDate: '', endDate: '', label: 'all available dates' }
}

/**
 * Natural language intent classifier for Supervisor questions
 */
function classifySupervisorIntent(query, history = []) {
  const lower = (query || '').toLowerCase().trim()

  // 1. Greetings & capability questions
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower.startsWith('who are you') ||
    lower.startsWith('what can you do') ||
    lower.includes('வணக்கம்')
  ) {
    return 'GREETING'
  }

  // 2. Personal profile
  if (
    lower.includes('my profile') ||
    lower.includes('my details') ||
    lower.includes('my employee id') ||
    lower.includes('my contact') ||
    lower.includes('who am i')
  ) {
    return 'SUPERVISOR_PROFILE'
  }

  // 3. Supervisor's own attendance (personal check-in/out)
  if (
    (lower.includes('my') && lower.includes('attendance')) ||
    lower.includes('my check in') ||
    lower.includes('my check-in') ||
    lower.includes('my check out') ||
    lower.includes('my check-out') ||
    lower.includes('did i check in') ||
    lower.includes('have i checked in') ||
    lower.includes('have i checked out') ||
    lower.includes('my shift today') ||
    lower.includes('my own attendance')
  ) {
    if (lower.includes('history') || lower.includes('past') || lower.includes('last week') || lower.includes('report')) {
      return 'SUPERVISOR_OWN_HISTORY'
    }
    return 'SUPERVISOR_OWN_TODAY'
  }

  // 4. Correction requests
  if (
    lower.includes('correction') ||
    lower.includes('approve') ||
    lower.includes('reject') ||
    lower.includes('review request')
  ) {
    return 'CORRECTION_REQUESTS'
  }

  // 5. Work assignments & task status
  if (
    lower.includes('assignment') ||
    lower.includes('assigned task') ||
    lower.includes('work status') ||
    lower.includes('task status') ||
    lower.includes('work assigned')
  ) {
    return 'WORK_ASSIGNMENTS'
  }

  // 6. Site Attendance Report / Historical logs
  if (
    (lower.includes('report') || lower.includes('history') || lower.includes('log')) &&
    (lower.includes('site') || lower.includes('worker') || lower.includes('date range'))
  ) {
    return 'SITE_ATTENDANCE_REPORT'
  }

  // 7. Today's live workforce attendance & check-in/out times
  if (
    lower.includes('present') ||
    lower.includes('absent') ||
    lower.includes('checked in') ||
    lower.includes('checked out') ||
    lower.includes('check-in') ||
    lower.includes('check-out') ||
    lower.includes('not checked in') ||
    lower.includes('who is on site') ||
    lower.includes('who is working today') ||
    lower.includes('today attendance') ||
    lower.includes("today's attendance") ||
    lower.includes('attendance today') ||
    lower.includes('time')
  ) {
    return 'TODAY_WORKFORCE_ATTENDANCE'
  }

  // 8. Follow-up: "which of them are present", "are they here"
  if (
    lower.includes('which of them') ||
    lower.includes('who of them') ||
    lower.includes('how many present') ||
    lower.includes('who are present') ||
    lower.includes('who is present')
  ) {
    return 'TODAY_WORKFORCE_ATTENDANCE'
  }

  // 9. Assigned workers list
  if (
    lower.includes('which workers') ||
    lower.includes('who are assigned') ||
    lower.includes('assigned workers') ||
    lower.includes('workers assigned') ||
    lower.includes('list workers') ||
    lower.includes('my workers') ||
    lower.includes('working under me') ||
    lower.includes('workforce')
  ) {
    return 'ASSIGNED_WORKERS'
  }

  // 10. Assigned site information
  if (
    lower.includes('which construction site') ||
    lower.includes('which site') ||
    lower.includes('assigned to me') ||
    lower.includes('my site') ||
    lower.includes('assigned site') ||
    lower.includes('site details') ||
    lower.includes('where am i working') ||
    lower.includes('site location')
  ) {
    return 'ASSIGNED_SITE'
  }

  // 11. Conversational follow-up referencing previous turn
  if (history && history.length > 0) {
    const lastBotMessage = history[history.length - 1]?.text?.toLowerCase() || ''
    if (lastBotMessage.includes('worker') || lastBotMessage.includes('deepak') || lastBotMessage.includes('santhosh')) {
      if (lower.includes('present') || lower.includes('here') || lower.includes('today') || lower.includes('status')) {
        return 'TODAY_WORKFORCE_ATTENDANCE'
      }
    }
  }

  // Default fallback to assigned site & workforce overview
  return 'ASSIGNED_SITE'
}

/**
 * Format ISO timestamp to friendly localized 12-hour string (e.g. "09:05 AM")
 */
function formatTime(isoStr) {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return String(isoStr)
  }
}

/**
 * Main Database-Grounded Supervisor AI Conversational Handler
 */
export async function processSupervisorAiQuery({ query, user, history = [] }) {
  if (!user || !user.user_id) {
    return {
      text: 'Authentication required. Please log in with your Supervisor credentials to access site and workforce data.',
      lang: 'en',
    }
  }

  const cleanQuery = (query || '').trim()
  const intent = classifySupervisorIntent(cleanQuery, history)
  const dateRange = extractDateRange(cleanQuery)

  // 1. Fetch Supervisor's Assigned Construction Site (Root of authorization)
  const assignedSite = await getSupervisorAssignedSite(user)

  // 2. Fetch required live database data based on classified intent
  let dbContext = {
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    assignedSite: assignedSite || null,
    queryIntent: intent,
    dateRange,
  }

  let finalResponse = ''

  // GREETING
  if (intent === 'GREETING') {
    if (assignedSite) {
      finalResponse = `Hello Supervisor ${user.name || ''}! 👋 I am your **Supervisor Assistant**, connected to your live database for **${assignedSite.site_name}**.\n\nYou can ask me:\n• "Which workers are assigned to my site?"\n• "Which workers are present today?"\n• "What are today's check-in and check-out times?"\n• "What is my own attendance status today?"\n• "What work assignments are active?"\n• "Show site attendance reports or correction requests"`
    } else {
      finalResponse = `Hello Supervisor ${user.name || ''}! 👋 I am your **Supervisor Assistant**. Currently, no construction site is assigned to your account in the database. Please contact the Administrator to set up your site assignment.`
    }
    return { text: finalResponse, lang: 'en' }
  }

  // If no site is assigned, clearly explain without hallucinating
  if (!assignedSite && intent !== 'SUPERVISOR_PROFILE' && intent !== 'SUPERVISOR_OWN_TODAY') {
    return {
      text: 'No construction site is currently assigned to your Supervisor account in the system database. Please contact the Administrator to assign you to a project site.',
      lang: 'en',
    }
  }

  // Intent 1: ASSIGNED_SITE
  if (intent === 'ASSIGNED_SITE') {
    dbContext.siteDetails = assignedSite
    finalResponse = `You are currently assigned to **${assignedSite.site_name}** (Site Code: \`${assignedSite.site_code}\`).\n\n• **Location:** ${assignedSite.address || 'Site Location'}\n• **Status:** ${assignedSite.status || 'Active'}\n• **Geofence Radius:** ${assignedSite.radius_meters || 300} meters (GPS accuracy limit: ${assignedSite.max_gps_accuracy || 150}m)\n• **Shift Timings:** ${assignedSite.working_start_time || '09:00'} to ${assignedSite.working_end_time || '18:00'}\n• **Assigned Supervisor:** ${assignedSite.supervisor_name || user.name}`
  }

  // Intent 2: ASSIGNED_WORKERS
  else if (intent === 'ASSIGNED_WORKERS') {
    const workers = await getSupervisorAssignedWorkers(assignedSite.site_id, user)
    dbContext.assignedWorkers = workers

    if (workers.length === 0) {
      finalResponse = `There are currently no workers assigned to your site (**${assignedSite.site_name}**) in the database.`
    } else {
      const workerLines = workers
        .map((w, idx) => `${idx + 1}. **${w.worker_name}** (Code: \`${w.employee_code}\`) — Trade: ${w.employee_type_name}${w.phone ? ` | Phone: ${w.phone}` : ''}`)
        .join('\n')
      finalResponse = `There are **${workers.length}** workers assigned to your site (**${assignedSite.site_name}**):\n\n${workerLines}\n\nWould you like to know who is present or checked in today?`
    }
  }

  // Intent 3: TODAY_WORKFORCE_ATTENDANCE
  else if (intent === 'TODAY_WORKFORCE_ATTENDANCE') {
    const attendanceToday = await getSupervisorSiteAttendanceToday(assignedSite.site_id, user, dateRange.startDate || null)
    dbContext.todayAttendance = attendanceToday

    if (attendanceToday.workers.length === 0) {
      finalResponse = `No workers are currently registered or assigned to **${assignedSite.site_name}** in the database.`
    } else {
      const presentWorkers = attendanceToday.workers.filter(
        (w) => w.today_status === 'Checked In' || w.today_status === 'Checked Out' || w.today_status === 'Present'
      )
      const absentWorkers = attendanceToday.workers.filter((w) => w.today_status === 'Absent' || w.today_status === 'Unmarked')

      let summaryHeader = `Today on **${assignedSite.site_name}**, **${presentWorkers.length}** of ${attendanceToday.totalAssigned} assigned workers are present:\n`

      let presentList = ''
      if (presentWorkers.length > 0) {
        presentList = '\n**Present Workers:**\n' + presentWorkers.map((w) => {
          const inTime = formatTime(w.check_in_at)
          const outTime = w.check_out_at ? formatTime(w.check_out_at) : 'Active Shift'
          return `• **${w.worker_name}** (\`${w.employee_code}\`) — Status: **${w.today_status}** | Check-In: ${inTime} | Check-Out: ${outTime}${w.hours_worked ? ` (${w.hours_worked} hrs)` : ''}`
        }).join('\n')
      }

      let absentList = ''
      if (absentWorkers.length > 0) {
        absentList = '\n\n**Not Checked In / Absent:**\n' + absentWorkers.map((w) => {
          return `• **${w.worker_name}** (\`${w.employee_code}\`) — ${w.employee_type_name || 'Worker'} (Unchecked)`
        }).join('\n')
      }

      finalResponse = summaryHeader + presentList + absentList
    }
  }

  // Intent 4: SUPERVISOR_OWN_TODAY
  else if (intent === 'SUPERVISOR_OWN_TODAY') {
    const ownToday = await getSupervisorOwnTodayAttendance(user, dateRange.startDate || null)
    dbContext.ownToday = ownToday

    if (!ownToday || !ownToday.hasRecord) {
      finalResponse = `Your attendance status for today on **${assignedSite ? assignedSite.site_name : 'your assigned site'}** is **Not Checked In**.\n\nTo mark your attendance, navigate to **My Attendance > Mark Attendance** tab and click "Mark Check-In" while inside the site geofence.`
    } else {
      finalResponse = `Here is your personal attendance record for today:\n\n• **Name:** ${ownToday.name} (\`${ownToday.employee_code}\`)\n• **Site:** ${ownToday.site_name || assignedSite?.site_name}\n• **Status:** **${ownToday.status}**\n• **Check-In Time:** ${formatTime(ownToday.check_in_at)}\n• **Check-Out Time:** ${ownToday.check_out_at ? formatTime(ownToday.check_out_at) : 'Active Shift'}\n• **Worked Hours:** ${ownToday.hours_worked || 0} hrs${ownToday.distance_meters !== null && ownToday.distance_meters !== undefined ? `\n• **Geofence Distance:** ${ownToday.distance_meters}m` : ''}`
    }
  }

  // Intent 5: SUPERVISOR_OWN_HISTORY
  else if (intent === 'SUPERVISOR_OWN_HISTORY') {
    const historyRecords = await getSupervisorOwnAttendanceHistory(user, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 10,
    })
    dbContext.personalHistory = historyRecords

    if (historyRecords.length === 0) {
      finalResponse = `No personal attendance records were found for your supervisor account in the database${dateRange.startDate ? ` for ${dateRange.label}` : ''}.`
    } else {
      const recordRows = historyRecords.map((r, i) => {
        const dStr = r.date ? new Date(r.date).toLocaleDateString() : 'N/A'
        const inStr = formatTime(r.check_in_at)
        const outStr = r.check_out_at ? formatTime(r.check_out_at) : 'Active'
        return `${i + 1}. **${dStr}** — Status: **${r.status}** | In: ${inStr} | Out: ${outStr} (${r.hours_worked || 0} hrs)`
      }).join('\n')

      finalResponse = `Here is your recent personal attendance history (${historyRecords.length} records):\n\n${recordRows}\n\nYou can also export your full personal CSV report from **My Attendance > History & Reports**.`
    }
  }

  // Intent 6: SITE_ATTENDANCE_REPORT
  else if (intent === 'SITE_ATTENDANCE_REPORT') {
    const reportRecords = await getSupervisorSiteAttendanceReport(assignedSite.site_id, user, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 15,
    })
    dbContext.siteReport = reportRecords

    if (reportRecords.length === 0) {
      finalResponse = `No attendance records found for **${assignedSite.site_name}** in the database${dateRange.startDate ? ` for ${dateRange.label}` : ''}.`
    } else {
      const rows = reportRecords.map((r, i) => {
        const dStr = r.date ? new Date(r.date).toLocaleDateString() : 'N/A'
        return `${i + 1}. **${r.worker_name}** (\`${r.employee_code}\`) | Date: ${dStr} | Status: **${r.status}** | ${formatTime(r.check_in_at)} - ${r.check_out_at ? formatTime(r.check_out_at) : 'Active'}`
      }).join('\n')

      finalResponse = `Attendance report for **${assignedSite.site_name}** (${reportRecords.length} records):\n\n${rows}\n\nYou can view the full site log or export a CSV report from **Site Attendance > Site History & Reports**.`
    }
  }

  // Intent 7: WORK_ASSIGNMENTS
  else if (intent === 'WORK_ASSIGNMENTS') {
    const assignments = await getSupervisorWorkAssignments(assignedSite.site_id, user)
    dbContext.workAssignments = assignments

    if (assignments.length === 0) {
      finalResponse = `There are currently no active worker assignments registered for **${assignedSite.site_name}** in the database.`
    } else {
      const assignmentLines = assignments.map((a, i) => {
        const aDate = a.assigned_date ? new Date(a.assigned_date).toLocaleDateString() : 'Active'
        return `${i + 1}. **${a.worker_name}** (\`${a.employee_code}\`) — Role: ${a.employee_type_name || 'Specialist'} | Assigned: ${aDate} | Status: **${a.status || 'Active'}**`
      }).join('\n')

      finalResponse = `Active work assignments for **${assignedSite.site_name}** (${assignments.length} total):\n\n${assignmentLines}`
    }
  }

  // Intent 8: CORRECTION_REQUESTS
  else if (intent === 'CORRECTION_REQUESTS') {
    const corrections = await getSupervisorCorrectionRequests(assignedSite.site_id, user)
    dbContext.corrections = corrections

    const hasApproveWord = cleanQuery.toLowerCase().includes('approve') || cleanQuery.toLowerCase().includes('reject')
    const governanceNotice = hasApproveWord
      ? '\n\n⚠️ **Important Governance Rule:** Per system security policy, approval and rejection of attendance correction requests are restricted exclusively to Administrators. Supervisors are authorized to view and track request statuses.'
      : ''

    if (corrections.length === 0) {
      finalResponse = `There are currently no attendance correction requests recorded for workers on your site (**${assignedSite.site_name}**).${governanceNotice}`
    } else {
      const pendingCount = corrections.filter((c) => c.status === 'Pending').length
      const corrLines = corrections.map((c, i) => {
        const reqIn = c.requested_check_in ? formatTime(c.requested_check_in) : 'N/A'
        const reqOut = c.requested_check_out ? formatTime(c.requested_check_out) : 'N/A'
        return `${i + 1}. **${c.worker_name}** (\`${c.employee_code}\`) — Status: **${c.status}**\n   Reason: "${c.reason || 'No reason provided'}" (Requested In: ${reqIn}, Out: ${reqOut})`
      }).join('\n')

      finalResponse = `Here are the attendance correction requests for workers at **${assignedSite.site_name}** (${pendingCount} pending review):\n\n${corrLines}${governanceNotice}`
    }
  }

  // Intent 9: SUPERVISOR_PROFILE
  else if (intent === 'SUPERVISOR_PROFILE') {
    const profile = await getSupervisorProfile(user)
    dbContext.profile = profile

    finalResponse = `Here is your profile information:\n\n• **Name:** ${profile.name}\n• **Employee ID / Code:** \`${profile.employee_code || `EMP-${user.user_id}`}\`\n• **Email:** ${profile.email}\n• **Role:** ${profile.role} (Site Supervisor)\n• **Phone:** ${profile.phone || 'Not provided'}\n• **Assigned Construction Site:** ${profile.site_name || assignedSite?.site_name || 'None assigned'}`
  }

  // 3. If GEMINI_API_KEY is configured in the environment, use Gemini to polish into fluent conversational response
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `You are the Supervisor Assistant for a Construction PMS & Real Estate Management system.
You are assisting an authenticated Site Supervisor named "${user.name}".

User Query: "${cleanQuery}"
Conversation Context: ${JSON.stringify(history.slice(-4))}
Live Database Records: ${JSON.stringify(dbContext)}

Instructions:
1. Provide a natural, concise, professional response strictly grounded in the Live Database Records.
2. DO NOT hallucinate, invent, or assume any worker names, sites, or attendance timestamps not in the Database Records.
3. If no matching records exist, explain clearly that no matching data was found in the database.
4. If the user asks you to approve or reject a correction request, state clearly that approval is restricted exclusively to Administrators under system governance rules.
5. If the user asks for unauthorized sites other than their assigned site, state clearly that as a Site Supervisor, their access is restricted to their assigned site.
6. Do NOT mention database table names, SQL queries, or tokens.
`
      const result = await model.generateContent(prompt)
      const aiText = result.response.text()
      if (aiText && aiText.trim()) {
        return { text: aiText.trim(), lang: 'en' }
      }
    } catch (llmErr) {
      console.warn('[Supervisor AI LLM Warning] Falling back to structured grounded response:', llmErr.message)
    }
  }

  return { text: finalResponse, lang: 'en' }
}
