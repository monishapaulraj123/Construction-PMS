import React, { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Users,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Download,
  Plus,
  ShieldAlert,
  Search,
  CheckCircle2,
  Layers,
  Phone,
  Briefcase,
} from 'lucide-react'
import { attendanceAPI, employeeAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastContext'
import PageHeader from '../components/PageHeader'
import Breadcrumb from '../components/Breadcrumb'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'

export default function SiteAttendance() {
  const { currentUser } = useApp()
  const { showToast } = useToast()
  const userRole = String(currentUser?.role || 'SUPERVISOR').toUpperCase()

  const [activeTab, setActiveTab] = useState('workforce') // 'workforce', 'history', 'corrections', 'assignments'

  // Loading & Error States
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Site & Workforce Today Data
  const [siteData, setSiteData] = useState(null)
  const [summary, setSummary] = useState({
    totalAssigned: 0,
    presentCount: 0,
    checkedInCount: 0,
    checkedOutCount: 0,
    absentCount: 0,
  })
  const [workers, setWorkers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Site History State
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [exportingCSV, setExportingCSV] = useState(false)
  const [historyFilters, setHistoryFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  })

  // Site Correction Requests State
  const [corrections, setCorrections] = useState([])
  const [loadingCorrections, setLoadingCorrections] = useState(false)

  // Work Assignments State
  const [assignments, setAssignments] = useState([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [availableEmployees, setAvailableEmployees] = useState([])
  const [assignmentForm, setAssignmentForm] = useState({
    worker_id: '',
  })

  // 1. Fetch Today's Site Workforce Attendance
  const fetchSiteWorkforceToday = useCallback(async () => {
    try {
      setErrorMsg('')
      const res = await attendanceAPI.getSiteWorkersToday()
      if (res && res.success) {
        setSiteData(res.site || null)
        setSummary(res.summary || {
          totalAssigned: 0,
          presentCount: 0,
          checkedInCount: 0,
          checkedOutCount: 0,
          absentCount: 0,
        })
        setWorkers(res.workers || [])
        if (!res.site) {
          setErrorMsg(res.message || 'No construction site is currently assigned to your Supervisor account. Please contact the Administrator.')
        }
      } else {
        setErrorMsg(res?.message || 'Failed to retrieve site worker attendance data.')
      }
    } catch (err) {
      console.error('Site attendance fetch error:', err)
      setErrorMsg(err.response?.data?.message || 'Failed to connect to attendance service. Please retry.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // 2. Fetch Site History
  const fetchSiteHistory = useCallback(async () => {
    if (!siteData?.site_id) return
    setLoadingHistory(true)
    try {
      const data = await attendanceAPI.getHistory({
        site_id: siteData.site_id,
        startDate: historyFilters.startDate,
        endDate: historyFilters.endDate,
        status: historyFilters.status,
      })
      setHistory(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch site history error:', err)
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }, [siteData?.site_id, historyFilters])

  // 3. Fetch Site Correction Requests
  const fetchSiteCorrections = useCallback(async () => {
    if (!siteData?.site_id) return
    setLoadingCorrections(true)
    try {
      const data = await attendanceAPI.getCorrections({ site_id: siteData.site_id })
      setCorrections(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch site corrections error:', err)
      setCorrections([])
    } finally {
      setLoadingCorrections(false)
    }
  }, [siteData?.site_id])

  // 4. Fetch Site Work Assignments
  const fetchSiteAssignments = useCallback(async () => {
    if (!siteData?.site_id) return
    setLoadingAssignments(true)
    try {
      const allAssignments = await attendanceAPI.getAssignments()
      if (Array.isArray(allAssignments)) {
        const siteFiltered = allAssignments.filter((a) => Number(a.site_id) === Number(siteData.site_id))
        setAssignments(siteFiltered)
      } else {
        setAssignments([])
      }
    } catch (err) {
      console.error('Fetch assignments error:', err)
      setAssignments([])
    } finally {
      setLoadingAssignments(false)
    }
  }, [siteData?.site_id])

  // Load Initial Data
  useEffect(() => {
    fetchSiteWorkforceToday()
  }, [fetchSiteWorkforceToday])

  // Switch tab triggers
  useEffect(() => {
    if (!siteData?.site_id) return
    if (activeTab === 'history') fetchSiteHistory()
    if (activeTab === 'corrections') fetchSiteCorrections()
    if (activeTab === 'assignments') fetchSiteAssignments()
  }, [activeTab, siteData?.site_id, fetchSiteHistory, fetchSiteCorrections, fetchSiteAssignments])

  // Fetch employees for work assignment modal
  const handleOpenAssignmentModal = async () => {
    try {
      const emps = await employeeAPI.getAll()
      setAvailableEmployees(Array.isArray(emps) ? emps : [])
      setAssignmentModalOpen(true)
    } catch (e) {
      console.error('Failed to load employee list:', e)
      showToast('Failed to load employee records.', 'error')
    }
  }

  // Handle Save Work Assignment
  const handleSaveAssignment = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!assignmentForm.worker_id) {
      showToast('Please select a worker to assign.', 'error')
      return
    }
    if (!siteData?.site_id) {
      showToast('No active assigned site found.', 'error')
      return
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const res = await attendanceAPI.createAssignment({
        worker_id: assignmentForm.worker_id,
        site_id: siteData.site_id,
        assigned_date: todayStr,
      })
      if (res && res.success) {
        showToast('Worker successfully assigned to site!', 'success')
        setAssignmentModalOpen(false)
        setAssignmentForm({ worker_id: '' })
        fetchSiteWorkforceToday()
        fetchSiteAssignments()
      } else {
        showToast(res?.message || 'Failed to assign worker.', 'error')
      }
    } catch (err) {
      console.error('Assignment error:', err)
      showToast(err.response?.data?.message || 'Failed to assign worker.', 'error')
    }
  }

  // Handle Export Site CSV Report
  const handleExportCSV = async () => {
    if (!siteData?.site_id) return
    setExportingCSV(true)
    try {
      const res = await attendanceAPI.exportCSV({
        site_id: siteData.site_id,
        startDate: historyFilters.startDate,
        endDate: historyFilters.endDate,
        status: historyFilters.status,
      })
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const todayStr = new Date().toISOString().split('T')[0]
      link.setAttribute('download', `site_attendance_${siteData.site_code || 'SITE'}_${todayStr}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('Site attendance CSV report downloaded!', 'success')
    } catch (err) {
      console.error('CSV Export Error:', err)
      showToast('Failed to export site CSV report.', 'error')
    } finally {
      setExportingCSV(false)
    }
  }

  // Filtered workers list
  const filteredWorkers = workers.filter((w) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (w.worker_name && w.worker_name.toLowerCase().includes(q)) ||
      (w.employee_code && w.employee_code.toLowerCase().includes(q)) ||
      (w.employee_type_name && w.employee_type_name.toLowerCase().includes(q)) ||
      (w.today_status && w.today_status.toLowerCase().includes(q))
    )
  })

  return (
    <div>
      <Breadcrumb items={['Site Attendance & Monitoring']} />

      <PageHeader
        title="Site Attendance & Workforce Monitoring"
        description="Monitor real-time worker check-ins, attendance logs, and workforce assignments for your assigned construction site."
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <SecondaryButton
              onClick={() => {
                setRefreshing(true)
                fetchSiteWorkforceToday()
                if (activeTab === 'history') fetchSiteHistory()
                if (activeTab === 'corrections') fetchSiteCorrections()
                if (activeTab === 'assignments') fetchSiteAssignments()
              }}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'spin' : ''} color="var(--forest-700)" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </SecondaryButton>

            {siteData && (
              <SecondaryButton onClick={handleExportCSV} disabled={exportingCSV}>
                <Download size={15} className={exportingCSV ? 'spin' : ''} color="var(--gold-600)" />
                {exportingCSV ? 'Exporting...' : 'Export Site CSV'}
              </SecondaryButton>
            )}
          </div>
        }
      />

      {/* Loading State */}
      {loading ? (
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <RefreshCw className="spin empty-state-icon" size={36} color="var(--forest-600)" />
          <h4 style={{ marginTop: 16 }}>Loading assigned construction site workforce...</h4>
        </div>
      ) : !siteData ? (
        /* Empty State: No site assigned */
        <div
          className="card card-pad"
          style={{
            maxWidth: 720,
            margin: '40px auto',
            textAlign: 'center',
            padding: '48px 32px',
            border: '1.5px solid var(--amber-300, #FCD34D)',
            background: 'var(--amber-050, #FFFBEB)',
            borderRadius: 'var(--radius-lg, 12px)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <AlertTriangle size={32} color="#D97706" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400E', marginBottom: 10 }}>
            No Assigned Construction Site
          </h3>
          <p style={{ fontSize: '0.98rem', color: '#B45309', lineHeight: 1.6, maxWidth: 540, margin: '0 auto 20px' }}>
            No construction site is currently assigned to your Supervisor account. Please contact the Administrator.
          </p>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>
            Logged-in Supervisor: <strong>{currentUser?.name || 'Supervisor'}</strong> ({currentUser?.email})
          </div>
        </div>
      ) : (
        <>
          {/* TOP SITE INFORMATION CARD */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1B3830 0%, #274E43 100%)',
              color: '#FFFFFF',
              padding: '24px 28px',
              borderRadius: 'var(--radius-lg, 12px)',
              marginBottom: 24,
              boxShadow: '0 8px 24px rgba(27, 56, 48, 0.25)',
              border: '1px solid rgba(212, 175, 106, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      background: 'rgba(212, 175, 106, 0.25)',
                      color: 'var(--gold-400, #D4B06A)',
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {siteData.site_code || 'SITE'}
                  </span>
                  <StatusBadge status={siteData.status || 'Active'} tone={siteData.status === 'Active' ? 'green' : 'amber'} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 8px', color: '#FFFFFF' }}>
                  {siteData.site_name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: 12 }}>
                  <MapPin size={16} color="var(--gold-400, #D4B06A)" />
                  <span>{siteData.address || 'Site Location'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                  <div>
                    Supervisor: <strong style={{ color: '#FFFFFF' }}>{siteData.supervisor_name || currentUser?.name || 'N/A'}</strong>
                  </div>
                  <div>
                    Geofence Radius: <strong style={{ color: '#FFFFFF' }}>{siteData.radius_meters || 300}m</strong>
                  </div>
                  <div>
                    Working Hours: <strong style={{ color: '#FFFFFF' }}>{siteData.working_start_time || '09:00'} - {siteData.working_end_time || '18:00'}</strong>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '12px 18px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--gold-400, #D4B06A)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Shift Status Today
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>
                  {summary.presentCount > 0 ? `${summary.presentCount} On Site` : 'Shift In Progress'}
                </div>
              </div>
            </div>
          </div>

          {/* STATS OVERVIEW CARDS */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <StatCard
              title="Assigned Workers"
              value={summary.totalAssigned}
              hint="Total registered for this site"
              icon={Users}
              tone="gold"
            />
            <StatCard
              title="Present Today"
              value={summary.presentCount}
              hint={`${summary.totalAssigned > 0 ? Math.round((summary.presentCount / summary.totalAssigned) * 100) : 0}% workforce present`}
              icon={UserCheck}
              tone="green"
            />
            <StatCard
              title="Currently Checked In"
              value={summary.checkedInCount}
              hint="Active on site shift"
              icon={Clock}
              tone="forest"
            />
            <StatCard
              title="Checked Out"
              value={summary.checkedOutCount}
              hint="Completed day shift"
              icon={CheckCircle2}
              tone="forest"
            />
            <StatCard
              title="Absent Today"
              value={summary.absentCount}
              hint="Unchecked workers"
              icon={UserX}
              tone="red"
            />
          </div>

          {/* SECTION NAVIGATION TABS */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button
              onClick={() => setActiveTab('workforce')}
              className={`tab-btn ${activeTab === 'workforce' ? 'active' : ''}`}
            >
              <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
              Today's Workforce ({workers.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            >
              <Calendar size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
              Site History &amp; Reports
            </button>
            <button
              onClick={() => setActiveTab('corrections')}
              className={`tab-btn ${activeTab === 'corrections' ? 'active' : ''}`}
            >
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
              Site Correction Requests ({corrections.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            >
              <Briefcase size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
              Work Assignments ({assignments.length})
            </button>
          </div>

          {/* TAB 1: TODAY'S WORKFORCE TABLE */}
          {activeTab === 'workforce' && (
            <div>
              <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ position: 'relative', minWidth: 260 }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--ink-400)' }} />
                  <input
                    type="text"
                    placeholder="Search by worker name, code, trade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 36, width: '100%', height: 38, borderRadius: 'var(--radius-md)', border: '1px solid var(--line-200)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>
                    Showing <strong>{filteredWorkers.length}</strong> of {workers.length} workers
                  </span>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Employee ID</th>
                      <th>Trade / Role</th>
                      <th>Site</th>
                      <th>Today's Attendance</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Hours Worked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-500)' }}>
                          {searchQuery ? 'No workers match the search query.' : 'No workers currently assigned to this construction site.'}
                        </td>
                      </tr>
                    ) : (
                      filteredWorkers.map((w) => {
                        let tone = 'neutral'
                        if (w.today_status === 'Checked In' || w.today_status === 'Present') tone = 'green'
                        else if (w.today_status === 'Checked Out') tone = 'forest'
                        else if (w.today_status === 'Absent') tone = 'red'
                        else tone = 'neutral'

                        return (
                          <tr key={w.worker_id}>
                            <td className="cell-primary">
                              <div style={{ fontWeight: 600 }}>{w.worker_name}</div>
                              {w.phone && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--ink-400)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <Phone size={11} /> {w.phone}
                                </div>
                              )}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{w.employee_code}</td>
                            <td>{w.employee_type_name || 'Worker'}</td>
                            <td>{w.site_name}</td>
                            <td>
                              <StatusBadge status={w.today_status} tone={tone} />
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>
                              {w.check_in_at
                                ? new Date(w.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '—'}
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>
                              {w.check_out_at
                                ? new Date(w.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : w.today_status === 'Checked In'
                                ? <span style={{ color: 'var(--green-700)', fontStyle: 'italic' }}>Active</span>
                                : '—'}
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {w.hours_worked ? `${w.hours_worked} hrs` : '—'}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SITE HISTORY & REPORTS */}
          {activeTab === 'history' && (
            <div>
              <div className="toolbar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={historyFilters.status}
                  onChange={(e) => setHistoryFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="filter-select"
                >
                  <option value="">All Attendance Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Late">Late</option>
                </select>

                <input
                  type="date"
                  value={historyFilters.startDate}
                  onChange={(e) => setHistoryFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="filter-select"
                  placeholder="Start Date"
                />

                <input
                  type="date"
                  value={historyFilters.endDate}
                  onChange={(e) => setHistoryFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="filter-select"
                  placeholder="End Date"
                />

                <SecondaryButton onClick={fetchSiteHistory} disabled={loadingHistory}>
                  <RefreshCw size={14} className={loadingHistory ? 'spin' : ''} /> Apply Filters
                </SecondaryButton>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Worker Code</th>
                      <th>Worker Name</th>
                      <th>Check-In Time</th>
                      <th>Check-Out Time</th>
                      <th>Worked Hours</th>
                      <th>Distance (m)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHistory ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                          <RefreshCw className="spin" size={24} style={{ display: 'inline', marginRight: 8 }} />
                          Loading site attendance history...
                        </td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-500)' }}>
                          No attendance history records found for this site within the selected filters.
                        </td>
                      </tr>
                    ) : (
                      history.map((rec) => (
                        <tr key={rec.attendance_id}>
                          <td style={{ fontWeight: 600 }}>{new Date(rec.date).toLocaleDateString()}</td>
                          <td style={{ fontFamily: 'monospace' }}>{rec.employee_code}</td>
                          <td className="cell-primary">{rec.worker_name}</td>
                          <td>{rec.check_in_at ? new Date(rec.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td>{rec.check_out_at ? new Date(rec.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</td>
                          <td style={{ fontWeight: 600 }}>{rec.hours_worked || 0} hrs</td>
                          <td>{rec.distance_meters !== null ? `${rec.distance_meters}m` : '—'}</td>
                          <td>
                            <StatusBadge
                              status={rec.is_late ? 'Late' : rec.status}
                              tone={rec.status === 'Checked Out' ? 'green' : rec.is_late ? 'amber' : 'gold'}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SITE CORRECTION REQUESTS */}
          {activeTab === 'corrections' && (
            <div>
              <div
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line-100)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: '0.86rem',
                  color: 'var(--ink-700)',
                }}
              >
                <ShieldAlert size={18} color="var(--gold-600)" />
                <span>
                  <strong>Supervisor Notice:</strong> Showing attendance correction requests submitted by workers assigned to your construction site. Per governance security policy, review and approval are restricted to System Administrators.
                </span>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Employee ID</th>
                      <th>Requested Check-In</th>
                      <th>Requested Check-Out</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Reviewer / Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCorrections ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px' }}>
                          <RefreshCw className="spin" size={24} style={{ display: 'inline', marginRight: 8 }} />
                          Loading site correction requests...
                        </td>
                      </tr>
                    ) : corrections.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-500)' }}>
                          No attendance correction requests recorded for workers at this site.
                        </td>
                      </tr>
                    ) : (
                      corrections.map((corr) => (
                        <tr key={corr.correction_id}>
                          <td className="cell-primary">{corr.worker_name}</td>
                          <td style={{ fontFamily: 'monospace' }}>{corr.employee_code}</td>
                          <td style={{ fontSize: '0.82rem' }}>
                            {corr.requested_check_in ? new Date(corr.requested_check_in).toLocaleString() : '—'}
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>
                            {corr.requested_check_out ? new Date(corr.requested_check_out).toLocaleString() : '—'}
                          </td>
                          <td style={{ maxWidth: 260 }}>{corr.reason}</td>
                          <td>
                            <StatusBadge
                              status={corr.status}
                              tone={corr.status === 'Approved' ? 'green' : corr.status === 'Rejected' ? 'red' : 'amber'}
                            />
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--ink-600)' }}>
                            {corr.reviewed_by_name || corr.status === 'Pending' ? 'Pending Admin Review' : 'Closed'}
                            {corr.review_remarks && <div style={{ fontStyle: 'italic', color: 'var(--ink-400)', marginTop: 2 }}>"{corr.review_remarks}"</div>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: WORK ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div>
              <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.86rem', color: 'var(--ink-700)' }}>
                  Active workforce assignments for <strong>{siteData.site_name}</strong>
                </span>

                <PrimaryButton onClick={handleOpenAssignmentModal}>
                  <Plus size={16} /> Assign Worker to Site
                </PrimaryButton>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Employee ID</th>
                      <th>Trade / Specialization</th>
                      <th>Site Name</th>
                      <th>Assigned Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAssignments ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '36px' }}>
                          <RefreshCw className="spin" size={24} style={{ display: 'inline', marginRight: 8 }} />
                          Loading work assignments...
                        </td>
                      </tr>
                    ) : assignments.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-500)' }}>
                          No workers assigned to this site yet. Click "Assign Worker to Site" to assign workforce.
                        </td>
                      </tr>
                    ) : (
                      assignments.map((asn) => (
                        <tr key={asn.assignment_id}>
                          <td className="cell-primary">{asn.worker_name}</td>
                          <td style={{ fontFamily: 'monospace' }}>{asn.employee_code}</td>
                          <td>{asn.employee_type_name || 'Specialist'}</td>
                          <td style={{ color: 'var(--forest-900)', fontWeight: 600 }}>{asn.site_name}</td>
                          <td>{asn.assigned_date ? new Date(asn.assigned_date).toLocaleDateString() : 'Active'}</td>
                          <td>
                            <StatusBadge status={asn.status || 'Active'} tone="green" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODAL: ASSIGN WORKER TO SITE */}
          {assignmentModalOpen && (
            <Modal
              open={assignmentModalOpen}
              onClose={() => setAssignmentModalOpen(false)}
              title={`Assign Worker to ${siteData.site_name}`}
              footer={
                <>
                  <SecondaryButton onClick={() => setAssignmentModalOpen(false)}>Cancel</SecondaryButton>
                  <PrimaryButton type="submit" form="site-assignment-modal-form" onClick={handleSaveAssignment}>
                    Confirm Assignment
                  </PrimaryButton>
                </>
              }
            >
              <form id="site-assignment-modal-form" onSubmit={handleSaveAssignment} className="form-grid">
                <div className="form-field full">
                  <label>Assigned Construction Site</label>
                  <input
                    type="text"
                    disabled
                    value={`${siteData.site_code} - ${siteData.site_name}`}
                    style={{ background: 'var(--cream-050)', color: 'var(--ink-700)' }}
                  />
                </div>

                <div className="form-field full">
                  <label>Select Worker to Assign *</label>
                  <select
                    required
                    value={assignmentForm.worker_id}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, worker_id: e.target.value })}
                  >
                    <option value="">Select Employee / Specialist</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_code} - {emp.first_name} {emp.last_name || ''} ({emp.employee_type_name || 'Specialist'})
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </Modal>
          )}
        </>
      )}
    </div>
  )
}
