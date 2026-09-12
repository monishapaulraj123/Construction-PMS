import ProgressBar from '../components/ProgressBar'
import { progressUpdates } from '../data/mockData'

export default function ProgressUpdates() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h3>Today's Progress</h3>
          <p className="section-desc">Live feed of progress reported from every active site</p>
        </div>
      </div>

      <div className="stack-16">
        {progressUpdates.map((u) => (
          <div className="card card-pad" key={u.id}>
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <div>
                <div className="cell-primary" style={{ fontSize: '0.95rem' }}>{u.project}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Current Stage: {u.stage}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cell-primary" style={{ color: 'var(--green-700)' }}>{u.today}</div>
                <div className="text-muted" style={{ fontSize: '0.74rem' }}>{u.time}</div>
              </div>
            </div>
            <ProgressBar value={u.progress} showLabel />
            <p className="text-muted" style={{ fontSize: '0.83rem', marginTop: 14 }}>{u.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
