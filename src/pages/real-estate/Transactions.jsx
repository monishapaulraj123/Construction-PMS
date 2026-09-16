import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, HardHat, CheckCircle2, FileText, ArrowRight } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function Transactions() {
  const { transactions } = useApp()
  const [search, setSearch] = useState('')
  const [selectedTxn, setSelectedTxn] = useState(null)
  const showToast = useToast()
  const navigate = useNavigate()

  const filtered = transactions.filter(
    (t) =>
      !search ||
      t.property_name.toLowerCase().includes(search.toLowerCase()) ||
      t.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.transaction_code.toLowerCase().includes(search.toLowerCase())
  )

  function handleCreateConstruction(txn) {
    showToast(`Navigating to create Construction Project for "${txn.property_name}"`)
    setSelectedTxn(null)
    navigate('/projects')
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search transactions by property, buyer or code..." value={search} onChange={setSearch} />
      </div>

      <div className="card">
        <DataTable
          columns={[
            { header: 'Transaction Code', accessor: 'transaction_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Buyer', accessor: 'buyer_name' },
            { header: 'Seller', accessor: 'seller_name' },
            { header: 'Agreed Price', accessor: (t) => formatCurrencyINR(t.agreed_amount) },
            { header: 'Payment Status', accessor: 'payment_status' },
            { header: 'Date', accessor: (t) => formatDate(t.transaction_date) },
            { header: 'Status', accessor: (t) => <StatusBadge status={t.status} /> },
            {
              header: 'Actions',
              accessor: (t) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <SecondaryButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedTxn(t)}>
                    View Settlement
                  </SecondaryButton>
                </div>
              ),
            },
          ]}
          data={filtered}
        />
      </div>

      {selectedTxn && (
        <Modal
          open={Boolean(selectedTxn)}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction Record — ${selectedTxn.transaction_code}`}
          maxWidth={620}
        >
          <div className="card" style={{ padding: 16, background: 'var(--cream-50)', marginBottom: 16 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--ink-900)' }}>
              {selectedTxn.property_name}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Agreed Total Amount:</span>
                <div style={{ fontWeight: 800, color: 'var(--brand-gold)', fontSize: '1.05rem' }}>
                  {formatCurrencyINR(selectedTxn.agreed_amount)}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Payment Stage:</span>
                <div style={{ fontWeight: 700 }}>{selectedTxn.payment_status}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Buyer Details:</span>
                <div style={{ fontWeight: 600 }}>{selectedTxn.buyer_name} ({selectedTxn.buyer_contact})</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Seller Details:</span>
                <div style={{ fontWeight: 600 }}>{selectedTxn.seller_name} ({selectedTxn.seller_contact})</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Document Reference:</span>
                <div style={{ fontWeight: 600 }}>{selectedTxn.document_reference || 'SALE-DEED-2026-882'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Admin Verification:</span>
                <div style={{ fontWeight: 700, color: '#16a34a' }}>{selectedTxn.admin_verification || 'Approved'}</div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,255,255,0.8) 100%)',
              borderLeft: '4px solid var(--brand-gold)',
              marginBottom: 20,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink-900)' }}>
              Real Estate + Construction Workflow Integration
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-600)', marginTop: 2 }}>
              Convert this acquired land parcel directly into a new Construction PMS project.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <SecondaryButton onClick={() => setSelectedTxn(null)}>Close</SecondaryButton>
            <PrimaryButton icon={HardHat} onClick={() => handleCreateConstruction(selectedTxn)}>
              Create Construction Project
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  )
}
