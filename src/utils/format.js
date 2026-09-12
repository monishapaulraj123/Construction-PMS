export function formatCurrencyINR(value) {
  if (value === null || value === undefined) return '-'
  return '₹' + Number(value).toLocaleString('en-IN')
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

// Maps a status string to one of the badge tone classes.
export function statusTone(status) {
  const s = (status || '').toLowerCase()
  if (['active', 'approved', 'completed', 'delivered', 'confirmed', 'healthy', 'in stock'].includes(s)) return 'green'
  if (['in progress', 'near completion', 'dispatched', 'ordered'].includes(s)) return 'gold'
  if (['pending', 'scheduled', 'planning', 'in transit', 'low'].includes(s)) return 'amber'
  if (['rework required', 'delayed', 'high', 'overdue'].includes(s)) return 'red'
  if (['inactive', 'medium'].includes(s)) return 'gray'
  return 'gray'
}
