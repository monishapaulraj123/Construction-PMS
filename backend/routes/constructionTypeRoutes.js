import express from 'express'
import {
  getAllConstructionTypes,
  createConstructionType,
  updateConstructionType,
  deleteConstructionType,
} from '../controllers/constructionTypeController.js'

const router = express.Router()

router.get('/', getAllConstructionTypes)
router.post('/', createConstructionType)
router.put('/:id', updateConstructionType)
router.delete('/:id', deleteConstructionType)

export default router
