import { useState } from 'react'
import { Scale, CheckCircle2, DollarSign, MessageSquare } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { FormInput } from '../../components/FormInputs'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function Negotiations() {
  const { negotiations, updateNegotiation } = useApp()
  const [search, setSearch] = useState('')
  const [selectedNeg, setSelectedNeg] = useState(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [remarks, setRemarks] = useState('')
  const showToast = useToast()

  const filtered = negotiations.filter(
    (n) =>
      !search ||
      n.property_name.toLowerCase().includes(search.toLowerCase()) ||
      n.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      n.seller_name.toLowerCase().includes(search.toLowerCase())
  )

  function handleUpdateCounter(status) {
    if (!selectedNeg) return
    const amount = Number(counterPrice) || selectedNeg.counter_offer || selectedNeg.proposed_price
    updateNegotiation(selectedNeg.negotiation_id, amount, status, remarks || 'Updated by admin coordinator')
    showToast(`Negotiation state updated to ${status}`)
    setSelectedNeg(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search negotiations by property, buyer or seller..." value={search} onChange={setSearch} />
      </div>

      <div className="card">
        <DataTable
          columns={[
            { header: 'Negotiation ID', accessor: 'negotiation_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Buyer', accessor: 'buyer_name' },
            { header: 'Seller', accessor: 'seller_name' },
            { header: 'Initial Price', accessor: (n) => formatCurrencyINR(n.initial_price) },
            { header: 'Proposed Price', accessor: (n) => formatCurrencyINR(n.proposed_price) },
            { header: 'Counter Offer', accessor: (n) => formatCurrencyINR(n.counter_offer) },
            { header: 'Agreed Price', accessor: (n) => formatCurrencyINR(n.final_agreed_price) },
            { header: 'Status', accessor: (n) => <StatusBadge status={n.status} /> },
            {
              header: 'Actions',
              accessor: (n) => (
                <SecondaryButton
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  onClick={() => {
                    setSelectedNeg(n)
                    setCounterPrice(n.counter_offer || n.proposed_price)
                  }}
                >
                  Manage Counter Offer
                </SecondaryButton>
              ),
            },
          ]}
          data={filtered}
        />
      </div>

      {selectedNeg && (
        <Modal
          open={Boolean(selectedNeg)}
          onClose={() => setSelectedNeg(null)}
          title={`Price Negotiation — ${selectedNeg.property_name}`}
          maxWidth={560}
        >
          <div className="card" style={{ padding: 16, background: 'var(--cream-50)', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Initial Asking Price:</span>
                <div style={{ fontWeight: 600 }}>{formatCurrencyINR(selectedNeg.initial_price)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Buyer Proposed Price:</span>
                <div style={{ fontWeight: 600, color: '#2563eb' }}>{formatCurrencyINR(selectedNeg.proposed_price)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Current Counter Offer:</span>
                <div style={{ fontWeight: 700, color: 'var(--brand-gold)' }}>
                  {formatCurrencyINR(selectedNeg.counter_offer)}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Status:</span>
                <div><StatusBadge status={selectedNeg.status} /></div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FormInput
              label="Set Counter Offer Amount (₹)"
              type="number"
              placeholder="e.g. 19800000"
              value={counterPrice}
              onChange={setCounterPrice}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <FormInput
              label="Negotiation Remarks / Notes"
              placeholder="Seller agreed to ₹1.98 Cr final closing price..."
              value={remarks}
              onChange={setRemarks}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <button
              className="btn"
              style={{ color: 'var(--coral-500)', fontSize: '0.8rem' }}
              onClick={() => handleUpdateCounter('Closed')}
            >
              Close Negotiation
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <SecondaryButton onClick={() => handleUpdateCounter('Counter Offer')}>
                Send Counter Offer
              </SecondaryButton>
              <PrimaryButton icon={CheckCircle2} onClick={() => handleUpdateCounter('Agreed')}>
                Confirm Final Agreed Price
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
