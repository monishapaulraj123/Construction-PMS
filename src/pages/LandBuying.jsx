import { useState } from 'react'
import { Plus, Landmark, MapPin, FileCheck, DollarSign } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { landBuying as initialLand } from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useToast } from '../components/ToastContext'

export default function LandBuying() {
  const [landList, setLandList] = useState(initialLand)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('card')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const showToast = useToast()

  const filtered = landList.filter(
    (l) =>
      !search ||
      l.property_name.toLowerCase().includes(search.toLowerCase()) ||
      l.survey_number.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.party_name.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditing(null)
    setForm({ status: 'Completed', unit: 'Sq. Ft', area: 2400, rate_per_unit: 4000 })
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
      setLandList((rs) => rs.map((r) => (r.land_id === editing.land_id ? { ...r, ...form, total_amount: computedTotal } : r)))
      showToast('Land acquisition record updated')
    } else {
      const newId = Math.max(0, ...landList.map((r) => r.land_id)) + 1
      setLandList((rs) => [
        {
          ...form,
          land_id: newId,
          transaction_code: form.transaction_code || `LND-BUY-${String(newId).padStart(3, '0')}`,
          total_amount: computedTotal,
          status: form.status || 'Completed',
          image: form.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
        },
        ...rs,
      ])
      showToast('Land acquisition record registered')
    }
    setModalOpen(false)
  }

  function handleDelete() {
    setLandList((rs) => rs.filter((r) => r.land_id !== deleteTarget.land_id))
    showToast('Land buying record removed')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search land acquisitions by plot name, survey no or seller..." value={search} onChange={setSearch} />
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={openAdd}>
          + Register Land Purchase
        </PrimaryButton>
      </div>

      <div className="card-grid">
        {filtered.map((land) => (
          <div className="entity-card" key={land.land_id} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 160, backgroundImage: `url(${land.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--paper)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', fontWeight: 700, color: 'var(--forest-900)', boxShadow: 'var(--shadow-card)' }}>
                {land.transaction_code}
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <StatusBadge status={land.status === 'Completed' ? 'Active' : 'Pending'} />
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{land.property_name}</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                <MapPin size={13} /> {land.location}, {land.district}
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--cream-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.72rem' }}>Survey Number</span>
                  <strong>{land.survey_number}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.72rem' }}>Land Extent Area</span>
                  <strong>{land.area} {land.unit}</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--ink-700)', marginBottom: 12, lineHeight: 1.4 }}>
                Seller: <strong>{land.party_name}</strong> ({land.party_contact})
              </div>

              <div className="entity-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line-100)' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Acquisition Value</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                  {formatCurrencyINR(land.total_amount || land.area * land.rate_per_unit)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Land Purchase' : 'Register Land Purchase'}
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? 'Save Changes' : 'Register Purchase'}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Transaction Code" required value={form.transaction_code || ''} onChange={(e) => setForm({ ...form, transaction_code: e.target.value })} />
          <FormInput label="Property / Land Name" required full value={form.property_name || ''} onChange={(e) => setForm({ ...form, property_name: e.target.value })} />
          <FormInput label="Survey Number" required value={form.survey_number || ''} onChange={(e) => setForm({ ...form, survey_number: e.target.value })} />
          <FormInput label="Location / Street" required value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <FormInput label="District" value={form.district || ''} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <FormInput label="State" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <FormInput label="Pincode" value={form.pincode || ''} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />

          <FormInput label="Area / Extent" type="number" required value={form.area ?? ''} onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) || 0 })} />
          <SelectInput label="Unit of Measure" options={['Sq. Ft', 'Acres', 'Cents', 'Grounds']} value={form.unit || 'Sq. Ft'} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <FormInput label="Rate per Unit (₹)" type="number" required value={form.rate_per_unit ?? ''} onChange={(e) => setForm({ ...form, rate_per_unit: parseFloat(e.target.value) || 0 })} />
          <DateInput label="Transaction Date" value={form.transaction_date || ''} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />

          <FormInput label="Seller Party Name" required value={form.party_name || ''} onChange={(e) => setForm({ ...form, party_name: e.target.value })} />
          <FormInput label="Seller Phone" value={form.party_contact || ''} onChange={(e) => setForm({ ...form, party_contact: e.target.value })} />
          <FormInput label="Document Ref / Deed No." value={form.document_reference || ''} onChange={(e) => setForm({ ...form, document_reference: e.target.value })} />

          <FormInput label="Image URL" full value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <FormInput label="Remarks & Title Deed Status" type="textarea" full value={form.remarks || ''} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <SelectInput
            label="Status"
            options={['Completed', 'In Progress', 'On Hold', 'Cancelled']}
            value={form.status || 'Completed'}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Land Record?"
        description="This action cannot be undone."
      />
    </div>
  )
}
