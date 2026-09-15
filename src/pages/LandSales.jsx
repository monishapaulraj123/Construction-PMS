import { useState } from 'react'
import { Plus, ShoppingBag, MapPin, CheckCircle2 } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { landSales as initialSales } from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useToast } from '../components/ToastContext'

export default function LandSales() {
  const [salesList, setSalesList] = useState(initialSales)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const showToast = useToast()

  const filtered = salesList.filter(
    (s) =>
      !search ||
      s.property_name.toLowerCase().includes(search.toLowerCase()) ||
      s.survey_number.toLowerCase().includes(search.toLowerCase()) ||
      s.buyer_name.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditing(null)
    setForm({ status: 'Completed', unit: 'Sq. Ft', area: 2400, rate_per_unit: 5800 })
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm(row)
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const computedTotal = (form.area || 0) * (form.rate_per_unit || 0)
    if (editing) {
      setSalesList((rs) => rs.map((r) => (r.sale_id === editing.sale_id ? { ...r, ...form, total_amount: computedTotal } : r)))
      showToast('Land sale record updated')
    } else {
      const newId = Math.max(0, ...salesList.map((r) => r.sale_id)) + 1
      setSalesList((rs) => [
        {
          ...form,
          sale_id: newId,
          transaction_code: form.transaction_code || `LND-SEL-${String(newId).padStart(3, '0')}`,
          total_amount: computedTotal,
          status: form.status || 'Completed',
          image: form.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
        },
        ...rs,
      ])
      showToast('Land plot sale registered successfully')
    }
    setModalOpen(false)
  }

  function handleDelete() {
    setSalesList((rs) => rs.filter((r) => r.sale_id !== deleteTarget.sale_id))
    showToast('Land sale record removed')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search land sales by property, survey no or buyer..." value={search} onChange={setSearch} />
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={openAdd}>
          + Register Plot Sale
        </PrimaryButton>
      </div>

      <div className="card-grid">
        {filtered.map((sale) => (
          <div className="entity-card" key={sale.sale_id} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 160, backgroundImage: `url(${sale.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--paper)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', fontWeight: 700, color: 'var(--forest-900)', boxShadow: 'var(--shadow-card)' }}>
                {sale.transaction_code}
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <StatusBadge status={sale.status === 'Completed' ? 'Active' : 'Pending'} />
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{sale.property_name}</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                <MapPin size={13} /> {sale.location}, {sale.district}
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--gold-050)', border: '1px solid var(--gold-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.72rem' }}>Survey No</span>
                  <strong>{sale.survey_number}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.72rem' }}>Plot Extent</span>
                  <strong>{sale.area} {sale.unit}</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--ink-700)', marginBottom: 12, lineHeight: 1.4 }}>
                Buyer: <strong>{sale.buyer_name}</strong> ({sale.buyer_contact})
              </div>

              <div className="entity-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line-100)' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Sale Agreement Amount</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                  {formatCurrencyINR(sale.total_amount || sale.area * sale.rate_per_unit)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Land Sale' : 'Register Land Sale'}
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? 'Save Changes' : 'Register Sale'}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Transaction Code" required value={form.transaction_code || ''} onChange={(e) => setForm({ ...form, transaction_code: e.target.value })} />
          <FormInput label="Property / Plot Name" required full value={form.property_name || ''} onChange={(e) => setForm({ ...form, property_name: e.target.value })} />
          <FormInput label="Survey Number" required value={form.survey_number || ''} onChange={(e) => setForm({ ...form, survey_number: e.target.value })} />
          <FormInput label="Location" required value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <FormInput label="District" value={form.district || ''} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <FormInput label="State" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} />

          <FormInput label="Area / Extent" type="number" required value={form.area ?? ''} onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) || 0 })} />
          <SelectInput label="Unit of Measure" options={['Sq. Ft', 'Acres', 'Cents', 'Grounds']} value={form.unit || 'Sq. Ft'} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <FormInput label="Sale Rate per Unit (₹)" type="number" required value={form.rate_per_unit ?? ''} onChange={(e) => setForm({ ...form, rate_per_unit: parseFloat(e.target.value) || 0 })} />
          <DateInput label="Transaction Date" value={form.transaction_date || ''} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />

          <FormInput label="Buyer Name" required value={form.buyer_name || ''} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} />
          <FormInput label="Buyer Phone" value={form.buyer_contact || ''} onChange={(e) => setForm({ ...form, buyer_contact: e.target.value })} />
          <FormInput label="Sale Deed Reference No." value={form.document_reference || ''} onChange={(e) => setForm({ ...form, document_reference: e.target.value })} />

          <FormInput label="Image URL" full value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <FormInput label="Remarks" type="textarea" full value={form.remarks || ''} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <SelectInput
            label="Status"
            options={['Completed', 'Under Agreement', 'Cancelled']}
            value={form.status || 'Completed'}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Land Sale Record?"
        description="This action cannot be undone."
      />
    </div>
  )
}
