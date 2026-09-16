import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, FileCheck2, CheckCircle2, AlertTriangle, Eye, ShieldCheck } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function SellRequests() {
  const { sellRequests, submitSellProperty, updatePropertyStatus } = useApp()
  const [search, setSearch] = useState('')
  const [selectedSellReq, setSelectedSellReq] = useState(null)
  const showToast = useToast()
  const navigate = useNavigate()

  const filtered = sellRequests.filter(
    (s) =>
      !search ||
      s.property_name.toLowerCase().includes(search.toLowerCase()) ||
      s.seller_name.toLowerCase().includes(search.toLowerCase()) ||
      s.survey_number.toLowerCase().includes(search.toLowerCase())
  )

  function handleApprove(req) {
    submitSellProperty({
      property_name: req.property_name,
      survey_number: req.survey_number,
      location: req.location,
      district: req.district,
      state: req.state,
      pincode: req.pincode,
      area: req.area,
      unit: req.unit,
      rate_per_unit: req.expected_rate,
      total_amount: req.expected_total,
      seller_name: req.seller_name,
      seller_phone: req.seller_phone,
      seller_email: req.seller_email,
      status: 'Approved',
      publication_status: 'Published',
      verification_status: 'Verified',
    })
    showToast(`Property "${req.property_name}" approved & published to listings`)
    setSelectedSellReq(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search sell submissions by property, seller or survey number..." value={search} onChange={setSearch} />
      </div>

      <div className="card">
        <DataTable
          columns={[
            { header: 'Request Code', accessor: 'request_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Survey No', accessor: 'survey_number' },
            { header: 'Location', accessor: 'location' },
            { header: 'Seller Name', accessor: 'seller_name' },
            { header: 'Expected Total', accessor: (s) => formatCurrencyINR(s.expected_total) },
            { header: 'Submitted Date', accessor: (s) => formatDate(s.submitted_date) },
            { header: 'Status', accessor: (s) => <StatusBadge status={s.status} /> },
            {
              header: 'Actions',
              accessor: (s) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <SecondaryButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedSellReq(s)}>
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
      {selectedSellReq && (
        <Modal
          open={Boolean(selectedSellReq)}
          onClose={() => setSelectedSellReq(null)}
          title={`Review Seller Land Submission — ${selectedSellReq.request_code}`}
          maxWidth={640}
        >
          <div className="card" style={{ padding: 16, background: 'var(--cream-50)', marginBottom: 16 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--ink-900)' }}>
              {selectedSellReq.property_name}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Survey Number:</span>
                <div style={{ fontWeight: 600 }}>{selectedSellReq.survey_number}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Location:</span>
                <div style={{ fontWeight: 600 }}>{selectedSellReq.location}, {selectedSellReq.district}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Area Size:</span>
                <div style={{ fontWeight: 600 }}>{selectedSellReq.area} {selectedSellReq.unit}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Expected Price:</span>
                <div style={{ fontWeight: 700, color: 'var(--brand-gold)' }}>
                  {formatCurrencyINR(selectedSellReq.expected_total)}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Seller Name:</span>
                <div style={{ fontWeight: 600 }}>{selectedSellReq.seller_name} ({selectedSellReq.seller_phone})</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Document Reference:</span>
                <div style={{ fontWeight: 600 }}>{selectedSellReq.document_url || 'DOC-TR-2026-009'}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <SecondaryButton
              style={{ color: 'var(--coral-500)' }}
              onClick={() => {
                showToast('Correction requested from seller')
                setSelectedSellReq(null)
              }}
            >
              Request Correction
            </SecondaryButton>
            <PrimaryButton icon={ShieldCheck} onClick={() => handleApprove(selectedSellReq)}>
              Approve & Publish Listing
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  )
}
