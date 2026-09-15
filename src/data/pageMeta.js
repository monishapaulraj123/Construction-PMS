const meta = [
  { pattern: /^\/$/, title: 'Dashboard', description: 'Overview of your construction projects, teams, materials and site activities.' },
  { pattern: /^\/employee-types/, title: 'Employee Types', description: 'Manage the employee type master used across the workforce.' },
  { pattern: /^\/employees/, title: 'Employees', description: 'Manage engineers, supervisors and site workforce records.' },
  { pattern: /^\/item-categories/, title: 'Material Categories', description: 'Organize materials into categories for faster procurement.' },
  { pattern: /^\/items/, title: 'Materials', description: 'Manage the material catalogue, rates and stock thresholds.' },
  { pattern: /^\/suppliers/, title: 'Suppliers', description: 'Manage supplier records, categories and contact details.' },
  { pattern: /^\/services/, title: 'Services', description: 'Manage service offerings, rates and estimated durations.' },
  { pattern: /^\/construction-types/, title: 'Construction Types', description: 'Define the construction types supported by your organization.' },
  { pattern: /^\/project-types/, title: 'Project Types', description: 'Manage project and home types (villas, apartments, gated communities, commercial units).' },
  { pattern: /^\/construction-stages/, title: 'Construction Stages', description: 'Configure the stage sequence for each construction type.' },
  { pattern: /^\/clients$/, title: 'Clients', description: 'Manage client records across individuals, companies and government bodies.' },
  { pattern: /^\/projects\/[^/]+/, title: 'Project Details', description: 'Full overview, stages, materials and progress for this project.' },
  { pattern: /^\/projects/, title: 'Projects', description: 'Track every active, planned and completed construction project.' },
  { pattern: /^\/project-planning/, title: 'Project Planning', description: 'Plan schedules, budgets and resourcing before kickoff.' },
  { pattern: /^\/stage-tracking/, title: 'Stage Tracking', description: 'Visual construction timeline across stages for each project.' },
  { pattern: /^\/progress-updates/, title: 'Progress Updates', description: 'Live feed of progress percentages reported from site.' },
  { pattern: /^\/site-updates/, title: 'Site Updates', description: 'Photo updates and notes captured directly from construction sites.' },
  { pattern: /^\/materials\/requests/, title: 'Material Requests', description: 'Requests raised by supervisors for site materials.' },
  { pattern: /^\/materials\/quotations/, title: 'Quotations', description: 'Supplier quotations awaiting review and approval.' },
  { pattern: /^\/materials\/orders/, title: 'Orders', description: 'Confirmed purchase orders placed with suppliers.' },
  { pattern: /^\/materials\/deliveries/, title: 'Deliveries', description: 'Track delivery status of ordered materials.' },
  { pattern: /^\/materials\/inventory/, title: 'Inventory', description: 'Current stock levels against minimum thresholds.' },
  { pattern: /^\/contracts/, title: 'Contracts', description: 'Manage project & service level contracts (Full & Labour contracts).' },
  { pattern: /^\/work-management/, title: 'Work Management', description: 'Track work tasks, progress and completion across projects, services and employees.' },
  { pattern: /^\/payments/, title: 'Payment Management', description: 'Track income, project expenses, payment methods and net balances.' },
  { pattern: /^\/real-estate\/land-buying/, title: 'Real Estate - Land Buying', description: 'Manage land parcel acquisitions, survey details, valuations and title deeds.' },
  { pattern: /^\/real-estate\/land-sales/, title: 'Real Estate - Land Sales', description: 'Track developed land plot sales, buyer agreements and transactions.' },
  { pattern: /^\/inspections/, title: 'Inspections', description: 'Quality control checks across every construction stage.' },
  { pattern: /^\/rework/, title: 'Rework', description: 'Track corrective work raised from failed inspections.' },
  { pattern: /^\/reports/, title: 'Reports', description: 'Generate reports across progress, budget and materials.' },
  { pattern: /^\/settings/, title: 'Settings', description: 'Manage your profile, preferences and security.' },
]

export function getPageMeta(pathname) {
  const found = meta.find((m) => m.pattern.test(pathname))
  return found || { title: 'Construction PMS', description: '' }
}
