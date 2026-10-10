import { FileText, Download, ShieldCheck } from 'lucide-react'
import { SecondaryButton } from '../../components/Buttons'
import { useToast } from '../../components/ToastContext'

export default function BuyerDocuments() {
  const showToast = useToast()

  const docs = [
    { title: 'ECR Sea Breeze Title Deed Copy', type: 'Parent Deed (PDF)', date: '14 Aug 2025', size: '2.4 MB' },
    { title: 'Encumbrance Certificate (EC) 30 Yrs', type: 'Govt Certificate (PDF)', date: '20 Aug 2025', size: '1.1 MB' },
    { title: 'DTCP Approved Plot Layout Sketch', type: 'Approval Sketch', date: '05 Sep 2025', size: '3.8 MB' },
  ]

  return (
    <div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Verified Property Documents</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {docs.map((d, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 14,
                borderRadius: 8,
                background: 'var(--cream-50)',
                border: '1px solid var(--cream-200)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={24} color="var(--brand-gold)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>
                    {d.type} · {d.date} · {d.size}
                  </div>
                </div>
              </div>
              <SecondaryButton icon={Download} onClick={() => showToast(`Downloading ${d.title}`)}>
                Download
              </SecondaryButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
