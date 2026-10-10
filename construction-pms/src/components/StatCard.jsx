export default function StatCard({
  icon: Icon,
  iconBg = 'var(--gold-050)',
  iconColor = 'var(--forest-900)',
  value,
  label,
  title,
  trend,
}) {
  const displayLabel = label || title

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        {Icon ? (
          <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
            <Icon size={20} />
          </div>
        ) : <div />}
        {trend && (
          <span className={`stat-trend ${trend.startsWith('-') ? 'down' : ''}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{displayLabel}</div>
    </div>
  )
}
