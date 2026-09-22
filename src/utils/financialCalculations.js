// Financial Calculation Utilities for Construction PMS

export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function isSameWeek(d1, d2) {
  const oneDay = 24 * 60 * 60 * 1000
  const diffDays = Math.round(Math.abs((d1 - d2) / oneDay))
  return diffDays < 7 && d1.getDay() >= d2.getDay()
}

export function isSameMonth(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
}

export function isSameYear(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
}

export function filterPaymentsByDateRange(payments = [], dateRangeFilter = 'All Time', customStartDate = null, customEndDate = null) {
  if (!dateRangeFilter || dateRangeFilter === 'All Time') return payments

  const now = new Date()

  return payments.filter((p) => {
    if (!p.payment_date) return true
    const pDate = new Date(p.payment_date)
    if (isNaN(pDate.getTime())) return true

    switch (dateRangeFilter) {
      case 'Today':
        return isSameDay(pDate, now)
      case 'This Week': {
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        return pDate >= startOfWeek
      }
      case 'This Month':
        return isSameMonth(pDate, now)
      case 'This Year':
        return isSameYear(pDate, now)
      case 'Custom': {
        if (customStartDate && new Date(customStartDate) > pDate) return false
        if (customEndDate && new Date(customEndDate) < pDate) return false
        return true
      }
      default:
        return true
    }
  })
}

export function filterPayments(payments = [], {
  search = '',
  typeFilter = '',
  projectFilter = '',
  statusFilter = '',
  dateRangeFilter = 'All Time',
  categoryFilter = '',
  customStartDate = null,
  customEndDate = null,
} = {}) {
  let list = filterPaymentsByDateRange(payments, dateRangeFilter, customStartDate, customEndDate)

  return list.filter((p) => {
    // Search query check
    if (search) {
      const q = search.toLowerCase()
      const match =
        (p.payment_number || '').toLowerCase().includes(q) ||
        (p.project_name || '').toLowerCase().includes(q) ||
        (p.party_name || '').toLowerCase().includes(q) ||
        (p.reference_number || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      if (!match) return false
    }

    // Voucher Type filter
    if (typeFilter && p.payment_type !== typeFilter) return false

    // Project filter
    if (projectFilter && p.project_name !== projectFilter && String(p.project_id) !== String(projectFilter)) return false

    // Status filter
    if (statusFilter) {
      if (statusFilter === 'Realized') {
        if (p.status !== 'Received' && p.status !== 'Paid' && p.status !== 'Completed' && p.status !== 'Active') return false
      } else if (statusFilter === 'Pending') {
        if (p.status !== 'Pending') return false
      } else if (p.status !== statusFilter) {
        return false
      }
    }

    // Category filter
    if (categoryFilter && p.category !== categoryFilter) return false

    return true
  })
}

export function calculateRealizedFinancials(payments = []) {
  // Only realized/completed transactions count towards realized financial totals
  const isRealized = (status) =>
    status === 'Received' || status === 'Paid' || status === 'Completed' || status === 'Active' || !status

  let totalIncome = 0
  let totalExpense = 0
  let pendingIncome = 0
  let pendingExpense = 0

  payments.forEach((p) => {
    const amt = Number(p.amount) || 0
    if (p.payment_type === 'Income') {
      if (isRealized(p.status)) {
        totalIncome += amt
      } else if (p.status === 'Pending') {
        pendingIncome += amt
      }
    } else if (p.payment_type === 'Expense') {
      if (isRealized(p.status)) {
        totalExpense += amt
      } else if (p.status === 'Pending') {
        pendingExpense += amt
      }
    }
  })

  const netCashFlow = totalIncome - totalExpense
  const netProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

  return {
    totalIncome,
    totalExpense,
    pendingIncome,
    pendingExpense,
    netCashFlow,
    netProfit,
    profitMargin,
  }
}

export function calculateProjectFinancials(project, payments = []) {
  const projPayments = payments.filter(
    (p) => p.project_id === project.project_id || p.project_name === project.project_name
  )

  const financials = calculateRealizedFinancials(projPayments)
  const estimatedBudget = Number(project.estimated_budget) || 0
  const actualExpense = financials.totalExpense
  const totalIncome = financials.totalIncome
  const budgetRemaining = estimatedBudget - actualExpense
  const budgetVariance = estimatedBudget - actualExpense
  const isBudgetExceeded = actualExpense > estimatedBudget && estimatedBudget > 0
  const budgetUtilization = estimatedBudget > 0 ? (actualExpense / estimatedBudget) * 100 : 0

  return {
    projectId: project.project_id,
    projectName: project.project_name,
    estimatedBudget,
    actualExpense,
    totalIncome,
    budgetRemaining,
    budgetVariance,
    budgetUtilization,
    isBudgetExceeded,
    netProfit: financials.netProfit,
    profitMargin: financials.profitMargin,
  }
}
