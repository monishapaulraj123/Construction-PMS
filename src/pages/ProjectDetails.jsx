import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, TrendingUp, MoreHorizontal } from 'lucide-react'
import Breadcrumb from '../components/Breadcrumb'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import Timeline from '../components/Timeline'
import EmptyState from '../components/EmptyState'
import { SecondaryButton, PrimaryButton } from '../components/Buttons'
import { projects, projectStages, siteUpdates, inspections } from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'

const TABS = ['Overview', 'Stages', 'Tasks', 'Materials', 'Progress', 'Site Updates', 'Inspections', 'Documents']

export default function ProjectDetails() {
  const { id } = useParams()
  const [tab, setTab] = useState('Overview')
  const project = projects.find((p) => String(p.project_id) === id)

  if (!project) {
    return <EmptyState title="Project not found" description="This project may have been removed." />
  }

  const stages = projectStages[project.project_id] || projectStages[1]
  const updates = siteUpdates.filter((u) => u.project === project.project_name)
  const projectInspections = inspections.filter((i) => i.project === project.project_name)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Projects', to: '/projects' }, { label: project.project_name }]} />

      <div className="detail-hero" style={{ backgroundImage: `url(${project.image})` }}>
        <div className="detail-hero-title">
          <h1>{project.project_name}</h1>
          <p>{project.project_code} · {project.construction_type_name}</p>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: 0 }}>
        <div />
        <div className="page-header-actions">
          <SecondaryButton icon={Pencil}>Edit</SecondaryButton>
          <PrimaryButton icon={TrendingUp}>Update Progress</PrimaryButton>
          <SecondaryButton icon={MoreHorizontal}>More</SecondaryButton>
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
          <span>Location</span>
          <strong>{project.city}</strong>
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
          <span>Overall Progress</span>
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
        <div className="card card-pad">
          <h3 style={{ marginBottom: 12 }}>Project Description</h3>
          <p className="text-muted" style={{ lineHeight: 1.7, maxWidth: '70ch' }}>
            {project.description}
          </p>
          <div className="mt-24">
            <StatusBadge status={project.project_status} />
          </div>
        </div>
      )}

      {tab === 'Stages' && (
        <div className="card card-pad">
          <Timeline stages={stages} />
        </div>
      )}

      {tab === 'Tasks' && (
        <div className="card card-pad">
          <div className="chip-list">
            {['Column Work', 'Beam Work', 'Slab Work', 'Formwork Removal'].map((task) => (
              <span className="chip" key={task}>
                {task}
              </span>
            ))}
          </div>
        </div>
      )}

      {tab === 'Materials' && (
        <div className="card card-pad">
          <div className="chip-list">
            {['Cement', 'Steel', 'Sand', 'Aggregate'].map((mat) => (
              <span className="chip" key={mat}>
                {mat}
              </span>
            ))}
          </div>
        </div>
      )}

      {tab === 'Progress' && (
        <div className="card card-pad">
          <ProgressBar value={project.overall_progress_percentage} showLabel tone="green" />
          <p className="text-muted mt-24" style={{ fontSize: '0.85rem' }}>
            Latest Supervisor Update: "Structural work completed up to {stages.find((s) => s.status === 'current')?.progress || project.overall_progress_percentage}%."
          </p>
          <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 6 }}>
            Last Updated: Today, 04:35 PM
          </p>
        </div>
      )}

      {tab === 'Site Updates' && (
        <div className="photo-grid">
          {updates.length === 0 && <EmptyState title="No site updates yet" description="Photos uploaded by supervisors will appear here." />}
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

      {tab === 'Inspections' && (
        <div className="card card-pad">
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
      )}

      {tab === 'Documents' && (
        <EmptyState title="No documents uploaded" description="Contracts, drawings and approvals for this project will appear here." />
      )}
    </div>
  )
}
