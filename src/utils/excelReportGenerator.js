// CSV / Excel Financial Report Export Utility for Construction PMS

import { formatCurrencyINR, formatDate } from './format'

export function exportFinancialsToCSV(financialSummary, transactions = [], reportTitle = 'Financial_Report') {
  const sanitize = (text) => `"${String(text || '').replace(/"/g, '""')}"`

  const headers = [
    'Voucher No',
    'Type',
    'Project Name',
    'Party / Client / Supplier',
    'Category',
    'Amount (INR)',
    'Payment Date',
    'Payment Method',
    'Reference / Cheque No',
    'Status',
    'Description',
  ]

  const rows = transactions.map((t) => [
    sanitize(t.payment_number || '-'),
    sanitize(t.payment_type || '-'),
    sanitize(t.project_name || '-'),
    sanitize(t.party_name || '-'),
    sanitize(t.category || t.payment_type || '-'),
    t.amount || 0,
    sanitize(formatDate(t.payment_date)),
    sanitize(t.payment_method || '-'),
    sanitize(t.reference_number || '-'),
    sanitize(t.status || '-'),
    sanitize(t.description || '-'),
  ])

  // Header & Summary Block
  const csvLines = [
    `"CONSTRUCTION PMS & REAL ESTATE - ${reportTitle.toUpperCase()}"`,
    `"Generated On: ${new Date().toLocaleString()}"`,
    '""',
    `"Total Realized Income","${financialSummary.totalIncome || 0}"`,
    `"Total Realized Expense","${financialSummary.totalExpense || 0}"`,
    `"Net Profit","${financialSummary.netProfit || 0}"`,
    `"Profit Margin %","${(financialSummary.profitMargin || 0).toFixed(2)}%"`,
    '""',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ]

  const csvString = csvLines.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${reportTitle}_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
