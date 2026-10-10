import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import {
  users as initialUsers,
  employees as initialEmployees,
  services as initialServices,
  projects as initialProjects,
  landBuying as initialLandBuying,
  landSales as initialLandSales,
  employeeAssignments as initialEmployeeAssignments,
  payments as initialPayments,
} from '../data/mockData'
import { getDefaultProjectEstimation } from '../utils/budgetCalculations'
import {
  authAPI,
  projectAPI,
  propertyAPI,
  buyRequestAPI,
  sellRequestAPI,
  transactionAPI,
  negotiationAPI,
  paymentAPI,
  employeeAPI,
  serviceAPI,
  notificationAPI,
} from '../services/api'
import { io } from 'socket.io-client'

const AppContext = createContext()

const defaultProperties = [
  {
    property_id: 101,
    property_name: 'ECR Sea Breeze Coastal Plot',
    property_code: 'PROP-001',
    property_type: 'Plot / Land',
    survey_number: 'SY-142/3A',
    location: 'Kottivakkam, ECR Road',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600041',
    area: 4800,
    unit: 'Sq. Ft',
    rate_per_unit: 4200,
    total_amount: 20160000,
    seller_id: 201,
    seller_name: 'Santhosh Landowners',
    seller_phone: '9841029384',
    seller_email: 'santhosh@landowners.in',
    status: 'Approved',
    publication_status: 'Published',
    verification_status: 'Verified',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
    document_reference: 'DOC-ECR-2025-8812',
    created_at: '2025-12-10',
    description: 'Prime coastal land parcel suitable for residential luxury villa development.',
  },
  {
    property_id: 102,
    property_name: 'Avinashi Highway Commercial Land',
    property_code: 'PROP-002',
    property_type: 'Commercial Plot',
    survey_number: 'SY-308/1B',
    location: 'Avinashi Road, Kalapatti',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641014',
    area: 2.5,
    unit: 'Acres',
    rate_per_unit: 14000000,
    total_amount: 35000000,
    seller_id: 202,
    seller_name: 'Vanguard Promoters',
    seller_phone: '9842201928',
    seller_email: 'vanguard@realty.com',
    status: 'Approved',
    publication_status: 'Published',
    verification_status: 'Verified',
    image: '/avinashi_commercial_land.jpg',
    document_reference: 'DOC-CBE-2025-5510',
    created_at: '2025-12-15',
    description: 'High visibility frontage land parcel on Avinashi main highway.',
  },
]

const defaultBuyRequests = [
  {
    request_id: 301,
    request_code: 'REQ-BUY-101',
    property_id: 101,
    property_name: 'ECR Sea Breeze Coastal Plot',
    buyer_id: 501,
    buyer_name: 'Ravi',
    buyer_email: 'ravi.kumar@gmail.com',
    buyer_phone: '9791122334',
    budget: 21000000,
    requirements: 'Interested in purchasing plot for constructing a luxury villa.',
    status: 'Negotiation',
    current_stage: 'Price Settlement',
    submitted_date: '2026-01-10',
    verification_status: 'Verified',
  },
]

const defaultSellRequests = [
  {
    sell_request_id: 401,
    request_code: 'REQ-SEL-201',
    property_name: 'Trichy Road Tech Park Site',
    survey_number: 'SY-88/2C',
    location: 'Singanallur, Trichy Road',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641005',
    area: 12000,
    unit: 'Sq. Ft',
    expected_rate: 3200,
    expected_total: 38400000,
    seller_id: 204,
    seller_name: 'Selvam Realities',
    seller_phone: '9843300112',
    seller_email: 'selvam@realities.in',
    status: 'Under Verification',
    remarks: 'DTCP NOC and survey sketch submitted for review.',
    submitted_date: '2026-02-01',
    document_url: 'DOC-TR-2026-009',
  },
]

