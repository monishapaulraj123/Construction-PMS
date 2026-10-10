import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CalendarClock, Users2, Wallet, Home, ArrowRight, Layers, FolderKanban } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import EmptyState from '../components/EmptyState'
import SearchBar from '../components/SearchBar'
import { SecondaryButton, PrimaryButton } from '../components/Buttons'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useApp } from '../context/AppContext'

export default function ProjectPlanning() {
  const navigate = useNavigate()
  const { projects } = useApp()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const planningProjects = useMemo(() => {
    return (projects || []).filter((p) => {
      const matchSearch =
        !search ||
        p.project_name.toLowerCase().includes(search.toLowerCase()) ||
        p.project_code.toLowerCase().includes(search.toLowerCase()) ||
        (p.city || '').toLowerCase().includes(search.toLowerCase())

      const matchStatus = !statusFilter || p.project_status === statusFilter
      return matchSearch && matchStatus
    })
  }, [projects, search, statusFilter])

  return (
    <div className="animate-fade-slide">
      <div className="section-head">
        <div>
          <h3>Project Planning & House Design</h3>
          <p className="section-desc">Set schedules, budgets, resourcing, and 2D/3D house plans before construction kicks off</p>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <SearchBar
          placeholder="Search planning projects by name, code or city..."
          value={search}
          onChange={setSearch}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Project Statuses</option>
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="Site Preparation">Site Preparation</option>
          <option value="Near Completion">Near Completion</option>
        </select>
      </div>

      {planningProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try adjusting your search or filter parameters."
        />
      ) : (
        <div className="stack-16">
          {planningProjects.map((p) => (
            <div className="card card-pad" key={p.project_id}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div>
                  <div className="cell-primary" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                    {p.project_name}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {p.project_code} · {p.construction_type_name} {p.project_type_name ? `(${p.project_type_name})` : ''}
                  </div>
                </div>
                <StatusBadge status={p.project_status} />
              </div>

              <div className="mini-stat-row" style={{ marginBottom: 16 }}>
                <div className="flex-between" style={{ gap: 10 }}>
                  <div className="mini-stat-icon" style={{ background: 'var(--gold-050)', color: 'var(--gold-600)' }}>
                    <Wallet size={17} />
                  </div>
                  <div>
                    <div className="cell-primary" style={{ fontSize: '0.9rem' }}>
                      {formatCurrencyINR(p.estimated_budget)}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Estimated Budget</span>
                  </div>
                </div>

                <div className="flex-between" style={{ gap: 10 }}>
                  <div className="mini-stat-icon" style={{ background: 'var(--cream-100)', color: 'var(--forest-700)' }}>
                    <CalendarClock size={17} />
                  </div>
                  <div>
                    <div className="cell-primary" style={{ fontSize: '0.9rem' }}>
                      {formatDate(p.start_date)}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Planned Start</span>
                  </div>
                </div>

                <div className="flex-between" style={{ gap: 10 }}>
                  <div className="mini-stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
                    <Users2 size={17} />
                  </div>
                  <div>
                    <div className="cell-primary" style={{ fontSize: '0.9rem' }}>
                      {p.supervisor_name || 'Unassigned'}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Assigned Supervisor</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <ProgressBar value={p.overall_progress_percentage} showLabel />
              </div>

              {/* Action Buttons: View Details + House Planning */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <SecondaryButton
                  icon={FolderKanban}
                  onClick={() => navigate(`/projects/${p.project_id}`)}
                >
                  View Project Details
                </SecondaryButton>
                <PrimaryButton
                  icon={Home}
                  onClick={() => navigate(`/projects/${p.project_id}/house-plan`)}
                >
                  House Planning
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
