import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, currentUser } = useApp()
  const navigate = useNavigate()

  // If already logged in, redirect based on stored role
  if (currentUser) {
    if (currentUser.role === 'ADMIN') {
      navigate('/', { replace: true })
    } else if (currentUser.role === 'CLIENT') {
      navigate('/client/dashboard', { replace: true })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const res = login(email, password)
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please check your credentials.')
      return
    }

    if (res.user.role === 'ADMIN') {
      navigate('/')
    } else if (res.user.role === 'CLIENT') {
      navigate('/client/dashboard')
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        background: '#FAF8F3',
        overflowX: 'hidden',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Left Side — User Uploaded Green Modern House Image with #2F5D50 Overlay */}
      <div
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(35, 68, 58, 0.35) 0%, rgba(20, 45, 38, 0.65) 100%), url('/images/login-house.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Top-Left Branding ONLY */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: '#2F5D50',
              border: '2px solid #D4B06A',
              color: '#D4B06A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(47, 93, 80, 0.3)',
              flexShrink: 0,
            }}
          >
            <Building2 size={26} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.65rem',
                fontWeight: 700,
                margin: 0,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                lineHeight: 1.15,
              }}
            >
              Construction PMS
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#D4B06A', margin: '3px 0 0 0', fontWeight: 600, letterSpacing: '0.01em' }}>
              & Real Estate Management System
            </p>
          </div>
        </div>

        {/* Clean Building Image Body — ALL middle/bottom hero text & icon badges REMOVED as required */}

        {/* Bottom Copyright Tag */}
        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
          © Construction Project Management & Real Estate Enterprise Platform
        </div>
      </div>

      {/* Right Side — Premium Clean Login Panel */}
      <div
        style={{
          padding: '48px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#FAF8F3',
          minHeight: '100vh',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Top-Right Decorative Corner Wave Accent */}
        <svg
          style={{ position: 'absolute', top: 0, right: 0, width: 180, height: 180, pointerEvents: 'none', opacity: 0.85 }}
          viewBox="0 0 200 200"
          fill="none"
        >
          <path d="M200 0H70C140 30 180 90 200 170V0Z" fill="#2F5D50" />
          <path d="M200 0H110C160 40 185 100 200 140V0Z" fill="#D4B06A" opacity="0.4" />
        </svg>

        {/* Bottom-Right Architectural Line Art Background Accent */}
        <svg
          style={{ position: 'absolute', bottom: 0, right: 0, width: 220, height: 220, pointerEvents: 'none', opacity: 0.1 }}
          viewBox="0 0 200 200"
          fill="none"
          stroke="#2F5D50"
          strokeWidth="1"
        >
          <path d="M20 180 L180 180 M40 180 L40 60 L120 20 L180 60 L180 180 M40 100 L180 100 M40 140 L180 140 M100 180 L100 60" />
        </svg>

        <div style={{ maxWidth: 410, width: '100%', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Top Header — Logo Mark + Construction PMS Title ONLY (NO "LOGIN TO DASHBOARD" subtitle) */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ height: 1, width: 44, background: '#D4B06A' }} />
              <Building2 size={32} color="#D4B06A" />
              <div style={{ height: 1, width: 44, background: '#D4B06A' }} />
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '2.15rem',
                fontWeight: 800,
                color: '#2F5D50',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Construction PMS
            </h2>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 22,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#b91c1c',
                fontSize: '0.84rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#2D3748',
                }}
              >
                Email / Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#2F5D50"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}
                />
                <input
                  type="text"
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 8,
                    border: '1px solid #E2DCD2',
                    background: '#F6F2EA',
                    fontSize: '0.9rem',
                    color: '#1F2937',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2F5D50'
                    e.target.style.background = '#FFFFFF'
                    e.target.style.boxShadow = '0 0 0 3px rgba(47, 93, 80, 0.12)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2DCD2'
                    e.target.style.background = '#F6F2EA'
                    e.target.style.boxShadow = 'none'
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#2D3748' }}>
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Password reset instructions sent to registered email.')
                  }}
                  style={{ fontSize: '0.78rem', color: '#D4B06A', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="#2F5D50"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    borderRadius: 8,
                    border: '1px solid #E2DCD2',
                    background: '#F6F2EA',
                    fontSize: '0.9rem',
                    color: '#1F2937',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2F5D50'
                    e.target.style.background = '#FFFFFF'
                    e.target.style.boxShadow = '0 0 0 3px rgba(47, 93, 80, 0.12)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2DCD2'
                    e.target.style.background = '#F6F2EA'
                    e.target.style.boxShadow = 'none'
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#A09686',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Submit Button — ONLY place where "Login to Dashboard" appears */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: '#2F5D50',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 700,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 4px 14px rgba(47, 93, 80, 0.28)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#24493f'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(47, 93, 80, 0.38)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2F5D50'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(47, 93, 80, 0.28)'
              }}
            >
              <span>Login to Dashboard</span>
              <span style={{ color: '#D4B06A', fontWeight: 800, fontSize: '1.1rem' }}>→</span>
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '26px 0', color: '#9E9484', fontSize: '0.78rem', fontWeight: 600 }}>
            <div style={{ flex: 1, height: '1px', background: '#E5DFD5' }} />
            <span style={{ padding: '0 14px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#E5DFD5' }} />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => alert('Google authentication is currently unavailable. Please log in with your email and password.')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#FFFFFF',
              border: '1px solid #D4B06A',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#1F2937',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FAF8F3'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 106, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF'
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.03)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}
