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
import { useTranslation } from '../context/LanguageContext'

export default function Sidebar({ open, hidden, hoverOpen, onNavigate, onMouseEnter, onMouseLeave }) {
  const location = useLocation()
  const { currentUser } = useApp()
  const { t } = useTranslation()
  const userRole = String(currentUser?.role || '').toUpperCase()

  const isClient = userRole === 'CLIENT'

  // Dynamic Standalone link
  const standaloneLink = isClient
    ? { to: '/client/dashboard', label: t('client_dash_title', 'Client Dashboard'), keyLabel: 'client_dash_title', icon: LayoutDashboard, end: true }
    : { to: '/', label: t('dashboard', 'Dashboard'), keyLabel: 'dashboard', icon: LayoutDashboard, end: true }

  // Dynamic Admin sections
  const adminSections = [
    {
      id: 'real_estate',
      label: t('real_estate', 'Real Estate'),
      icon: Building,
      links: [
        { to: '/real-estate/overview', label: t('overview', 'Overview'), icon: LayoutDashboard },
        { to: '/real-estate/properties', label: t('properties', 'Properties'), icon: Building },
        { to: '/real-estate/buy-requests', label: t('buy_requests', 'Buy Requests'), icon: Tag },
        { to: '/real-estate/sell-requests', label: t('sell_requests', 'Sell Requests'), icon: PlusCircle },
        { to: '/real-estate/verification', label: t('verification', 'Verification'), icon: FileCheck2 },
        { to: '/real-estate/negotiations', label: t('negotiations', 'Negotiations'), icon: Scale },
        { to: '/real-estate/transactions', label: t('transactions', 'Transactions'), icon: CreditCard },
      ],
    },
    {
      id: 'services_contracts',
      label: t('services_contracts', 'Services & Contracts'),
      icon: Wrench,
      links: [
        { to: '/services', label: t('services', 'Services'), icon: Wrench },
        { to: '/contracts', label: t('contracts', 'Contracts'), icon: FileText },
        { to: '/work-management', label: t('work_management', 'Work Management'), icon: CheckSquare },
      ],
    },
    {
      id: 'financials',
      label: t('financials', 'Financials'),
      icon: Wallet,
      links: [{ to: '/payments', label: t('payments', 'Payments'), icon: Wallet }],
    },
    {
      id: 'master_data',
      label: t('master_data', 'Master Data'),
      icon: Boxes,
      links: [
        { to: '/employee-types', label: t('employee_types', 'Employee Types'), icon: UserSquare2 },
        { to: '/employees', label: t('employees', 'Employees'), icon: Users },
        { to: '/item-categories', label: t('material_categories', 'Material Categories'), icon: Boxes },
        { to: '/items', label: t('materials', 'Materials'), icon: Package },
        { to: '/suppliers', label: t('suppliers', 'Suppliers'), icon: Truck },
        { to: '/construction-types', label: t('construction_types', 'Construction Types'), icon: Building2 },
        { to: '/project-types', label: t('project_types', 'Project Types'), icon: Home },
        { to: '/construction-stages', label: t('construction_stages', 'Construction Stages'), icon: GanttChartSquare },
        { to: '/clients', label: t('clients', 'Clients'), icon: UserSquare2 },
      ],
    },
    {
      id: 'project_management',
      label: t('project_management', 'Project Management'),
      icon: FolderKanban,
      links: [
        { to: '/projects', label: t('projects', 'Projects'), icon: FolderKanban },
        { to: '/project-planning', label: t('project_planning', 'Project Planning'), icon: CalendarClock },
        { to: '/stage-tracking', label: t('stage_tracking', 'Stage Tracking'), icon: ListChecks },
        { to: '/progress-updates', label: t('progress_updates', 'Progress Updates'), icon: BarChart3 },
        { to: '/site-updates', label: t('site_updates', 'Site Updates'), icon: Camera },
      ],
    },
    {
      id: 'material_management',
      label: t('procurement_inventory', 'Material Management'),
      icon: Package,
      links: [
        { to: '/materials/requests', label: t('material_requests', 'Material Requests'), icon: ClipboardList },
        { to: '/materials/quotations', label: t('quotations', 'Quotations & Approval'), icon: FileSpreadsheet },
        { to: '/materials/orders', label: t('orders', 'Orders'), icon: ShoppingCart },
        { to: '/materials/deliveries', label: t('deliveries', 'Deliveries'), icon: PackageCheck },
        { to: '/materials/inventory', label: t('inventory', 'Inventory'), icon: Warehouse },
      ],
    },
    {
      id: 'quality_reports',
      label: t('quality_control', 'Quality & Reports'),
      icon: ClipboardCheck,
      links: [
        { to: '/inspections', label: t('inspections', 'Inspections'), icon: ClipboardCheck },
        { to: '/rework', label: t('rework', 'Rework'), icon: RotateCcw },
        { to: '/reports', label: t('reports', 'Reports'), icon: BarChart3 },
      ],
    },
  ]

  // Dynamic Client sections
  const clientSections = [
    {
      id: 'buy_sell_activities',
      label: t('buy_requests', 'Buy & Sell Activities'),
      icon: Tag,
      links: [
        { to: '/client/buy', label: t('client_buy_title', 'Buy Land / Property'), icon: Building },
        { to: '/client/sell', label: t('client_sell_title', 'Sell Land / Property'), icon: PlusCircle },
        { to: '/client/requests', label: t('my_requests', 'My Requests'), icon: Tag },
      ],
    },
    {
      id: 'transactions_documents',
      label: t('transactions', 'Transactions & Documents'),
      icon: CreditCard,
      links: [
        { to: '/client/transactions', label: t('my_transactions', 'My Transactions'), icon: CreditCard },
        { to: '/client/documents', label: t('my_documents', 'Documents'), icon: FileText },
        { to: '/client/notifications', label: t('notifications', 'Notifications'), icon: Bell },
        { to: '/client/profile', label: t('profile', 'Profile'), icon: UserCheck },
      ],
    },
  ]

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
      setExpandedSection(activeSec.id)
    }
  }, [location.pathname, userRole])

  const toggleSection = (sectionId) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId))
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
          <p>{t('app_title', 'Construction & Real Estate')}</p>
        </div>
      </div>

      <nav className="sidebar-nav scrollbar-thin">
        {/* Standalone Dashboard Link */}
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
          const isExpanded = expandedSection === section.id
          const hasActiveChild = section.links.some((l) => {
            if (l.end) return l.to === location.pathname
            return location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to))
          })

          return (
            <div className="nav-section-group" key={section.id} style={{ marginBottom: '6px' }}>
              {/* Expandable Main Heading Row */}
              <div
                className="nav-section-heading"
                onClick={() => toggleSection(section.id)}
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
        <NavLink to="/settings" onClick={onNavigate} title={t('settings', 'Settings')} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={17} style={{ flexShrink: 0 }} />
          <span>{t('settings', 'Settings')}</span>
        </NavLink>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {avatarChar}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser?.name ? currentUser.name.split(' ')[0] : t('administrator', 'Administrator')}</div>
            <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>
              {currentUser?.role || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
