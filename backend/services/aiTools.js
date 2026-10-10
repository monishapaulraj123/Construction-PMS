import db from '../config/db.js'

/**
 * AI Tool Layer: Authorized MySQL Database Access Functions
 * Enforces Role-Based Access Control (RBAC) at backend level.
 */

// Helper to check if user is Admin
function isAdminUser(user) {
  return user && String(user.role).toUpperCase() === 'ADMIN'
}

// Helper to get client_id for logged-in user
async function getClientIdForUser(user) {
  if (!user || !user.user_id) return null
  const [rows] = await db.query('SELECT client_id FROM clients WHERE user_id = ? OR LOWER(email) = ?', [user.user_id, (user.email || '').toLowerCase()])
  if (rows.length > 0) {
    return rows[0].client_id
  }
  return null
}

export async function getProjects(params = {}, user) {
  const isAdmin = isAdminUser(user)
  const userClientId = await getClientIdForUser(user)

  let sql = 'SELECT * FROM projects WHERE status = 1'
  const sqlParams = []

  if (!isAdmin) {
    if (userClientId) {
      sql += ' AND (client_id = ? OR LOWER(client_name) LIKE ?)'
      sqlParams.push(userClientId, `%${(user?.name || '').toLowerCase()}%`)
    } else {
      sql += ' AND (LOWER(client_name) LIKE ? OR created_by = ?)'
      sqlParams.push(`%${(user?.name || '').toLowerCase()}%`, user?.user_id || 0)
    }
  }

  if (params.status) {
    sql += ' AND LOWER(project_status) = ?'
    sqlParams.push(params.status.toLowerCase())
  }

  sql += ' ORDER BY created_at DESC LIMIT 20'

  const [rows] = await db.query(sql, sqlParams)
  return rows
}

export async function getProjectDetails(identifier, user) {
  if (!identifier) return null
  const isAdmin = isAdminUser(user)
  const userClientId = await getClientIdForUser(user)

  let sql = 'SELECT * FROM projects WHERE (project_id = ? OR LOWER(project_code) = ? OR LOWER(project_name) LIKE ?)'
  const sqlParams = [identifier, String(identifier).toLowerCase(), `%${String(identifier).toLowerCase()}%`]

  if (!isAdmin) {
    if (userClientId) {
      sql += ' AND (client_id = ? OR LOWER(client_name) LIKE ?)'
      sqlParams.push(userClientId, `%${(user?.name || '').toLowerCase()}%`)
    } else {
      sql += ' AND LOWER(client_name) LIKE ?'
      sqlParams.push(`%${(user?.name || '').toLowerCase()}%`)
    }
  }

  const [rows] = await db.query(sql, sqlParams)
  return rows[0] || null
}

export async function getProjectProgress(identifier, user) {
  const project = await getProjectDetails(identifier, user)
  if (!project) return null
  return {
    project_id: project.project_id,
    project_code: project.project_code,
    project_name: project.project_name,
    overall_progress_percentage: project.overall_progress_percentage || 0,
    construction_stage_name: project.construction_stage_name || 'In Progress',
    project_status: project.project_status || 'In Progress',
    start_date: project.start_date,
    expected_completion_date: project.expected_completion_date,
    supervisor_name: project.supervisor_name,
  }
}

export async function getAvailableProperties(params = {}, user) {
  let sql = "SELECT * FROM properties WHERE (status = 'Approved' OR publication_status = 'Published')"
  const sqlParams = []

  if (params.type) {
    sql += ' AND LOWER(property_type) LIKE ?'
    sqlParams.push(`%${params.type.toLowerCase()}%`)
  }

  if (params.district) {
    sql += ' AND LOWER(district) LIKE ?'
    sqlParams.push(`%${params.district.toLowerCase()}%`)
  }

  sql += ' ORDER BY created_at DESC LIMIT 20'
  const [rows] = await db.query(sql, sqlParams)
  return rows
}

export async function getPropertyDetails(identifier, user) {
  if (!identifier) return null
  const [rows] = await db.query(
    'SELECT * FROM properties WHERE property_id = ? OR LOWER(property_code) = ? OR LOWER(property_name) LIKE ?',
    [identifier, String(identifier).toLowerCase(), `%${String(identifier).toLowerCase()}%`]
  )
  return rows[0] || null
}

