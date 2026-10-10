import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building, MapPin, CheckCircle2, AlertCircle, Eye, Plus, LayoutGrid, TableProperties, HardHat } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { FormInput, SelectInput } from '../../components/FormInputs'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function AdminProperties() {
  const { properties, updatePropertyStatus, submitSellProperty } = useApp()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('card')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form, setForm] = useState({})
  const showToast = useToast()
  const navigate = useNavigate()

  const filtered = useMemo(
    () =>
      properties.filter(
        (p) =>
          !search ||
          p.property_name.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase()) ||
          p.survey_number.toLowerCase().includes(search.toLowerCase())
      ),
    [properties, search]
  )

  function handleAddSubmit(e) {
    e.preventDefault()
    const rate = Number(form.rate_per_unit || 0)
    const area = Number(form.area || 0)
    submitSellProperty({
      ...form,
      area,
      rate_per_unit: rate,
      total_amount: area * rate,
      status: 'Approved',
      publication_status: 'Published',
      verification_status: 'Verified',
    })
    showToast('New property created and published')
    setAddModalOpen(false)
  }

  function togglePublish(p) {
    const newPub = p.publication_status === 'Published' ? 'Unpublished' : 'Published'
    updatePropertyStatus(p.property_id, p.status, newPub, p.verification_status)
    showToast(`Property listing set to ${newPub}`)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search properties by name, location or survey no..." value={search} onChange={setSearch} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            className="icon-btn"
            style={{ background: view === 'card' ? 'var(--cream-100)' : undefined }}
            onClick={() => setView('card')}
            aria-label="Card view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className="icon-btn"
            style={{ background: view === 'table' ? 'var(--cream-100)' : undefined }}
            onClick={() => setView('table')}
            aria-label="Table view"
          >
            <TableProperties size={16} />
          </button>
          <PrimaryButton icon={Plus} onClick={() => setAddModalOpen(true)}>
            Add Property
          </PrimaryButton>
        </div>
      </div>

      {view === 'card' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((p) => (
            <div key={p.property_id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                <img src={p.image} alt={p.property_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                  <StatusBadge status={p.publication_status} />
                  <StatusBadge status={p.verification_status || p.status} />
                </div>
              </div>

              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-gold)', textTransform: 'uppercase' }}>
                    {p.property_type || 'Plot / Land'}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 8px 0', color: 'var(--ink-900)' }}>
                    {p.property_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--ink-500)', marginBottom: 12 }}>
                    <MapPin size={15} color="var(--brand-gold)" />
                    {p.location}, {p.district}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      background: 'var(--cream-50)',
                      padding: 10,
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--ink-500)' }}>Area / Size:</span>
                      <div style={{ fontWeight: 600 }}>{p.area} {p.unit}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--ink-500)' }}>Survey No:</span>
                      <div style={{ fontWeight: 600 }}>{p.survey_number}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--ink-500)' }}>Total Price:</span>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-gold)' }}>
                        {formatCurrencyINR(p.total_amount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <SecondaryButton
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }}
                    icon={Eye}
                    onClick={() => setSelectedProperty(p)}
                  >
                    View Details
                  </SecondaryButton>
                  <SecondaryButton
                    style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                    onClick={() => togglePublish(p)}
                  >
                    {p.publication_status === 'Published' ? 'Unpublish' : 'Publish'}
                  </SecondaryButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <DataTable
            columns={[
              { header: 'Property Code', accessor: 'property_code' },
              { header: 'Name', accessor: 'property_name' },
              { header: 'Survey No', accessor: 'survey_number' },
              { header: 'Location', accessor: 'location' },
              { header: 'Area', accessor: (p) => `${p.area} ${p.unit}` },
              { header: 'Total Price', accessor: (p) => formatCurrencyINR(p.total_amount) },
              { header: 'Verification', accessor: (p) => <StatusBadge status={p.verification_status || p.status} /> },
              { header: 'Publication', accessor: (p) => <StatusBadge status={p.publication_status} /> },
              {
                header: 'Actions',
                accessor: (p) => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <SecondaryButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedProperty(p)}>
                      View
                    </SecondaryButton>
                    <SecondaryButton style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => togglePublish(p)}>
                      {p.publication_status === 'Published' ? 'Unpublish' : 'Publish'}
                    </SecondaryButton>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        </div>
      )}

      {/* View Details Modal */}
      {selectedProperty && (
        <Modal
          open={Boolean(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
          title={`Property Details — ${selectedProperty.property_name}`}
          maxWidth={640}
        >
          <img
            src={selectedProperty.image}
            alt={selectedProperty.property_name}
            style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem', marginBottom: 16 }}>
            <div>
              <span style={{ color: 'var(--ink-500)' }}>Property Type:</span>
              <div style={{ fontWeight: 600 }}>{selectedProperty.property_type || 'Land Plot'}</div>
            </div>
            <div>
              <span style={{ color: 'var(--ink-500)' }}>Survey Number:</span>
              <div style={{ fontWeight: 600 }}>{selectedProperty.survey_number}</div>
            </div>
            <div>
              <span style={{ color: 'var(--ink-500)' }}>Location:</span>
              <div style={{ fontWeight: 600 }}>{selectedProperty.location}, {selectedProperty.district}</div>
            </div>
            <div>
              <span style={{ color: 'var(--ink-500)' }}>State & Pincode:</span>
              <div style={{ fontWeight: 600 }}>{selectedProperty.state} - {selectedProperty.pincode}</div>
            </div>
            <div>
              <span style={{ color: 'var(--ink-500)' }}>Area / Size:</span>
              <div style={{ fontWeight: 600 }}>{selectedProperty.area} {selectedProperty.unit}</div>
            </div>
            <div>
              <span style={{ color: 'var(--ink-500)' }}>Rate / Unit:</span>
              <div style={{ fontWeight: 600 }}>{formatCurrencyINR(selectedProperty.rate_per_unit)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--ink-500)' }}>Seller / Owner:</span>
              <div style={{ fontWeight: 600 }}>{selectedProperty.seller_name} ({selectedProperty.seller_phone})</div>
            </div>
            <div>
              <span style={{ color: 'var(--ink-500)' }}>Total Price:</span>
              <div style={{ fontWeight: 800, color: 'var(--brand-gold)', fontSize: '1.1rem' }}>
                {formatCurrencyINR(selectedProperty.total_amount)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <PrimaryButton
              icon={HardHat}
              onClick={() => {
                setSelectedProperty(null)
                navigate('/projects')
              }}
            >
              Create Construction Project
            </PrimaryButton>
            <SecondaryButton onClick={() => setSelectedProperty(null)}>Close</SecondaryButton>
          </div>
        </Modal>
      )}

      {/* Add Property Modal */}
      {addModalOpen && (
        <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register New Property" maxWidth={540}>
          <form onSubmit={handleAddSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <FormInput
                  label="Property Name"
                  required
                  placeholder="e.g. ECR Coastal Villa Plot"
                  value={form.property_name || ''}
                  onChange={(v) => setForm((s) => ({ ...s, property_name: v }))}
                />
              </div>
              <SelectInput
                label="Property Type"
                options={['Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Villa Plot']}
                value={form.property_type || 'Residential Plot'}
                onChange={(v) => setForm((s) => ({ ...s, property_type: v }))}
              />
              <FormInput
                label="Survey Number"
                required
                placeholder="SY-142/3A"
                value={form.survey_number || ''}
                onChange={(v) => setForm((s) => ({ ...s, survey_number: v }))}
              />
              <FormInput
                label="Location / Area"
                required
                placeholder="Kottivakkam, ECR Road"
                value={form.location || ''}
                onChange={(v) => setForm((s) => ({ ...s, location: v }))}
              />
              <FormInput
                label="District"
                required
                placeholder="Chennai"
                value={form.district || ''}
                onChange={(v) => setForm((s) => ({ ...s, district: v }))}
              />
              <FormInput
                label="Area Size"
                type="number"
                required
                placeholder="2400"
                value={form.area || ''}
                onChange={(v) => setForm((s) => ({ ...s, area: v }))}
              />
              <SelectInput
                label="Unit"
                options={['Sq. Ft', 'Acres', 'Cents', 'Grounds']}
                value={form.unit || 'Sq. Ft'}
                onChange={(v) => setForm((s) => ({ ...s, unit: v }))}
              />
              <FormInput
                label="Rate per Unit (₹)"
                type="number"
                required
                placeholder="4200"
                value={form.rate_per_unit || ''}
                onChange={(v) => setForm((s) => ({ ...s, rate_per_unit: v }))}
              />
              <FormInput
                label="Seller Name"
                required
                placeholder="Santhosh Builder"
                value={form.seller_name || ''}
                onChange={(v) => setForm((s) => ({ ...s, seller_name: v }))}
              />
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <SecondaryButton onClick={() => setAddModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit">Publish Property</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
