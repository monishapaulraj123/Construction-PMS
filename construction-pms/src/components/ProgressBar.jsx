export default function ProgressBar({ value, showLabel = false, tone = 'gold' }) {
  return (
    <div>
      {showLabel && (
        <div className="progress-row">
          <span>Progress</span>
          <strong>{value}%</strong>
        </div>
      )}
      <div className="progress-track">
        <div
          className={`progress-fill ${tone === 'green' ? 'green' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}
