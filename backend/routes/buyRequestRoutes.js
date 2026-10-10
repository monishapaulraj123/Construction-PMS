import express from 'express'
import {
  getAllBuyRequests,
  createBuyRequest,
  updateBuyRequestStatus,
  deleteBuyRequest,
} from '../controllers/buyRequestController.js'

const router = express.Router()

router.get('/', getAllBuyRequests)
router.post('/', createBuyRequest)
router.put('/:id', updateBuyRequestStatus)
router.delete('/:id', deleteBuyRequest)

export default router
