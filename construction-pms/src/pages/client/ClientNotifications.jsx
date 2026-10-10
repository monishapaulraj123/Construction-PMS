import { Bell, CheckCircle2, Clock, Scale, Info, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatDate } from '../../utils/format'

export default function ClientNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp()
  const { t } = useTranslation()

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle2, color: '#16a34a' }
      case 'warning':
        return { icon: AlertTriangle, color: '#d97706' }
      case 'negotiation':
        return { icon: Scale, color: '#D4B06A' }
      default:
        return { icon: Info, color: '#2563eb' }
    }
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('notifications', 'Notifications')}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            {t('client_notif_desc', 'Stay updated on request approvals, site visits, and price counter-offers.')}
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllNotificationsRead}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 6,
              background: 'var(--cream-100)',
              border: '1px solid var(--cream-300)',
              color: '#2F5D50',
              cursor: 'pointer',
            }}
          >
            {t('save', 'Mark All as Read')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)' }}>
            {t('no_notifications', 'No new notifications')}
          </div>
        ) : (
          notifications.map((n) => {
            const { icon: Icon, color } = getNotifIcon(n.type)
            return (
              <div
                key={n.id}
                className="card"
                onClick={() => markNotificationRead(n.id)}
                style={{
                  padding: 16,
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  opacity: n.is_read ? 0.7 : 1,
                  borderLeft: `4px solid ${color}`,
                }}
              >
                <div style={{ padding: 10, borderRadius: 8, background: `${color}15`, color }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: n.is_read ? 600 : 800, margin: 0, color: 'var(--ink-900)' }}>
                      {n.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink-400)' }}>
                      {n.created_at ? formatDate(n.created_at) : 'Recent'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ink-600)', marginTop: 4, margin: '4px 0 0 0' }}>{n.message}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