export async function getClientDetails(identifier, user) {
  const isAdmin = isAdminUser(user)
  if (!isAdmin) {
    // Client can only query their own client profile
    const [rows] = await db.query(
      'SELECT * FROM clients WHERE user_id = ? OR LOWER(email) = ?',
      [user?.user_id || 0, (user?.email || '').toLowerCase()]
    )
    return rows[0] || null
  }

  if (!identifier) {
    const [rows] = await db.query('SELECT * FROM clients LIMIT 20')
    return rows
  }

  const [rows] = await db.query(
    'SELECT * FROM clients WHERE client_id = ? OR LOWER(client_code) = ? OR LOWER(client_name) LIKE ? OR LOWER(phone) = ?',
    [identifier, String(identifier).toLowerCase(), `%${String(identifier).toLowerCase()}%`, String(identifier)]
  )
  return rows[0] || rows
}

export async function getClientProjects(user) {
  return await getProjects({}, user)
}

export async function getPayments(params = {}, user) {
  const isAdmin = isAdminUser(user)
  const userClientId = await getClientIdForUser(user)

  let sql = 'SELECT * FROM payments WHERE 1=1'
  const sqlParams = []

  if (!isAdmin) {
    if (userClientId) {
      sql += ' AND (client_id = ? OR LOWER(client_name) LIKE ?)'
      sqlParams.push(userClientId, `%${(user?.name || '').toLowerCase()}%`)
    } else {
      sql += ' AND LOWER(client_name) LIKE ?'
      sqlParams.push(`%${(user?.name || '').toLowerCase()}%`)
    }
  }

  if (params.status) {
    sql += ' AND LOWER(status) = ?'
    sqlParams.push(params.status.toLowerCase())
  }

  sql += ' ORDER BY payment_date DESC LIMIT 30'
  const [rows] = await db.query(sql, sqlParams)
  return rows
}

export async function getPendingPayments(params = {}, user) {
  return await getPayments({ status: 'Pending', ...params }, user)
}

export async function getTransactions(params = {}, user) {
  const isAdmin = isAdminUser(user)

  let sql = 'SELECT * FROM transactions WHERE 1=1'
  const sqlParams = []

  if (!isAdmin) {
    const userId = user?.user_id || 0
    const userName = (user?.name || '').toLowerCase()
    sql += ' AND (buyer_id = ? OR seller_id = ? OR LOWER(buyer_name) LIKE ? OR LOWER(seller_name) LIKE ?)'
    sqlParams.push(userId, userId, `%${userName}%`, `%${userName}%`)
  }

  sql += ' ORDER BY transaction_date DESC LIMIT 30'
  const [rows] = await db.query(sql, sqlParams)
  return rows
}

export async function getBuyRequests(params = {}, user) {
  const isAdmin = isAdminUser(user)

  let sql = 'SELECT * FROM buy_requests WHERE 1=1'
  const sqlParams = []

  if (!isAdmin) {
    const userId = user?.user_id || 0
    const userEmail = (user?.email || '').toLowerCase()
    sql += ' AND (buyer_id = ? OR LOWER(buyer_email) = ?)'
    sqlParams.push(userId, userEmail)
  }

  sql += ' ORDER BY created_at DESC LIMIT 30'
  const [rows] = await db.query(sql, sqlParams)
  return rows
}

export async function getSellRequests(params = {}, user) {
  const isAdmin = isAdminUser(user)

  let sql = 'SELECT * FROM sell_requests WHERE 1=1'
  const sqlParams = []

  if (!isAdmin) {
    const userId = user?.user_id || 0
    const userEmail = (user?.email || '').toLowerCase()
    sql += ' AND (seller_id = ? OR LOWER(seller_email) = ?)'
    sqlParams.push(userId, userEmail)
  }

  sql += ' ORDER BY created_at DESC LIMIT 30'
  const [rows] = await db.query(sql, sqlParams)
  return rows
}

export async function getNegotiations(params = {}, user) {
  const isAdmin = isAdminUser(user)

  let sql = 'SELECT * FROM negotiations WHERE 1=1'
  const sqlParams = []

  if (!isAdmin) {
    const userId = user?.user_id || 0
    const userName = (user?.name || '').toLowerCase()
    sql += ' AND (buyer_id = ? OR seller_id = ? OR LOWER(buyer_name) LIKE ? OR LOWER(seller_name) LIKE ?)'
    sqlParams.push(userId, userId, `%${userName}%`, `%${userName}%`)
  }

  sql += ' ORDER BY created_at DESC LIMIT 30'
  const [rows] = await db.query(sql, sqlParams)
  return rows
}

