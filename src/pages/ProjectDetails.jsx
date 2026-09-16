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
  UserCheck,
  Eye,
} from 'lucide-react'
import Breadcrumb from '../components/Breadcrumb'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import HorizontalTimeline from '../components/HorizontalTimeline'
import EmptyState from '../components/EmptyState'
import { SecondaryButton, PrimaryButton } from '../components/Buttons'
import {
  constructionStages,
  siteUpdates,
  inspections,
  contracts,
  workRecords,
  payments,
  materials,
} from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useApp } from '../context/AppContext'
import ServiceAssignmentModal from '../components/ServiceAssignmentModal'
import { useToast } from '../components/ToastContext'

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
  const { projects, services } = useApp()
  const [tab, setTab] = useState('Overview')
  const [assignModalSrv, setAssignModalSrv] = useState(null)
  const showToast = useToast()

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
          <span>Status</span>
          <StatusBadge status={project.project_status} />
        </div>
      </div>

      <div className="tabs-header">
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

                    {/* Actions */}
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

      {tab === 'Stages Timeline' && (
        <div className="card card-pad">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Construction Stages</h3>
          <HorizontalTimeline stages={stagesList} />
        </div>
      )}

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
