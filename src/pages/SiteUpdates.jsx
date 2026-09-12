import { Camera } from 'lucide-react'
import { PrimaryButton } from '../components/Buttons'
import { siteUpdates } from '../data/mockData'

export default function SiteUpdates() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h3>Site Photos</h3>
          <p className="section-desc">Latest photo updates uploaded by supervisors from active sites</p>
        </div>
        <PrimaryButton icon={Camera}>Upload Update</PrimaryButton>
      </div>

      <div className="photo-grid">
        {siteUpdates.map((u) => (
          <div className="photo-card" key={u.id}>
            <div className="photo-card-img" style={{ backgroundImage: `url(${u.image})` }} />
            <div className="photo-card-body">
              <div className="photo-card-title">{u.project}</div>
              <div className="photo-card-meta">
                <span>{u.stage}</span>
                <span>{u.task}</span>
                <span>{u.location}</span>
              </div>
              <div className="photo-card-caption">{u.caption}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: 8 }}>
                Uploaded by {u.uploaded_by} · {u.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