export async function getEmployees(params = {}, user) {
  let sql = 'SELECT employee_id, employee_code, first_name, last_name, service, specialization, availability, current_project_name, current_work, experience_years, service_rate, rate_unit FROM employees WHERE status = 1'
  const sqlParams = []

  if (params.service) {
    sql += ' AND LOWER(service) LIKE ?'
    sqlParams.push(`%${params.service.toLowerCase()}%`)
  }

  sql += ' ORDER BY first_name ASC LIMIT 30'
  const [rows] = await db.query(sql, sqlParams)
  return rows
}

export async function getSuppliers(params = {}, user) {
  const [rows] = await db.query('SELECT supplier_id, supplier_code, supplier_name, contact_person, phone, city, rating, supplied_materials FROM suppliers WHERE status = 1 LIMIT 30')
  return rows
}

export async function getConstructionStages() {
  const [rows] = await db.query('SELECT * FROM construction_stages ORDER BY stage_sequence ASC')
  return rows
}

export async function getProjectBudget(identifier, user) {
  const project = await getProjectDetails(identifier, user)
  if (!project) return null
  let est = project.budget_estimation
  if (typeof est === 'string') {
    try { est = JSON.parse(est) } catch (e) { est = null }
  }
  return {
    project_id: project.project_id,
    project_name: project.project_name,
    estimated_budget: project.estimated_budget,
    budget_estimation: est,
  }
}

export async function getProjectBOQ(identifier, user) {
  const budgetInfo = await getProjectBudget(identifier, user)
  if (!budgetInfo || !budgetInfo.budget_estimation) return null
  return {
    project_name: budgetInfo.project_name,
    boq: budgetInfo.budget_estimation.categories || budgetInfo.budget_estimation,
  }
}

// Action Helper: Create Buy Request
export async function createBuyRequestAction(data, user) {
  const { property_id, property_name, budget, requirements } = data
  const requestCode = `REQ-BUY-${Date.now().toString().slice(-4)}`
  const buyerId = user?.user_id || 501
  const buyerName = user?.name || 'Client'
  const buyerEmail = user?.email || ''
  const buyerPhone = user?.phone || '9840001122'
  const reqBudget = Number(budget) || 0
  const reqNotes = requirements || 'Submitted via AI Voice Assistant'

  const [result] = await db.query(
    `INSERT INTO buy_requests (request_code, property_id, property_name, buyer_id, buyer_name, buyer_email, buyer_phone, budget, requirements, status, current_stage, submitted_date, verification_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', 'Submitted', CURDATE(), 'Under Review')`,
    [requestCode, property_id || null, property_name || 'Property', buyerId, buyerName, buyerEmail, buyerPhone, reqBudget, reqNotes]
  )

  return {
    request_id: result.insertId,
    request_code: requestCode,
    property_name,
    buyer_name: buyerName,
    budget: reqBudget,
    status: 'Submitted',
  }
}

// Action Helper: Create Sell Request
export async function createSellRequestAction(data, user) {
  const { property_name, location, district, area, expected_total, remarks } = data
  const requestCode = `REQ-SEL-${Date.now().toString().slice(-4)}`
  const sellerId = user?.user_id || 201
  const sellerName = user?.name || 'Client'
  const sellerEmail = user?.email || ''
  const sellerPhone = user?.phone || '9840009988'

  const [result] = await db.query(
    `INSERT INTO sell_requests (request_code, property_name, location, district, state, area, unit, expected_total, seller_id, seller_name, seller_phone, seller_email, status, remarks, submitted_date)
     VALUES (?, ?, ?, ?, 'Tamil Nadu', ?, 'Sq. Ft', ?, ?, ?, ?, ?, 'Under Verification', ?, CURDATE())`,
    [requestCode, property_name || 'Land Parcel', location || 'Chennai', district || 'Chennai', Number(area) || 2400, Number(expected_total) || 3500000, sellerId, sellerName, sellerPhone, sellerEmail, remarks || 'Submitted via AI Assistant']
  )

  return {
    sell_request_id: result.insertId,
    request_code: requestCode,
    property_name,
    expected_total,
    status: 'Under Verification',
  }
}
