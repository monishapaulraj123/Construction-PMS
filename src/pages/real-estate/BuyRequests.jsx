import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, CheckCircle2, Clock, XCircle, Scale, CreditCard, Eye } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function BuyRequests() {
  const { buyRequests, updateBuyRequestStatus } = useApp()
  const [search, setSearch] = useState('')
  const [selectedReq, setSelectedReq] = useState(null)
  const showToast = useToast()
  const navigate = useNavigate()

  const filtered = buyRequests.filter(
    (r) =>
      !search ||
      r.property_name.toLowerCase().includes(search.toLowerCase()) ||
      r.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.request_code.toLowerCase().includes(search.toLowerCase())
  )

  function handleStatusChange(reqId, newStatus, newStage) {
    updateBuyRequestStatus(reqId, newStatus, newStage)
    showToast(`Buy Request status updated to ${newStatus}`)
    if (selectedReq) setSelectedReq(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search buy requests by property, buyer name or request code..." value={search} onChange={setSearch} />
      </div>

      <div className="card">
        <DataTable
          columns={[
            { header: 'Request Code', accessor: 'request_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Buyer Name', accessor: 'buyer_name' },
            { header: 'Buyer Contact', accessor: (r) => `${r.buyer_phone} (${r.buyer_email})` },
            { header: 'Budget', accessor: (r) => formatCurrencyINR(r.budget) },
            { header: 'Submitted Date', accessor: (r) => formatDate(r.submitted_date) },
            { header: 'Status', accessor: (r) => <StatusBadge status={r.status} /> },
            {
              header: 'Actions',
              accessor: (r) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <SecondaryButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedReq(r)}>
                    Review
                  </SecondaryButton>
                </div>
              ),
            },
          ]}
          data={filtered}
        />
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <Modal
          open={Boolean(selectedReq)}
          onClose={() => setSelectedReq(null)}
          title={`Review Buy Request — ${selectedReq.request_code}`}
          maxWidth={600}
        >
          <div className="card" style={{ padding: 16, background: 'var(--cream-50)', marginBottom: 16 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8, color: 'var(--brand-gold)' }}>
              {selectedReq.property_name}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Buyer Name:</span>
                <div style={{ fontWeight: 600 }}>{selectedReq.buyer_name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Buyer Phone:</span>
                <div style={{ fontWeight: 600 }}>{selectedReq.buyer_phone}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Offered Budget:</span>
                <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{formatCurrencyINR(selectedReq.budget)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Current Status:</span>
                <div><StatusBadge status={selectedReq.status} /></div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--ink-500)' }}>Buyer Requirements & Notes:</span>
              <div style={{ background: '#fff', padding: 8, borderRadius: 4, marginTop: 4, fontStyle: 'italic' }}>
                "{selectedReq.requirements || 'Interested in property purchase'}"
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>
            Admin Workflow Next Actions:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <SecondaryButton
              icon={Scale}
              onClick={() => {
                handleStatusChange(selectedReq.request_id, 'Negotiation', 'Price Settlement')
                navigate('/real-estate/negotiations')
              }}
            >
              Start Negotiation
            </SecondaryButton>
            <PrimaryButton
              icon={CreditCard}
              onClick={() => {
                handleStatusChange(selectedReq.request_id, 'Transaction Processing', 'Transaction Initiated')
                navigate('/real-estate/transactions')
              }}
            >
              Initiate Transaction
            </PrimaryButton>
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
            <button
              className="btn"
              style={{ color: 'var(--coral-500)', fontSize: '0.8rem' }}
              onClick={() => handleStatusChange(selectedReq.request_id, 'Rejected', 'Request Closed')}
            >
              Reject Request
            </button>
            <SecondaryButton onClick={() => setSelectedReq(null)}>Close</SecondaryButton>
          </div>
        </Modal>
      )}
    </div>
  )
}
