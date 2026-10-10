import express from 'express'
import { getAllNegotiations, updateNegotiation } from '../controllers/negotiationController.js'

const router = express.Router()

router.get('/', getAllNegotiations)
router.put('/:id', updateNegotiation)

export default router
