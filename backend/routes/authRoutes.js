import express from 'express'
import { login, googleLogin, getCurrentUser } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

router.post('/login', authRateLimiter, login)
router.post('/google', authRateLimiter, googleLogin)
router.get('/me', authenticateToken, getCurrentUser)

export default router
