import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'
import { formatDate } from '../utils/format'

export default function NotificationPanel() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp()
  const { t } = useTranslation()

  return (
    <div className="notif-panel">
      <div className="notif-panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{t('notifications', 'Notifications')}</span>
        {notifications.length > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            style={{ background: 'none', border: 'none', color: '#2F5D50', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: 16, fontSize: '0.82rem', color: 'var(--ink-500)', textAlign: 'center' }}>
          {t('no_notifications', 'No new notifications')}
        </div>
      ) : (
        notifications.slice(0, 8).map((n) => (
          <div
            className="notif-item"
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            style={{
              cursor: 'pointer',
              opacity: n.is_read ? 0.65 : 1,
              background: n.is_read ? 'transparent' : 'rgba(47, 93, 80, 0.04)',
            }}
          >
            <div className="notif-dot" style={{ background: n.is_read ? 'var(--ink-300)' : '#2F5D50' }} />
            <div className="notif-text">
              <p style={{ fontWeight: n.is_read ? 500 : 700 }}>{n.title || n.message}</p>
              {n.title && n.message && <p style={{ fontSize: '0.78rem', color: 'var(--ink-600)', marginTop: 2 }}>{n.message}</p>}
              <span>{n.created_at ? formatDate(n.created_at) : 'Just now'}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
