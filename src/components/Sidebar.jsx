import { NavLink } from 'react-router-dom'
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
  Eye,
  Bell,
  UserCheck,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const adminSections = [
  {
    label: 'MAIN',
    links: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'REAL ESTATE',
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
    label: 'SERVICES & CONTRACTS',
    links: [
      { to: '/services', label: 'Services', icon: Wrench },
      { to: '/contracts', label: 'Contracts', icon: FileText },
      { to: '/work-management', label: 'Work Management', icon: CheckSquare },
    ],
  },
  {
    label: 'FINANCIALS',
    links: [{ to: '/payments', label: 'Payments', icon: Wallet }],
  },
  {
    label: 'MASTER DATA',
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
    label: 'PROJECT MANAGEMENT',
    links: [
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/project-planning', label: 'Project Planning', icon: CalendarClock },
      { to: '/stage-tracking', label: 'Stage Tracking', icon: ListChecks },
      { to: '/progress-updates', label: 'Progress Updates', icon: BarChart3 },
      { to: '/site-updates', label: 'Site Updates', icon: Camera },
    ],
  },
  {
    label: 'MATERIAL MANAGEMENT',
    links: [
      { to: '/materials/requests', label: 'Material Requests', icon: ClipboardList },
      { to: '/materials/quotations', label: 'Quotations & Approval', icon: FileSpreadsheet },
      { to: '/materials/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/materials/deliveries', label: 'Deliveries', icon: PackageCheck },
      { to: '/materials/inventory', label: 'Inventory', icon: Warehouse },
    ],
  },
  {
    label: 'QUALITY & REPORTS',
    links: [
      { to: '/inspections', label: 'Inspections', icon: ClipboardCheck },
      { to: '/rework', label: 'Rework', icon: RotateCcw },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
]

const buyerSections = [
  {
    label: 'BUYER PORTAL',
    links: [
      { to: '/buyer/dashboard', label: 'Buyer Dashboard', icon: LayoutDashboard, end: true },
      { to: '/buyer/properties', label: 'Available Properties', icon: Building },
      { to: '/buyer/requests', label: 'My Buy Requests', icon: Tag },
      { to: '/buyer/negotiations', label: 'Negotiations', icon: Scale },
      { to: '/buyer/transactions', label: 'Current Transactions', icon: CreditCard },
      { to: '/buyer/documents', label: 'Documents', icon: FileText },
      { to: '/buyer/notifications', label: 'Notifications', icon: Bell },
      { to: '/buyer/profile', label: 'Profile', icon: UserCheck },
    ],
  },
]

const sellerSections = [
  {
    label: 'SELLER PORTAL',
    links: [
      { to: '/seller/dashboard', label: 'Seller Dashboard', icon: LayoutDashboard, end: true },
      { to: '/seller/properties', label: 'My Properties', icon: Building },
      { to: '/seller/requests', label: 'My Sell Requests', icon: PlusCircle },
      { to: '/seller/verification', label: 'Verification Status', icon: FileCheck2 },
      { to: '/seller/buyer-interest', label: 'Buyer Interest', icon: Eye },
      { to: '/seller/negotiations', label: 'Negotiations', icon: Scale },
      { to: '/seller/transactions', label: 'Transactions', icon: CreditCard },
      { to: '/seller/documents', label: 'Documents', icon: FileText },
      { to: '/seller/notifications', label: 'Notifications', icon: Bell },
      { to: '/seller/profile', label: 'Profile', icon: UserCheck },
    ],
  },
]

export default function Sidebar({ open, onNavigate }) {
  const { currentUser } = useApp()

  let sections = adminSections
  if (currentUser?.role === 'buyer') {
    sections = buyerSections
  } else if (currentUser?.role === 'seller') {
    sections = sellerSections
  }

  const avatarChar = String(currentUser?.name || 'A')[0]?.toUpperCase() || 'A'

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
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
        {sections.map((section) => (
          <div className="nav-section" key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.links.map((link) => {
              const IconComp = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={onNavigate}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {IconComp ? <IconComp size={17} /> : null}
                  {link.label}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={17} />
          Settings
        </NavLink>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {avatarChar}
          </div>
          <div>
            <div className="sidebar-user-name">{currentUser?.name || 'Administrator'}</div>
            <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>
              {currentUser?.role || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
