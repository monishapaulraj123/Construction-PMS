import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Pencil,
  TrendingUp,
  MapPin,
  Layers,
  DollarSign,
  Briefcase,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  UserCheck,
  Printer,
} from 'lucide-react'
import { generateBudgetPDFReport } from '../utils/pdfReportGenerator'
import Breadcrumb from '../components/Breadcrumb'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import HorizontalTimeline from '../components/HorizontalTimeline'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import { SecondaryButton, PrimaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import ProjectBudgetEditor from '../components/ProjectBudgetEditor'
import {
  constructionStages,
  siteUpdates,
  inspections,
  contracts,
  workRecords,
} from '../data/mockData'
import { formatCurrencyINR, formatDate, formatShortINR } from '../utils/format'
import { getDefaultProjectEstimation } from '../utils/budgetCalculations'
import { useApp } from '../context/AppContext'
import ServiceAssignmentModal from '../components/ServiceAssignmentModal'
import { useToast } from '../components/ToastContext'

const TABS = [
  'Overview',
  'Cost Estimation & Budget',
  'Services & Contracts',
  'Stages Timeline',
  'Work Tasks & Materials',
  'Financial Payments',
  'Site Updates & Quality',
]

export default function ProjectDetails() {
  const { id } = useParams()
  const { projects, services, payments, updateProjectBudget, addPayment } = useApp()
  const [tab, setTab] = useState('Overview')
  const [assignModalSrv, setAssignModalSrv] = useState(null)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState({})
  const showToast = useToast()

  const project = projects.find((p) => String(p.project_id) === id)

  if (!project) {
    return <EmptyState title="Project not found" description="This project may have been removed." />
  }

  // Budget estimation calculation
  const currentEstimation = project.budget_estimation || getDefaultProjectEstimation('standard')
  const [tempEstimation, setTempEstimation] = useState(currentEstimation)

  // Associated project payments
  const projectPayments = payments.filter(
    (p) => String(p.project_id) === String(project.project_id) || p.project_name === project.project_name
  )

  const actualExpense = projectPayments
    .filter((p) => p.payment_type === 'Expense')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const incomeReceived = projectPayments
    .filter((p) => p.payment_type === 'Income')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const estimatedBudget = currentEstimation.totalEstimatedBudget || project.estimated_budget || 0
  const expectedProjectValue = project.contract_value || Math.round(estimatedBudget * 1.15)
  const remainingBudget = estimatedBudget - actualExpense
  const isBudgetExceeded = actualExpense > estimatedBudget
  const exceededAmount = isBudgetExceeded ? actualExpense - estimatedBudget : 0
  const actualProfitLoss = incomeReceived - actualExpense
  const amountReceivable = Math.max(0, expectedProjectValue - incomeReceived)
  const budgetSpentPercentage = estimatedBudget > 0 ? Math.min(100, Math.round((actualExpense / estimatedBudget) * 100)) : 0

  const stagesList = constructionStages[project.construction_type_id] || constructionStages[1] || []
  const updates = siteUpdates.filter((u) => u.project === project.project_name || u.project_id === project.project_id)
  const projectInspections = inspections.filter((i) => i.project === project.project_name || i.project_id === project.project_id)
  const projectServices = services.filter((s) => s.project_id === project.project_id || s.project_name === project.project_name)
  const projectContracts = contracts.filter((c) => c.project_id === project.project_id || c.project_name === project.project_name)
  const projectWorkTasks = workRecords.filter((w) => w.project_id === project.project_id || w.project_name === project.project_name)

  function openEditBudget() {
    setTempEstimation(project.budget_estimation || getDefaultProjectEstimation('standard'))
    setBudgetModalOpen(true)
  }

  function handleSaveBudgetModal() {
    updateProjectBudget(project.project_id, tempEstimation)
    setBudgetModalOpen(false)
    showToast('Project budget estimation updated successfully')
  }

  function openRecordPayment(type = 'Expense') {
    setPaymentForm({
      payment_type: type,
      amount: 100000,
      party_name: type === 'Expense' ? 'Material / Labour Contractor' : project.client_name,
      payment_method: 'Bank Transfer (NEFT)',
      status: type === 'Expense' ? 'Paid' : 'Received',
      payment_date: new Date().toISOString().split('T')[0],
      description: `Project payment transaction for ${project.project_name}`,
    })
    setPaymentModalOpen(true)
  }

  function handleSavePayment(e) {
    e.preventDefault()
    addPayment({
      ...paymentForm,
      project_id: project.project_id,
      project_name: project.project_name,
    })
    setPaymentModalOpen(false)
    showToast(`Payment voucher (${paymentForm.payment_type}) recorded successfully`)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Projects', to: '/projects' }, { label: project.project_name }]} />

      <div className="detail-hero" style={{ backgroundImage: `url(${project.image})` }}>
        <div className="detail-hero-title">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600 }}>
              {project.construction_type_name}
            </span>
            {project.project_type_name && (
              <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600 }}>
                {project.project_type_name}
              </span>
            )}
          </div>
          <h1>{project.project_name}</h1>
          <p>{project.project_code} · {project.city}, {project.state || 'TN'}</p>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: 0 }}>
        <div />
        <div className="page-header-actions">
          <SecondaryButton icon={Calculator} onClick={openEditBudget}>
            Edit Budget Plan
          </SecondaryButton>
          <PrimaryButton icon={Plus} onClick={() => openRecordPayment('Expense')}>
            Record Expense
          </PrimaryButton>
        </div>
      </div>

      {/* Section 14: Project Details Summary Grid */}
      <div className="card detail-summary-grid" style={{ marginBottom: 16 }}>
        <div className="summary-item">
          <span>Client</span>
          <strong>{project.client_name}</strong>
        </div>
        <div className="summary-item">
          <span>Supervisor</span>
          <strong>{project.supervisor_name}</strong>
        </div>
        <div className="summary-item">
          <span>Current Stage</span>
          <strong>{project.construction_stage_name || 'Structural Work'}</strong>
        </div>
        <div className="summary-item">
          <span>Floors</span>
          <strong>{project.no_of_floors || 1} Floors</strong>
        </div>
        <div className="summary-item">
          <span>Estimated Budget</span>
          <strong style={{ color: 'var(--forest-900)' }}>{formatCurrencyINR(estimatedBudget)}</strong>
        </div>
        <div className="summary-item">
          <span>Start Date</span>
          <strong>{formatDate(project.start_date)}</strong>
        </div>
        <div className="summary-item">
          <span>Expected End</span>
          <strong>{formatDate(project.expected_end_date)}</strong>
        </div>
        <div className="summary-item">
          <span>Status</span>
          <StatusBadge status={project.project_status} />
        </div>
      </div>

      {/* Section 14: Budget & Financial Summary Cards Section */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--forest-950)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <DollarSign size={18} color="var(--forest-900)" /> Budget & Financial Summary
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {/* Estimated Budget Card */}
          <div className="card card-pad" style={{ background: '#fff', borderLeft: '4px solid var(--forest-900)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 600 }}>Estimated Budget</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--forest-900)', marginTop: 4 }}>
              {formatShortINR(estimatedBudget)}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>{formatCurrencyINR(estimatedBudget)}</span>
          </div>

          {/* Actual Expense Card */}
          <div className="card card-pad" style={{ background: '#fff', borderLeft: '4px solid var(--amber-600)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 600 }}>Actual Expense</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--amber-600)', marginTop: 4 }}>
              {formatShortINR(actualExpense)}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>{formatCurrencyINR(actualExpense)}</span>
          </div>

          {/* Income Received Card */}
          <div className="card card-pad" style={{ background: '#fff', borderLeft: '4px solid #15803d' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 600 }}>Income Received</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d', marginTop: 4 }}>
              {formatShortINR(incomeReceived)}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>{formatCurrencyINR(incomeReceived)}</span>
          </div>

          {/* Profit / Loss Card */}
          <div
            className="card card-pad"
            style={{
              background: '#fff',
              borderLeft: `4px solid ${actualProfitLoss >= 0 ? '#15803d' : '#b91c1c'}`,
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 600 }}>Profit / Loss</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: actualProfitLoss >= 0 ? '#15803d' : '#b91c1c', marginTop: 4 }}>
              {formatShortINR(actualProfitLoss)}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>Income - Expenses</span>
          </div>

          {/* Remaining Budget / Exceeded Card */}
          <div
            className="card card-pad"
            style={{
              background: isBudgetExceeded ? '#fef2f2' : '#fff',
              borderLeft: `4px solid ${isBudgetExceeded ? '#b91c1c' : 'var(--gold-600)'}`,
            }}
          >
            <span style={{ fontSize: '0.78rem', color: isBudgetExceeded ? '#b91c1c' : 'var(--ink-500)', fontWeight: 700 }}>
              {isBudgetExceeded ? '⚠️ Budget Exceeded' : 'Remaining Budget'}
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isBudgetExceeded ? '#b91c1c' : 'var(--forest-900)', marginTop: 4 }}>
              {isBudgetExceeded ? formatShortINR(exceededAmount) : formatShortINR(remainingBudget)}
            </div>
            <span style={{ fontSize: '0.72rem', color: isBudgetExceeded ? '#b91c1c' : 'var(--ink-500)' }}>
              {isBudgetExceeded ? `Exceeded by ${formatCurrencyINR(exceededAmount)}` : formatCurrencyINR(remainingBudget)}
            </span>
          </div>
        </div>
      </div>

      <div className="tabs-header">
        {TABS.map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB 1: Overview */}
      {tab === 'Overview' && (
        <div className="card card-pad stack-24">
          <div>
            <h3 style={{ marginBottom: 10 }}>Project Overview & Description</h3>
            <p className="text-muted" style={{ lineHeight: 1.7, maxWidth: '75ch' }}>
              {project.project_description || project.description || 'Turnkey residential and structural construction project.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line-100)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--forest-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="var(--forest-900)" /> Site Address & Location
              </h4>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 4 }}>{project.site_address || 'Site Location'}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-600)' }}>{project.city}, {project.state} - {project.pincode}</p>
            </div>

            <div style={{ padding: 16, background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line-100)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--forest-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={16} color="var(--forest-900)" /> Project Specifications
              </h4>
              <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>Construction Type: <strong>{project.construction_type_name}</strong></p>
              <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>Project Type: <strong>{project.project_type_name || 'Standard'}</strong></p>
              <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>Total Floors: <strong>{project.no_of_floors || 1} Floors</strong></p>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Overall Site Progress ({project.overall_progress_percentage}%)</h4>
            <ProgressBar value={project.overall_progress_percentage} showLabel tone="green" />
          </div>
        </div>
      )}

      {/* TAB 2: Cost Estimation & Budget */}
      {tab === 'Cost Estimation & Budget' && (
        <div className="stack-20">
          {/* Financial Variance Header Banner */}
          <div className="card card-pad" style={{ background: isBudgetExceeded ? '#fff1f0' : 'var(--cream-050)', border: `1px solid ${isBudgetExceeded ? 'var(--red-500)' : 'var(--line-200)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-950)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calculator size={20} color="var(--forest-900)" /> Project Budget vs Financial Actuals
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-600)', margin: '4px 0 0' }}>
                  Real-time comparison between estimated budget scope, actual expenses, collected income, and profit variance.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <SecondaryButton icon={Plus} onClick={() => openRecordPayment('Income')}>
                  + Record Income
                </SecondaryButton>
                <PrimaryButton icon={Plus} onClick={() => openRecordPayment('Expense')}>
                  + Record Expense
                </PrimaryButton>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 16 }}>
              <div style={{ padding: 12, background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-100)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 600 }}>Planned Estimated Budget</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-900)', marginTop: 2 }}>
                  {formatCurrencyINR(estimatedBudget)}
                </div>
              </div>

              <div style={{ padding: 12, background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-100)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 600 }}>Actual Money Spent (Expense)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--amber-600)', marginTop: 2 }}>
                  {formatCurrencyINR(actualExpense)}
                </div>
              </div>

              <div style={{ padding: 12, background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-100)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 600 }}>
                  {isBudgetExceeded ? 'Budget Variance (Overrun)' : 'Remaining Available Budget'}
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isBudgetExceeded ? '#b91c1c' : 'var(--forest-900)', marginTop: 2 }}>
                  {isBudgetExceeded ? `+ ${formatCurrencyINR(exceededAmount)}` : formatCurrencyINR(remainingBudget)}
                </div>
              </div>

              <div style={{ padding: 12, background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-100)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 600 }}>Current Financial Profit / Loss</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: actualProfitLoss >= 0 ? '#15803d' : '#b91c1c', marginTop: 2 }}>
                  {formatCurrencyINR(actualProfitLoss)}
                </div>
              </div>
            </div>

            {isBudgetExceeded && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: '#fee2e2', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5', color: '#991b1b', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 600 }}>
                <AlertTriangle size={18} />
                <span>
                  <strong>BUDGET EXCEEDED ALERT:</strong> Actual project expenses ({formatCurrencyINR(actualExpense)}) exceed the estimated budget ({formatCurrencyINR(estimatedBudget)}) by <strong>{formatCurrencyINR(exceededAmount)}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Full Interactive Scope & Cost Estimation Breakdown */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink-900)' }}>
                  Detailed Construction Scope & Cost Estimation
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-500)', margin: 0 }}>
                  Category-wise breakdown of material, labour, service, and optional add-ons.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <SecondaryButton icon={Printer} onClick={() => generateBudgetPDFReport(project, currentEstimation)}>
                  Generate PDF Report
                </SecondaryButton>
                <SecondaryButton icon={Pencil} onClick={openEditBudget}>
                  Modify Scope & Costs
                </SecondaryButton>
              </div>
            </div>

            <ProjectBudgetEditor
              initialEstimation={currentEstimation}
              onChange={(updated) => updateProjectBudget(project.project_id, updated)}
            />
          </div>
        </div>
      )}

      {/* TAB 3: Services & Contracts */}
      {tab === 'Services & Contracts' && (
        <div className="card card-pad stack-24">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={18} color="var(--forest-900)" /> Project Services & Service Person Assignments
            </h3>
            {projectServices.length === 0 ? (
              <div style={{ padding: 14, background: 'var(--paper)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--line-200)', fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                No services linked directly to this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {projectServices.map((srv) => (
                  <div
                    key={srv.service_id}
                    style={{
                      padding: 16,
                      border: '1px solid var(--line-200)',
                      borderRadius: 'var(--radius-md)',
                      background: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink-900)' }}>
                          {srv.service_name} ({srv.service_code})
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginTop: 2 }}>{srv.description}</div>
                      </div>
                      <StatusBadge status={srv.status ? 'Active' : 'Inactive'} />
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 12,
                        background: 'var(--cream-50)',
                        padding: 12,
                        borderRadius: 6,
                        fontSize: '0.82rem',
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--ink-500)' }}>Assigned Person:</span>
                        <div style={{ fontWeight: 700, color: srv.assigned_person_name ? 'var(--forest-900)' : 'var(--coral-500)' }}>
                          {srv.assigned_person_name || 'Unassigned'}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--ink-500)' }}>Base Rate:</span>
                        <div style={{ fontWeight: 600 }}>{formatCurrencyINR(srv.base_rate)} / {srv.unit_of_measure}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--ink-500)' }}>Schedule:</span>
                        <div style={{ fontWeight: 600 }}>{srv.start_date ? formatDate(srv.start_date) : 'TBD'}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--ink-500)' }}>Service Progress:</span>
                        <ProgressBar value={srv.progress || 45} showLabel tone="gold" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <SecondaryButton
                        style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        icon={TrendingUp}
                        onClick={() => showToast(`Progress updated for ${srv.service_name}`)}
                      >
                        Update Progress
                      </SecondaryButton>
                      <PrimaryButton
                        style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        icon={UserCheck}
                        onClick={() => setAssignModalSrv(srv)}
                      >
                        {srv.assigned_person_name ? 'Change Assignee' : 'Assign Service Person'}
                      </PrimaryButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Stages Timeline */}
      {tab === 'Stages Timeline' && (
        <div className="card card-pad">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Construction Stages</h3>
          <HorizontalTimeline stages={stagesList} />
        </div>
      )}

      {/* TAB 5: Financial Payments */}
      {tab === 'Financial Payments' && (
        <div className="card card-pad stack-20">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Project Financial Vouchers</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>
                Recorded Income Received & Actual Expenses Paid for this project.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <SecondaryButton icon={Plus} onClick={() => openRecordPayment('Income')}>
                + Record Income
              </SecondaryButton>
              <PrimaryButton icon={Plus} onClick={() => openRecordPayment('Expense')}>
                + Record Expense
              </PrimaryButton>
            </div>
          </div>

          <DataTable
            columns={[
              { key: 'payment_number', label: 'Voucher No.' },
              {
                key: 'payment_type',
                label: 'Type',
                render: (r) => (
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 12,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: r.payment_type === 'Income' ? '#dcfce7' : '#fee2e2',
                      color: r.payment_type === 'Income' ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {r.payment_type}
                  </span>
                ),
              },
              { key: 'party_name', label: 'Party / Vendor / Client' },
              {
                key: 'amount',
                label: 'Amount',
                render: (r) => (
                  <strong style={{ color: r.payment_type === 'Income' ? '#15803d' : 'var(--ink-900)' }}>
                    {formatCurrencyINR(r.amount)}
                  </strong>
                ),
              },
              { key: 'payment_date', label: 'Date', render: (r) => formatDate(r.payment_date) },
              { key: 'payment_method', label: 'Method' },
              { key: 'reference_number', label: 'Ref / Cheque' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'Received' || r.status === 'Paid' ? 'Active' : 'Pending'} /> },
            ]}
            rows={projectPayments}
            keyField="payment_id"
          />
        </div>
      )}

      {/* Edit Budget Modal */}
      <Modal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        title="Edit Project Cost Estimation & Scope"
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setBudgetModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSaveBudgetModal}>Save Budget Estimation</PrimaryButton>
          </>
        }
      >
        <ProjectBudgetEditor
          initialEstimation={tempEstimation}
          onChange={(updated) => setTempEstimation(updated)}
        />
      </Modal>

      {/* Record Payment Voucher Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record ${paymentForm.payment_type || 'Expense'} Voucher`}
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setPaymentModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSavePayment}>Save Voucher</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSavePayment}>
          <FormInput
            label="Voucher Number"
            required
            value={paymentForm.payment_number || `PAY-2026-${Math.floor(Math.random() * 900 + 100)}`}
            onChange={(e) => setPaymentForm({ ...paymentForm, payment_number: e.target.value })}
          />
          <SelectInput
            label="Voucher Type"
            required
            options={['Expense', 'Income']}
            value={paymentForm.payment_type || 'Expense'}
            onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
          />
          <FormInput
            label="Party / Vendor / Client Name"
            required
            value={paymentForm.party_name || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, party_name: e.target.value })}
          />
          <FormInput
            label="Amount (₹)"
            type="number"
            required
            value={paymentForm.amount || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
          />
          <DateInput
            label="Payment Date"
            value={paymentForm.payment_date || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
          />
          <SelectInput
            label="Payment Method"
            options={['Bank Transfer (NEFT)', 'RTGS', 'Cheque', 'UPI / IMPS', 'Cash']}
            value={paymentForm.payment_method || 'Bank Transfer (NEFT)'}
            onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
          />
          <FormInput
            label="Reference / Cheque No."
            value={paymentForm.reference_number || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
          />
          <FormInput
            label="Description"
            type="textarea"
            full
            value={paymentForm.description || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* Service Assignment Modal */}
      {assignModalSrv && (
        <ServiceAssignmentModal
          open={Boolean(assignModalSrv)}
          onClose={() => setAssignModalSrv(null)}
          service={assignModalSrv}
          project={project}
        />
      )}
    </div>
  )
}
