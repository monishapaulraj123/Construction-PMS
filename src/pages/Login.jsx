import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, Shield, User, Store, ArrowRight, Lock, Mail } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const [role, setRole] = useState('admin') // 'admin' | 'buyer' | 'seller'
  const [email, setEmail] = useState('admin@constructionpms.in')
  const [password, setPassword] = useState('password123')
  const { login } = useApp()
  const navigate = useNavigate()

  const getRoleHeader = () => {
    switch (role) {
      case 'admin':
        return {
          title: 'Company Administration Login',
          subtitle: 'Manage construction projects, real estate listings, verification pipelines and contractor services.',
          icon: Shield,
          defaultEmail: 'admin@constructionpms.in',
          badgeColor: 'var(--gold-500)',
        }
      case 'buyer':
        return {
          title: 'Buyer Portal Login',
          subtitle: 'Browse available land plots, submit purchase requests and track price negotiations.',
          icon: User,
          defaultEmail: 'buyer@constructionpms.in',
          badgeColor: '#2563eb',
        }
      case 'seller':
        return {
          title: 'Seller Portal Login',
          subtitle: 'Submit land parcels for sale, track DTCP/title verification status and buyer interest.',
          icon: Store,
          defaultEmail: 'seller@constructionpms.in',
          badgeColor: '#16a34a',
        }
      default:
        return { title: 'Login', subtitle: '', icon: Shield, defaultEmail: '', badgeColor: 'var(--gold-500)' }
    }
  }

  const roleMeta = getRoleHeader()
  const RoleIcon = roleMeta.icon

  function handleRoleSwitch(newRole) {
    setRole(newRole)
    if (newRole === 'admin') setEmail('admin@constructionpms.in')
    if (newRole === 'buyer') setEmail('buyer@constructionpms.in')
    if (newRole === 'seller') setEmail('seller@constructionpms.in')
  }

  function handleSubmit(e) {
    e.preventDefault()
    login(role, email || roleMeta.defaultEmail)
    if (role === 'buyer') {
      navigate('/buyer/dashboard')
    } else if (role === 'seller') {
      navigate('/seller/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        background: 'var(--paper)',
        overflowX: 'hidden',
      }}
    >
      {/* Left Half — Full Screen High Quality Image with Minimal Brand Badge */}
      <div
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20, 35, 30, 0.4) 0%, rgba(15, 28, 24, 0.65) 100%), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Brand Logo only - clean & uncluttered */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'var(--gold-500)',
              color: 'var(--forest-950)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.45)',
            }}
          >
            <HardHat size={28} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
              Construction PMS
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--gold-400)', margin: 0, fontWeight: 600 }}>
              & Real Estate Management System
            </p>
          </div>
        </div>

        {/* Bottom subtle copyright tag */}
        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)' }}>
          © Construction Project Management & Real Estate Enterprise Platform
        </div>
      </div>

      {/* Right Half — Full Screen Form Area */}
      <div
        style={{
          padding: '48px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'var(--paper)',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: 460, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink-900)', margin: 0, letterSpacing: '-0.02em' }}>
              Portal Sign In
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--ink-500)', marginTop: 6 }}>
              Select your role context below to sign into your dashboard.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6,
              background: 'var(--cream-100)',
              padding: 4,
              borderRadius: 10,
              marginBottom: 24,
              border: '1px solid var(--line-100)',
            }}
          >
            <button
              type="button"
              className="btn"
              style={{
                padding: '10px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: 8,
                background: role === 'admin' ? 'var(--paper)' : 'transparent',
                color: role === 'admin' ? 'var(--forest-950)' : 'var(--ink-500)',
                boxShadow: role === 'admin' ? 'var(--shadow-card)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => handleRoleSwitch('admin')}
            >
              [ ADMIN ]
            </button>
            <button
              type="button"
              className="btn"
              style={{
                padding: '10px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: 8,
                background: role === 'buyer' ? 'var(--paper)' : 'transparent',
                color: role === 'buyer' ? '#2563eb' : 'var(--ink-500)',
                boxShadow: role === 'buyer' ? 'var(--shadow-card)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => handleRoleSwitch('buyer')}
            >
              [ BUYER ]
            </button>
            <button
              type="button"
              className="btn"
              style={{
                padding: '10px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: 8,
                background: role === 'seller' ? 'var(--paper)' : 'transparent',
                color: role === 'seller' ? '#16a34a' : 'var(--ink-500)',
                boxShadow: role === 'seller' ? 'var(--shadow-card)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => handleRoleSwitch('seller')}
            >
              [ SELLER ]
            </button>
          </div>

          {/* Role Context Banner */}
          <div
            style={{
              background: 'var(--cream-050)',
              padding: '14px 16px',
              borderRadius: 10,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              border: '1px solid var(--line-200)',
              borderLeft: `4px solid ${roleMeta.badgeColor}`,
            }}
          >
            <RoleIcon size={20} color={roleMeta.badgeColor} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                {roleMeta.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: 2, lineHeight: 1.4 }}>
                {roleMeta.subtitle}
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink-700)' }}>
                Email / Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  color="var(--ink-500)"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 8,
                    border: '1px solid var(--line-200)',
                    background: 'var(--paper)',
                    fontSize: '0.88rem',
                    color: 'var(--ink-900)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink-700)' }}>
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Password reset instructions sent to registered email.')
                  }}
                  style={{ fontSize: '0.78rem', color: 'var(--gold-600)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  color="var(--ink-500)"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 8,
                    border: '1px solid var(--line-200)',
                    background: 'var(--paper)',
                    fontSize: '0.88rem',
                    color: 'var(--ink-900)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{
                padding: '13px',
                fontSize: '0.92rem',
                fontWeight: 700,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.25)',
                cursor: 'pointer',
              }}
            >
              Login to Dashboard <ArrowRight size={17} />
            </button>
          </form>

          {/* Quick Demo Selectors */}
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px dashed var(--line-200)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 10 }}>
              Quick Demo Logins
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                onClick={() => {
                  handleRoleSwitch('admin')
                  login('admin')
                  navigate('/')
                }}
              >
                Log in as Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                onClick={() => {
                  handleRoleSwitch('buyer')
                  login('buyer')
                  navigate('/buyer/dashboard')
                }}
              >
                Log in as Buyer
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => {
                  handleRoleSwitch('seller')
                  login('seller')
                  navigate('/seller/dashboard')
                }}
              >
                Log in as Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
