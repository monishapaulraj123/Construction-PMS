import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  MapPin, 
  Ruler, 
  Coins, 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  ArrowLeft
} from 'lucide-react'
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

  function formatCurrency(val) {
    const num = parseFloat(val)
    if (isNaN(num) || num === 0) return '₹ 0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num)
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
    <div style={{ maxWidth: 940, margin: '0 auto', paddingBottom: 40 }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={() => navigate('/client/dashboard')}
          style={{
            background: 'var(--paper, #ffffff)',
            border: '1px solid var(--line-200, #E2E8F0)',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--ink-700, #334155)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Hero Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A34 0%, #2F5D50 60%, #17322B 100%)',
          borderRadius: '16px',
          padding: '30px 36px',
          color: '#ffffff',
          marginBottom: 24,
          boxShadow: '0 12px 28px -6px rgba(30, 58, 52, 0.28)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(212, 176, 106, 0.2)',
              border: '1px solid rgba(212, 176, 106, 0.4)',
              color: '#D4B06A',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            <Sparkles size={13} /> Seller Property Listing Portal
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Sell Land / Property
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.85)', maxWidth: 660, lineHeight: 1.5, margin: 0 }}>
            Submit land details, survey numbers, title deed documents, and asking price. Once submitted, our team will review the title deed and publish your property for verified buyers.
          </p>
        </div>

        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-30px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 176, 106, 0.18) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Authenticated Seller Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '18px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2F5D50 0%, #1E3A34 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.15rem',
              boxShadow: '0 4px 12px rgba(47, 93, 80, 0.25)',
            }}
          >
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'S'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0F172A' }}>
                {currentUser?.name || 'Client Seller'}
              </span>
              <span
                style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <UserCheck size={12} /> Verified Seller
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 3 }}>
              {currentUser?.email || 'seller@client.com'} · {currentUser?.phone || '+91 98400 09988'}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: '0.82rem',
            background: '#F8FAFC',
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div>
            <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Client ID
            </span>
            <strong style={{ color: '#1E293B', fontSize: '0.9rem' }}>#{currentUser?.user_id || '101'}</strong>
          </div>
          <div style={{ height: 28, width: 1, background: '#CBD5E1' }} />
          <div>
            <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verification Workflow
            </span>
            <strong style={{ color: '#D97706', fontSize: '0.9rem' }}>Admin Title Review</strong>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* SECTION 1: Property Identification & Legal Details */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: '#F0FDF4',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(22, 101, 52, 0.1)',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                1. Property Identification & Classification
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, marginTop: 2 }}>
                Enter official title name, land type, and official Patta / Survey details.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Property Title Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                Property Title / Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                placeholder="e.g. ECR Sea View Gated Layout Plot #12"
                value={formData.property_name}
                onChange={(e) => handleChange('property_name', e.target.value)}
                required
              />
            </div>

            {/* Grid 2 Column: Property Type & Survey Number */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Property Type <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                  value={formData.property_type}
                  onChange={(e) => handleChange('property_type', e.target.value)}
                >
                  <option value="Plot / Land">Plot / Land</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="Agricultural Land">Agricultural Land</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Survey / Patta Number <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g. SY-142/3A"
                  value={formData.survey_number}
                  onChange={(e) => handleChange('survey_number', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Title Deed Reference No */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                Title Deed / Registration Reference No.
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g. DOC-ECR-2025-8812"
                value={formData.document_reference}
                onChange={(e) => handleChange('document_reference', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Location & Address */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(217, 119, 6, 0.1)',
              }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                2. Location & Geographical Address
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, marginTop: 2 }}>
                Provide exact site locality, street address, district, state and pincode.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Street / Locality */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                Street / Locality Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g. No. 45 Kottivakkam, ECR Main Road"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </div>

            {/* 3 Column Balanced Grid: District, State, Pincode */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  District <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  State <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Pincode <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="600041"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Dimensions & Price Calculator */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
              }}
            >
              <Ruler size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                3. Land Area Dimensions & Expected Price
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, marginTop: 2 }}>
                Specify plot area, measurement unit, expected rate per unit, and total valuation.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Grid 2 Column: Land Area & Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Land Area Measurement <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g. 2400"
                  value={formData.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Measurement Unit <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                >
                  <option value="Sq. Ft">Sq. Ft</option>
                  <option value="Acres">Acres</option>
                  <option value="Cents">Cents</option>
                  <option value="Grounds">Grounds</option>
                </select>
              </div>
            </div>

            {/* Grid 2 Column: Expected Rate & Total Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Expected Rate / {formData.unit} (₹) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g. 4200"
                  value={formData.rate_per_unit}
                  onChange={(e) => handleChange('rate_per_unit', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Total Asking Price (₹ INR) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #D4B06A',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#1E3A34',
                    backgroundColor: '#FCFBF7',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={formData.total_amount}
                  onChange={(e) => handleChange('total_amount', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Price Preview Valuation Badge */}
            {formData.total_amount ? (
              <div
                style={{
                  background: 'linear-gradient(135deg, #1E3A34 0%, #2F5D50 100%)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  boxShadow: '0 4px 14px rgba(30, 58, 52, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(212, 176, 106, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={20} style={{ color: '#D4B06A' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#D4B06A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Calculated Total Valuation
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                      {formatCurrency(formData.total_amount)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', textAlign: 'right' }}>
                  {formData.area} {formData.unit} × ₹{formData.rate_per_unit} / {formData.unit}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* SECTION 4: Description & Highlights */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: '#F3E8FF',
                color: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(126, 34, 206, 0.1)',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                4. Property Highlights & Key Descriptions
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, marginTop: 2 }}>
                Describe road width, DTCP/CMDA sanction state, boundary wall, corner plot details, etc.
              </p>
            </div>
          </div>

          <div>
            <textarea
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.92rem',
                minHeight: 120,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., 40ft wide blacktop road frontage, DTCP approved residential layout, clear single-owner Patta deed, fully fenced compound wall, 2 km from highway..."
            />
          </div>
        </div>

        {/* Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            padding: '20px 28px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#475569' }}>
            <ShieldCheck size={20} style={{ color: '#166534', flexShrink: 0 }} />
            <span>Title verification will be initiated immediately by Admin upon submission.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <SecondaryButton type="button" onClick={() => navigate('/client/dashboard')}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" icon={UploadCloud}>
              Submit Property for Verification
            </PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  )
}
