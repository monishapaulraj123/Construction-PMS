import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Boxes,
  Package,
  Truck,
  Wrench,
  Building2,
  GanttChartSquare,
  UserSquare2,
  FolderKanban,
  CalendarClock,
  ListChecks,
  Camera,
  ClipboardList,
  FileSpreadsheet,
  ShoppingCart,
  PackageCheck,
  Warehouse,
  ClipboardCheck,
  RotateCcw,
  BarChart3,
  Settings,
  HardHat,
  Home,
  FileText,
  CheckSquare,
  Wallet,
  Building,
  Tag,
  FileCheck2,
  Scale,
  CreditCard,
  PlusCircle,
  Bell,
  UserCheck,
  ChevronRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

// Standalone top link for ADMIN
const adminStandaloneLink = {
  to: '/',
  label: 'Dashboard',
  icon: LayoutDashboard,
  end: true,
}

// Collapsible module sections for ADMIN
const adminSections = [
  {
    label: 'Real Estate',
    icon: Building,
    links: [
      { to: '/real-estate/overview', label: 'Overview', icon: LayoutDashboard },
      { to: '/real-estate/properties', label: 'Properties', icon: Building },
      { to: '/real-estate/buy-requests', label: 'Buy Requests', icon: Tag },
      { to: '/real-estate/sell-requests', label: 'Sell Requests', icon: PlusCircle },
      { to: '/real-estate/verification', label: 'Verification', icon: FileCheck2 },
      { to: '/real-estate/negotiations', label: 'Negotiations', icon: Scale },
      { to: '/real-estate/transactions', label: 'Transactions', icon: CreditCard },
    ],
  },
  {
    label: 'Services & Contracts',
    icon: Wrench,
    links: [
      { to: '/services', label: 'Services', icon: Wrench },
      { to: '/contracts', label: 'Contracts', icon: FileText },
      { to: '/work-management', label: 'Work Management', icon: CheckSquare },
    ],
  },
  {
    label: 'Financials',
    icon: Wallet,
    links: [{ to: '/payments', label: 'Payments', icon: Wallet }],
  },
  {
    label: 'Master Data',
    icon: Boxes,
    links: [
      { to: '/employee-types', label: 'Employee Types', icon: UserSquare2 },
      { to: '/employees', label: 'Employees', icon: Users },
      { to: '/item-categories', label: 'Material Categories', icon: Boxes },
      { to: '/items', label: 'Materials', icon: Package },
      { to: '/suppliers', label: 'Suppliers', icon: Truck },
      { to: '/construction-types', label: 'Construction Types', icon: Building2 },
      { to: '/project-types', label: 'Project Types', icon: Home },
      { to: '/construction-stages', label: 'Construction Stages', icon: GanttChartSquare },
      { to: '/clients', label: 'Clients', icon: UserSquare2 },
    ],
  },
  {
    label: 'Project Management',
    icon: FolderKanban,
    links: [
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/project-planning', label: 'Project Planning', icon: CalendarClock },
      { to: '/stage-tracking', label: 'Stage Tracking', icon: ListChecks },
      { to: '/progress-updates', label: 'Progress Updates', icon: BarChart3 },
      { to: '/site-updates', label: 'Site Updates', icon: Camera },
    ],
  },
  {
    label: 'Material Management',
    icon: Package,
    links: [
      { to: '/materials/requests', label: 'Material Requests', icon: ClipboardList },
      { to: '/materials/quotations', label: 'Quotations & Approval', icon: FileSpreadsheet },
      { to: '/materials/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/materials/deliveries', label: 'Deliveries', icon: PackageCheck },
      { to: '/materials/inventory', label: 'Inventory', icon: Warehouse },
    ],
  },
  {
    label: 'Quality & Reports',
    icon: ClipboardCheck,
    links: [
      { to: '/inspections', label: 'Inspections', icon: ClipboardCheck },
      { to: '/rework', label: 'Rework', icon: RotateCcw },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
]

// Standalone top link for CLIENT
const clientStandaloneLink = {
  to: '/client/dashboard',
  label: 'Client Dashboard',
  icon: LayoutDashboard,
  end: true,
}

// Collapsible module sections for CLIENT
const clientSections = [
  {
    label: 'Buy & Sell Activities',
    icon: Tag,
    links: [
      { to: '/client/buy', label: 'Buy Land / Property', icon: Building },
      { to: '/client/sell', label: 'Sell Land / Property', icon: PlusCircle },
      { to: '/client/requests', label: 'My Requests', icon: Tag },
    ],
  },
  {
    label: 'Transactions & Documents',
    icon: CreditCard,
    links: [
      { to: '/client/transactions', label: 'My Transactions', icon: CreditCard },
      { to: '/client/documents', label: 'Documents', icon: FileText },
      { to: '/client/notifications', label: 'Notifications', icon: Bell },
      { to: '/client/profile', label: 'Profile', icon: UserCheck },
    ],
  },
]

export default function Sidebar({ open, hidden, hoverOpen, onNavigate, onMouseEnter, onMouseLeave }) {
  const location = useLocation()
  const { currentUser } = useApp()
  const userRole = String(currentUser?.role || '').toUpperCase()

  const isClient = userRole === 'CLIENT'
  const standaloneLink = isClient ? clientStandaloneLink : adminStandaloneLink
  const sections = isClient ? clientSections : adminSections

  const [expandedSection, setExpandedSection] = useState(null)

  // Auto-expand section containing current active pathname
  useEffect(() => {
    const currentPath = location.pathname
    const activeSec = sections.find((sec) =>
      sec.links.some((l) => {
        if (l.end) return l.to === currentPath
        return currentPath === l.to || (l.to !== '/' && currentPath.startsWith(l.to))
      })
    )
    if (activeSec) {
      setExpandedSection(activeSec.label)
    }
  }, [location.pathname, userRole])

  const toggleSection = (sectionLabel) => {
    setExpandedSection((prev) => (prev === sectionLabel ? null : sectionLabel))
  }

  const avatarChar = String(currentUser?.name || 'A')[0]?.toUpperCase() || 'A'

  return (
    <aside
      className={`sidebar ${open ? 'open' : ''} ${hidden ? 'hidden' : ''} ${hoverOpen ? 'hover-peek' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <HardHat size={20} />
        </div>
        <div className="sidebar-brand-text">
          <h1>Construction PMS</h1>
          <p>Construction & Real Estate</p>
        </div>
      </div>

      <nav className="sidebar-nav scrollbar-thin">
        {/* Standalone Dashboard Link — ALWAYS visible, standalone, with LayoutDashboard icon */}
        <div style={{ marginBottom: '10px' }}>
          <NavLink
            to={standaloneLink.to}
            end={standaloneLink.end}
            onClick={onNavigate}
            title={standaloneLink.label}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
            <span>{standaloneLink.label}</span>
          </NavLink>
        </div>

        {/* Collapsible Module Sections */}
        {sections.map((section) => {
          const SectionIcon = section.icon || Boxes
          const isExpanded = expandedSection === section.label
          const hasActiveChild = section.links.some((l) => {
            if (l.end) return l.to === location.pathname
            return location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to))
          })

          return (
            <div className="nav-section-group" key={section.label} style={{ marginBottom: '6px' }}>
              {/* Expandable Main Heading Row */}
              <div
                className="nav-section-heading"
                onClick={() => toggleSection(section.label)}
                title={section.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isExpanded ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                  color: hasActiveChild ? 'var(--gold-400, #D4B06A)' : 'rgba(238, 243, 238, 0.78)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <SectionIcon size={17} style={{ flexShrink: 0, opacity: 0.95 }} />
                  <span
                    className="sidebar-section-text"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {section.label}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="sidebar-chevron"
                  style={{
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.8,
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* Collapsible Subdivisions / Child Links */}
              {isExpanded && (
                <div
                  className="sidebar-sub-group"
                  style={{
                    marginTop: '4px',
                    marginBottom: '8px',
                    paddingLeft: '8px',
                    marginLeft: '12px',
                    borderLeft: '2px solid rgba(212, 175, 106, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  {section.links.map((link) => {
                    const IconComp = link.icon
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        onClick={onNavigate}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={{ fontSize: '0.84rem', padding: '8px 10px' }}
                      >
                        {IconComp ? <IconComp size={16} /> : null}
                        <span>{link.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <NavLink to="/settings" onClick={onNavigate} title="Settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={17} style={{ flexShrink: 0 }} />
          <span>Settings</span>
        </NavLink>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {avatarChar}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser?.name ? currentUser.name.split(' ')[0] : 'Administrator'}</div>
            <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>
              {currentUser?.role || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
