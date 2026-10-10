import db from '../config/db.js'
import { getCache, setCache } from '../services/redisService.js'

export async function getAdminDashboardStats(req, res) {
  try {
    const cacheKey = 'dashboard:admin_stats'
    const cachedStats = await getCache(cacheKey)
    if (cachedStats) {
      return res.json({
        ...cachedStats,
        cached: true,
      })
    }

    const [[{ total_clients }]] = await db.query('SELECT COUNT(*) AS total_clients FROM clients WHERE status = 1')
    const [[{ total_projects }]] = await db.query('SELECT COUNT(*) AS total_projects FROM projects')
    const [[{ active_projects }]] = await db.query("SELECT COUNT(*) AS active_projects FROM projects WHERE project_status != 'Completed'")
    const [[{ total_suppliers }]] = await db.query('SELECT COUNT(*) AS total_suppliers FROM suppliers WHERE status = 1')
    const [[{ total_items }]] = await db.query('SELECT COUNT(*) AS total_items FROM items WHERE status = 1')
    const [[{ total_properties }]] = await db.query('SELECT COUNT(*) AS total_properties FROM properties')
    const [[{ total_buy_requests }]] = await db.query('SELECT COUNT(*) AS total_buy_requests FROM buy_requests')
    const [[{ total_sell_requests }]] = await db.query('SELECT COUNT(*) AS total_sell_requests FROM sell_requests')
    const [[{ total_transactions }]] = await db.query('SELECT COUNT(*) AS total_transactions FROM transactions')

    const [recent_projects] = await db.query('SELECT * FROM projects ORDER BY project_id DESC LIMIT 5')
    const [recent_properties] = await db.query('SELECT * FROM properties ORDER BY property_id DESC LIMIT 5')

    const responsePayload = {
      success: true,
      stats: {
        total_clients,
        total_projects,
        active_projects,
        total_suppliers,
        total_items,
        total_properties,
        total_buy_requests,
        total_sell_requests,
        total_transactions,
      },
      recent_projects,
      recent_properties,
    }

    // Cache in Redis for 120 seconds
    await setCache(cacheKey, responsePayload, 120)

    return res.json(responsePayload)
  } catch (error) {
    console.error('[Dashboard Stats Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching dashboard stats.' })
  }
}

export async function getClientDashboardStats(req, res) {
  try {
    const userId = req.params.userId || req.user?.user_id

    const [clientRows] = await db.query('SELECT * FROM clients WHERE user_id = ? OR email = ?', [userId, req.user?.email || ''])
    const client = clientRows[0] || null
    const clientId = client ? client.client_id : null

    const [userProjects] = await db.query(
      'SELECT * FROM projects WHERE client_id = ? OR LOWER(client_name) LIKE ?',
      [clientId, `%${req.user?.name || ''}%`]
    )

    const [userBuyRequests] = await db.query(
      'SELECT * FROM buy_requests WHERE buyer_id = ? OR LOWER(buyer_name) LIKE ?',
      [userId, `%${req.user?.name || ''}%`]
    )

    const [userSellRequests] = await db.query(
      'SELECT * FROM sell_requests WHERE seller_id = ? OR LOWER(seller_name) LIKE ?',
      [userId, `%${req.user?.name || ''}%`]
    )

    const [userTransactions] = await db.query(
      'SELECT * FROM transactions WHERE buyer_id = ? OR seller_id = ? OR LOWER(buyer_name) LIKE ? OR LOWER(seller_name) LIKE ?',
      [userId, userId, `%${req.user?.name || ''}%`, `%${req.user?.name || ''}%`]
    )

    return res.json({
      success: true,
      client,
      projects: userProjects,
      buyRequests: userBuyRequests,
      sellRequests: userSellRequests,
      transactions: userTransactions,
    })
  } catch (error) {
    console.error('[Client Stats Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch client dashboard data.' })
  }
}
