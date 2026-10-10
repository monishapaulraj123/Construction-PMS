import express from 'express'
import {
  getAllSellRequests,
  createSellRequest,
  updateSellRequestStatus,
  deleteSellRequest,
} from '../controllers/sellRequestController.js'

const router = express.Router()

router.get('/', getAllSellRequests)
router.post('/', createSellRequest)
router.put('/:id', updateSellRequestStatus)
router.delete('/:id', deleteSellRequest)

export default router
