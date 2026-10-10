import express from 'express'
import { getAdminDashboardStats, getClientDashboardStats } from '../controllers/dashboardController.js'

const router = express.Router()

router.get('/stats', getAdminDashboardStats)
router.get('/client-stats/:userId?', getClientDashboardStats)

export default router
