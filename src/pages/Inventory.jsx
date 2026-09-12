import StatusBadge from '../components/StatusBadge'
import { inventory } from '../data/mockData'

export default function Inventory() {
  return (
    <div>
      <div className="card-grid">
        {inventory.map((inv) => {
          const pct = Math.min(100, Math.round((inv.stock / (inv.min_level * 2)) * 100))
          return (
            <div className="entity-card" key={inv.id}>
              <div className="flex-between">
                <h3 style={{ fontSize: '0.95rem' }}>{inv.item}</h3>
                <StatusBadge status={inv.status} />
              </div>
              <p className="entity-meta">{inv.category}</p>
              <div className="mt-24">
                <div className="progress-row">
                  <span>Current Stock</span>
                  <strong>{inv.stock} {inv.unit}</strong>
                </div>
                <div className="stock-bar-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: inv.status === 'Low' ? 'linear-gradient(90deg, var(--red-600), var(--red-500))' : undefined,
                    }}
                  />
                </div>
                <p className="text-muted" style={{ fontSize: '0.74rem', marginTop: 8 }}>
                  Minimum stock level: {inv.min_level} {inv.unit}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
