import { useState } from 'react'
import { CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, FileSpreadsheet, Plus } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { serviceQuotationsWorkflow as initialQuotes, suppliers, projects, services } from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useToast } from '../components/ToastContext'

export default function Quotations() {
  const [quoteList, setQuoteList] = useState(initialQuotes)
  const [search, setSearch] = useState('')
  const [activeWorkflowItem, setActiveWorkflowItem] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({})
  const showToast = useToast()

  const filtered = quoteList.filter(
    (q) =>
      !search ||
      q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
      q.project_name.toLowerCase().includes(search.toLowerCase()) ||
      q.supplier_name.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setForm({ status: 'Quotation Received', quoted_amount: 100000 })
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const newId = Math.max(0, ...quoteList.map((q) => q.quotation_id)) + 1
    const newQuote = {
      ...form,
      quotation_id: newId,
      quotation_number: form.quotation_number || `QT-2026-${String(newId).padStart(3, '0')}`,
      status: 'Quotation Received',
      negotiation: null,
      approval: null,
    }
    setQuoteList((qs) => [newQuote, ...qs])
    setModalOpen(false)
    showToast('Quotation registered')
  }

  function handleNegotiationSubmit(qId, proposedAmt, comments) {
    setQuoteList((qs) =>
      qs.map((q) => {
        if (q.quotation_id === qId) {
          return {
            ...q,
            status: 'Under Negotiation',
            negotiation: {
              original_amount: q.quoted_amount,
              proposed_amount: proposedAmt,
              negotiated_by: 'Authorized Lead',
              negotiation_date: new Date().toISOString().split('T')[0],
              comments: comments || 'Counter offer submitted to supplier.',
              status: 'Proposed',
            },
          }
        }
        return q;
      })
    )
    showToast('Negotiation counter-proposal updated')
  }

  function handleApprovalSubmit(qId, approvalComments) {
    setQuoteList((qs) =>
      qs.map((q) => {
        if (q.quotation_id === qId) {
          return {
            ...q,
            status: 'Approved',
            approval: {
              approved_by: 'Project Director',
              approval_status: 'Approved',
              approval_date: new Date().toISOString().split('T')[0],
              comments: approvalComments || 'Final quotation approved for contract execution.',
            },
          }
        }
        return q
      })
    )
    showToast('Quotation approved successfully!')
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search quotations by number, project or supplier..." value={search} onChange={setSearch} />
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={openAdd}>
          + Receive Quotation
        </PrimaryButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filtered.map((quote) => {
          const hasNegotiation = !!quote.negotiation
          const isApproved = quote.status === 'Approved'

          return (
            <div className="card card-pad" key={quote.quotation_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span className="stage-code">{quote.quotation_number}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 2px' }}>{quote.service_name || 'Construction Service'}</h3>
                  <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                    Project: <strong>{quote.project_name}</strong> · Supplier: <strong>{quote.supplier_name}</strong>
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={isApproved ? 'Active' : quote.status === 'Under Negotiation' ? 'Pending' : 'Inactive'} />
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--forest-900)', marginTop: 6 }}>
                    {formatCurrencyINR(quote.negotiation?.proposed_amount || quote.quoted_amount)}
                  </div>
                </div>
              </div>

              {/* Workflow Stepper */}
              <div style={{ padding: 16, background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'center' }}>
                  {/* Step 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--forest-900)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                      1
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--ink-500)', display: 'block' }}>Step 1: Quotation</span>
                      <strong style={{ fontSize: '0.85rem' }}>{formatCurrencyINR(quote.quoted_amount)}</strong>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: hasNegotiation ? 'var(--gold-500)' : 'var(--line-200)', color: hasNegotiation ? '#244a3f' : 'var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                      2
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--ink-500)', display: 'block' }}>Step 2: Negotiation</span>
                      <strong style={{ fontSize: '0.85rem' }}>
                        {hasNegotiation ? formatCurrencyINR(quote.negotiation.proposed_amount) : 'Pending Offer'}
                      </strong>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: isApproved ? 'var(--forest-900)' : 'var(--line-200)', color: isApproved ? '#fff' : 'var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                      3
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--ink-500)', display: 'block' }}>Step 3: Approval</span>
                      <strong style={{ fontSize: '0.85rem' }}>{isApproved ? 'Approved' : 'Awaiting Sign-off'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Details */}
              {hasNegotiation && (
                <div style={{ fontSize: '0.82rem', background: 'var(--paper)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px dashed var(--line-200)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Negotiation Comments by <strong>{quote.negotiation.negotiated_by}</strong>:</span>
                    <span className="text-muted">{quote.negotiation.negotiation_date}</span>
                  </div>
                  <p style={{ color: 'var(--ink-700)', fontStyle: 'italic' }}>"{quote.negotiation.comments}"</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                {!isApproved && (
                  <>
                    <SecondaryButton icon={MessageSquare} onClick={() => handleNegotiationSubmit(quote.quotation_id, Math.round(quote.quoted_amount * 0.9), 'Counter offer submitted for 10% discount.')}>
                      Negotiate Rate
                    </SecondaryButton>
                    <PrimaryButton icon={ShieldCheck} onClick={() => handleApprovalSubmit(quote.quotation_id, 'Approved for purchase order generation.')}>
                      Approve Quotation
                    </PrimaryButton>
                  </>
                )}
                {isApproved && (
                  <span style={{ color: 'var(--forest-900)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={16} /> Fully Approved for Contract
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Receive Supplier Quotation"
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>Save Quotation</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Quotation Number" required value={form.quotation_number || ''} onChange={(e) => setForm({ ...form, quotation_number: e.target.value })} />
          <SelectInput
            label="Project"
            required
            options={projects.map((p) => p.project_name)}
            value={form.project_name || ''}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
          />
          <SelectInput
            label="Supplier / Vendor"
            required
            options={suppliers.map((s) => s.supplier_name)}
            value={form.supplier_name || ''}
            onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
          />
          <SelectInput
            label="Service / Trade"
            options={services.map((s) => s.service_name)}
            value={form.service_name || ''}
            onChange={(e) => setForm({ ...form, service_name: e.target.value })}
          />
          <FormInput label="Quoted Amount (₹)" type="number" required value={form.quoted_amount ?? ''} onChange={(e) => setForm({ ...form, quoted_amount: parseFloat(e.target.value) || 0 })} />
          <DateInput label="Quotation Date" value={form.quotation_date || ''} onChange={(e) => setForm({ ...form, quotation_date: e.target.value })} />
          <DateInput label="Validity Date" value={form.valid_till || ''} onChange={(e) => setForm({ ...form, valid_till: e.target.value })} />
          <FormInput label="Quotation Scope & Remarks" type="textarea" full value={form.remarks || ''} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}
