import { Bell, CheckCircle2, Eye, PlusCircle } from 'lucide-react'

export default function SellerNotifications() {
  const notifs = [
    { title: 'Buyer Interest Registered', text: 'A buyer submitted an offer of ₹1.95 Cr on your ECR Sea Breeze Coastal Plot.', time: '1 hour ago', icon: Eye },
    { title: 'Title Deed Clearance Verified', text: 'Your plot SY-142/3A has passed clear title deed verification by admin.', time: 'Yesterday', icon: CheckCircle2 },
    { title: 'Plot Submission Received', text: 'Land plot submission REQ-SEL-201 received and assigned to legal verifier.', time: '4 days ago', icon: PlusCircle },
  ]

  return (
    <div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Seller Notifications & Updates</h3>
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
