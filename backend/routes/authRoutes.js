import express from 'express'
import { login, googleLogin, getCurrentUser, updateProfile } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

router.post('/login', authRateLimiter, login)
router.post('/google', authRateLimiter, googleLogin)
router.get('/me', authenticateToken, getCurrentUser)
router.put('/profile', authenticateToken, updateProfile)

export default router

