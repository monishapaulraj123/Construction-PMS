import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building, MapPin, Tag, CheckCircle2, Eye, Plus } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { FormInput } from '../../components/FormInputs'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function AvailableProperties() {
  const { properties, submitBuyRequest, currentUser } = useApp()
  const [search, setSearch] = useState('')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [buyModalProp, setBuyModalProp] = useState(null)
  const [budget, setBudget] = useState('')
  const [requirements, setRequirements] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('9791122334')
  const showToast = useToast()
  const navigate = useNavigate()

  // Only approved and published properties appear in buyer portal
  const publicProperties = useMemo(() => {
    return properties.filter(
      (p) =>
        p.status === 'Approved' &&
        p.publication_status === 'Published' &&
        (!search ||
          p.property_name.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase()))
    )
  }, [properties, search])

  function handleBuySubmit(e) {
    e.preventDefault()
    if (!buyModalProp) return

    submitBuyRequest({
      property_id: buyModalProp.property_id,
      property_name: buyModalProp.property_name,
      buyer_phone: buyerPhone,
      budget: Number(budget) || buyModalProp.total_amount,
      requirements,
    })

    showToast(`Buy Request submitted for "${buyModalProp.property_name}"! Track status in My Buy Requests.`)
    setBuyModalProp(null)
    navigate('/buyer/requests')
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search available properties by location or title..." value={search} onChange={setSearch} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {publicProperties.map((p) => (
          <div key={p.property_id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 190, position: 'relative' }}>
              <img src={p.image} alt={p.property_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(34, 197, 94, 0.9)',
                    color: '#fff',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  Verified Listing
                </span>
              </div>
            </div>

            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-gold)', textTransform: 'uppercase' }}>
                  {p.property_type || 'Residential Plot'}
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
                    <span style={{ color: 'var(--ink-500)' }}>Area Size:</span>
                    <div style={{ fontWeight: 600 }}>{p.area} {p.unit}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ink-500)' }}>Rate per Unit:</span>
                    <div style={{ fontWeight: 600 }}>{formatCurrencyINR(p.rate_per_unit)}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--ink-500)' }}>Total Asking Price:</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
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
                <PrimaryButton
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }}
                  icon={Tag}
                  onClick={() => {
                    setBuyModalProp(p)
                    setBudget(p.total_amount)
                  }}
                >
                  Submit Buy Request
                </PrimaryButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <Modal
          open={Boolean(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
          title={`Property Catalogue — ${selectedProperty.property_name}`}
          maxWidth={600}
        >
          <img src={selectedProperty.image} alt={selectedProperty.property_name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem', marginBottom: 16 }}>
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
              <span style={{ color: 'var(--ink-500)' }}>Total Price:</span>
              <div style={{ fontWeight: 800, color: 'var(--brand-gold)', fontSize: '1.1rem' }}>
                {formatCurrencyINR(selectedProperty.total_amount)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <SecondaryButton onClick={() => setSelectedProperty(null)}>Close</SecondaryButton>
            <PrimaryButton
              icon={Tag}
              onClick={() => {
                const prop = selectedProperty
                setSelectedProperty(null)
                setBuyModalProp(prop)
                setBudget(prop.total_amount)
              }}
            >
              Submit Buy Request
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Submit Buy Request Modal */}
      {buyModalProp && (
        <Modal open={Boolean(buyModalProp)} onClose={() => setBuyModalProp(null)} title={`Submit Buy Request — ${buyModalProp.property_name}`} maxWidth={520}>
          <form onSubmit={handleBuySubmit}>
            <div style={{ marginBottom: 12 }}>
              <FormInput label="Buyer Name" disabled value={currentUser.name} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <FormInput label="Buyer Email" disabled value={currentUser.email} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <FormInput label="Contact Phone Number" required value={buyerPhone} onChange={setBuyerPhone} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <FormInput label="Offered Budget (₹)" type="number" required value={budget} onChange={setBudget} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <FormInput label="Purchase Requirements & Notes" placeholder="e.g. Planning to start immediate construction..." value={requirements} onChange={setRequirements} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <SecondaryButton onClick={() => setBuyModalProp(null)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit">Submit Purchase Intent</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
