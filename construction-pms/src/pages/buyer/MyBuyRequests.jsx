import { useState, useMemo } from 'react'
import { Tag, CheckCircle2, Clock, Scale, CreditCard } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import HorizontalTimeline from '../../components/HorizontalTimeline'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

const STAGES = [
  'Submitted',
  'Under Review',
  'Verification',
  'Negotiation',
  'Approved',
  'Transaction Processing',
  'Completed',
]

export default function MyBuyRequests() {
  const { buyRequests, currentUser } = useApp()
  const [search, setSearch] = useState('')

  const myRequests = useMemo(() => {
    return buyRequests.filter(
      (r) =>
        (r.buyer_email === currentUser.email || r.buyer_name.includes('Ravi')) &&
        (!search || r.property_name.toLowerCase().includes(search.toLowerCase()))
    )
  }, [buyRequests, currentUser, search])

  const getStageIndex = (status) => {
    const idx = STAGES.findIndex((s) => s.toLowerCase() === (status || '').toLowerCase())
    return idx >= 0 ? idx : 1
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search my buy requests..." value={search} onChange={setSearch} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {myRequests.map((r) => {
          const activeIndex = getStageIndex(r.status)
          const timelineStages = STAGES.map((s, idx) => ({
            name: s,
            status: idx < activeIndex ? 'completed' : idx === activeIndex ? 'current' : 'upcoming',
          }))

          return (
            <div key={r.request_id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-gold)' }}>
                    {r.request_code} · Submitted on {formatDate(r.submitted_date)}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 4px 0' }}>
                    {r.property_name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-600)' }}>
                    Offered Budget: <strong>{formatCurrencyINR(r.budget)}</strong>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {/* Status Progression Horizontal Bar */}
              <div style={{ background: 'var(--cream-50)', padding: '16px 12px', borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-500)', marginBottom: 10 }}>
                  Status Progression Tracker
                </div>
                <HorizontalTimeline stages={timelineStages} />
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>
                Current Stage: <strong style={{ color: 'var(--ink-900)' }}>{r.current_stage || r.status}</strong>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
