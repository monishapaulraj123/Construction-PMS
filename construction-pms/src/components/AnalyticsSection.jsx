import { useState, useEffect, useMemo } from 'react'
import {
  FolderKanban,
  Activity,
  CheckCircle2,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  TrendingUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'
import StatCard from './StatCard'
import EmptyState from './EmptyState'
import StatusBadge from './StatusBadge'
import { formatCurrencyINR } from '../utils/format'
import { useApp } from '../context/AppContext'
import { analyticsAPI, constructionTypeAPI } from '../services/api'

// Project design system color palette
const COLORS = [
  '#2F5D50', // Forest Green
  '#D4B06A', // Warm Gold
  '#4a927e', // Mint Green
  '#c98a3e', // Warm Amber
  '#bf6155', // Coral Red
  '#427f6d', // Secondary Forest
  '#b8934f', // Deep Gold
  '#8b8578', // Taupe
]

export default function AnalyticsSection() {
  const { projects: contextProjects = [], payments: contextPayments = [] } = useApp()

  // Filter States
  const [dateRange, setDateRange] = useState('all')
  const [selectedProjectId, setSelectedProjectId] = useState('all')
  const [selectedTypeId, setSelectedTypeId] = useState('all')
  const [constructionTypes, setConstructionTypes] = useState([])

  // Backend vs Computed data states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendAnalytics, setBackendAnalytics] = useState(null)

  // Fetch Construction Types for filter dropdown
  useEffect(() => {
    let isMounted = true
    constructionTypeAPI
      .getAll()
      .then((types) => {
        if (isMounted && Array.isArray(types)) {
          setConstructionTypes(types)
        }
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch Analytics from Backend API when filters change
  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (selectedProjectId !== 'all') params.projectId = selectedProjectId
      if (selectedTypeId !== 'all') params.constructionTypeId = selectedTypeId

      const now = new Date()
      if (dateRange === 'this_month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        params.startDate = firstDay
      } else if (dateRange === 'this_quarter') {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3
        const firstDay = new Date(now.getFullYear(), quarterMonth, 1).toISOString().split('T')[0]
        params.startDate = firstDay
      } else if (dateRange === 'this_year') {
        const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
        params.startDate = firstDay
      }

      const res = await analyticsAPI.getAnalyticsData(params)
      if (res && res.success) {
        setBackendAnalytics(res)
      } else {
        setBackendAnalytics(null)
      }
    } catch (err) {
      console.warn('[Analytics API Warning] Using context fallback analytics:', err.message)
      setBackendAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, selectedProjectId, selectedTypeId])

  // Fallback Client-side Data Calculation if backend endpoint is unavailable
  const fallbackAnalytics = useMemo(() => {
    let filteredProjects = [...contextProjects]
    let filteredPayments = [...contextPayments]

    // Apply Project Filter
    if (selectedProjectId !== 'all') {
      filteredProjects = filteredProjects.filter((p) => String(p.project_id) === String(selectedProjectId))
      filteredPayments = filteredPayments.filter((p) => String(p.project_id) === String(selectedProjectId))
    }

    // Apply Construction Type Filter
    if (selectedTypeId !== 'all') {
      filteredProjects = filteredProjects.filter(
        (p) => String(p.construction_type_id) === String(selectedTypeId)
      )
    }

    // Apply Date Range Filter
    if (dateRange !== 'all') {
      const now = new Date()
      let startDateCutoff = null

      if (dateRange === 'this_month') {
        startDateCutoff = new Date(now.getFullYear(), now.getMonth(), 1)
      } else if (dateRange === 'this_quarter') {
        const qMonth = Math.floor(now.getMonth() / 3) * 3
        startDateCutoff = new Date(now.getFullYear(), qMonth, 1)
      } else if (dateRange === 'this_year') {
        startDateCutoff = new Date(now.getFullYear(), 0, 1)
      }

      if (startDateCutoff) {
        filteredProjects = filteredProjects.filter((p) => {
          if (!p.start_date) return true
          return new Date(p.start_date) >= startDateCutoff
        })
        filteredPayments = filteredPayments.filter((p) => {
          if (!p.payment_date) return true
          return new Date(p.payment_date) >= startDateCutoff
        })
      }
    }

    // Summary Metrics
    const totalProjects = filteredProjects.length
    const activeProjects = filteredProjects.filter((p) => p.project_status !== 'Completed').length
    const completedProjects = filteredProjects.filter((p) => p.project_status === 'Completed').length
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (Number(p.estimated_budget) || 0), 0)

    const totalIncome = filteredPayments
      .filter((p) => (p.payment_type || '').toLowerCase() === 'income')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    const totalExpense = filteredPayments
      .filter((p) => (p.payment_type || '').toLowerCase() === 'expense')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    // A. Project Status
    const statusMap = {}
    filteredProjects.forEach((p) => {
      const st = p.project_status || 'Not Started'
      statusMap[st] = (statusMap[st] || 0) + 1
    })
    const projectStatusData = Object.keys(statusMap).map((st) => ({
      name: st,
      count: statusMap[st],
    }))

    // B. Construction Type Distribution
    const typeMap = {}
    filteredProjects.forEach((p) => {
      const tName = p.construction_type_name || 'Other'
      typeMap[tName] = (typeMap[tName] || 0) + 1
    })
    const constructionTypeData = Object.keys(typeMap).map((tName) => ({
      name: tName,
      value: typeMap[tName],
    }))

    // C. Budget vs Actual Expense
    const expenseByProject = {}
    filteredPayments.forEach((pay) => {
      if ((pay.payment_type || '').toLowerCase() === 'expense') {
        const key = pay.project_id || pay.project_name
        if (key) {
          expenseByProject[key] = (expenseByProject[key] || 0) + (Number(pay.amount) || 0)
        }
      }
    })

    const budgetVsExpenseData = filteredProjects.map((p) => {
      const actualExpense = expenseByProject[p.project_id] || expenseByProject[p.project_name] || 0
      return {
        id: p.project_id,
        name: p.project_name,
        estimatedBudget: Number(p.estimated_budget) || 0,
        actualExpense,
      }
    })

    // D. Income vs Expense
    const monthlyMap = {}
    filteredPayments.forEach((pay) => {
      let mKey = 'Overall'
      if (pay.payment_date) {
        const d = new Date(pay.payment_date)
        if (!isNaN(d.getTime())) {
          mKey = d.toLocaleString('default', { month: 'short', year: '2-digit' })
        }
      }
      if (!monthlyMap[mKey]) {
        monthlyMap[mKey] = { month: mKey, income: 0, expense: 0 }
      }
      const type = (pay.payment_type || '').toLowerCase()
      const amt = Number(pay.amount) || 0
      if (type === 'income') monthlyMap[mKey].income += amt
      else if (type === 'expense') monthlyMap[mKey].expense += amt
    })
    const incomeVsExpenseData = Object.values(monthlyMap)

    // E. Construction Progress
    const constructionProgressData = filteredProjects.map((p) => ({
      id: p.project_id,
      name: p.project_name,
      stage: p.construction_stage_name || 'In Progress',
      progress: Number(p.overall_progress_percentage) || 0,
      status: p.project_status || 'In Progress',
    }))

    return {
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        totalExpense,
        totalIncome,
      },
      projectStatusData,
      constructionTypeData,
      budgetVsExpenseData,
      incomeVsExpenseData,
      constructionProgressData,
    }
  }, [contextProjects, contextPayments, selectedProjectId, selectedTypeId, dateRange])

  // Final Analytics Payload (prefer backend API data if available, fallback to client computed)
  const analytics = backendAnalytics || fallbackAnalytics
  const {
    summary = {},
    projectStatusData = [],
    constructionTypeData = [],
    budgetVsExpenseData = [],
    incomeVsExpenseData = [],
    constructionProgressData = [],
  } = analytics

  const hasData = (summary.totalProjects > 0 || incomeVsExpenseData.length > 0)

  // Custom Recharts Tooltip styling matching theme
  const customTooltipStyle = {
    backgroundColor: 'var(--paper)',
    borderColor: 'var(--line-100)',
    color: 'var(--ink-900)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-card)',
    fontSize: '0.82rem',
    padding: '8px 12px',
  }

  return (
    <div className="analytics-section" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Filters Toolbar */}
      <div
        className="card card-pad"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={18} style={{ color: 'var(--forest-800)' }} />
          <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>Analytics Filters</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Date Range Filter */}
          <div>
            <select
              className="filter-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Filter by Date Range"
            >
              <option value="all">All Time</option>
              <option value="this_month">This Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <select
              className="filter-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              aria-label="Filter by Project"
            >
              <option value="all">All Projects</option>
              {contextProjects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* Construction Type Filter */}
          <div>
            <select
              className="filter-select"
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              aria-label="Filter by Construction Type"
            >
              <option value="all">All Construction Types</option>
              {constructionTypes.length > 0
                ? constructionTypes.map((ct) => (
                    <option key={ct.construction_type_id} value={ct.construction_type_id}>
                      {ct.construction_type_name}
                    </option>
                  ))
                : [
                    'Residential',
                    'Hospital',
                    'Commercial Building',
                    'Industrial',
                    'Road',
                    'Bridge',
                  ].map((typeName, idx) => (
                    <option key={idx} value={typeName}>
                      {typeName}
                    </option>
                  ))}
            </select>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchAnalytics}
            disabled={loading}
            title="Refresh Analytics"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Error state alert if any */}
      {error && (
        <div className="card card-pad" style={{ borderLeft: '4px solid var(--red-500)', background: 'var(--red-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} style={{ color: 'var(--red-600)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--red-600)', fontWeight: 600 }}>{error}</span>
          </div>
        </div>
      )}

      {/* 3. Summary Cards */}
      <div className="stat-grid">
        <StatCard
          icon={FolderKanban}
          iconBg="var(--forest-900)"
          iconColor="#fff"
          value={summary.totalProjects?.toString() || '0'}
          label="Total Projects"
        />
        <StatCard
          icon={Activity}
          iconBg="var(--gold-050)"
          iconColor="var(--gold-600)"
          value={summary.activeProjects?.toString() || '0'}
          label="Active Projects"
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="var(--green-100)"
          iconColor="var(--forest-900)"
          value={summary.completedProjects?.toString() || '0'}
          label="Completed Projects"
        />
        <StatCard
          icon={DollarSign}
          iconBg="var(--sand-100)"
          iconColor="var(--forest-900)"
          value={formatCurrencyINR(summary.totalBudget || 0)}
          label="Total Budget"
        />
        <StatCard
          icon={ArrowUpRight}
          iconBg="#fee2e2"
          iconColor="#b91c1c"
          value={formatCurrencyINR(summary.totalExpense || 0)}
          label="Total Expense"
        />
        <StatCard
          icon={ArrowDownLeft}
          iconBg="#dcfce7"
          iconColor="#15803d"
          value={formatCurrencyINR(summary.totalIncome || 0)}
          label="Total Income"
        />
      </div>

      {!hasData ? (
        <div className="card card-pad">
          <EmptyState
            icon={BarChart3}
            title="No data available for the selected period."
            description="Try selecting a different date range or project filter."
          />
        </div>
      ) : (
        <>
          {/* Charts Row 1: Project Status & Construction Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* Chart A: Project Status Analytics */}
            <div className="card card-pad">
              <div className="section-head" style={{ marginBottom: 16 }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart3 size={18} style={{ color: 'var(--forest-800)' }} /> Project Status Analytics
                  </h3>
                  <p className="section-desc">Distribution of projects by current execution status</p>
                </div>
              </div>
              {projectStatusData.length === 0 ? (
                <EmptyState title="No status data available" />
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={projectStatusData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line-100)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-700)' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--ink-700)' }} />
                      <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                      <Bar dataKey="count" name="Projects" radius={[6, 6, 0, 0]}>
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart B: Construction Type Distribution */}
            <div className="card card-pad">
              <div className="section-head" style={{ marginBottom: 16 }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PieIcon size={18} style={{ color: 'var(--gold-600)' }} /> Construction Type Distribution
                  </h3>
                  <p className="section-desc">Projects grouped by actual construction type</p>
                </div>
              </div>
              {constructionTypeData.length === 0 ? (
                <EmptyState title="No construction type data available" />
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={constructionTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {constructionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={customTooltipStyle} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(val) => <span style={{ color: 'var(--ink-900)', fontSize: '0.8rem' }}>{val}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2: Budget vs Expense & Income vs Expense */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* Chart C: Budget vs Actual Expense */}
            <div className="card card-pad">
              <div className="section-head" style={{ marginBottom: 16 }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={18} style={{ color: 'var(--forest-800)' }} /> Budget vs Actual Expense
                  </h3>
                  <p className="section-desc">Estimated budget vs actual expense incurred per project</p>
                </div>
              </div>
              {budgetVsExpenseData.length === 0 ? (
                <EmptyState title="No budget vs expense data" />
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={budgetVsExpenseData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line-100)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: 'var(--ink-700)' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--ink-700)' }}
                        tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                      />
                      <Tooltip
                        contentStyle={customTooltipStyle}
                        formatter={(value) => [formatCurrencyINR(value), '']}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="estimatedBudget" name="Estimated Budget" fill="var(--forest-900)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actualExpense" name="Actual Expense" fill="var(--gold-500)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart D: Income vs Expense */}
            <div className="card card-pad">
              <div className="section-head" style={{ marginBottom: 16 }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={18} style={{ color: 'var(--green-700)' }} /> Income vs Expense
                  </h3>
                  <p className="section-desc">Financial transactions summary based on actual payments</p>
                </div>
              </div>
              {incomeVsExpenseData.length === 0 ? (
                <EmptyState title="No transaction records available" />
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={incomeVsExpenseData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line-100)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ink-700)' }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--ink-700)' }}
                        tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                      />
                      <Tooltip
                        contentStyle={customTooltipStyle}
                        formatter={(value) => [formatCurrencyINR(value), '']}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="income" name="Total Income" fill="#4a927e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Total Expense" fill="#bf6155" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Chart E: Project / Construction Progress */}
          <div className="card card-pad">
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <h3>Construction Progress & Stage Execution</h3>
                <p className="section-desc">Overall physical progress percentage by project stage</p>
              </div>
            </div>

            {constructionProgressData.length === 0 ? (
              <EmptyState title="No project progress records found" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {constructionProgressData.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--cream-050)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--line-100)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink-900)' }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginLeft: 10 }}>
                          Stage: <strong>{item.stage}</strong>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <StatusBadge status={item.status} />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--forest-900)' }}>
                          {item.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div
                      style={{
                        height: 10,
                        width: '100%',
                        background: 'var(--line-100)',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(0, item.progress))}%`,
                          background:
                            item.progress >= 100
                              ? 'var(--green-700)'
                              : item.progress >= 50
                              ? 'var(--forest-900)'
                              : 'var(--gold-500)',
                          borderRadius: 999,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
