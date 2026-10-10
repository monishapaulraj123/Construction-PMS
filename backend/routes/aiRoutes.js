import express from 'express'
import { chatWithAi } from '../controllers/aiController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { aiRateLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

router.use(authenticateToken)
router.post('/chat', aiRateLimiter, chatWithAi)

export default router
