import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building, Search, Filter, MapPin, Maximize2, Tag, CheckCircle2, ArrowRight } from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import Modal from '../../components/Modal'
import StatusBadge from '../../components/StatusBadge'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'
import { useToast } from '../../components/ToastContext'

export default function ClientBuy() {
  const { properties, submitBuyRequest, currentUser } = useApp()
  const [search, setSearch] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)

  const [budget, setBudget] = useState('')
  const [requirements, setRequirements] = useState('')
  const showToast = useToast()
  const navigate = useNavigate()

  // Published & approved properties
  const availableList = properties.filter((p) => p.status === 'Approved' || p.publication_status === 'Published')

  const filtered = availableList.filter((p) => {
    const matchesSearch =
      !search ||
      p.property_name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.survey_number.toLowerCase().includes(search.toLowerCase())
    const matchesDistrict = !districtFilter || p.district === districtFilter
    const matchesType = !typeFilter || p.property_type === typeFilter
    return matchesSearch && matchesDistrict && matchesType
  })

  function handleOpenEnquiry(prop) {
    setSelectedProperty(prop)
    setBudget(prop.total_amount || '')
    setRequirements('Interested in purchasing plot for construction.')
    setShowEnquiryModal(true)
  }

  function handleSubmitEnquiry(e) {
    e.preventDefault()
    if (!selectedProperty) return

    submitBuyRequest({
      property_id: selectedProperty.property_id,
      property_name: selectedProperty.property_name,
      buyer_id: currentUser?.user_id,
      buyer_name: currentUser?.name || 'Client Buyer',
      buyer_email: currentUser?.email,
      buyer_phone: currentUser?.phone || '9840001122',
      budget: Number(budget) || selectedProperty.total_amount,
      requirements,
    })

    showToast(`Buy request submitted for ${selectedProperty.property_name}!`)
    setShowEnquiryModal(false)
    setSelectedProperty(null)
    navigate('/client/requests')
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Buy Land / Property</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Browse verified land parcels, search location & survey details, and submit purchase requests.
          </p>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <SearchBar placeholder="Search by property name, location, survey number..." value={search} onChange={setSearch} />
        </div>
        <select
          className="form-control"
          style={{ width: 160 }}
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
        >
          <option value="">All Districts</option>
          <option value="Chennai">Chennai</option>
          <option value="Coimbatore">Coimbatore</option>
        </select>

        <select
          className="form-control"
          style={{ width: 180 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Property Types</option>
          <option value="Plot / Land">Plot / Land</option>
          <option value="Commercial Plot">Commercial Plot</option>
          <option value="Residential Plot">Residential Plot</option>
        </select>
      </div>

      {/* Grid of Available Land Listings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filtered.map((p) => (
          <div key={p.property_id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: 'var(--cream-100)' }}>
              <img src={p.image} alt={p.property_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <StatusBadge status={p.verification_status || 'Verified'} />
              </div>
            </div>

            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-600)', textTransform: 'uppercase' }}>
                  {p.property_type} · Survey: {p.survey_number}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 8px 0', color: 'var(--ink-900)' }}>
                  {p.property_name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--ink-600)', marginBottom: 10 }}>
                  <MapPin size={15} color="var(--ink-500)" /> {p.location}, {p.district}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--ink-500)', marginBottom: 14 }}>
                  Area: <strong>{p.area} {p.unit}</strong> @ {formatCurrencyINR(p.rate_per_unit)} / {p.unit}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--cream-200)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>Expected Total</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
                    {formatCurrencyINR(p.total_amount)}
                  </div>
                </div>
                <PrimaryButton icon={Tag} style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => handleOpenEnquiry(p)}>
                  Submit Enquiry
                </PrimaryButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Purchase Enquiry Modal */}
      {showEnquiryModal && selectedProperty && (
        <Modal
          open={showEnquiryModal}
          onClose={() => setShowEnquiryModal(false)}
          title={`Submit Purchase Enquiry — ${selectedProperty.property_name}`}
          maxWidth={550}
        >
          <form onSubmit={handleSubmitEnquiry}>
            <div className="card" style={{ padding: 14, background: 'var(--cream-50)', marginBottom: 18 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink-900)' }}>{selectedProperty.property_name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: 2 }}>
                Survey: {selectedProperty.survey_number} | {selectedProperty.location} ({selectedProperty.area} {selectedProperty.unit})
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-gold)', marginTop: 4 }}>
                Asking Price: {formatCurrencyINR(selectedProperty.total_amount)}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.84rem', fontWeight: 600 }}>Buyer Details (Prefilled)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem', background: '#fff', padding: 10, borderRadius: 6, border: '1px solid var(--line-200)' }}>
                <div><strong>Name:</strong> {currentUser?.name}</div>
                <div><strong>Email:</strong> {currentUser?.email}</div>
                <div><strong>Phone:</strong> {currentUser?.phone || '9840001122'}</div>
                <div><strong>Client ID:</strong> #{currentUser?.user_id}</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.84rem', fontWeight: 600 }}>Offered Budget (₹ INR)</label>
              <input
                type="number"
                className="form-control"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.84rem', fontWeight: 600 }}>Purchase Requirements & Notes</label>
              <textarea
                className="form-control"
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Mention intended construction timeline, funding state, or site visit preference..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <SecondaryButton type="button" onClick={() => setShowEnquiryModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" icon={ArrowRight}>Submit Buy Request</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