const defaultNegotiations = [
  {
    negotiation_id: 601,
    negotiation_code: 'NEG-101',
    request_id: 301,
    property_id: 101,
    property_name: 'ECR Sea Breeze Coastal Plot',
    buyer_id: 501,
    buyer_name: 'Ravi',
    seller_id: 201,
    seller_name: 'Santhosh Landowners',
    initial_price: 20160000,
    proposed_price: 19500000,
    counter_offer: 19800000,
    final_agreed_price: 19800000,
    status: 'Counter Offer',
    date: '2026-01-18',
    remarks: 'Seller offered ₹1.98 Cr final closing price.',
  },
]

const defaultTransactions = [
  {
    transaction_id: 701,
    transaction_code: 'TXN-2026-001',
    request_id: 302,
    property_id: 103,
    property_name: 'Green Valley Premium Villa Plot #14',
    buyer_id: 502,
    buyer_name: 'Anand',
    buyer_contact: '9840998877',
    seller_id: 203,
    seller_name: 'Kavitha Landowner',
    seller_contact: '9840112233',
    agreed_amount: 13800000,
    payment_status: 'Advance Paid',
    advance_amount: 2500000,
    transaction_date: '2026-01-22',
    document_reference: 'SALE-DEED-2026-882',
    status: 'Transaction Processing',
    admin_verification: 'Approved',
    remarks: 'Advance ₹25L received. Sub-registrar booking pending.',
  },
]

