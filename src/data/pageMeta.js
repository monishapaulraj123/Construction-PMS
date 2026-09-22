const meta = [
  { pattern: /^\/$/, keyTitle: 'dash_header_title', keyDesc: 'dash_header_desc', title: 'Construction & Real Estate Dashboard', description: 'Overview of construction projects, real estate metrics, teams and site activities.' },
  { pattern: /^\/login/, keyTitle: 'login_header_title', keyDesc: 'login_header_desc', title: 'Unified Enterprise Login', description: 'Role-based access for Admin, Buyer, and Seller users.' },
  
  // Real Estate Admin
  { pattern: /^\/real-estate\/overview/, keyTitle: 're_overview_title', keyDesc: 're_overview_desc', title: 'Real Estate Overview', description: 'Business metrics, buying/selling transactions, property verifications and activities.' },
  { pattern: /^\/real-estate\/properties/, keyTitle: 're_props_title', keyDesc: 're_props_desc', title: 'Properties Master', description: 'Manage land parcels, plots, commercial sites and publication status.' },
  { pattern: /^\/real-estate\/buy-requests/, keyTitle: 're_buy_title', keyDesc: 're_buy_desc', title: 'Buy Requests Management', description: 'Review buyer submissions, verify budget & requirements, and coordinate negotiations.' },
  { pattern: /^\/real-estate\/sell-requests/, keyTitle: 're_sell_title', keyDesc: 're_sell_desc', title: 'Sell Requests Management', description: 'Verify seller land plot submissions, survey numbers and title deeds.' },
  { pattern: /^\/real-estate\/verification/, keyTitle: 're_verif_title', keyDesc: 're_verif_desc', title: 'Property Verification Workspace', description: 'Legal title deed checks, survey number validation and DTCP sanctions.' },
  { pattern: /^\/real-estate\/negotiations/, keyTitle: 're_neg_title', keyDesc: 're_neg_desc', title: 'Price Negotiations', description: 'Track initial prices, buyer proposals, counter offers and agreed amounts.' },
  { pattern: /^\/real-estate\/transactions/, keyTitle: 're_txn_title', keyDesc: 're_txn_desc', title: 'Property Transactions', description: 'Manage sale deeds, advance payments, final settlements and project conversion.' },

  // Client Portal
  { pattern: /^\/client\/dashboard/, keyTitle: 'client_dash_title', keyDesc: 'client_dash_desc', title: 'Client Dashboard', description: 'Overview of available land properties, buy/sell requests, transactions, and documents.' },
  { pattern: /^\/client\/buy/, keyTitle: 'client_buy_title', keyDesc: 'client_buy_desc', title: 'Buy Land / Property', description: 'Browse available verified land plots, submit purchase requests and track buying enquiries.' },
  { pattern: /^\/client\/sell/, keyTitle: 'client_sell_title', keyDesc: 'client_sell_desc', title: 'Sell Land / Property', description: 'Submit land parcels for sale, upload documents, and track admin verification.' },
  { pattern: /^\/client\/requests/, keyTitle: 'client_req_title', keyDesc: 'client_req_desc', title: 'My Requests', description: 'Track status of your land buying enquiries and selling submissions.' },
  { pattern: /^\/client\/transactions/, keyTitle: 'client_txn_title', keyDesc: 'client_txn_desc', title: 'My Transactions', description: 'Track payment progress, advance receipts, and deed execution.' },
  { pattern: /^\/client\/documents/, keyTitle: 'client_doc_title', keyDesc: 'client_doc_desc', title: 'My Documents', description: 'Access property title deeds, tax receipts, and sale agreements.' },
  { pattern: /^\/client\/notifications/, keyTitle: 'client_notif_title', keyDesc: 'client_notif_desc', title: 'Notifications', description: 'Stay updated on request approvals, site visits, and price counter-offers.' },
  { pattern: /^\/client\/profile/, keyTitle: 'client_prof_title', keyDesc: 'client_prof_desc', title: 'Client Profile', description: 'Manage contact details, identity info, and personal preferences.' },

  // Master Data & Construction
  { pattern: /^\/employee-types/, keyTitle: 'emp_types_title', keyDesc: 'emp_types_desc', title: 'Employee Types', description: 'Manage the employee type master used across the workforce.' },
  { pattern: /^\/employees/, keyTitle: 'employees_title', keyDesc: 'employees_desc', title: 'Employees', description: 'Manage engineers, supervisors and site workforce records.' },
  { pattern: /^\/item-categories/, keyTitle: 'item_cat_title', keyDesc: 'item_cat_desc', title: 'Material Categories', description: 'Organize materials into categories for faster procurement.' },
  { pattern: /^\/items/, keyTitle: 'items_title', keyDesc: 'items_desc', title: 'Materials', description: 'Manage the material catalogue, rates and stock thresholds.' },
  { pattern: /^\/suppliers/, keyTitle: 'suppliers_title', keyDesc: 'suppliers_desc', title: 'Suppliers', description: 'Manage supplier records, categories and contact details.' },
  { pattern: /^\/services/, keyTitle: 'services_title', keyDesc: 'services_desc', title: 'Services & Service Assignment', description: 'Manage service offerings, rates and assign service specialists.' },
  { pattern: /^\/construction-types/, keyTitle: 'const_types_title', keyDesc: 'const_types_desc', title: 'Construction Types', description: 'Define the construction types supported by your organization.' },
  { pattern: /^\/project-types/, keyTitle: 'proj_types_title', keyDesc: 'proj_types_desc', title: 'Project Types', description: 'Manage project and home types (villas, apartments, gated communities, commercial units).' },
  { pattern: /^\/construction-stages/, keyTitle: 'const_stages_title', keyDesc: 'const_stages_desc', title: 'Construction Stages', description: 'Configure the stage sequence for each construction type.' },
  { pattern: /^\/clients$/, keyTitle: 'clients_title', keyDesc: 'clients_desc', title: 'Clients', description: 'Manage client records across individuals, companies and government bodies.' },
  { pattern: /^\/projects\/[^/]+/, keyTitle: 'proj_details_title', keyDesc: 'proj_details_desc', title: 'Project Details', description: 'Full overview, stages, assigned service specialists and progress.' },
  { pattern: /^\/projects/, keyTitle: 'projects_title', keyDesc: 'projects_desc', title: 'Projects', description: 'Track every active, planned and completed construction project.' },
  { pattern: /^\/project-planning/, keyTitle: 'proj_plan_title', keyDesc: 'proj_plan_desc', title: 'Project Planning', description: 'Plan schedules, budgets and resourcing before kickoff.' },
  { pattern: /^\/stage-tracking/, keyTitle: 'stage_track_title', keyDesc: 'stage_track_desc', title: 'Stage Tracking', description: 'Visual construction timeline across stages for each project.' },
  { pattern: /^\/progress-updates/, keyTitle: 'progress_upd_title', keyDesc: 'progress_upd_desc', title: 'Progress Updates', description: 'Live feed of progress percentages reported from site.' },
  { pattern: /^\/site-updates/, keyTitle: 'site_upd_title', keyDesc: 'site_upd_desc', title: 'Site Updates', description: 'Photo updates and notes captured directly from construction sites.' },
  { pattern: /^\/materials\/requests/, keyTitle: 'mat_req_title', keyDesc: 'mat_req_desc', title: 'Material Requests', description: 'Requests raised by supervisors for site materials.' },
  { pattern: /^\/materials\/quotations/, keyTitle: 'quotations_title', keyDesc: 'quotations_desc', title: 'Quotations', description: 'Supplier quotations awaiting review and approval.' },
  { pattern: /^\/materials\/orders/, keyTitle: 'orders_title', keyDesc: 'orders_desc', title: 'Orders', description: 'Confirmed purchase orders placed with suppliers.' },
  { pattern: /^\/materials\/deliveries/, keyTitle: 'deliveries_title', keyDesc: 'deliveries_desc', title: 'Deliveries', description: 'Track delivery status of ordered materials.' },
  { pattern: /^\/materials\/inventory/, keyTitle: 'inventory_title', keyDesc: 'inventory_desc', title: 'Inventory', description: 'Current stock levels against minimum thresholds.' },
  { pattern: /^\/contracts/, keyTitle: 'contracts_title', keyDesc: 'contracts_desc', title: 'Contracts', description: 'Manage project & service level contracts (Full & Labour contracts).' },
  { pattern: /^\/work-management/, keyTitle: 'work_mgmt_title', keyDesc: 'work_mgmt_desc', title: 'Work Management', description: 'Track work tasks, progress and completion across projects, services and employees.' },
  { pattern: /^\/payments/, keyTitle: 'payments_title', keyDesc: 'payments_desc', title: 'Payment Management', description: 'Track income, project expenses, payment methods and net balances.' },
  { pattern: /^\/inspections/, keyTitle: 'inspections_title', keyDesc: 'inspections_desc', title: 'Inspections', description: 'Quality control checks across every construction stage.' },
  { pattern: /^\/rework/, keyTitle: 'rework_title', keyDesc: 'rework_desc', title: 'Rework', description: 'Track corrective work raised from failed inspections.' },
  { pattern: /^\/reports/, keyTitle: 'reports_title', keyDesc: 'reports_desc', title: 'Reports', description: 'Generate reports across progress, budget and materials.' },
  { pattern: /^\/settings/, keyTitle: 'settings_title', keyDesc: 'settings_desc', title: 'Settings', description: 'Manage your profile, preferences and security.' },
]

export function getPageMeta(pathname, t) {
  const found = meta.find((m) => m.pattern.test(pathname))
  if (found) {
    return {
      title: t ? t(found.keyTitle, found.title) : found.title,
      description: t ? t(found.keyDesc, found.description) : found.description,
    }
  }
  return { title: t ? t('app_title', 'Construction PMS & Real Estate') : 'Construction PMS & Real Estate', description: '' }
}
