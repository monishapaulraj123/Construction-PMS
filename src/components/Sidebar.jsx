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
  Landmark,
  ShoppingBag,
  FileText,
  CheckSquare,
  Wallet,
} from 'lucide-react'

const sections = [
  {
    label: 'MAIN',
    links: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'REAL ESTATE',
    links: [
      { to: '/real-estate/land-buying', label: 'Land Buying', icon: Landmark },
      { to: '/real-estate/land-sales', label: 'Land Sales', icon: ShoppingBag },
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

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <HardHat size={20} />
        </div>
        <div className="sidebar-brand-text">
          <h1>Construction PMS</h1>
          <p>Construction Project Management System</p>
        </div>
      </div>

      <nav className="sidebar-nav scrollbar-thin">
        {sections.map((section) => (
          <div className="nav-section" key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onNavigate}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <link.icon size={17} />
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={17} />
          Settings
        </NavLink>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">A</div>
          <div>
            <div className="sidebar-user-name">Administrator</div>
            <div className="sidebar-user-role">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
