import express from 'express'
import {
  getAllConstructionStages,
  createConstructionStage,
  updateConstructionStage,
  deleteConstructionStage,
} from '../controllers/constructionStageController.js'

const router = express.Router()

router.get('/', getAllConstructionStages)
router.post('/', createConstructionStage)
router.put('/:id', updateConstructionStage)
router.delete('/:id', deleteConstructionStage)

export default router
