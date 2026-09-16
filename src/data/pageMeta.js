const meta = [
  { pattern: /^\/$/, title: 'Construction & Real Estate Dashboard', description: 'Overview of construction projects, real estate metrics, teams and site activities.' },
  { pattern: /^\/login/, title: 'Unified Enterprise Login', description: 'Role-based access for Admin, Buyer, and Seller users.' },
  
  // Real Estate Admin
  { pattern: /^\/real-estate\/overview/, title: 'Real Estate Overview', description: 'Business metrics, buying/selling transactions, property verifications and activities.' },
  { pattern: /^\/real-estate\/properties/, title: 'Properties Master', description: 'Manage land parcels, plots, commercial sites and publication status.' },
  { pattern: /^\/real-estate\/buy-requests/, title: 'Buy Requests Management', description: 'Review buyer submissions, verify budget & requirements, and coordinate negotiations.' },
  { pattern: /^\/real-estate\/sell-requests/, title: 'Sell Requests Management', description: 'Verify seller land plot submissions, survey numbers and title deeds.' },
  { pattern: /^\/real-estate\/verification/, title: 'Property Verification Workspace', description: 'Legal title deed checks, survey number validation and DTCP sanctions.' },
  { pattern: /^\/real-estate\/negotiations/, title: 'Price Negotiations', description: 'Track initial prices, buyer proposals, counter offers and agreed amounts.' },
  { pattern: /^\/real-estate\/transactions/, title: 'Property Transactions', description: 'Manage sale deeds, advance payments, final settlements and project conversion.' },

  // Client Portal
  { pattern: /^\/client\/dashboard/, title: 'Client Dashboard', description: 'Overview of available land properties, buy/sell requests, transactions, and documents.' },
  { pattern: /^\/client\/buy/, title: 'Buy Land / Property', description: 'Browse available verified land plots, submit purchase requests and track buying enquiries.' },
  { pattern: /^\/client\/sell/, title: 'Sell Land / Property', description: 'Submit land parcels for sale, upload documents, and track admin verification.' },
  { pattern: /^\/client\/requests/, title: 'My Requests', description: 'Track status of your land buying enquiries and selling submissions.' },
  { pattern: /^\/client\/transactions/, title: 'My Transactions', description: 'Track payment progress, advance receipts, and deed execution.' },
  { pattern: /^\/client\/documents/, title: 'My Documents', description: 'Access property title deeds, tax receipts, and sale agreements.' },
  { pattern: /^\/client\/notifications/, title: 'Notifications', description: 'Stay updated on request approvals, site visits, and price counter-offers.' },
  { pattern: /^\/client\/profile/, title: 'Client Profile', description: 'Manage contact details, identity info, and personal preferences.' },

  // Buyer Portal
  { pattern: /^\/buyer\/dashboard/, title: 'Buyer Dashboard', description: 'Overview of available properties, active buy requests, negotiations and purchases.' },
  { pattern: /^\/buyer\/properties/, title: 'Available Properties', description: 'Browse verified land plots and properties with detailed specifications.' },
  { pattern: /^\/buyer\/requests/, title: 'My Buy Requests', description: 'Track the status progression of your property purchase requests.' },
  { pattern: /^\/buyer\/negotiations/, title: 'My Price Negotiations', description: 'View proposed offers and counter-offers on selected properties.' },
  { pattern: /^\/buyer\/transactions/, title: 'Current Transactions', description: 'Track payment progress, advance receipts and deed execution.' },
  { pattern: /^\/buyer\/documents/, title: 'My Documents', description: 'Access property title deeds, tax receipts and sale agreements.' },
  { pattern: /^\/buyer\/notifications/, title: 'Notifications', description: 'Stay updated on request approvals, site visits and price counter-offers.' },
  { pattern: /^\/buyer\/profile/, title: 'Buyer Profile', description: 'Manage contact details, ID references and purchase preferences.' },

  // Seller Portal
  { pattern: /^\/seller\/dashboard/, title: 'Seller Dashboard', description: 'Overview of submitted land plots, verification status and buyer interest.' },
  { pattern: /^\/seller\/properties/, title: 'My Listed Properties', description: 'Manage your plot submissions and track approval & publication state.' },
  { pattern: /^\/seller\/requests/, title: 'My Sell Requests', description: 'Submit new land/property for verification and track status.' },
  { pattern: /^\/seller\/verification/, title: 'Verification Status', description: 'Track survey sketch and title deed verification by company admin.' },
  { pattern: /^\/seller\/buyer-interest/, title: 'Buyer Interest', description: 'View buyer inquiries and offers on your listed properties.' },
  { pattern: /^\/seller\/negotiations/, title: 'Price Negotiations', description: 'Respond to buyer offers and set counter-offer amounts.' },
  { pattern: /^\/seller\/transactions/, title: 'Seller Transactions', description: 'View sales proceeds, advance receipts and deed handovers.' },
  { pattern: /^\/seller\/documents/, title: 'Land Documents', description: 'Manage uploaded survey maps, parent deeds and EC certificates.' },
  { pattern: /^\/seller\/notifications/, title: 'Notifications', description: 'Updates on plot verifications, buyer inquiries and price agreements.' },
  { pattern: /^\/seller\/profile/, title: 'Seller Profile', description: 'Manage owner information, bank details and contact references.' },

  // Master Data & Construction
  { pattern: /^\/employee-types/, title: 'Employee Types', description: 'Manage the employee type master used across the workforce.' },
  { pattern: /^\/employees/, title: 'Employees', description: 'Manage engineers, supervisors and site workforce records.' },
  { pattern: /^\/item-categories/, title: 'Material Categories', description: 'Organize materials into categories for faster procurement.' },
  { pattern: /^\/items/, title: 'Materials', description: 'Manage the material catalogue, rates and stock thresholds.' },
  { pattern: /^\/suppliers/, title: 'Suppliers', description: 'Manage supplier records, categories and contact details.' },
  { pattern: /^\/services/, title: 'Services & Service Assignment', description: 'Manage service offerings, rates and assign service specialists.' },
  { pattern: /^\/construction-types/, title: 'Construction Types', description: 'Define the construction types supported by your organization.' },
  { pattern: /^\/project-types/, title: 'Project Types', description: 'Manage project and home types (villas, apartments, gated communities, commercial units).' },
  { pattern: /^\/construction-stages/, title: 'Construction Stages', description: 'Configure the stage sequence for each construction type.' },
  { pattern: /^\/clients$/, title: 'Clients', description: 'Manage client records across individuals, companies and government bodies.' },
  { pattern: /^\/projects\/[^/]+/, title: 'Project Details', description: 'Full overview, stages, assigned service specialists and progress.' },
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
  { pattern: /^\/inspections/, title: 'Inspections', description: 'Quality control checks across every construction stage.' },
  { pattern: /^\/rework/, title: 'Rework', description: 'Track corrective work raised from failed inspections.' },
  { pattern: /^\/reports/, title: 'Reports', description: 'Generate reports across progress, budget and materials.' },
  { pattern: /^\/settings/, title: 'Settings', description: 'Manage your profile, preferences and security.' },
]

export function getPageMeta(pathname) {
  const found = meta.find((m) => m.pattern.test(pathname))
  return found || { title: 'Construction PMS & Real Estate', description: '' }
}
