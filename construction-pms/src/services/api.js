import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include Auth token if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('cpms_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    console.error('Error attaching token', e)
  }
  return config
})

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    if (res.data.token) {
      localStorage.setItem('cpms_token', res.data.token)
    }
    return res.data
  },
  googleLogin: async (googleUser) => {
    const res = await api.post('/auth/google', googleUser)
    if (res.data.token) {
      localStorage.setItem('cpms_token', res.data.token)
    }
    return res.data
  },
  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },
  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data)
    return res.data
  },
}

// Master Data APIs
export const employeeTypeAPI = {
  getAll: (params) => api.get('/employee-types', { params }).then((res) => res.data.data),
  create: (data) => api.post('/employee-types', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/employee-types/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/employee-types/${id}`).then((res) => res.data),
}

export const itemCategoryAPI = {
  getAll: (params) => api.get('/item-categories', { params }).then((res) => res.data.data),
  create: (data) => api.post('/item-categories', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/item-categories/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/item-categories/${id}`).then((res) => res.data),
}

export const itemAPI = {
  getAll: (params) => api.get('/items', { params }).then((res) => res.data.data),
  create: (data) => api.post('/items', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/items/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/items/${id}`).then((res) => res.data),
}

export const supplierAPI = {
  getAll: (params) => api.get('/suppliers', { params }).then((res) => res.data.data),
  create: (data) => api.post('/suppliers', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/suppliers/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/suppliers/${id}`).then((res) => res.data),
}

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }).then((res) => res.data.data),
  create: (data) => api.post('/employees', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/employees/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/employees/${id}`).then((res) => res.data),
}

export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }).then((res) => res.data.data),
  create: (data) => api.post('/services', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/services/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/services/${id}`).then((res) => res.data),
}

export const constructionTypeAPI = {
  getAll: (params) => api.get('/construction-types', { params }).then((res) => res.data.data),
  create: (data) => api.post('/construction-types', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/construction-types/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/construction-types/${id}`).then((res) => res.data),
}

export const constructionStageAPI = {
  getAll: (params) => api.get('/construction-stages', { params }).then((res) => res.data.data),
  create: (data) => api.post('/construction-stages', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/construction-stages/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/construction-stages/${id}`).then((res) => res.data),
}

export const clientAPI = {
  getAll: (params) => api.get('/clients', { params }).then((res) => res.data.data),
  create: (data) => api.post('/clients', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/clients/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/clients/${id}`).then((res) => res.data),
}

// Project API
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/projects/${id}`).then((res) => res.data.data),
  create: (data) => api.post('/projects', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/projects/${id}`).then((res) => res.data),
}

export const housePlanAPI = {
  get: (projectId) => api.get(`/projects/${projectId}/house-plan`).then((res) => res.data.data),
  save: (projectId, plan) => api.post(`/projects/${projectId}/house-plan`, plan).then((res) => res.data.data),
  delete: (projectId) => api.delete(`/projects/${projectId}/house-plan`).then((res) => res.data),
  validate: (projectId, plan) => api.post(`/projects/${projectId}/house-plan/validate`, plan).then((res) => res.data.validation),
}


// Real Estate Module APIs
export const propertyAPI = {
  getAll: (params) => api.get('/properties', { params }).then((res) => res.data.data),
  create: (data) => api.post('/properties', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/properties/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/properties/${id}`).then((res) => res.data),
}

export const buyRequestAPI = {
  getAll: (params) => api.get('/buy-requests', { params }).then((res) => res.data.data),
  create: (data) => api.post('/buy-requests', data).then((res) => res.data.data),
  updateStatus: (id, status, current_stage) => api.put(`/buy-requests/${id}`, { status, current_stage }).then((res) => res.data.data),
  delete: (id) => api.delete(`/buy-requests/${id}`).then((res) => res.data),
}

export const sellRequestAPI = {
  getAll: (params) => api.get('/sell-requests', { params }).then((res) => res.data.data),
  create: (data) => api.post('/sell-requests', data).then((res) => res.data.data),
  updateStatus: (id, status, remarks) => api.put(`/sell-requests/${id}`, { status, remarks }).then((res) => res.data.data),
  delete: (id) => api.delete(`/sell-requests/${id}`).then((res) => res.data),
}

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }).then((res) => res.data.data),
  create: (data) => api.post('/transactions', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/transactions/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/transactions/${id}`).then((res) => res.data),
}

export const negotiationAPI = {
  getAll: (params) => api.get('/negotiations', { params }).then((res) => res.data.data),
  update: (id, data) => api.put(`/negotiations/${id}`, data).then((res) => res.data.data),
}

export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }).then((res) => res.data.data),
  create: (data) => api.post('/payments', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/payments/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/payments/${id}`).then((res) => res.data),
}

