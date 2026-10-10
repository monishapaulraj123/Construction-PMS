import db from '../config/db.js'

export async function getAnalyticsData(req, res) {
  try {
    const { projectId, constructionTypeId, dateRange, startDate, endDate } = req.query

    // 1. Build SQL filters for projects
    let projectWhere = ' WHERE 1=1'
    const projectParams = []

    if (projectId && projectId !== 'all') {
      projectWhere += ' AND p.project_id = ?'
      projectParams.push(projectId)
    }

    if (constructionTypeId && constructionTypeId !== 'all') {
      projectWhere += ' AND p.construction_type_id = ?'
      projectParams.push(constructionTypeId)
    }

    if (startDate) {
      projectWhere += ' AND p.start_date >= ?'
      projectParams.push(startDate)
    }

    if (endDate) {
      projectWhere += ' AND p.start_date <= ?'
      projectParams.push(endDate)
    }

    const projectsQuery = `
      SELECT p.*, ct.construction_type_name AS resolved_type_name, st.stage_name AS resolved_stage_name
      FROM projects p
      LEFT JOIN construction_types ct ON p.construction_type_id = ct.construction_type_id
      LEFT JOIN construction_stages st ON p.construction_stage_id = st.stage_id
      ${projectWhere}
      ORDER BY p.project_id DESC
    `

    const [projects] = await db.query(projectsQuery, projectParams)

    // 2. Build SQL filters for payments
    let paymentWhere = ' WHERE 1=1'
    const paymentParams = []

    if (projectId && projectId !== 'all') {
      paymentWhere += ' AND project_id = ?'
      paymentParams.push(projectId)
    }

    if (startDate) {
      paymentWhere += ' AND payment_date >= ?'
      paymentParams.push(startDate)
    }

    if (endDate) {
      paymentWhere += ' AND payment_date <= ?'
      paymentParams.push(endDate)
    }

    const paymentsQuery = `SELECT * FROM payments ${paymentWhere} ORDER BY payment_date ASC`
    const [payments] = await db.query(paymentsQuery, paymentParams)

    // 3. Compute Summary Metrics
    const totalProjects = projects.length
    const activeProjects = projects.filter((p) => p.project_status !== 'Completed').length
    const completedProjects = projects.filter((p) => p.project_status === 'Completed').length
    const totalBudget = projects.reduce((sum, p) => sum + (Number(p.estimated_budget) || 0), 0)

    const totalIncome = payments
      .filter((p) => (p.payment_type || '').toLowerCase() === 'income')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    const totalExpense = payments
      .filter((p) => (p.payment_type || '').toLowerCase() === 'expense')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    // 4. Project Status Breakdown (Bar Chart A)
    const statusCounts = {}
    projects.forEach((p) => {
      const st = p.project_status || 'Not Started'
      statusCounts[st] = (statusCounts[st] || 0) + 1
    })

    const projectStatusData = Object.keys(statusCounts).map((status) => ({
      name: status,
      count: statusCounts[status],
    }))

    // 5. Construction Type Distribution (Donut / Pie Chart B)
    const typeCounts = {}
    projects.forEach((p) => {
      const typeName = p.resolved_type_name || p.construction_type_name || 'Other'
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1
    })

    const constructionTypeData = Object.keys(typeCounts).map((typeName) => ({
      name: typeName,
      value: typeCounts[typeName],
    }))

    // 6. Budget vs Actual Expense per Project (Bar Chart C)
    const projectExpenseMap = {}
    payments.forEach((pay) => {
      if ((pay.payment_type || '').toLowerCase() === 'expense') {
        const pKey = pay.project_id || pay.project_name
        if (pKey) {
          projectExpenseMap[pKey] = (projectExpenseMap[pKey] || 0) + (Number(pay.amount) || 0)
        }
      }
    })

    const budgetVsExpenseData = projects.map((p) => {
      const actualExpense = projectExpenseMap[p.project_id] || projectExpenseMap[p.project_name] || 0
      return {
        id: p.project_id,
        name: p.project_name,
        estimatedBudget: Number(p.estimated_budget) || 0,
        actualExpense,
      }
    })

    // 7. Income vs Expense Trend (Bar Chart D)
    const monthlyMap = {}
    payments.forEach((pay) => {
      let monthKey = 'Overall'
      if (pay.payment_date) {
        const d = new Date(pay.payment_date)
        if (!isNaN(d.getTime())) {
          monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' })
        }
      }
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0 }
      }
      const type = (pay.payment_type || '').toLowerCase()
      const amt = Number(pay.amount) || 0
      if (type === 'income') {
        monthlyMap[monthKey].income += amt
      } else if (type === 'expense') {
        monthlyMap[monthKey].expense += amt
      }
    })

    const incomeVsExpenseData = Object.values(monthlyMap)

    // 8. Construction Progress Visualization (E)
    const constructionProgressData = projects.map((p) => ({
      id: p.project_id,
      name: p.project_name,
      stage: p.resolved_stage_name || p.construction_stage_name || 'In Progress',
      progress: Number(p.overall_progress_percentage) || 0,
      status: p.project_status || 'In Progress',
    }))

    return res.json({
      success: true,
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        totalExpense,
        totalIncome,
      },
      projectStatusData,
      constructionTypeData,
      budgetVsExpenseData,
      incomeVsExpenseData,
      constructionProgressData,
    })
  } catch (error) {
    console.error('[Analytics Controller Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching analytics.' })
  }
}
