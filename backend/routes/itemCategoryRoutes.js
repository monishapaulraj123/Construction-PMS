import express from 'express'
import {
  getAllItemCategories,
  createItemCategory,
  updateItemCategory,
  deleteItemCategory,
} from '../controllers/itemCategoryController.js'

const router = express.Router()

router.get('/', getAllItemCategories)
router.post('/', createItemCategory)
router.put('/:id', updateItemCategory)
router.delete('/:id', deleteItemCategory)

export default router
