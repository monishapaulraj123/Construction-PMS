import express from 'express'
import {
  getAllEmployeeTypes,
  createEmployeeType,
  updateEmployeeType,
  deleteEmployeeType,
} from '../controllers/employeeTypeController.js'

const router = express.Router()

router.get('/', getAllEmployeeTypes)
router.post('/', createEmployeeType)
router.put('/:id', updateEmployeeType)
router.delete('/:id', deleteEmployeeType)

export default router
