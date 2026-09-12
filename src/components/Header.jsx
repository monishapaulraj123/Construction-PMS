import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Bell, MessageSquare, ChevronDown } from 'lucide-react'
import SearchBar from './SearchBar'
import NotificationPanel from './NotificationPanel'
import { getPageMeta } from '../data/pageMeta'

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const { title, description } = getPageMeta(location.pathname)
  const [showNotif, setShowNotif] = useState(false)

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
        <SearchBar placeholder="Search projects, clients, materials..." />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div className="sidebar-user-avatar" style={{ width: 36, height: 36 }}>
            A
          </div>
          <div className="hide-on-mobile" style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Administrator</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>Admin</div>
          </div>
          <ChevronDown size={15} color="var(--ink-500)" />
        </div>
      </div>
    </header>
  )
}
