import { Router } from 'express'
import {
  getTodayStatus,
  checkIn,
  checkOut,
  getDashboardMetrics,
  getSites,
  createSite,
  updateSite,
  getAssignments,
  createAssignment,
  getAttendanceHistory,
  getCorrectionRequests,
  createCorrectionRequest,
  reviewCorrectionRequest,
  exportAttendanceCSV,
  createUserAccountForEmployee,
} from '../controllers/attendanceController.js'
import { authenticateToken, requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// All attendance routes require authentication
router.use(authenticateToken)
router.use(requireAuth)

// Worker Spot Attendance
router.get('/today', getTodayStatus)
router.post('/check-in', checkIn)
router.post('/check-out', checkOut)

// Admin & Supervisor Dashboard Metrics
router.get('/dashboard', getDashboardMetrics)

// Construction Site Management
router.get('/sites', getSites)
router.post('/sites', requireAdmin, createSite)
router.put('/sites/:id', requireAdmin, updateSite)

// Worker Assignments
router.get('/assignments', getAssignments)
router.post('/assignments', requireAdmin, createAssignment)

// History & Reports
router.get('/history', getAttendanceHistory)
router.get('/export', exportAttendanceCSV)

// Correction Requests
router.get('/corrections', getCorrectionRequests)
router.post('/corrections', createCorrectionRequest)
// User Account Provisioning for Supervisors & Workers (Admin Only)
router.post('/create-user-account', requireAdmin, createUserAccountForEmployee)

export default router
