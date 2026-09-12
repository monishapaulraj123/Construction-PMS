import * as Icons from 'lucide-react'
import { reportTypes, monthlyProgress } from '../data/mockData'

export default function Reports() {
  const max = Math.max(...monthlyProgress.map((m) => m.value))

  return (
    <div>
      <div className="report-grid">
        {reportTypes.map((r) => {
          const Icon = Icons[r.icon] || Icons.FileText
          return (
            <button key={r.id} className="card report-tile" style={{ textAlign: 'left', border: '1px solid var(--line-100)' }}>
              <div className="report-tile-icon">
                <Icon size={20} />
              </div>
              <div>
                <h4>{r.name}</h4>
                <p>{r.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="card card-pad">
        <div className="section-head">
          <div>
            <h3>Overall Progress Trend</h3>
            <p className="section-desc">Average progress percentage across all active projects, by month</p>
          </div>
        </div>
        <div className="bar-chart">
          {monthlyProgress.map((m) => (
            <div className="bar-chart-col" key={m.month}>
              <div className="bar-chart-bar" style={{ height: `${(m.value / max) * 100}%` }} />
              <span className="bar-chart-label">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
