import { FileCheck2, CheckCircle2 } from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'

export default function SellerVerification() {
  const verifications = [
    { name: 'ECR Sea Breeze Coastal Plot', survey: 'SY-142/3A', doc: 'DOC-ECR-2025-8812', status: 'Verified', date: '14 Dec 2025' },
    { name: 'Avinashi Highway Commercial Land', survey: 'SY-308/1B', doc: 'DOC-CBE-2025-5510', status: 'Verified', date: '20 Dec 2025' },
    { name: 'Trichy Road Tech Park Site', survey: 'SY-88/2C', doc: 'DOC-TR-2026-009', status: 'Under Review', date: '01 Feb 2026' },
  ]

  return (
    <div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Verification Progress & Clearance</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {verifications.map((v, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderRadius: 8,
                background: 'var(--cream-50)',
                border: '1px solid var(--cream-200)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginTop: 2 }}>
                  Survey No: {v.survey} · Doc Ref: {v.doc} · Submitted: {v.date}
                </div>
              </div>
              <StatusBadge status={v.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
