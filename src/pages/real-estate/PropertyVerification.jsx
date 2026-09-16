import { useState } from 'react'
import { FileCheck2, ShieldCheck, CheckCircle2, AlertCircle, FileText, Search } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function PropertyVerification() {
  const { properties, updatePropertyStatus } = useApp()
  const [search, setSearch] = useState('')
  const [selectedProp, setSelectedProp] = useState(null)
  const showToast = useToast()

  const filtered = properties.filter(
    (p) =>
      !search ||
      p.property_name.toLowerCase().includes(search.toLowerCase()) ||
      p.survey_number.toLowerCase().includes(search.toLowerCase())
  )

  function verifyStep(propId) {
    updatePropertyStatus(propId, 'Approved', 'Published', 'Verified')
    showToast(`Property "${selectedProp.property_name}" title deed verified & approved!`)
    setSelectedProp(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search property verification records by name or survey no..." value={search} onChange={setSearch} />
      </div>

      <div className="card">
        <DataTable
          columns={[
            { header: 'Property Code', accessor: 'property_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Survey No', accessor: 'survey_number' },
            { header: 'Seller', accessor: 'seller_name' },
            { header: 'Document Ref', accessor: (p) => p.document_reference || 'DOC-ECR-2025' },
            { header: 'Verification Status', accessor: (p) => <StatusBadge status={p.verification_status || p.status} /> },
            {
              header: 'Actions',
              accessor: (p) => (
                <SecondaryButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedProp(p)}>
                  Inspect Verification
                </SecondaryButton>
              ),
            },
          ]}
          data={filtered}
        />
      </div>

      {selectedProp && (
        <Modal
          open={Boolean(selectedProp)}
          onClose={() => setSelectedProp(null)}
          title={`Property Verification Checklist — ${selectedProp.property_name}`}
          maxWidth={600}
        >
          <div className="card" style={{ padding: 16, background: 'var(--cream-50)', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Survey Number:</span>
                <div style={{ fontWeight: 600 }}>{selectedProp.survey_number}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Location:</span>
                <div style={{ fontWeight: 600 }}>{selectedProp.location}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Parent Deed Reference:</span>
                <div style={{ fontWeight: 600 }}>{selectedProp.document_reference || 'DOC-ECR-8812'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Seller Contact:</span>
                <div style={{ fontWeight: 600 }}>{selectedProp.seller_name} ({selectedProp.seller_phone})</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>Compliance Checklist</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid var(--cream-200)' }}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>Parent Title Deed Ownership verified at Sub-Registrar Office</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid var(--cream-200)' }}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>Encumbrance Certificate (EC) clear for 30 years</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid var(--cream-200)' }}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>DTCP Layout sanction & survey boundary verified</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <SecondaryButton onClick={() => setSelectedProp(null)}>Cancel</SecondaryButton>
            <PrimaryButton icon={ShieldCheck} onClick={() => verifyStep(selectedProp.property_id)}>
              Mark as Verified & Approved
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  )
}
