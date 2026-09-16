import { Bell, CheckCircle2, Scale, Tag } from 'lucide-react'

export default function BuyerNotifications() {
  const notifs = [
    { title: 'Counter Offer Received', text: 'Seller offered ₹1.98 Cr final closing price on ECR Sea Breeze Coastal Plot.', time: '2 hours ago', icon: Scale },
    { title: 'Site Visit Confirmed', text: 'Admin scheduled site coordinator for Kottivakkam plot visit tomorrow at 10 AM.', time: 'Yesterday', icon: CheckCircle2 },
    { title: 'Buy Request Status', text: 'Buy request REQ-BUY-101 moved to Negotiation stage.', time: '3 days ago', icon: Tag },
  ]

  return (
    <div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Notifications & Updates</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifs.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 8, background: 'var(--cream-50)' }}>
              <n.icon size={20} color="var(--brand-gold)" style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-600)', marginTop: 2 }}>{n.text}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-400)', marginTop: 4 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
