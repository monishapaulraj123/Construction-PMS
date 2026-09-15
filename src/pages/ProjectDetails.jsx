import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Pencil,
  TrendingUp,
  MapPin,
  Layers,
  DollarSign,
  Briefcase,
  FileText,
  CheckSquare,
  Receipt,
  Camera,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import Breadcrumb from '../components/Breadcrumb'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import HorizontalTimeline from '../components/HorizontalTimeline'
import EmptyState from '../components/EmptyState'
import { SecondaryButton, PrimaryButton } from '../components/Buttons'
import {
  projects,
  constructionStages,
  siteUpdates,
  inspections,
  services,
  contracts,
  workRecords,
  payments,
  materials,
} from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'

const TABS = [
  'Overview',
  'Services & Contracts',
  'Stages Timeline',
  'Work Tasks & Materials',
  'Financial Payments',
  'Site Updates & Quality',
]

export default function ProjectDetails() {
  const { id } = useParams()
  const [tab, setTab] = useState('Overview')
  const project = projects.find((p) => String(p.project_id) === id)

  if (!project) {
    return <EmptyState title="Project not found" description="This project may have been removed." />
  }

  const stagesList = constructionStages[project.construction_type_id] || constructionStages[1] || []
  const updates = siteUpdates.filter((u) => u.project === project.project_name || u.project_id === project.project_id)
  const projectInspections = inspections.filter((i) => i.project === project.project_name || i.project_id === project.project_id)
  const projectServices = services.filter((s) => s.project_id === project.project_id || s.project_name === project.project_name)
  const projectContracts = contracts.filter((c) => c.project_id === project.project_id || c.project_name === project.project_name)
  const projectWorkTasks = workRecords.filter((w) => w.project_id === project.project_id || w.project_name === project.project_name)
  const projectPayments = payments.filter((p) => p.project_id === project.project_id || p.project_name === project.project_name)

  const totalIncome = projectPayments.filter((p) => p.payment_type === 'Income').reduce((sum, p) => sum + p.amount, 0)
  const totalExpense = projectPayments.filter((p) => p.payment_type === 'Expense').reduce((sum, p) => sum + p.amount, 0)

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
          <SecondaryButton icon={Pencil}>Edit Project</SecondaryButton>
          <PrimaryButton icon={TrendingUp}>Update Progress</PrimaryButton>
        </div>
      </div>

      <div className="card detail-summary-grid">
        <div className="summary-item">
          <span>Client (client_id)</span>
          <strong>{project.client_name}</strong>
        </div>
        <div className="summary-item">
          <span>Supervisor (employee_id)</span>
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
          <span>Budget</span>
          <strong>{formatCurrencyINR(project.estimated_budget)}</strong>
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
          <span>Progress</span>
          <strong>{project.overall_progress_percentage}%</strong>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

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
              {project.latitude && project.longitude && (
                <a
                  href={`https://maps.google.com/?q=${project.latitude},${project.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: '0.78rem', color: 'var(--forest-900)', fontWeight: 600 }}
                >
                  GPS Coordinates: {project.latitude}, {project.longitude} <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div style={{ padding: 16, background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line-100)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--forest-900)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={16} color="var(--forest-900)" /> Project Specifications
              </h4>
              <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>Construction Type: <strong>{project.construction_type_name}</strong></p>
              <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>Project Type: <strong>{project.project_type_name || 'Standard'}</strong></p>
              <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>Total Floors: <strong>{project.no_of_floors || 1} Floors</strong></p>
              <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>Current Stage: <strong>{project.construction_stage_name || 'Structural Work'}</strong></p>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Overall Site Progress ({project.overall_progress_percentage}%)</h4>
            <ProgressBar value={project.overall_progress_percentage} showLabel tone="green" />
          </div>
        </div>
      )}

      {tab === 'Services & Contracts' && (
        <div className="card card-pad stack-24">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={18} color="var(--forest-900)" /> Active Contracts
            </h3>
            {projectContracts.length === 0 ? (
              <div style={{ padding: 14, background: 'var(--paper)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--line-200)', fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                No active contracts recorded for this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projectContracts.map((c) => (
                  <div key={c.contract_id} style={{ padding: 14, border: '1px solid var(--line-200)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--forest-900)' }}>{c.contract_code} — {c.contract_type}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--ink-600)', marginTop: 4 }}>
                        Party: <strong>{c.party_name}</strong> | Billing: {c.billing_type}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--forest-900)' }}>{formatCurrencyINR(c.contract_amount)}</div>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={18} color="var(--forest-900)" /> Associated Services
            </h3>
            {projectServices.length === 0 ? (
              <div style={{ padding: 14, background: 'var(--paper)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--line-200)', fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                No services linked directly to this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projectServices.map((srv) => (
                  <div key={srv.service_id} style={{ padding: 14, border: '1px solid var(--line-200)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--forest-900)' }}>{srv.service_name}</strong> ({srv.service_code})
                      <div style={{ fontSize: '0.82rem', color: 'var(--ink-600)', marginTop: 2 }}>{srv.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--forest-900)' }}>{formatCurrencyINR(srv.base_rate)} / {srv.unit_of_measure}</div>
                      <StatusBadge status={srv.status ? 'Active' : 'Inactive'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Stages Timeline' && (
        <div className="card card-pad">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>14-Stage Master Horizontal Timeline</h3>
          <HorizontalTimeline stages={stagesList} />
        </div>
      )}

      {tab === 'Work Tasks & Materials' && (
        <div className="card card-pad stack-24">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckSquare size={18} color="var(--forest-900)" /> Site Work Tasks
            </h3>
            {projectWorkTasks.length === 0 ? (
              <div style={{ padding: 14, background: 'var(--paper)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--line-200)', fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                No specific work tasks logged for this project yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projectWorkTasks.map((w) => (
                  <div key={w.work_id} style={{ padding: 14, border: '1px solid var(--line-200)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--forest-900)' }}>{w.task_name}</strong> ({w.service_name})
                      <div style={{ fontSize: '0.82rem', color: 'var(--ink-600)', marginTop: 4 }}>
                        Assigned To: <strong>{w.employee_name}</strong> | Qty: {w.quantity_completed} units
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--forest-900)' }}>{formatCurrencyINR(w.total_cost)}</div>
                      <StatusBadge status={w.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Materials Allocated to Site</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {materials.slice(0, 4).map((m) => (
                <div key={m.material_id} style={{ padding: 12, background: 'var(--cream-100)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-100)' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--forest-900)' }}>{m.material_name}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-600)', marginTop: 4 }}>
                    Stock: {m.current_stock || 120} {m.unit_of_measure} | Price: {formatCurrencyINR(m.unit_price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Financial Payments' && (
        <div className="card card-pad stack-24">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--paper)', border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>Total Project Income</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: 4 }}>{formatCurrencyINR(totalIncome)}</div>
            </div>
            <div style={{ padding: 16, background: 'var(--paper)', border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>Total Project Expense</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginTop: 4 }}>{formatCurrencyINR(totalExpense)}</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Receipt size={18} color="var(--forest-900)" /> Payment Transactions
            </h3>
            {projectPayments.length === 0 ? (
              <div style={{ padding: 14, background: 'var(--paper)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--line-200)', fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                No payment transactions recorded for this project yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projectPayments.map((p) => (
                  <div key={p.payment_id} style={{ padding: 14, border: '1px solid var(--line-200)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--forest-900)' }}>{p.payment_code}</strong> ({p.payment_type})
                      <div style={{ fontSize: '0.82rem', color: 'var(--ink-600)', marginTop: 2 }}>
                        Party: {p.party_name} | Mode: {p.payment_mode} | Ref: {p.reference_no}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: p.payment_type === 'Income' ? '#16a34a' : '#dc2626' }}>
                        {p.payment_type === 'Income' ? '+' : '-'}{formatCurrencyINR(p.amount)}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>{formatDate(p.payment_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Site Updates & Quality' && (
        <div className="card card-pad stack-24">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Camera size={18} color="var(--forest-900)" /> Supervisor Site Updates
            </h3>
            {updates.length === 0 ? (
              <EmptyState title="No site updates yet" description="Photos uploaded by supervisors will appear here." />
            ) : (
              <div className="photo-grid">
                {updates.map((u) => (
                  <div className="photo-card" key={u.id}>
                    <div className="photo-card-img" style={{ backgroundImage: `url(${u.image})` }} />
                    <div className="photo-card-body">
                      <div className="photo-card-title">{u.task}</div>
                      <div className="photo-card-meta">
                        <span>{u.stage}</span>
                        <span>{u.time}</span>
                      </div>
                      <div className="photo-card-caption">{u.caption}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={18} color="var(--forest-900)" /> Quality Control Inspections
            </h3>
            {projectInspections.length === 0 ? (
              <EmptyState title="No inspections recorded" description="Quality checks for this project will appear here." />
            ) : (
              <div className="stack-16">
                {projectInspections.map((insp) => (
                  <div className="flex-between" key={insp.id} style={{ borderBottom: '1px solid var(--line-100)', paddingBottom: 14 }}>
                    <div>
                      <div className="cell-primary">{insp.stage}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{insp.inspection_type} · {formatDate(insp.date)}</div>
                    </div>
                    <StatusBadge status={insp.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

