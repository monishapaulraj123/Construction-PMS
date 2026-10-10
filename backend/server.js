import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/db.js'

import authRoutes from './routes/authRoutes.js'
import employeeTypeRoutes from './routes/employeeTypeRoutes.js'
import itemCategoryRoutes from './routes/itemCategoryRoutes.js'
import itemRoutes from './routes/itemRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import constructionTypeRoutes from './routes/constructionTypeRoutes.js'
import constructionStageRoutes from './routes/constructionStageRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import buyRequestRoutes from './routes/buyRequestRoutes.js'
import sellRequestRoutes from './routes/sellRequestRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import negotiationRoutes from './routes/negotiationRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import { setSocketIO } from './controllers/notificationController.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// Configure CORS
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || origin === allowedOrigin) {
      callback(null, true)
    } else {
      callback(null, true)
    }
  },
  credentials: true
}))

app.use(express.json())

// Configure Socket.IO Real-time Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

setSocketIO(io)

io.on('connection', (socket) => {
  socket.on('join', (data) => {
    if (data?.userId) {
      socket.join(`user_${data.userId}`)
    }
    if (data?.role === 'ADMIN') {
      socket.join('admin_room')
    }
  })
})

// Root system info endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Construction & Real Estate Enterprise PMS REST API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      projects: '/api/projects',
      properties: '/api/properties',
      clients: '/api/clients',
      employees: '/api/employees',
      suppliers: '/api/suppliers'
    },
    timestamp: new Date().toISOString()
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Construction & Real Estate Backend Service Running' })
})

// Mount API routes
app.use('/api/auth', authRoutes)
app.use('/api/employee-types', employeeTypeRoutes)
app.use('/api/item-categories', itemCategoryRoutes)
app.use('/api/items', itemRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/construction-types', constructionTypeRoutes)
app.use('/api/construction-stages', constructionStageRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/buy-requests', buyRequestRoutes)
app.use('/api/sell-requests', sellRequestRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/negotiations', negotiationRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/ai', aiRoutes)

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Start Server
server.listen(PORT, async () => {
  console.log(`==================================================`)
  console.log(`🚀 Express Backend Server running on http://localhost:${PORT}`)
  console.log(`==================================================`)
  await testConnection()
})
