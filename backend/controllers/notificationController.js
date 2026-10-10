import db from '../config/db.js'

let ioInstance = null

export function setSocketIO(io) {
  ioInstance = io
}

// Helper to create and broadcast notification
export async function createNotification({ user_id, title, message, type = 'info' }) {
  try {
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)',
      [user_id || null, title, message, type]
    )
    const newNotif = {
      id: result.insertId,
      user_id: user_id || null,
      title,
      message,
      type,
      is_read: 0,
      created_at: new Date().toISOString(),
    }

    if (ioInstance) {
      if (user_id) {
        ioInstance.to(`user_${user_id}`).emit('notification', newNotif)
      }
      ioInstance.to('admin_room').emit('notification', newNotif)
    }

    return newNotif
  } catch (error) {
    console.error('[Notification Creation Error]', error)
    return null
  }
}

// GET /api/notifications
export async function getNotifications(req, res) {
  try {
    const userId = req.user?.user_id
    const role = String(req.user?.role || '').toUpperCase()

    let rows = []
    if (role === 'ADMIN') {
      [rows] = await db.query(
        'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
      )
    } else if (userId) {
      [rows] = await db.query(
        'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50',
        [userId]
      )
    } else {
      [rows] = await db.query(
        'SELECT * FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 20'
      )
    }

    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Get Notifications Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications' })
  }
}

// PUT /api/notifications/:id/read
export async function markAsRead(req, res) {
  try {
    const { id } = req.params
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id])
    return res.json({ success: true, message: 'Notification marked as read' })
  } catch (error) {
    console.error('[Mark Read Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update notification' })
  }
}

// PUT /api/notifications/read-all
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user?.user_id
    const role = String(req.user?.role || '').toUpperCase()

    if (role === 'ADMIN') {
      await db.query('UPDATE notifications SET is_read = 1')
    } else if (userId) {
      await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL', [userId])
    }
    return res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('[Mark All Read Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update notifications' })
  }
}
