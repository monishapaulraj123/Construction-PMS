const notifications = [
  { id: 1, text: 'Inspection failed for City Hospital Construction', time: '20 min ago' },
  { id: 2, text: 'Material request MR-2026-011 is pending approval', time: '1 hr ago' },
  { id: 3, text: 'Quotation received from Chennai Steel House', time: '3 hrs ago' },
  { id: 4, text: 'Sunrise Public School is running behind schedule', time: 'Yesterday' },
]

export default function NotificationPanel() {
  return (
    <div className="notif-panel">
      <div className="notif-panel-head">Notifications</div>
      {notifications.map((n) => (
        <div className="notif-item" key={n.id}>
          <div className="notif-dot" />
          <div className="notif-text">
            <p>{n.text}</p>
            <span>{n.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
