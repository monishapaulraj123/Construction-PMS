import express from 'express'
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getHousePlan,
  saveHousePlan,
  deleteHousePlan,
  validateHousePlan,
} from '../controllers/projectController.js'

const router = express.Router()

router.get('/', getAllProjects)
router.get('/:id', getProjectById)
router.post('/', createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

// House Plan Endpoints
router.get('/:id/house-plan', getHousePlan)
router.post('/:id/house-plan', saveHousePlan)
router.put('/:id/house-plan', saveHousePlan)
router.delete('/:id/house-plan', deleteHousePlan)
router.post('/:id/house-plan/validate', validateHousePlan)
router.post('/house-plan/validate', validateHousePlan)

export default router
