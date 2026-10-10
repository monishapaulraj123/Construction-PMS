import express from 'express'
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js'
import { authenticateToken, requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateToken)
router.get('/', getNotifications)
router.put('/read-all', requireAuth, markAllAsRead)
router.put('/:id/read', requireAuth, markAsRead)

export default router
