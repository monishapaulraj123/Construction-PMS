import { Bell, CheckCircle2, Clock, Scale } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ClientNotifications() {
  const { currentUser } = useApp()

  const notifications = [
    {
      id: 1,
      title: 'Title Deed Verification Approved',
      time: '2 hours ago',
      text: `Your property submission survey plot has passed EC legal title verification by Admin.`,
      icon: CheckCircle2,
      color: '#16a34a',
    },
    {
      id: 2,
      title: 'Counter Offer Received',
      time: '1 day ago',
      text: `Admin updated negotiation terms for ECR Sea Breeze Coastal Plot buy enquiry.`,
      icon: Scale,
      color: 'var(--brand-gold)',
    },
    {
      id: 3,
      title: 'Site Visit Schedule Confirmed',
      time: '3 days ago',
      text: `Property site visit coordinated for Avinashi Highway Commercial Land.`,
      icon: Clock,
      color: '#2563eb',
    },
  ]

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Notifications</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Updates on plot title verifications, purchase counter-offers, and transaction progress.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.map((n) => {
          const Icon = n.icon
          return (
            <div key={n.id} className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ padding: 10, borderRadius: 8, background: 'var(--cream-100)', color: n.color }}>
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-400)' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-600)', marginTop: 4, margin: '4px 0 0 0' }}>{n.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
