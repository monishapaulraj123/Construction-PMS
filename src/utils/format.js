export function formatCurrencyINR(value) {
  if (value === null || value === undefined) return '-'
  return '₹' + Number(value).toLocaleString('en-IN')
}

export const formatCurrency = formatCurrencyINR

export function formatShortINR(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0'
  const val = Number(value)
  const absVal = Math.abs(val)
  const sign = val < 0 ? '-' : ''
  if (absVal >= 10000000) {
    return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`
  } else if (absVal >= 100000) {
    return `${sign}₹${(absVal / 100000).toFixed(2)} L`
  }
  return sign + '₹' + absVal.toLocaleString('en-IN')
}

export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function statusTone(status) {
  const s = (status || '').toLowerCase()
  if (['active', 'approved', 'completed', 'delivered', 'confirmed', 'healthy', 'in stock', 'published', 'verified', 'agreed'].includes(s)) return 'green'
  if (['in progress', 'near completion', 'dispatched', 'ordered', 'transaction processing', 'negotiation', 'counter offer'].includes(s)) return 'gold'
  if (['pending', 'scheduled', 'planning', 'in transit', 'low', 'submitted', 'under review', 'under verification'].includes(s)) return 'amber'
  if (['rework required', 'delayed', 'high', 'overdue', 'rejected', 'correction required'].includes(s)) return 'red'
  if (['inactive', 'medium', 'unpublished', 'closed'].includes(s)) return 'gray'
  return 'gray'
}
