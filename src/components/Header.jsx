import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, MessageSquare, ChevronDown, LogOut, User } from 'lucide-react'
import SearchBar from './SearchBar'
import NotificationPanel from './NotificationPanel'
import { getPageMeta } from '../data/pageMeta'
import { useApp } from '../context/AppContext'

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useApp()
  const { title, description } = getPageMeta(location.pathname)
  const [showNotif, setShowNotif] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserDropdown(false)
    navigate('/login')
  }

  const userRole = String(currentUser?.role || '').toUpperCase()

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
                borderRadius: '50%',
                background: '#F5F0E6',
                color: '#2F5D50',
                border: '1.5px solid #D4B06A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0,
              }}
            >
              {(currentUser?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="hide-on-mobile" style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{currentUser?.name ? currentUser.name.split(' ')[0] : 'Administrator'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>
                Role: <strong>{userRole || 'ADMIN'}</strong>
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
              <div style={{ padding: '6px 10px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                {currentUser?.name}
              </div>
              <div style={{ padding: '0 10px 8px 10px', fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                {currentUser?.email}
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--cream-200)', margin: '4px 0 8px 0' }} />
              
              {userRole === 'CLIENT' && (
                <button
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: 8,
                    fontSize: '0.82rem',
                    padding: '8px 10px',
                    marginBottom: 4,
                  }}
                  onClick={() => {
                    setShowUserDropdown(false)
                    navigate('/client/profile')
                  }}
                >
                  <User size={15} /> My Client Profile
                </button>
              )}

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
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