export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/stats').then((res) => res.data),
  getClientStats: (userId) => api.get(`/dashboard/client-stats/${userId || ''}`).then((res) => res.data),
}

export const analyticsAPI = {
  getAnalyticsData: (params) => api.get('/analytics', { params }).then((res) => res.data),
}

export const notificationAPI = {
  getAll: () => api.get('/notifications').then((res) => res.data.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((res) => res.data),
  markAllRead: () => api.put('/notifications/read-all').then((res) => res.data),
}

export const aiAPI = {
  chat: (query, confirmAction = false, actionData = null, source = 'chat', history = []) =>
    api.post('/ai/chat', { query, confirmAction, actionData, source, history }).then((res) => res.data),
}

export const attendanceAPI = {
  getToday: () => api.get('/attendance/today').then((res) => res.data),
  checkIn: (locationData) => api.post('/attendance/check-in', locationData).then((res) => res.data),
  checkOut: () => api.post('/attendance/check-out').then((res) => res.data),
  getDashboard: () => api.get('/attendance/dashboard').then((res) => res.data),
  getSites: () => api.get('/attendance/sites').then((res) => res.data.sites),
  createSite: (siteData) => api.post('/attendance/sites', siteData).then((res) => res.data),
  updateSite: (id, siteData) => api.put(`/attendance/sites/${id}`, siteData).then((res) => res.data),
  getAssignments: () => api.get('/attendance/assignments').then((res) => res.data.assignments),
  createAssignment: (data) => api.post('/attendance/assignments', data).then((res) => res.data),
  getHistory: (params) => api.get('/attendance/history', { params }).then((res) => res.data.history),
  getCorrections: (params) => api.get('/attendance/corrections', { params }).then((res) => res.data.corrections),
  createCorrection: (data) => api.post('/attendance/corrections', data).then((res) => res.data),
  reviewCorrection: (id, data) => api.patch(`/attendance/corrections/${id}/review`, data).then((res) => res.data),
  getSiteWorkersToday: (params) => api.get('/attendance/site-workers-today', { params }).then((res) => res.data),
  createUserAccount: (data) => api.post('/attendance/create-user-account', data).then((res) => res.data),
  exportCSV: (params) => api.get('/attendance/export', { params, responseType: 'blob' }),
  exportCSVUrl: `${API_BASE_URL}/attendance/export`,
  importCSV: (csvData) => api.post('/attendance/import-csv', { csvData }).then((res) => res.data),
}

export const inventoryAPI = {
  getDashboard: () => api.get('/inventory/dashboard').then((res) => res.data),
  getMaterials: (params) => api.get('/inventory/materials', { params }).then((res) => res.data.data),
  createMaterial: (data) => api.post('/inventory/materials', data).then((res) => res.data),
  updateMaterial: (id, data) => api.put(`/inventory/materials/${id}`, data).then((res) => res.data),
  archiveMaterial: (id) => api.delete(`/inventory/materials/${id}`).then((res) => res.data),
  stockIn: (data) => api.post('/inventory/stock-in', data).then((res) => res.data),
  stockOut: (data) => api.post('/inventory/stock-out', data).then((res) => res.data),
  getAllocations: () => api.get('/inventory/allocations').then((res) => res.data.data),
  createAllocation: (data) => api.post('/inventory/allocate', data).then((res) => res.data),
  issueAllocation: (data) => api.post('/inventory/allocations/issue', data).then((res) => res.data),
  returnSite: (data) => api.post('/inventory/allocations/return', data).then((res) => res.data),
  getTransactions: (params) => api.get('/inventory/transactions', { params }).then((res) => res.data.data),
  getReports: () => api.get('/inventory/reports').then((res) => res.data),
}

export const procurementAPI = {
  getRFQs: () => api.get('/materials/rfq').then((res) => res.data.data),
  createRFQ: (data) => api.post('/materials/rfq', data).then((res) => res.data),
  getQuotations: (rfqId) => api.get('/materials/quotations', { params: { rfq_id: rfqId } }).then((res) => res.data.data),
  createQuotation: (data) => api.post('/materials/quotations', data).then((res) => res.data),
  getRecommendations: (rfqId) => api.get(`/materials/rfq/${rfqId}/recommendations`).then((res) => res.data.data),
  getPOs: () => api.get('/materials/po').then((res) => res.data.data),
  createPOFromQuotation: (data) => api.post('/materials/po/from-quotation', data).then((res) => res.data),
  updatePOStatus: (id, status) => api.patch(`/materials/po/${id}/status`, { status }).then((res) => res.data),
  addPOPayment: (id, amount) => api.post(`/materials/po/${id}/payment`, { amount }).then((res) => res.data),
}

export default api
