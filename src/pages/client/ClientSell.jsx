import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Upload, CheckCircle2, FileCheck2, Building, ArrowRight } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ToastContext'

export default function ClientSell() {
  const { submitSellProperty, currentUser } = useApp()
  const navigate = useNavigate()
  const showToast = useToast()

  const [formData, setFormData] = useState({
    property_name: '',
    property_type: 'Plot / Land',
    survey_number: '',
    location: '',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    area: '',
    unit: 'Sq. Ft',
    rate_per_unit: '',
    total_amount: '',
    document_reference: '',
    description: '',
  })

  function handleChange(field, val) {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val }
      if (field === 'area' || field === 'rate_per_unit') {
        const a = parseFloat(field === 'area' ? val : prev.area) || 0
        const r = parseFloat(field === 'rate_per_unit' ? val : prev.rate_per_unit) || 0
        if (a && r) {
          updated.total_amount = Math.round(a * r)
        }
      }
      return updated
    })
  }

  function handleSubmit(e) {
    e.preventDefault()

    submitSellProperty({
      property_name: formData.property_name,
      property_type: formData.property_type,
      survey_number: formData.survey_number,
      location: formData.location,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
      area: parseFloat(formData.area) || 0,
      unit: formData.unit,
      rate_per_unit: parseFloat(formData.rate_per_unit) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
      seller_id: currentUser?.user_id,
      seller_name: currentUser?.name || 'Client Seller',
      seller_email: currentUser?.email,
      seller_phone: currentUser?.phone || '9840009988',
      document_reference: formData.document_reference || `DOC-${Date.now().toString().slice(-6)}`,
      description: formData.description,
    })

    showToast('Land plot submitted successfully for Admin title verification!')
    navigate('/client/requests')
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sell Land / Property</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Submit land details, survey numbers, title documents and expected pricing for Admin verification & publishing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
        {/* Owner Info Banner */}
        <div style={{ background: 'var(--cream-50)', padding: 14, borderRadius: 8, border: '1px solid var(--cream-200)', marginBottom: 20 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-gold)', textTransform: 'uppercase', marginBottom: 4 }}>
            Authenticated Seller Info
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: '0.82rem' }}>
            <div><strong>Seller Name:</strong> {currentUser?.name}</div>
            <div><strong>Email:</strong> {currentUser?.email}</div>
            <div><strong>Phone:</strong> {currentUser?.phone || '9840009988'}</div>
            <div><strong>Client ID:</strong> #{currentUser?.user_id}</div>
          </div>
        </div>

        {/* Section 1: Property Identification */}
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: 14, color: 'var(--ink-900)' }}>
          1. Property Identification & Classification
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Property Title / Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. ECR Sea View Layout Plot #12"
              value={formData.property_name}
              onChange={(e) => handleChange('property_name', e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Property Type</label>
            <select
              className="form-control"
              value={formData.property_type}
              onChange={(e) => handleChange('property_type', e.target.value)}
            >
              <option value="Plot / Land">Plot / Land</option>
              <option value="Residential Plot">Residential Plot</option>
              <option value="Commercial Plot">Commercial Plot</option>
              <option value="Agricultural Land">Agricultural Land</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Survey / Patta Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SY-142/3A"
              value={formData.survey_number}
              onChange={(e) => handleChange('survey_number', e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Title Deed Reference No.</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. DOC-ECR-2025-8812"
              value={formData.document_reference}
              onChange={(e) => handleChange('document_reference', e.target.value)}
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--cream-200)', margin: '20px 0' }} />

        {/* Section 2: Location & Area */}
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: 14, color: 'var(--ink-900)' }}>
          2. Location & Dimensions
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Street / Locality</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Kottivakkam, ECR Road"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>District</label>
            <input
              type="text"
              className="form-control"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>State</label>
            <input
              type="text"
              className="form-control"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Pincode</label>
            <input
              type="text"
              className="form-control"
              placeholder="600041"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 2fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Land Area</label>
            <input
              type="number"
              className="form-control"
              placeholder="2400"
              value={formData.area}
              onChange={(e) => handleChange('area', e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Unit</label>
            <select
              className="form-control"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            >
              <option value="Sq. Ft">Sq. Ft</option>
              <option value="Acres">Acres</option>
              <option value="Cents">Cents</option>
              <option value="Grounds">Grounds</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Expected Rate / Unit</label>
            <input
              type="number"
              className="form-control"
              placeholder="4200"
              value={formData.rate_per_unit}
              onChange={(e) => handleChange('rate_per_unit', e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Total Asking Price (₹ INR)</label>
            <input
              type="number"
              className="form-control"
              style={{ fontWeight: 700, color: 'var(--brand-gold)' }}
              value={formData.total_amount}
              onChange={(e) => handleChange('total_amount', e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>Property Description & Highlights</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe road access width, DTCP/CMDA sanction state, boundary wall, corner plot details..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <SecondaryButton type="button" onClick={() => navigate('/client/dashboard')}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" icon={Upload}>
            Submit Property for Verification
          </PrimaryButton>
        </div>
      </form>
    </div>
  )
}
