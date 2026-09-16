import { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  FileCheck2, 
  Sparkles, 
  Lock, 
  Bell, 
  Save,
  BadgeCheck,
  Building,
  KeyRound
} from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ToastContext'

export default function ClientProfile() {
  const { currentUser } = useApp()
  const showToast = useToast()

  const [name, setName] = useState(currentUser?.name || 'Ravi Kumar')
  const [email] = useState(currentUser?.email || 'client@example.com')
  const [phone, setPhone] = useState(currentUser?.phone || '9840001122')
  const [altPhone, setAltPhone] = useState('9840099887')
  const [idType, setIdType] = useState('Aadhaar Card')
  const [idNumber, setIdNumber] = useState('4890 2210 8821')
  const [address, setAddress] = useState('Plot No. 14, Sea View Layout, ECR Main Road')
  const [city, setCity] = useState('Kottivakkam')
  const [district, setDistrict] = useState('Chennai')
  const [state, setState] = useState('Tamil Nadu')
  const [pincode, setPincode] = useState('600041')
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(true)

  function handleSave(e) {
    e.preventDefault()
    showToast('Client Profile updated successfully!')
  }

  const roleName = currentUser?.role === 'BUYER' ? 'Registered Land Buyer' : currentUser?.role === 'SELLER' ? 'Property Landowner / Seller' : 'Verified Client Member'

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', paddingBottom: 40 }}>
      {/* Hero Profile Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A34 0%, #2F5D50 55%, #17322B 100%)',
          borderRadius: '20px',
          padding: '32px',
          color: '#ffffff',
          marginBottom: 24,
          boxShadow: '0 12px 28px -6px rgba(30, 58, 52, 0.28)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar Badge */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4B06A 0%, #AA823B 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                fontWeight: 800,
                boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                border: '3px solid #ffffff',
                flexShrink: 0,
              }}
            >
              {(name || 'C')[0].toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  {name}
                </h1>
                <span
                  style={{
                    background: 'rgba(220, 252, 231, 0.2)',
                    border: '1px solid rgba(220, 252, 231, 0.4)',
                    color: '#86EFAC',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <BadgeCheck size={14} /> Verified Account
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.82)', marginTop: 4 }}>
                {roleName} · Client ID: <strong style={{ color: '#D4B06A' }}>#{currentUser?.user_id || '501'}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: 2 }}>
                {email} · {phone}
              </div>
            </div>
          </div>

          {/* Client Account Overview Pill Cards */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '12px',
                padding: '10px 16px',
                textAlign: 'center',
                minWidth: 100,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: '#D4B06A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                KYC Status
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ShieldCheck size={14} style={{ color: '#86EFAC' }} /> Approved
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '12px',
                padding: '10px 16px',
                textAlign: 'center',
                minWidth: 100,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: '#D4B06A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Account Level
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                Gold Member
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background circle */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 176, 106, 0.16) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* CARD 1: Personal & Contact Information */}
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
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                1. Personal Details & Contact Information
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, marginTop: 2 }}>
                Update full legal name, phone numbers and registered account identity.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Full Legal Name <span style={{ color: '#EF4444' }}>*</span>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Email Address (Primary Login ID)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '0.92rem',
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      cursor: 'not-allowed',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    value={email}
                    disabled
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.72rem',
                      color: '#166534',
                      background: '#DCFCE7',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Primary Phone Number <span style={{ color: '#EF4444' }}>*</span>
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Alternative Contact / WhatsApp No.
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
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: KYD / Identity Verification & Address */}
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
              <FileCheck2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                2. Identity Verification & Residential Address
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, marginTop: 2 }}>
                Government identification numbers and permanent residential address details.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Government Identity Document Type
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
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  ID Document Reference Number
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
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                Residential Street Address
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
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* 3 Column Grid: City, District/State, Pincode */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  City / Locality
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
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  District & State
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
                  value={`${district}, ${state}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',')
                    setDistrict(parts[0] || '')
                    if (parts[1]) setState(parts[1].trim())
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                  Pincode
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
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Communication & Security Preferences */}
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
              <Bell size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                3. Notification Preferences & Security
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, marginTop: 2 }}>
                Configure real-time property verification alerts, negotiation updates, and account security.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* WhatsApp Notifications */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={notifyWhatsapp}
                onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#2F5D50' }}
              />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', display: 'block' }}>
                  WhatsApp Status Alerts
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Receive instant buy request & title approval updates on WhatsApp.
                </span>
              </div>
            </label>

            {/* Email Digest */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#2F5D50' }}
              />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', display: 'block' }}>
                  Email Notifications
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Receive formal transaction receipts & legal document copies via email.
                </span>
              </div>
            </label>
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
            <span>Your client profile identity & contact details are encrypted & secured.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <PrimaryButton type="submit" icon={CheckCircle2}>
              Save Profile Changes
            </PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  )
}
