export default function StatCard({ icon: Icon, iconBg, iconColor, value, label, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`stat-trend ${trend.startsWith('-') ? 'down' : ''}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
