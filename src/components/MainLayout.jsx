import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [hoverOpen, setHoverOpen] = useState(false)

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 900) {
      setMobileOpen((prev) => !prev)
    } else {
      setSidebarHidden((prev) => !prev)
      setHoverOpen(false)
    }
  }

  const handleNavigate = () => {
    setMobileOpen(false)
    setHoverOpen(false)
  }

  return (
    <div className={`app-shell ${sidebarHidden ? 'sidebar-collapsed' : ''}`}>
      {/* Left-edge 28px hover trigger zone spanning full vertical height when sidebar is hidden */}
      {sidebarHidden && (
        <div
          className="left-edge-hover-trigger"
          onMouseEnter={() => setHoverOpen(true)}
        />
      )}

      <Sidebar
        open={mobileOpen}
        hidden={sidebarHidden}
        hoverOpen={hoverOpen}
        onNavigate={handleNavigate}
        onMouseEnter={() => {
          if (sidebarHidden) setHoverOpen(true)
        }}
        onMouseLeave={() => {
          if (sidebarHidden) setHoverOpen(false)
        }}
      />

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div
        className="app-main"
        style={{
          marginLeft: sidebarHidden ? (hoverOpen ? '264px' : '68px') : undefined,
        }}
      >
        <Header onMenuClick={handleToggleSidebar} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
