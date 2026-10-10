import React, { useState, useEffect, useCallback } from 'react'
import {
  MapPin,
  Clock,
  UserCheck,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Navigation,
  ShieldAlert,
  Download,
  Calendar,
  Layers,
  Briefcase,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { attendanceAPI, employeeAPI, projectAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastContext'
import PageHeader from '../components/PageHeader'
import Breadcrumb from '../components/Breadcrumb'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'

export default function AttendanceManagement() {
  const { currentUser } = useApp()
  const { showToast } = useToast()
  const userRole = String(currentUser?.role || 'ADMIN').toUpperCase()
  const isWorker = userRole === 'WORKER'
  const isAdminOrSupervisor = !isWorker

  // Active Sub-Tab State
  const [activeTab, setActiveTab] = useState(isWorker ? 'spot_attendance' : 'dashboard')

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)

  // Today Worker Spot Attendance State
  const [todayState, setTodayState] = useState(null)
  const [loadingToday, setLoadingToday] = useState(false)

  // Geolocation & Attendance Action States
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [currentPosition, setCurrentPosition] = useState(null)
  const [checkInProcessing, setCheckInProcessing] = useState(false)
  const [checkOutProcessing, setCheckOutProcessing] = useState(false)

  // Site Management State
  const [sites, setSites] = useState([])
  const [employeesList, setEmployeesList] = useState([])
  const [loadingSites, setLoadingSites] = useState(false)
  const [siteModalOpen, setSiteModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState(null)
  const [siteForm, setSiteForm] = useState({
    site_code: '',
    site_name: '',
    project_id: '',
    address: '',
    latitude: '12.9010',
    longitude: '80.2279',
    radius_meters: 300,
    max_gps_accuracy: 150,
    working_start_time: '09:00',
    working_end_time: '18:00',
    supervisor_name: '',
    status: 'Active',
  })

  // Worker Assignments State
  const [assignments, setAssignments] = useState([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({ worker_id: '', site_id: '' })

  // History & Reports State
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyFilters, setHistoryFilters] = useState({
    startDate: '',
    endDate: '',
    site_id: '',
    status: '',
    searchTerm: '',
  })

  // Correction Requests State
  const [corrections, setCorrections] = useState([])
  const [loadingCorrections, setLoadingCorrections] = useState(false)
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false)
  const [correctionForm, setCorrectionForm] = useState({
    site_id: '',
    requested_check_in: '',
    requested_check_out: '',
    reason: '',
  })
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewItem, setReviewItem] = useState(null)
  const [reviewRemarks, setReviewRemarks] = useState('')

  // Account Provisioning State (Admin Only)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [createdAccountResult, setCreatedAccountResult] = useState(null)
  const [accountForm, setAccountForm] = useState({
    employee_id: '',
    role: 'WORKER',
    email: '',
    password: 'password123',
  })

  // Export CSV Handler
  const [exportingCSV, setExportingCSV] = useState(false)
  const handleExportCSV = async () => {
    setExportingCSV(true)
    try {
      const res = await attendanceAPI.exportCSV(historyFilters)
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const todayStr = new Date().toISOString().split('T')[0]
      link.setAttribute('download', `attendance_report_${todayStr}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('Attendance report CSV downloaded successfully!', 'success')
    } catch (err) {
      console.error('CSV Export Error:', err)
      showToast('Failed to export CSV report.', 'error')
    } finally {
      setExportingCSV(false)
    }
  }

  // 1. Fetch Today Status for Worker
  const fetchTodayStatus = useCallback(async () => {
    setLoadingToday(true)
    try {
      const data = await attendanceAPI.getToday()
      if (data.success) {
        setTodayState(data)
      }
    } catch (err) {
      console.error('Failed to load today attendance:', err)
    } finally {
      setLoadingToday(false)
    }
  }, [])

  // 2. Fetch Dashboard Metrics
  const fetchDashboard = useCallback(async () => {
    setLoadingDashboard(true)
    try {
      const data = await attendanceAPI.getDashboard()
      if (data.success) {
        setDashboardData(data)
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoadingDashboard(false)
    }
  }, [])

  // 3. Fetch Sites
  const fetchSites = useCallback(async () => {
    setLoadingSites(true)
    try {
      const data = await attendanceAPI.getSites()
      setSites(data || [])
    } catch (err) {
      console.error('Failed to load sites:', err)
    } finally {
      setLoadingSites(false)
    }
  }, [])

  // 4. Fetch Assignments
  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true)
    try {
      const data = await attendanceAPI.getAssignments()
      setAssignments(data || [])
    } catch (err) {
      console.error('Failed to load assignments:', err)
    } finally {
      setLoadingAssignments(false)
    }
  }, [])

  // 5. Fetch History
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const data = await attendanceAPI.getHistory(historyFilters)
      setHistory(data || [])
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }, [historyFilters])

  // 6. Fetch Corrections
  const fetchCorrections = useCallback(async () => {
    setLoadingCorrections(true)
    try {
      const data = await attendanceAPI.getCorrections()
      setCorrections(data || [])
    } catch (err) {
      console.error('Failed to load corrections:', err)
    } finally {
      setLoadingCorrections(false)
    }
  }, [])

  // Initial Load based on Active Tab
  useEffect(() => {
    fetchTodayStatus()
    fetchSites()
    fetchEmployeesList()

    if (activeTab === 'dashboard') fetchDashboard()
    if (activeTab === 'sites') fetchSites()
    if (activeTab === 'assignments') fetchAssignments()
    if (activeTab === 'history') fetchHistory()
    if (activeTab === 'corrections') fetchCorrections()
  }, [activeTab, fetchTodayStatus, fetchDashboard, fetchSites, fetchAssignments, fetchHistory, fetchCorrections])

  // Fetch employees list for dropdowns
  const fetchEmployeesList = async () => {
    try {
      const emps = await employeeAPI.getAll()
      setEmployeesList(emps || [])
    } catch (e) {
      console.error('Error fetching master lists', e)
    }
  }

  // Geolocation Acquisition
  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS Geolocation is not supported by your browser.')
      return
    }

    setGpsLoading(true)
    setGpsError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false)
        setCurrentPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        showToast('GPS Location acquired successfully!', 'success')
      },
      (err) => {
        setGpsLoading(false)
        let msg = 'Failed to acquire GPS location.'
        if (err.code === err.PERMISSION_DENIED) msg = 'Location access permission was denied. Please enable location in browser settings.'
        if (err.code === err.POSITION_UNAVAILABLE) msg = 'GPS signal unavailable. Please step outdoors or turn on location services.'
        if (err.code === err.TIMEOUT) msg = 'GPS location request timed out. Please try again.'
        setGpsError(msg)
        showToast(msg, 'error')
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    )
  }

  // Handle Worker GPS Spot Check-In
  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      showToast('GPS is not supported by this browser.', 'error')
      return
    }

    setCheckInProcessing(true)
    setGpsError('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const payload = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          const res = await attendanceAPI.checkIn(payload)
          if (res.success) {
            showToast(res.message || 'Check-in successful!', 'success')
            fetchTodayStatus()
            if (activeTab === 'dashboard') fetchDashboard()
          } else {
            showToast(res.message || 'Check-in failed.', 'error')
            setGpsError(res.message)
          }
        } catch (err) {
          const msg = err.response?.data?.message || err.message || 'Check-in failed.'
          setGpsError(msg)
          showToast(msg, 'error')
        } finally {
          setCheckInProcessing(false)
        }
      },
      (err) => {
        setCheckInProcessing(false)
        const msg = 'Please enable location permissions to mark attendance.'
        setGpsError(msg)
        showToast(msg, 'error')
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    )
  }

  // Handle Worker Check-Out
  const handleCheckOut = async () => {
    if (!window.confirm('Are you sure you want to Check Out for today?')) return
    setCheckOutProcessing(true)
    try {
      const res = await attendanceAPI.checkOut()
      if (res.success) {
        showToast(res.message || 'Check-out successful!', 'success')
        fetchTodayStatus()
        if (activeTab === 'dashboard') fetchDashboard()
      } else {
        showToast(res.message || 'Check-out failed.', 'error')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Check-out failed.'
      showToast(msg, 'error')
    } finally {
      setCheckOutProcessing(false)
    }
  }

  // Handle Save Construction Site Form
  const handleSaveSite = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      if (editingSite) {
        await attendanceAPI.updateSite(editingSite.site_id, siteForm)
        showToast('Construction site updated successfully.', 'success')
      } else {
        await attendanceAPI.createSite(siteForm)
        showToast('Construction site created successfully.', 'success')
      }
      setSiteModalOpen(false)
      fetchSites()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save site.', 'error')
    }
  }

  // Handle Save Worker Assignment
  const handleSaveAssignment = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      await attendanceAPI.createAssignment(assignmentForm)
      showToast('Worker assigned to site successfully.', 'success')
      setAssignmentModalOpen(false)
      fetchAssignments()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign worker.', 'error')
    }
  }

  // Handle Submit Correction Request
  const handleSubmitCorrection = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      await attendanceAPI.createCorrection(correctionForm)
      showToast('Correction request submitted for approval.', 'success')
      setCorrectionModalOpen(false)
      setCorrectionForm({ site_id: '', requested_check_in: '', requested_check_out: '', reason: '' })
      fetchCorrections()
      fetchTodayStatus()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit correction request.', 'error')
    }
  }

  // Handle Review Correction Request
  const handleReviewCorrection = async (status) => {
    if (!reviewItem) return
    try {
      await attendanceAPI.reviewCorrection(reviewItem.correction_id, {
        status,
        review_remarks: reviewRemarks,
      })
      showToast(`Correction request ${status.toLowerCase()} successfully.`, 'success')
      setReviewModalOpen(false)
      setReviewItem(null)
      setReviewRemarks('')
      fetchCorrections()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review request.', 'error')
    }
  }

  // Handle Provision User Account
  const handleCreateUserAccount = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    try {
      const res = await attendanceAPI.createUserAccount(accountForm)
      if (res.success) {
        showToast('User account provisioned successfully!', 'success')
        setCreatedAccountResult(res)
        fetchEmployeesList()
      } else {
        showToast(res.message || 'Failed to create user account.', 'error')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user account.', 'error')
    }
  }


  // Fill Current Location Coordinates
  const handleUseCurrentLocationForSite = () => {
    if (!navigator.geolocation) {
      showToast('GPS not supported.', 'error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSiteForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
        }))
        showToast('Coordinates filled from current device GPS!', 'success')
      },
      () => showToast('Failed to acquire device location.', 'error'),
      { enableHighAccuracy: true }
    )
  }

  return (
    <div>
      {/* Standard Breadcrumb */}
      <Breadcrumb items={['Workforce Attendance']} />

      {/* Standard Page Header */}
      <PageHeader
        title="Workforce Attendance Management"
        description="Real-time GPS spot check-in, construction site geofence validation & workforce analytics."
        actions={
          isAdminOrSupervisor ? (
            <SecondaryButton onClick={handleExportCSV} disabled={exportingCSV}>
              <Download size={16} className={exportingCSV ? 'spin' : ''} color="var(--gold-600)" /> {exportingCSV ? 'Exporting CSV...' : 'Export CSV Report'}
            </SecondaryButton>
          ) : null
        }
      />

      {/* Standard Design System Navigation Tabs */}
      <div className="tabs">
        {isAdminOrSupervisor && (
          <button onClick={() => setActiveTab('dashboard')} className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <Layers size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Dashboard
          </button>
        )}

        {isWorker && (
          <button onClick={() => setActiveTab('spot_attendance')} className={`tab-btn ${activeTab === 'spot_attendance' ? 'active' : ''}`}>
            <MapPin size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Spot Attendance (GPS)
          </button>
        )}

        {isAdminOrSupervisor && (
          <button onClick={() => setActiveTab('sites')} className={`tab-btn ${activeTab === 'sites' ? 'active' : ''}`}>
            <Building2 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Site Management
          </button>
        )}

        {isAdminOrSupervisor && (
          <button onClick={() => setActiveTab('assignments')} className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}>
            <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Worker Assignments
          </button>
        )}

        <button onClick={() => setActiveTab('history')} className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}>
          <Calendar size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> History & Reports
        </button>

        <button onClick={() => setActiveTab('corrections')} className={`tab-btn ${activeTab === 'corrections' ? 'active' : ''}`}>
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Correction Requests
        </button>
      </div>

      {/* TAB 1: ATTENDANCE DASHBOARD */}
      {activeTab === 'dashboard' && isAdminOrSupervisor && (
        <div>
          {loadingDashboard ? (
            <div className="empty-state">
              <RefreshCw className="spin empty-state-icon" size={32} />
              <h4>Loading workforce metrics...</h4>
            </div>
          ) : (
            <>
              {/* Standard KPI Stat Cards Grid */}
              <div className="stat-grid">
                <StatCard icon={Users} value={dashboardData?.metrics?.totalAssignedWorkers || 0} label="Total Assigned Workers" />
                <StatCard icon={UserCheck} iconBg="var(--green-100)" iconColor="var(--green-700)" value={dashboardData?.metrics?.presentToday || 0} label="Present Today" />
                <StatCard icon={Clock} iconBg="var(--gold-050)" iconColor="var(--forest-900)" value={dashboardData?.metrics?.checkedInCount || 0} label="On Shift (Checked In)" />
                <StatCard icon={CheckCircle2} iconBg="var(--green-100)" iconColor="var(--green-700)" value={dashboardData?.metrics?.checkedOutCount || 0} label="Checked Out" />
                <StatCard icon={XCircle} iconBg="var(--red-100)" iconColor="var(--red-600)" value={dashboardData?.metrics?.absentCount || 0} label="Absent / Unmarked" />
                <StatCard icon={AlertTriangle} iconBg="var(--amber-100)" iconColor="var(--amber-600)" value={dashboardData?.metrics?.pendingCorrections || 0} label="Pending Corrections" />
              </div>

              {/* Site-wise Summary Table */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 14 }}>
                  Site-wise Attendance Summary
                </h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Site Code</th>
                        <th>Site Name</th>
                        <th>Supervisor</th>
                        <th>Assigned Workers</th>
                        <th>Present Today</th>
                        <th>Currently On Site</th>
                        <th>Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.siteBreakdown?.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                            No construction site records available.
                          </td>
                        </tr>
                      ) : (
                        dashboardData?.siteBreakdown?.map((site) => {
                          const pct = site.assigned_count > 0 ? Math.round((site.present_today / site.assigned_count) * 100) : 0
                          return (
                            <tr key={site.site_id}>
                              <td style={{ fontWeight: 600 }}>{site.site_code}</td>
                              <td className="cell-primary">{site.site_name}</td>
                              <td>{site.supervisor_name || 'N/A'}</td>
                              <td>{site.assigned_count}</td>
                              <td style={{ color: 'var(--green-700)', fontWeight: 600 }}>{site.present_today}</td>
                              <td style={{ color: 'var(--forest-900)', fontWeight: 600 }}>{site.currently_on_site}</td>
                              <td>
                                <StatusBadge status={`${pct}%`} tone={pct >= 80 ? 'green' : pct >= 50 ? 'gold' : 'red'} />
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: SPOT ATTENDANCE (GPS CHECK-IN / CHECK-OUT) */}
      {activeTab === 'spot_attendance' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="card card-pad" style={{ background: 'var(--paper)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>GPS Spot Attendance</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-500)', marginTop: 4 }}>
                  Verify location & record check-in/out at your assigned construction site
                </p>
              </div>
              <StatusBadge
                status={
                  todayState?.todayRecord?.status === 'Checked Out'
                    ? 'Checked Out'
                    : todayState?.todayRecord
                    ? 'Checked In'
                    : 'Not Checked In'
                }
              />
            </div>

            {/* Assigned Construction Site Card */}
            <div style={{ padding: 16, background: 'var(--cream-050)', border: '1px solid var(--line-100)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 4 }}>
                Assigned Construction Site
              </div>
              {todayState?.assignedSite ? (
                <>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                    {todayState.assignedSite.site_name}
                  </h4>
                  <div style={{ fontSize: '0.84rem', color: 'var(--ink-700)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="var(--gold-600)" /> {todayState.assignedSite.address || 'Site Location'}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '0.78rem', color: 'var(--ink-500)' }}>
                    <span>Supervisor: <strong>{todayState.assignedSite.supervisor_name || 'Assigned Lead'}</strong></span>
                    <span>Geofence Radius: <strong>{todayState.assignedSite.radius_meters || 300}m</strong></span>
                    <span>Shift: <strong>{todayState.assignedSite.working_start_time} - {todayState.assignedSite.working_end_time}</strong></span>
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--red-600)', fontSize: '0.88rem', fontWeight: 600 }}>
                  No active construction site currently assigned to your worker account.
                </div>
              )}
            </div>

            {/* Today Record Timestamp Card */}
            {todayState?.todayRecord && (
              <div style={{ padding: 16, background: 'var(--green-100)', borderRadius: 'var(--radius-md)', marginBottom: 20, border: '1px solid rgba(110,182,162,0.3)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--green-700)', fontWeight: 700 }}>CHECK-IN TIME</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--forest-950)', marginTop: 4 }}>
                      {new Date(todayState.todayRecord.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--green-700)', fontWeight: 700 }}>CHECK-OUT TIME</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--forest-950)', marginTop: 4 }}>
                      {todayState.todayRecord.check_out_at
                        ? new Date(todayState.todayRecord.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Active Shift'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--green-700)', fontWeight: 700 }}>WORKED HOURS</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--forest-950)', marginTop: 4 }}>
                      {todayState.todayRecord.hours_worked || 0} hrs
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GPS Geolocation Status & Accuracy Meter */}
            <div style={{ border: '1px solid var(--line-100)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 22, background: 'var(--paper)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Navigation size={16} color="var(--forest-800)" /> Device Geolocation Status
                </span>
                <button onClick={acquireLocation} disabled={gpsLoading} className="btn btn-ghost btn-sm">
                  <RefreshCw size={14} className={gpsLoading ? 'spin' : ''} /> {gpsLoading ? 'Acquiring...' : 'Acquire GPS'}
                </button>
              </div>

              {currentPosition ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-700)', background: 'var(--cream-050)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                  <div>Latitude: <strong>{currentPosition.latitude.toFixed(6)}</strong> | Longitude: <strong>{currentPosition.longitude.toFixed(6)}</strong></div>
                  <div style={{ marginTop: 4, color: currentPosition.accuracy <= 150 ? 'var(--green-700)' : 'var(--amber-600)' }}>
                    GPS Accuracy: <strong>{Math.round(currentPosition.accuracy)} meters</strong> (Max threshold: 150m)
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', fontStyle: 'italic' }}>
                  Click "Acquire GPS" or press Check-In to request high-accuracy location from your device.
                </div>
              )}

              {gpsError && (
                <div style={{ marginTop: 10, background: 'var(--red-100)', color: 'var(--red-600)', padding: 10, borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={16} /> {gpsError}
                </div>
              )}
            </div>

            {/* Check-In and Check-Out Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <PrimaryButton onClick={handleCheckIn} disabled={checkInProcessing || !!todayState?.todayRecord} className="btn-block">
                {checkInProcessing ? <RefreshCw className="spin" size={18} /> : <CheckCircle2 size={18} />}
                {checkInProcessing ? 'Verifying GPS...' : 'Mark Check-In'}
              </PrimaryButton>

              <button
                onClick={handleCheckOut}
                disabled={checkOutProcessing || !todayState?.todayRecord || !!todayState?.todayRecord?.check_out_at}
                className="btn btn-danger btn-block"
              >
                {checkOutProcessing ? <RefreshCw className="spin" size={18} /> : <XCircle size={18} />}
                {checkOutProcessing ? 'Processing...' : 'Mark Check-Out'}
              </button>
            </div>

            {/* Correction Link */}
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <button
                onClick={() => {
                  if (todayState?.assignedSite) {
                    setCorrectionForm((prev) => ({ ...prev, site_id: todayState.assignedSite.site_id }))
                  }
                  setCorrectionModalOpen(true)
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--forest-800)', fontWeight: 600 }}
              >
                Need to submit a missed check-out or attendance correction?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SITE MANAGEMENT */}
      {activeTab === 'sites' && isAdminOrSupervisor && (
        <div>
          <div className="toolbar">
            <div style={{ flex: 1 }} />
            <PrimaryButton
              onClick={() => {
                setEditingSite(null)
                setSiteForm({
                  site_code: `SITE-${Math.floor(1000 + Math.random() * 9000)}`,
                  site_name: '',
                  project_id: '',
                  address: '',
                  latitude: '12.9010',
                  longitude: '80.2279',
                  radius_meters: 300,
                  max_gps_accuracy: 150,
                  working_start_time: '09:00',
                  working_end_time: '18:00',
                  supervisor_name: '',
                  status: 'Active',
                })
                setSiteModalOpen(true)
              }}
            >
              <Plus size={16} /> Add Construction Site
            </PrimaryButton>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Site Name</th>
                  <th>Coordinates (Lat, Lon)</th>
                  <th>Radius (m)</th>
                  <th>Max Accuracy</th>
                  <th>Working Hours</th>
                  <th>Supervisor</th>
                  <th>Assigned Workers</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                      No construction sites defined.
                    </td>
                  </tr>
                ) : (
                  sites.map((site) => (
                    <tr key={site.site_id}>
                      <td style={{ fontWeight: 600 }}>{site.site_code}</td>
                      <td className="cell-primary">{site.site_name}</td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
                      </td>
                      <td>{site.radius_meters || 300}m</td>
                      <td>{site.max_gps_accuracy || 150}m</td>
                      <td>{site.working_start_time} - {site.working_end_time}</td>
                      <td>{site.supervisor_name || 'Unassigned'}</td>
                      <td style={{ fontWeight: 600 }}>{site.assigned_workers_count || 0}</td>
                      <td style={{ textAlign: 'right' }}>
                        <SecondaryButton
                          onClick={() => {
                            setEditingSite(site)
                            setSiteForm(site)
                            setSiteModalOpen(true)
                          }}
                          className="btn-sm"
                        >
                          Edit Config
                        </SecondaryButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WORKER ASSIGNMENTS */}
      {activeTab === 'assignments' && isAdminOrSupervisor && (
        <div>
          <div className="toolbar">
            <div style={{ flex: 1 }} />
            {isAdminOrSupervisor && (
              <SecondaryButton
                onClick={() => {
                  setCreatedAccountResult(null)
                  setAccountModalOpen(true)
                }}
              >
                🔑 Provision User Account
              </SecondaryButton>
            )}
            <PrimaryButton
              onClick={() => {
                setAssignmentForm({ worker_id: '', site_id: '' })
                setAssignmentModalOpen(true)
              }}
            >
              <Plus size={16} /> Assign Worker to Site
            </PrimaryButton>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker Code</th>
                  <th>Worker Name</th>
                  <th>Employee Type</th>
                  <th>Assigned Site</th>
                  <th>Site Code</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                      No active worker assignments found.
                    </td>
                  </tr>
                ) : (
                  assignments.map((asn) => (
                    <tr key={asn.assignment_id}>
                      <td style={{ fontWeight: 600 }}>{asn.employee_code}</td>
                      <td className="cell-primary">{asn.worker_name}</td>
                      <td>{asn.employee_type_name || 'Specialist'}</td>
                      <td style={{ color: 'var(--forest-900)', fontWeight: 600 }}>{asn.site_name}</td>
                      <td>{asn.site_code}</td>
                      <td>{new Date(asn.assigned_date).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={asn.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: HISTORY & REPORTS */}
      {activeTab === 'history' && (
        <div>
          {/* Standard Filters Toolbar */}
          <div className="toolbar">
            <select
              value={historyFilters.site_id}
              onChange={(e) => setHistoryFilters((prev) => ({ ...prev, site_id: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Construction Sites</option>
              {sites.map((s) => (
                <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
              ))}
            </select>

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
            />

            <input
              type="date"
              value={historyFilters.endDate}
              onChange={(e) => setHistoryFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="filter-select"
            />

            <SecondaryButton onClick={fetchHistory}>Apply Filter</SecondaryButton>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker Name</th>
                  <th>Site Name</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Worked Hours</th>
                  <th>Distance (m)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                      No attendance history records found.
                    </td>
                  </tr>
                ) : (
                  history.map((rec) => (
                    <tr key={rec.attendance_id}>
                      <td style={{ fontWeight: 600 }}>{new Date(rec.date).toLocaleDateString()}</td>
                      <td className="cell-primary">{rec.worker_name}</td>
                      <td>{rec.site_name}</td>
                      <td>{new Date(rec.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        {rec.check_out_at
                          ? new Date(rec.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Active Shift'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{rec.hours_worked || 0} hrs</td>
                      <td>{rec.distance_meters}m</td>
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

      {/* TAB 6: CORRECTION REQUESTS */}
      {activeTab === 'corrections' && (
        <div>
          <div className="toolbar">
            <div style={{ flex: 1 }} />
            <PrimaryButton onClick={() => setCorrectionModalOpen(true)}>
              <Plus size={16} /> Submit Correction Request
            </PrimaryButton>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Site Name</th>
                  <th>Requested Times</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                  {isAdminOrSupervisor && <th style={{ textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {corrections.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                      No attendance correction requests.
                    </td>
                  </tr>
                ) : (
                  corrections.map((corr) => (
                    <tr key={corr.correction_id}>
                      <td className="cell-primary">{corr.worker_name}</td>
                      <td>{corr.site_name}</td>
                      <td style={{ fontSize: '0.8rem' }}>
                        In: {corr.requested_check_in ? new Date(corr.requested_check_in).toLocaleString() : 'N/A'} <br />
                        Out: {corr.requested_check_out ? new Date(corr.requested_check_out).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ maxWidth: 260 }}>{corr.reason}</td>
                      <td>
                        <StatusBadge
                          status={corr.status}
                          tone={corr.status === 'Approved' ? 'green' : corr.status === 'Rejected' ? 'red' : 'amber'}
                        />
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{corr.reviewed_by_name || 'Pending Review'}</td>
                      {isAdminOrSupervisor && (
                        <td style={{ textAlign: 'right' }}>
                          {corr.status === 'Pending' ? (
                            <PrimaryButton
                              onClick={() => {
                                setReviewItem(corr)
                                setReviewModalOpen(true)
                              }}
                              className="btn-sm"
                            >
                              Review
                            </PrimaryButton>
                          ) : (
                            <span style={{ color: 'var(--ink-300)', fontSize: '0.78rem' }}>Closed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD/EDIT CONSTRUCTION SITE */}
      {siteModalOpen && (
        <Modal
          open={siteModalOpen}
          onClose={() => setSiteModalOpen(false)}
          title={editingSite ? 'Edit Construction Site Settings' : 'Create Construction Site'}
          footer={
            <>
              <SecondaryButton onClick={() => setSiteModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="site-modal-form">Save Site Configuration</PrimaryButton>
            </>
          }
        >
          <form id="site-modal-form" onSubmit={handleSaveSite} className="form-grid">
            <div className="form-field">
              <label>Site Code *</label>
              <input
                type="text"
                required
                value={siteForm.site_code}
                onChange={(e) => setSiteForm({ ...siteForm, site_code: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Site Name *</label>
              <input
                type="text"
                required
                value={siteForm.site_name}
                onChange={(e) => setSiteForm({ ...siteForm, site_name: e.target.value })}
              />
            </div>

            <div className="form-field full">
              <label>Site Address</label>
              <input
                type="text"
                value={siteForm.address}
                onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Latitude *</label>
              <input
                type="text"
                required
                value={siteForm.latitude}
                onChange={(e) => setSiteForm({ ...siteForm, latitude: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Longitude *</label>
              <input
                type="text"
                required
                value={siteForm.longitude}
                onChange={(e) => setSiteForm({ ...siteForm, longitude: e.target.value })}
              />
            </div>

            <div className="form-field full">
              <SecondaryButton type="button" onClick={handleUseCurrentLocationForSite}>
                📍 Fill Coordinates from Current Location
              </SecondaryButton>
            </div>

            <div className="form-field">
              <label>Geofence Radius (Meters)</label>
              <input
                type="number"
                value={siteForm.radius_meters}
                onChange={(e) => setSiteForm({ ...siteForm, radius_meters: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Max GPS Accuracy (Meters)</label>
              <input
                type="number"
                value={siteForm.max_gps_accuracy}
                onChange={(e) => setSiteForm({ ...siteForm, max_gps_accuracy: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Work Start Time</label>
              <input
                type="time"
                value={siteForm.working_start_time}
                onChange={(e) => setSiteForm({ ...siteForm, working_start_time: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Work End Time</label>
              <input
                type="time"
                value={siteForm.working_end_time}
                onChange={(e) => setSiteForm({ ...siteForm, working_end_time: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: WORKER ASSIGNMENT */}
      {assignmentModalOpen && (
        <Modal
          open={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          title="Assign Worker to Construction Site"
          footer={
            <>
              <SecondaryButton onClick={() => setAssignmentModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="assignment-modal-form" onClick={handleSaveAssignment}>Assign Worker</PrimaryButton>
            </>
          }
        >
          <form id="assignment-modal-form" onSubmit={handleSaveAssignment} className="form-grid">
            <div className="form-field full">
              <label>Select Worker *</label>
              <select
                required
                value={assignmentForm.worker_id}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, worker_id: e.target.value })}
              >
                <option value="">Select Employee / Worker</option>
                {employeesList.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_code} - {emp.first_name} {emp.last_name || ''} ({emp.employee_type_name || 'Specialist'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field full">
              <label>Select Target Site *</label>
              <select
                required
                value={assignmentForm.site_id}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, site_id: e.target.value })}
              >
                <option value="">Select Construction Site</option>
                {sites.map((s) => (
                  <option key={s.site_id} value={s.site_id}>
                    {s.site_code} - {s.site_name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: SUBMIT CORRECTION REQUEST */}
      {correctionModalOpen && (
        <Modal
          open={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          title="Submit Attendance Correction Request"
          footer={
            <>
              <SecondaryButton onClick={() => setCorrectionModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="correction-modal-form" onClick={handleSubmitCorrection}>Submit Request</PrimaryButton>
            </>
          }
        >
          <form id="correction-modal-form" onSubmit={handleSubmitCorrection} className="form-grid">
            <div className="form-field full">
              <label>Construction Site *</label>
              <select
                required
                value={correctionForm.site_id}
                onChange={(e) => setCorrectionForm({ ...correctionForm, site_id: e.target.value })}
              >
                <option value="">Select Site</option>
                {sites.map((s) => (
                  <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Requested Check-In Date & Time</label>
              <input
                type="datetime-local"
                value={correctionForm.requested_check_in}
                onChange={(e) => setCorrectionForm({ ...correctionForm, requested_check_in: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Requested Check-Out Date & Time</label>
              <input
                type="datetime-local"
                value={correctionForm.requested_check_out}
                onChange={(e) => setCorrectionForm({ ...correctionForm, requested_check_out: e.target.value })}
              />
            </div>

            <div className="form-field full">
              <label>Reason for Correction *</label>
              <textarea
                required
                rows="3"
                placeholder="e.g. Device battery died before check-out / GPS signal error at boundary"
                value={correctionForm.reason}
                onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: REVIEW CORRECTION REQUEST */}
      {reviewModalOpen && reviewItem && (
        <Modal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Review Attendance Correction Request"
          footer={
            <>
              <SecondaryButton onClick={() => setReviewModalOpen(false)}>Cancel</SecondaryButton>
              <button onClick={() => handleReviewCorrection('Rejected')} className="btn btn-danger">
                Reject Request
              </button>
              <PrimaryButton onClick={() => handleReviewCorrection('Approved')}>
                Approve Request
              </PrimaryButton>
            </>
          }
        >
          <div style={{ fontSize: '0.88rem', color: 'var(--ink-700)', marginBottom: 16 }}>
            <div><strong>Worker:</strong> {reviewItem.worker_name} ({reviewItem.employee_code})</div>
            <div><strong>Site:</strong> {reviewItem.site_name}</div>
            <div><strong>Reason:</strong> {reviewItem.reason}</div>
          </div>

          <div className="form-field full">
            <label>Reviewer Remarks</label>
            <textarea
              rows="2"
              placeholder="Enter remarks for approval or rejection..."
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
            ></textarea>
          </div>
        </Modal>
      )}

      {/* MODAL 5: PROVISION USER ACCOUNT */}
      {accountModalOpen && (
        <Modal
          open={accountModalOpen}
          onClose={() => {
            setAccountModalOpen(false)
            setCreatedAccountResult(null)
          }}
          title="🔑 Provision User Login Account for Employee"
          footer={
            <>
              <SecondaryButton
                onClick={() => {
                  setAccountModalOpen(false)
                  setCreatedAccountResult(null)
                }}
              >
                Close
              </SecondaryButton>
              {!createdAccountResult && (
                <PrimaryButton type="submit" form="account-modal-form">Provision Account</PrimaryButton>
              )}
            </>
          }
        >
          {createdAccountResult ? (
            <div style={{ background: 'var(--green-100)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid rgba(110,182,162,0.4)' }}>
              <h4 style={{ color: 'var(--green-800)', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 700 }}>
                ✅ User Account Successfully Created!
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--ink-700)', marginBottom: 12 }}>
                Please provide the login credentials below to the user securely.
              </p>
              <div style={{ background: 'var(--paper)', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: '0.86rem', fontFamily: 'monospace' }}>
                <div><strong>Email / Username:</strong> {createdAccountResult.credentials?.email || createdAccountResult.account?.email}</div>
                <div><strong>Initial Password:</strong> {createdAccountResult.credentials?.initial_password || createdAccountResult.account?.initialPassword}</div>
                <div><strong>Role Assigned:</strong> {createdAccountResult.credentials?.role || createdAccountResult.account?.role}</div>
                <div><strong>Employee ID:</strong> {createdAccountResult.credentials?.employee_id || createdAccountResult.account?.employee_id}</div>
              </div>
            </div>
          ) : (
            <form id="account-modal-form" onSubmit={handleCreateUserAccount} className="form-grid">
              <div className="form-field full">
                <label>Select Employee Record *</label>
                <select
                  required
                  value={accountForm.employee_id}
                  onChange={(e) => {
                    const emp = employeesList.find((x) => String(x.employee_id) === String(e.target.value))
                    setAccountForm({
                      ...accountForm,
                      employee_id: e.target.value,
                      email: emp?.email || accountForm.email,
                    })
                  }}
                >
                  <option value="">Select Employee to Link Account</option>
                  {employeesList.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_code} - {emp.first_name} {emp.last_name || ''} ({emp.email || 'No email saved'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Assign Role *</label>
                <select
                  value={accountForm.role}
                  onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                >
                  <option value="WORKER">WORKER</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="form-field">
                <label>Login Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. worker@company.com"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                />
              </div>

              <div className="form-field full">
                <label>Initial Password *</label>
                <input
                  type="text"
                  required
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                />
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}
