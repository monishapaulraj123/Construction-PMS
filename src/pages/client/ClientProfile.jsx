import { useState } from 'react'
import { UserCheck, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { PrimaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ToastContext'

export default function ClientProfile() {
  const { currentUser } = useApp()
  const showToast = useToast()

  const [name, setName] = useState(currentUser?.name || 'Client User')
  const [email] = useState(currentUser?.email || 'client@example.com')
  const [phone, setPhone] = useState(currentUser?.phone || '9840001122')

  function handleSave(e) {
    e.preventDefault()
    showToast('Profile information updated successfully!')
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Client Profile</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Manage client identity details, contact information and communication preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#2563eb',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
            }}
          >
            {(name || 'C')[0].toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{name}</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginTop: 2 }}>
              Account Role: <strong>{currentUser?.role || 'CLIENT'}</strong> | Client ID: #{currentUser?.user_id || 501}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.84rem', fontWeight: 600 }}>Full Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.84rem', fontWeight: 600 }}>Email Address (Account Username)</label>
          <input
            type="email"
            className="form-control"
            value={email}
            disabled
            style={{ background: 'var(--cream-100)', cursor: 'not-allowed' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.84rem', fontWeight: 600 }}>Phone Number</label>
          <input
            type="text"
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PrimaryButton type="submit">Save Changes</PrimaryButton>
        </div>
      </form>
    </div>
  )
}