export function AppProvider({ children }) {
  const [usersList, setUsersList] = useState(initialUsers)

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cpms_user')
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object' && parsed.role) {
          let role = String(parsed.role).toUpperCase()
          if (role === 'BUYER' || role === 'SELLER') role = 'CLIENT'
          return { ...parsed, role }
        }
      }
    } catch (e) {
      console.error('Error reading cpms_user from localStorage', e)
    }
    return null
  })

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('cpms_user', JSON.stringify(currentUser))
      } else {
        localStorage.removeItem('cpms_user')
      }
    } catch (e) {
      console.error('Error saving cpms_user to localStorage', e)
    }
  }, [currentUser])

  // Theme State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('cpms_theme')
      if (saved === 'dark' || saved === 'light') return saved
    } catch (e) {}
    return 'light'
  })

  useEffect(() => {
    try {
      localStorage.setItem('cpms_theme', theme)
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Application Data States
  const [properties, setProperties] = useState(defaultProperties)
  const [buyRequests, setBuyRequests] = useState(defaultBuyRequests)
  const [sellRequests, setSellRequests] = useState(defaultSellRequests)
  const [negotiations, setNegotiations] = useState(defaultNegotiations)
  const [transactions, setTransactions] = useState(defaultTransactions)
  const [employees, setEmployees] = useState(initialEmployees)
  const [services, setServices] = useState(initialServices)
  const [payments, setPayments] = useState(initialPayments)
  const [projects, setProjects] = useState(initialProjects)
  const [assignments, setAssignments] = useState(initialEmployeeAssignments)

  // Helper to merge fetched backend items with initial fallback mock items without losing records
  const mergeLists = (fetched, initial, keyField) => {
    if (!Array.isArray(fetched) || fetched.length === 0) return initial || []
    if (!Array.isArray(initial) || initial.length === 0) return fetched
    const merged = [...fetched]
    initial.forEach((initItem) => {
      const initKey = initItem[keyField]
      if (initKey !== undefined) {
        const exists = merged.some((item) => String(item[keyField]) === String(initKey))
        if (!exists) merged.push(initItem)
      }
    })
    return merged
  }

  // Fetch real data from Express MySQL Backend on Mount / User change
  const refreshBackendData = async () => {
    try {
      const [
        fetchedProjects,
        fetchedProperties,
        fetchedBuyRequests,
        fetchedSellRequests,
        fetchedTransactions,
        fetchedNegotiations,
        fetchedPayments,
        fetchedEmployees,
        fetchedServices,
      ] = await Promise.all([
        projectAPI.getAll().catch(() => null),
        propertyAPI.getAll().catch(() => null),
        buyRequestAPI.getAll().catch(() => null),
        sellRequestAPI.getAll().catch(() => null),
        transactionAPI.getAll().catch(() => null),
        negotiationAPI.getAll().catch(() => null),
        paymentAPI.getAll().catch(() => null),
        employeeAPI.getAll().catch(() => null),
        serviceAPI.getAll().catch(() => null),
      ])

      if (Array.isArray(fetchedProjects)) {
        const processed = fetchedProjects.map((p) => {
          let est = p.budget_estimation
          if (typeof est === 'string') {
            try { est = JSON.parse(est) } catch (e) { est = null }
          }
          if (!est) est = getDefaultProjectEstimation(p.project_id === 1 ? 'standard' : 'premium')
          return { ...p, budget_estimation: est }
        })
        setProjects(mergeLists(processed, initialProjects, 'project_id'))
      }

      if (Array.isArray(fetchedProperties)) setProperties(mergeLists(fetchedProperties, defaultProperties, 'property_id'))
      if (Array.isArray(fetchedBuyRequests)) setBuyRequests(mergeLists(fetchedBuyRequests, defaultBuyRequests, 'request_id'))
      if (Array.isArray(fetchedSellRequests)) setSellRequests(mergeLists(fetchedSellRequests, defaultSellRequests, 'sell_request_id'))
      if (Array.isArray(fetchedTransactions)) setTransactions(mergeLists(fetchedTransactions, defaultTransactions, 'transaction_id'))
      if (Array.isArray(fetchedNegotiations)) setNegotiations(mergeLists(fetchedNegotiations, defaultNegotiations, 'negotiation_id'))
      if (Array.isArray(fetchedPayments)) setPayments(mergeLists(fetchedPayments, initialPayments, 'payment_id'))
      if (Array.isArray(fetchedEmployees)) setEmployees(mergeLists(fetchedEmployees, initialEmployees, 'employee_id'))
      if (Array.isArray(fetchedServices)) setServices(mergeLists(fetchedServices, initialServices, 'service_id'))
    } catch (e) {
      console.error('[AppContext Backend Refresh Error]', e)
    }
  }

  // Notifications State & Real-Time Delivery
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = async () => {
    try {
      const data = await notificationAPI.getAll()
      if (Array.isArray(data)) setNotifications(data)
    } catch (e) {
      console.error('[AppContext Fetch Notifications Error]', e)
    }
  }

  const markNotificationRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
    } catch (e) {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    )
  }

  const markAllNotificationsRead = async () => {
    try {
      await notificationAPI.markAllRead()
    } catch (e) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
  }

  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read || n.is_read === 0).length
  }, [notifications])

  // Socket.IO Connection for Real-Time Event Notifications
  useEffect(() => {
    fetchNotifications()

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    const socketUrl = apiBase.replace(/\/api\/?$/, '')
    const socket = io(socketUrl, { autoConnect: true })

    if (currentUser) {
      socket.emit('join', { userId: currentUser.user_id, role: currentUser.role })
    }

    socket.on('notification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev])
    })

    return () => {
      socket.disconnect()
    }
  }, [currentUser])

  useEffect(() => {
    refreshBackendData()
  }, [])

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password)
      if (res && res.success && res.user) {
        const sessionUser = {
          user_id: res.user.user_id,
          name: res.user.name,
          email: res.user.email,
          role: String(res.user.role || '').toUpperCase(),
          phone: res.user.phone || '',
          status: res.user.status || 'Active',
        }
        setCurrentUser(sessionUser)
        refreshBackendData()
        return { success: true, user: sessionUser }
      }
      return { success: false, error: res?.error || 'Authentication failed' }
    } catch (err) {
      // Fallback local check if server unreachable
      const trimmed = (email || '').trim().toLowerCase()
      const foundUser = usersList.find(
        (u) => u.email.toLowerCase() === trimmed || u.name.toLowerCase() === trimmed
      )
      if (foundUser) {
        const sessionUser = {
          user_id: foundUser.user_id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          phone: foundUser.phone || '',
          status: foundUser.status || 'Active',
        }
        setCurrentUser(sessionUser)
        return { success: true, user: sessionUser }
      }
      return { success: false, error: err.response?.data?.error || err.message || 'Invalid credentials' }
    }
  }

  // Google OAuth Login handler
  const googleLogin = async (googleData) => {
    try {
      const res = await authAPI.googleLogin(googleData)
      if (res && res.success && res.user) {
        const sessionUser = {
          user_id: res.user.user_id,
          name: res.user.name,
          email: res.user.email,
          role: String(res.user.role || '').toUpperCase(),
          phone: res.user.phone || '',
          status: res.user.status || 'Active',
        }
        setCurrentUser(sessionUser)
        refreshBackendData()
        return { success: true, user: sessionUser }
      }
      return { success: false, error: res?.error || 'Google Login failed' }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to authenticate with Google' }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem('cpms_user')
      localStorage.removeItem('cpms_token')
    } catch (e) {
      console.error('Error removing session token', e)
    }
  }

  const addProject = async (projectData) => {
    try {
      const created = await projectAPI.create(projectData)
      if (created) {
        setProjects((prev) => [created, ...prev])
        return created
      }
    } catch (e) {
      console.error('Error creating project via API', e)
    }
    const newId = Math.max(0, ...projects.map((p) => p.project_id || 0)) + 1
    const newProject = {
      project_id: newId,
      project_code: `PRJ-2026-${String(newId).padStart(3, '0')}`,
      overall_progress_percentage: 0,
      project_status: projectData.project_status || 'In Progress',
      status: projectData.status !== false,
      image: 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=800&auto=format&fit=crop',
      created_at: new Date().toISOString().split('T')[0],
      ...projectData,
    }
    setProjects((prev) => [newProject, ...prev])
    return newProject
  }

  const updateProject = async (projectId, updatedData) => {
    try {
      const updated = await projectAPI.update(projectId, updatedData)
      setProjects((prev) =>
        prev.map((p) => (p.project_id === Number(projectId) ? updated || { ...p, ...updatedData } : p))
      )
    } catch (e) {
      console.error('Error updating project via API', e)
      setProjects((prev) =>
        prev.map((p) => (p.project_id === Number(projectId) ? { ...p, ...updatedData } : p))
      )
    }
  }

  const updateProjectBudget = async (projectId, budgetEstimation) => {
    try {
      await projectAPI.update(projectId, {
        budget_estimation: budgetEstimation,
        estimated_budget: budgetEstimation.totalEstimatedBudget,
      })
    } catch (e) {
      console.error('Error updating budget via API', e)
    }
    setProjects((prev) =>
      prev.map((p) =>
        p.project_id === Number(projectId)
          ? {
              ...p,
              budget_estimation: budgetEstimation,
              estimated_budget: budgetEstimation.totalEstimatedBudget,
            }
          : p
      )
    )
  }

  const addPayment = async (paymentData) => {
    try {
      const created = await paymentAPI.create(paymentData)
      if (created) {
        setPayments((prev) => [created, ...prev])
        return created
      }
    } catch (e) {
      console.error('Error creating payment via API', e)
    }
    const newId = Math.max(0, ...payments.map((p) => p.payment_id || 0)) + 1
    const newPayment = {
      payment_id: newId,
      payment_number: paymentData.payment_number || `PAY-2026-${String(newId).padStart(3, '0')}`,
      status: paymentData.status || (paymentData.payment_type === 'Income' ? 'Received' : 'Paid'),
      payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
      ...paymentData,
    }
    setPayments((prev) => [newPayment, ...prev])
    return newPayment
  }

  const updatePayment = async (paymentId, updatedData) => {
    try {
      const updated = await paymentAPI.update(paymentId, updatedData)
      setPayments((prev) =>
        prev.map((p) => (p.payment_id === Number(paymentId) ? updated || { ...p, ...updatedData } : p))
      )
    } catch (e) {
      setPayments((prev) =>
        prev.map((p) => (p.payment_id === Number(paymentId) ? { ...p, ...updatedData } : p))
      )
    }
  }

  const deletePayment = async (paymentId) => {
    try {
      await paymentAPI.delete(paymentId)
    } catch (e) {}
    setPayments((prev) => prev.filter((p) => p.payment_id !== Number(paymentId)))
  }

  const submitBuyRequest = async (requestData) => {
    try {
      const created = await buyRequestAPI.create(requestData)
      if (created) {
        setBuyRequests((prev) => [created, ...prev])
        return created
      }
    } catch (e) {
      console.error('Error submitting buy request', e)
    }
    const newId = Math.max(0, ...buyRequests.map((b) => b.request_id || 0)) + 1
    const newReq = {
      request_id: newId,
      request_code: `REQ-BUY-${100 + newId}`,
      buyer_id: currentUser?.user_id || 500 + newId,
      buyer_name: currentUser?.name || requestData.buyer_name || 'Client',
      buyer_email: currentUser?.email || requestData.buyer_email || '',
      buyer_phone: currentUser?.phone || requestData.buyer_phone || '9840001122',
      status: 'Submitted',
      current_stage: 'Submitted',
      submitted_date: new Date().toISOString().split('T')[0],
      verification_status: 'Under Review',
      ...requestData,
    }
    setBuyRequests((prev) => [newReq, ...prev])
    return newReq
  }

  const submitSellProperty = async (propertyData) => {
    try {
      const createdProp = await propertyAPI.create(propertyData)
      const createdSellReq = await sellRequestAPI.create({
        ...propertyData,
        property_id: createdProp?.property_id,
      })
      if (createdProp) setProperties((prev) => [createdProp, ...prev])
      if (createdSellReq) setSellRequests((prev) => [createdSellReq, ...prev])
      return createdProp
    } catch (e) {
      console.error('Error submitting sell property', e)
    }
    const newPropId = Math.max(0, ...properties.map((p) => p.property_id || 0)) + 1
    const newProp = {
      property_id: newPropId,
      property_code: `PROP-${String(newPropId).padStart(3, '0')}`,
      seller_id: currentUser?.user_id || 200 + newPropId,
      seller_name: currentUser?.name || propertyData.seller_name || 'Client',
      seller_email: currentUser?.email || propertyData.seller_email || '',
      seller_phone: currentUser?.phone || propertyData.seller_phone || '9840009988',
      status: 'Under Verification',
      publication_status: 'Unpublished',
      verification_status: 'Under Review',
      image: propertyData.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
      created_at: new Date().toISOString().split('T')[0],
      ...propertyData,
    }
    setProperties((prev) => [newProp, ...prev])
    return newProp
  }

  const updatePropertyStatus = async (propertyId, status, publication_status, verification_status) => {
    try {
      await propertyAPI.update(propertyId, { status, publication_status, verification_status })
    } catch (e) {}
    setProperties((prev) =>
      prev.map((p) =>
        p.property_id === propertyId
          ? {
              ...p,
              status: status || p.status,
              publication_status: publication_status || p.publication_status,
              verification_status: verification_status || p.verification_status,
            }
          : p
      )
    )
  }

  const updateBuyRequestStatus = async (requestId, status, stage) => {
    try {
      await buyRequestAPI.updateStatus(requestId, status, stage)
    } catch (e) {}
    setBuyRequests((prev) =>
      prev.map((r) =>
        r.request_id === requestId
          ? { ...r, status: status || r.status, current_stage: stage || r.current_stage }
          : r
      )
    )
  }

  const updateNegotiation = async (negId, counterPrice, status, remarks) => {
    try {
      await negotiationAPI.update(negId, {
        counter_offer: counterPrice,
        final_agreed_price: status === 'Agreed' ? counterPrice : undefined,
        status,
        remarks,
      })
    } catch (e) {}
    setNegotiations((prev) =>
      prev.map((n) =>
        n.negotiation_id === negId
          ? {
              ...n,
              counter_offer: counterPrice !== undefined ? counterPrice : n.counter_offer,
              final_agreed_price: status === 'Agreed' ? counterPrice || n.counter_offer : n.final_agreed_price,
              status: status || n.status,
              remarks: remarks || n.remarks,
            }
          : n
      )
    )
  }

  const createTransaction = async (txnData) => {
    try {
      const created = await transactionAPI.create(txnData)
      if (created) {
        setTransactions((prev) => [created, ...prev])
        return created
      }
    } catch (e) {}
    const newId = Math.max(0, ...transactions.map((t) => t.transaction_id || 0)) + 1
    const newTxn = {
      transaction_id: newId,
      transaction_code: `TXN-2026-${String(newId).padStart(3, '0')}`,
      status: 'Transaction Processing',
      admin_verification: 'Approved',
      transaction_date: new Date().toISOString().split('T')[0],
      ...txnData,
    }
    setTransactions((prev) => [newTxn, ...prev])
    return newTxn
  }

  const assignServicePerson = async (serviceId, employeeId, projectId) => {
    const emp = employees.find((e) => e.employee_id === Number(employeeId))
    const srv = services.find((s) => s.service_id === Number(serviceId))
    const prj = projects.find((p) => p.project_id === Number(projectId))

    if (!emp || !srv) return

    try {
      await serviceAPI.update(serviceId, {
        assigned_person_id: emp.employee_id,
        assigned_person_name: `${emp.first_name} ${emp.last_name}`.trim(),
        status: true,
      })
      await employeeAPI.update(employeeId, {
        availability: 'Assigned',
        current_project_name: prj ? prj.project_name : 'Assigned Project',
        current_work: srv.service_name,
      })
    } catch (e) {}

    setServices((prev) =>
      prev.map((s) =>
        s.service_id === Number(serviceId)
          ? {
              ...s,
              assigned_person_id: emp.employee_id,
              assigned_person_name: `${emp.first_name} ${emp.last_name}`.trim(),
              status: true,
            }
          : s
      )
    )

    setEmployees((prev) =>
      prev.map((e) =>
        e.employee_id === Number(employeeId)
          ? {
              ...e,
              availability: 'Assigned',
              current_project_name: prj ? prj.project_name : 'Assigned Project',
              current_service_name: srv.service_name,
            }
          : e
      )
    )
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        googleLogin,
        logout,
        properties,
        buyRequests,
        sellRequests,
        negotiations,
        transactions,
        employees,
        services,
        projects,
        payments,
        assignments,
        addProject,
        updateProject,
        updateProjectBudget,
        addPayment,
        updatePayment,
        deletePayment,
        submitBuyRequest,
        submitSellProperty,
        updatePropertyStatus,
        updateBuyRequestStatus,
        updateNegotiation,
        createTransaction,
        assignServicePerson,
        theme,
        setTheme,
        toggleTheme,
        refreshBackendData,
        notifications,
        unreadNotifCount,
        markNotificationRead,
        markAllNotificationsRead,
        fetchNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    return {
      currentUser: null,
      login: async () => ({ success: false, error: 'App session loading. Please refresh or try again in a moment.' }),
      logout: () => {},
      properties: [],
      buyRequests: [],
      sellRequests: [],
      negotiations: [],
      transactions: [],
      employees: [],
      services: [],
      projects: [],
      payments: [],
      assignments: [],
      addProject: async () => {},
      updateProject: async () => {},
      updateProjectBudget: async () => {},
      addPayment: async () => {},
      updatePayment: async () => {},
      deletePayment: async () => {},
      submitBuyRequest: async () => {},
      submitSellProperty: async () => {},
      updatePropertyStatus: async () => {},
      updateBuyRequestStatus: async () => {},
      updateNegotiation: async () => {},
      createTransaction: async () => {},
      assignServicePerson: async () => {},
      theme: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
      refreshBackendData: async () => {},
      notifications: [],
      unreadNotifCount: 0,
      markNotificationRead: async () => {},
      markAllNotificationsRead: async () => {},
      fetchNotifications: async () => {},
    }
  }
  return ctx
}
