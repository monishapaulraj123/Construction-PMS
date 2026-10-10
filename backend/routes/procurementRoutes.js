import express from 'express'
import {
  getRFQs,
  createRFQ,
  getQuotations,
  createQuotation,
  getRFQRecommendations,
  createPOFromQuotation,
  getPOs,
  updatePOStatus,
  addPOPayment,
} from '../controllers/procurementController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateToken)

// RFQs (Material Requirements)
router.get('/rfq', getRFQs)
router.post('/rfq', createRFQ)

// Quotations
router.get('/quotations', getQuotations)
router.post('/quotations', createQuotation)

// Supplier Recommendation Engine (Weighted Algorithm)
router.get('/rfq/:rfqId/recommendations', getRFQRecommendations)

// Purchase Orders & Delivery
router.get('/po', getPOs)
router.post('/po/from-quotation', createPOFromQuotation)
router.patch('/po/:id/status', updatePOStatus)
router.post('/po/:id/payment', addPOPayment)

export default router
