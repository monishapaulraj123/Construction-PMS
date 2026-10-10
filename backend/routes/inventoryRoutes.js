import express from 'express'
import {
  getDashboardMetrics,
  getMaterials,
  createMaterial,
  updateMaterial,
  archiveMaterial,
  stockIn,
  stockOut,
  getAllocations,
  createAllocation,
  issueFromAllocation,
  returnFromSite,
  getTransactions,
  getReports,
} from '../controllers/inventoryController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateToken)

// Inventory Dashboard & Reports
router.get('/dashboard', getDashboardMetrics)
router.get('/reports', getReports)

// Material Catalog Management
router.get('/materials', getMaterials)
router.post('/materials', createMaterial)
router.put('/materials/:id', updateMaterial)
router.delete('/materials/:id', archiveMaterial)

// Stock Operations
router.post('/stock-in', stockIn)
router.post('/stock-out', stockOut)

// Project Allocations & Site Issues / Returns
router.get('/allocations', getAllocations)
router.post('/allocate', createAllocation)
router.post('/allocations/issue', issueFromAllocation)
router.post('/allocations/return', returnFromSite)

// Movement Ledger
router.get('/transactions', getTransactions)

export default router
