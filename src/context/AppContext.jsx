import { createContext, useContext, useState, useEffect } from 'react'
import {
  users as initialUsers,
  employees as initialEmployees,
  services as initialServices,
  projects as initialProjects,
  landBuying as initialLandBuying,
  landSales as initialLandSales,
  employeeAssignments as initialEmployeeAssignments,
} from '../data/mockData'

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
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
    document_reference: 'DOC-CBE-2025-5510',
    created_at: '2025-12-15',
    description: 'High visibility frontage land parcel on Avinashi main highway.',
  },
  {
    property_id: 103,
    property_name: 'Green Valley Premium Villa Plot #14',
    property_code: 'PROP-003',
    property_type: 'Residential Plot',
    survey_number: 'SY-142/3A-P14',
    location: 'ECR Road, Kottivakkam',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600041',
    area: 2400,
    unit: 'Sq. Ft',
    rate_per_unit: 5800,
    total_amount: 13920000,
    seller_id: 203,
    seller_name: 'Kavitha Landowner',
    seller_phone: '9840112233',
    seller_email: 'kavitha@gmail.com',
    status: 'Approved',
    publication_status: 'Published',
    verification_status: 'Verified',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    document_reference: 'DOC-GV-2025-104',
    created_at: '2026-01-05',
    description: 'Corner villa plot inside approved gated layout with 40ft road access.',
  },
  {
    property_id: 104,
    property_name: 'Trichy Road Tech Park Site',
    property_code: 'PROP-004',
    property_type: 'Commercial Plot',
    survey_number: 'SY-88/2C',
    location: 'Singanallur, Trichy Road',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641005',
    area: 12000,
    unit: 'Sq. Ft',
    rate_per_unit: 3200,
    total_amount: 38400000,
    seller_id: 204,
    seller_name: 'Selvam Realities',
    seller_phone: '9843300112',
    seller_email: 'selvam@realities.in',
    status: 'Under Verification',
    publication_status: 'Unpublished',
    verification_status: 'Under Review',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    document_reference: 'DOC-TR-2026-009',
    created_at: '2026-02-01',
    description: 'Commercial plot undergoing DTCP title verification and road setback validation.',
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
  {
    request_id: 302,
    request_code: 'REQ-BUY-102',
    property_id: 103,
    property_name: 'Green Valley Premium Villa Plot #14',
    buyer_id: 502,
    buyer_name: 'Anand',
    buyer_email: 'anand.sharma@gmail.com',
    buyer_phone: '9840998877',
    budget: 14000000,
    requirements: 'Immediate booking intent. Looking for clear title handover.',
    status: 'Transaction Processing',
    current_stage: 'Advance Paid',
    submitted_date: '2026-01-15',
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
  {
    negotiation_id: 602,
    negotiation_code: 'NEG-102',
    request_id: 302,
    property_id: 103,
    property_name: 'Green Valley Premium Villa Plot #14',
    buyer_id: 502,
    buyer_name: 'Anand',
    seller_id: 203,
    seller_name: 'Kavitha Landowner',
    initial_price: 13920000,
    proposed_price: 13500000,
    counter_offer: 13800000,
    final_agreed_price: 13800000,
    status: 'Agreed',
    date: '2026-01-20',
    remarks: 'Final price agreed at ₹1.38 Cr. Transaction initiated.',
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
  {
    transaction_id: 702,
    transaction_code: 'TXN-2025-901',
    request_id: 300,
    property_id: 101,
    property_name: 'ECR Sea Breeze Coastal Plot',
    buyer_id: 501,
    buyer_name: 'Ravi',
    buyer_contact: '9791122334',
    seller_id: 201,
    seller_name: 'Santhosh Landowners',
    seller_contact: '9841029384',
    agreed_amount: 20160000,
    payment_status: 'Completed',
    advance_amount: 20160000,
    transaction_date: '2025-11-10',
    document_reference: 'DOC-ECR-2025-8812',
    status: 'Completed',
    admin_verification: 'Approved',
    remarks: 'Sale deed executed and handed over.',
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

  const [properties, setProperties] = useState(defaultProperties)
  const [buyRequests, setBuyRequests] = useState(defaultBuyRequests)
  const [sellRequests, setSellRequests] = useState(defaultSellRequests)
  const [negotiations, setNegotiations] = useState(defaultNegotiations)
  const [transactions, setTransactions] = useState(defaultTransactions)

  const [employees, setEmployees] = useState(initialEmployees)
  const [services, setServices] = useState(initialServices)
  const [projects, setProjects] = useState(initialProjects)
  const [assignments, setAssignments] = useState(initialEmployeeAssignments)

  const login = (email, password) => {
    const trimmed = (email || '').trim().toLowerCase()
    const foundUser = usersList.find(
      (u) => u.email.toLowerCase() === trimmed || u.name.toLowerCase() === trimmed
    )

    if (!foundUser) {
      return { success: false, error: 'User account not found in database.' }
    }

    if (password && foundUser.password_hash && password !== foundUser.password_hash) {
      return { success: false, error: 'Invalid password. Please check your credentials.' }
    }

    const sessionUser = {
      user_id: foundUser.user_id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role, // ONLY "ADMIN" or "CLIENT"
      phone: foundUser.phone || '',
      status: foundUser.status || 'Active',
    }

    setCurrentUser(sessionUser)
    return { success: true, user: sessionUser }
  }

  const logout = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem('cpms_user')
    } catch (e) {
      console.error('Error removing cpms_user', e)
    }
  }

  const submitBuyRequest = (requestData) => {
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

  const submitSellProperty = (propertyData) => {
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

    const newSellReqId = Math.max(0, ...sellRequests.map((s) => s.sell_request_id || 0)) + 1
    const newSellReq = {
      sell_request_id: newSellReqId,
      request_code: `REQ-SEL-${200 + newSellReqId}`,
      property_id: newPropId,
      seller_id: currentUser?.user_id || 200 + newSellReqId,
      seller_name: currentUser?.name || propertyData.seller_name || 'Client',
      seller_email: currentUser?.email || propertyData.seller_email || '',
      seller_phone: currentUser?.phone || propertyData.seller_phone || '',
      status: 'Under Verification',
      submitted_date: new Date().toISOString().split('T')[0],
      ...propertyData,
    }
    setSellRequests((prev) => [newSellReq, ...prev])
    return newProp
  }

  const updatePropertyStatus = (propertyId, status, publication_status, verification_status) => {
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

  const updateBuyRequestStatus = (requestId, status, stage) => {
    setBuyRequests((prev) =>
      prev.map((r) =>
        r.request_id === requestId
          ? { ...r, status: status || r.status, current_stage: stage || r.current_stage }
          : r
      )
    )
  }

  const updateNegotiation = (negId, counterPrice, status, remarks) => {
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

  const createTransaction = (txnData) => {
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

  const assignServicePerson = (serviceId, employeeId, projectId) => {
    const emp = employees.find((e) => e.employee_id === Number(employeeId))
    const srv = services.find((s) => s.service_id === Number(serviceId))
    const prj = projects.find((p) => p.project_id === Number(projectId))

    if (!emp || !srv) return

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

    const newAssignId = Math.max(0, ...assignments.map((a) => a.assignment_id || 0)) + 1
    setAssignments((prev) => [
      {
        assignment_id: newAssignId,
        employee_id: emp.employee_id,
        employee_name: `${emp.first_name} ${emp.last_name}`.trim(),
        project_id: prj ? prj.project_id : 1,
        project_name: prj ? prj.project_name : 'Project',
        service_name: srv.service_name,
        role_in_project: emp.employee_type_name || 'Specialist',
        assigned_date: new Date().toISOString().split('T')[0],
        status: 'Active',
      },
      ...prev,
    ])
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        properties,
        buyRequests,
        sellRequests,
        negotiations,
        transactions,
        employees,
        services,
        projects,
        assignments,
        submitBuyRequest,
        submitSellProperty,
        updatePropertyStatus,
        updateBuyRequestStatus,
        updateNegotiation,
        createTransaction,
        assignServicePerson,
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
      login: () => ({ success: false, error: 'Context uninitialized' }),
      logout: () => {},
      properties: [],
      buyRequests: [],
      sellRequests: [],
      negotiations: [],
      transactions: [],
      employees: [],
      services: [],
      projects: [],
      assignments: [],
      submitBuyRequest: () => {},
      submitSellProperty: () => {},
      updatePropertyStatus: () => {},
      updateBuyRequestStatus: () => {},
      updateNegotiation: () => {},
      createTransaction: () => {},
      assignServicePerson: () => {},
    }
  }
  return ctx
}
