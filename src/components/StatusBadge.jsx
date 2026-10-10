import { statusTone } from '../utils/format'

export default function StatusBadge({ status, tone }) {
  const resolvedTone = tone || statusTone(status)
  return <span className={`badge badge-${resolvedTone}`}>{status}</span>
}
