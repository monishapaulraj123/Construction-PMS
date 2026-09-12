import { CalendarClock, Users2, Wallet } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import EmptyState from '../components/EmptyState'
import { projects } from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'

export default function ProjectPlanning() {
  const planningProjects = projects.filter((p) => p.project_status === 'Planning' || p.overall_progress_percentage < 15)

  return (
    <div>
      <div className="section-head">
        <div>
          <h3>Projects in Planning</h3>
          <p className="section-desc">Set schedules, budgets and resourcing before construction kicks off</p>
        </div>
      </div>

      {planningProjects.length === 0 ? (
        <EmptyState title="No projects in planning" description="Newly created projects awaiting kickoff will appear here." />
      ) : (
        <div className="stack-16">
          {planningProjects.map((p) => (
            <div className="card card-pad" key={p.project_id}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div>
                  <div className="cell-primary" style={{ fontSize: '1rem' }}>{p.project_name}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{p.project_code} · {p.construction_type_name}</div>
                </div>
                <StatusBadge status={p.project_status} />
              </div>
              <div className="mini-stat-row" style={{ marginBottom: 16 }}>
                <div className="flex-between" style={{ gap: 10 }}>
                  <div className="mini-stat-icon" style={{ background: 'var(--gold-050)', color: 'var(--gold-600)' }}>
                    <Wallet size={17} />
                  </div>
                  <div>
                    <div className="cell-primary" style={{ fontSize: '0.9rem' }}>{formatCurrencyINR(p.estimated_budget)}</div>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Estimated Budget</span>
                  </div>
                </div>
                <div className="flex-between" style={{ gap: 10 }}>
                  <div className="mini-stat-icon" style={{ background: 'var(--cream-100)', color: 'var(--forest-700)' }}>
                    <CalendarClock size={17} />
                  </div>
                  <div>
                    <div className="cell-primary" style={{ fontSize: '0.9rem' }}>{formatDate(p.start_date)}</div>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Planned Start</span>
                  </div>
                </div>
                <div className="flex-between" style={{ gap: 10 }}>
                  <div className="mini-stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
                    <Users2 size={17} />
                  </div>
                  <div>
                    <div className="cell-primary" style={{ fontSize: '0.9rem' }}>{p.supervisor_name}</div>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>Assigned Supervisor</span>
                  </div>
                </div>
              </div>
              <ProgressBar value={p.overall_progress_percentage} showLabel />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
