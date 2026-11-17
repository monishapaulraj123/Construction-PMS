import express from 'express'
import { verifyDiagnosticToken, getDatabaseDiagnostics } from '../controllers/diagnosticController.js'

const router = express.Router()

// Temporary Diagnostic Endpoint: GET /api/diagnostics/database
router.get('/database', verifyDiagnosticToken, getDatabaseDiagnostics)

export default router
