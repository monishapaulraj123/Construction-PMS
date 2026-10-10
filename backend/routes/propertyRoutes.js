import express from 'express'
import {
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js'

const router = express.Router()

router.get('/', getAllProperties)
router.post('/', createProperty)
router.put('/:id', updateProperty)
router.delete('/:id', deleteProperty)

export default router
