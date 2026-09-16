import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, MessageSquare, ChevronDown, LogOut, Shield, User, Store } from 'lucide-react'
import SearchBar from './SearchBar'
import NotificationPanel from './NotificationPanel'
import { getPageMeta } from '../data/pageMeta'
import { useApp } from '../context/AppContext'

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, login, logout } = useApp()
  const { title, description } = getPageMeta(location.pathname)
  const [showNotif, setShowNotif] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const handleRoleSwitch = (newRole) => {
    login(newRole)
    setShowUserDropdown(false)
    if (newRole === 'buyer') navigate('/buyer/dashboard')
    else if (newRole === 'seller') navigate('/seller/dashboard')
    else navigate('/real-estate/overview')
  }

  const handleLogout = () => {
    logout()
    setShowUserDropdown(false)
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button className="icon-btn menu-toggle" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="app-header-title">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="app-header-search">
        <SearchBar placeholder="Search projects, properties, clients, materials..." />
      </div>

      <div className="app-header-actions">
        <div className="header-pop-wrap">
          <button className="icon-btn" onClick={() => setShowNotif((s) => !s)} aria-label="Notifications">
            <Bell size={17} />
            <span className="dot" />
          </button>
          {showNotif && <NotificationPanel />}
        </div>
        <button className="icon-btn" aria-label="Messages">
          <MessageSquare size={17} />
        </button>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserDropdown((s) => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}
          >
            <div
              className="sidebar-user-avatar"
              style={{
                width: 36,
                height: 36,
                background:
                  currentUser?.role === 'buyer'
                    ? '#2563eb'
                    : currentUser?.role === 'seller'
                    ? '#16a34a'
                    : 'var(--brand-gold)',
              }}
            >
              {(currentUser?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="hide-on-mobile" style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{currentUser?.name || 'Administrator'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)', textTransform: 'capitalize' }}>
                Role: <strong>{currentUser?.role || 'Admin'}</strong>
              </div>
            </div>
            <ChevronDown size={15} color="var(--ink-500)" />
          </div>

          {showUserDropdown && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: 220,
                padding: 10,
                zIndex: 100,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase' }}>
                Switch Account Role
              </div>
              <button
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  gap: 8,
                  fontSize: '0.82rem',
                  padding: '8px 10px',
                  background: currentUser?.role === 'admin' ? 'var(--cream-100)' : 'transparent',
                }}
                onClick={() => handleRoleSwitch('admin')}
              >
                <Shield size={15} color="var(--brand-gold)" /> Admin Account
              </button>
              <button
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  gap: 8,
                  fontSize: '0.82rem',
                  padding: '8px 10px',
                  background: currentUser?.role === 'buyer' ? 'var(--cream-100)' : 'transparent',
                }}
                onClick={() => handleRoleSwitch('buyer')}
              >
                <User size={15} color="#2563eb" /> Buyer Account
              </button>
              <button
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  gap: 8,
                  fontSize: '0.82rem',
                  padding: '8px 10px',
                  background: currentUser?.role === 'seller' ? 'var(--cream-100)' : 'transparent',
                }}
                onClick={() => handleRoleSwitch('seller')}
              >
                <Store size={15} color="#16a34a" /> Seller Account
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid var(--cream-200)', margin: '6px 0' }} />
              <button
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  gap: 8,
                  fontSize: '0.82rem',
                  padding: '8px 10px',
                  color: 'var(--coral-500)',
                }}
                onClick={handleLogout}
              >
                <LogOut size={15} /> Logout to Login Screen
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
