import * as Icons from 'lucide-react'

export default function ActivityFeed({ items }) {
  return (
    <div className="timeline activity-feed">
      {items.map((item) => {
        const Icon = Icons[item.icon] || Icons.Activity
        return (
          <div className="timeline-item" key={item.id}>
            <div className="timeline-marker">
              <Icon size={16} />
            </div>
            <div className="timeline-content" style={{ flex: 1 }}>
              <div className="activity-row">
                <div>
                  <h4>{item.text}</h4>
                  <p>{item.project}</p>
                </div>
                <span className="activity-time">{item.time}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
