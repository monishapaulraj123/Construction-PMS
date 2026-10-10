import { FileText, Download } from 'lucide-react'
import { SecondaryButton } from '../../components/Buttons'
import { useToast } from '../../components/ToastContext'

export default function SellerDocuments() {
  const showToast = useToast()

  const docs = [
    { title: 'Parent Title Deed — ECR Sea Breeze Plot', type: 'Registered Deed (PDF)', date: '10 Aug 2025', size: '4.2 MB' },
    { title: 'Encumbrance Certificate (EC)', type: 'Govt Certificate (PDF)', date: '15 Aug 2025', size: '1.4 MB' },
    { title: 'FMB Survey Sketch & Field Map', type: 'Survey Map', date: '01 Sep 2025', size: '2.1 MB' },
  ]

  return (
    <div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Uploaded Land & Title Documents</h3>
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
