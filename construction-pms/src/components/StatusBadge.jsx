import { statusTone } from '../utils/format'
import { useTranslation } from '../context/LanguageContext'

export default function StatusBadge({ status, tone }) {
  const { t } = useTranslation()
  const resolvedTone = tone || statusTone(status)
  const key = String(status || '').toLowerCase().replace(/\s+/g, '_')
  const labelText = t(key, status)

  return <span className={`badge badge-${resolvedTone}`}>{labelText}</span>
}
