import { Inbox } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description }) {
  const { t } = useTranslation()
  const translatedTitle = t('nothing_here', title)
  const translatedDesc = description ? t(description.toLowerCase().replace(/\s+/g, '_'), description) : ''

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={24} />
      </div>
      <h4>{translatedTitle}</h4>
      {translatedDesc && <p>{translatedDesc}</p>}
    </div>
  )
}
