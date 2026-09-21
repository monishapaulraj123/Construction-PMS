import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import { ToastProvider } from './components/ToastContext'
import { AppProvider, useApp } from './context/AppContext'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EmployeeTypes from './pages/EmployeeTypes'
import Employees from './pages/Employees'
import ItemCategories from './pages/ItemCategories'
import Items from './pages/Items'
import Suppliers from './pages/Suppliers'
import Services from './pages/Services'
import ConstructionTypes from './pages/ConstructionTypes'
import ProjectTypes from './pages/ProjectTypes'
import ConstructionStages from './pages/ConstructionStages'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import ProjectDetails from './pages/ProjectDetails'
import ProjectPlanning from './pages/ProjectPlanning'
import StageTracking from './pages/StageTracking'
import ProgressUpdates from './pages/ProgressUpdates'
import SiteUpdates from './pages/SiteUpdates'
import MaterialRequests from './pages/MaterialRequests'
import Quotations from './pages/Quotations'
import Orders from './pages/Orders'
import Deliveries from './pages/Deliveries'
import Inventory from './pages/Inventory'
import Inspections from './pages/Inspections'
import Rework from './pages/Rework'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Contracts from './pages/Contracts'
import WorkManagement from './pages/WorkManagement'
import Payments from './pages/Payments'

// Admin Real Estate
import RealEstateOverview from './pages/real-estate/RealEstateOverview'
import AdminProperties from './pages/real-estate/AdminProperties'
import BuyRequests from './pages/real-estate/BuyRequests'
import SellRequests from './pages/real-estate/SellRequests'
import PropertyVerification from './pages/real-estate/PropertyVerification'
import Negotiations from './pages/real-estate/Negotiations'
import Transactions from './pages/real-estate/Transactions'

// Unified Client Pages
import ClientDashboard from './pages/client/ClientDashboard'
import ClientBuy from './pages/client/ClientBuy'
import ClientSell from './pages/client/ClientSell'
import ClientRequests from './pages/client/ClientRequests'
import ClientTransactions from './pages/client/ClientTransactions'
import ClientDocuments from './pages/client/ClientDocuments'
import ClientNotifications from './pages/client/ClientNotifications'
import ClientProfile from './pages/client/ClientProfile'

import NotFound from './pages/NotFound'

function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser } = useApp()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const userRole = String(currentUser.role || '').toUpperCase()
  const normalizedAllowed = (allowedRoles || []).map((r) => r.toUpperCase())

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole)) {
    if (userRole === 'CLIENT') {
      return <Navigate to="/client/dashboard" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Routes>
          {/* Public Common Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Main App Layout */}
          <Route element={<MainLayout />}>
            {/* ADMIN Protected Routes */}
            <Route path="/" element={<ProtectedRoute allowedRoles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
            <Route path="/real-estate/overview" element={<ProtectedRoute allowedRoles={['ADMIN']}><RealEstateOverview /></ProtectedRoute>} />
            <Route path="/real-estate/properties" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProperties /></ProtectedRoute>} />
            <Route path="/real-estate/buy-requests" element={<ProtectedRoute allowedRoles={['ADMIN']}><BuyRequests /></ProtectedRoute>} />
            <Route path="/real-estate/sell-requests" element={<ProtectedRoute allowedRoles={['ADMIN']}><SellRequests /></ProtectedRoute>} />
            <Route path="/real-estate/verification" element={<ProtectedRoute allowedRoles={['ADMIN']}><PropertyVerification /></ProtectedRoute>} />
            <Route path="/real-estate/negotiations" element={<ProtectedRoute allowedRoles={['ADMIN']}><Negotiations /></ProtectedRoute>} />
            <Route path="/real-estate/transactions" element={<ProtectedRoute allowedRoles={['ADMIN']}><Transactions /></ProtectedRoute>} />

            <Route path="/real-estate/land-buying" element={<Navigate to="/real-estate/overview" replace />} />
            <Route path="/real-estate/land-sales" element={<Navigate to="/real-estate/overview" replace />} />

            {/* Construction PMS Admin Routes */}
            <Route path="/contracts" element={<ProtectedRoute allowedRoles={['ADMIN']}><Contracts /></ProtectedRoute>} />
            <Route path="/work-management" element={<ProtectedRoute allowedRoles={['ADMIN']}><WorkManagement /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute allowedRoles={['ADMIN']}><Payments /></ProtectedRoute>} />
            <Route path="/employee-types" element={<ProtectedRoute allowedRoles={['ADMIN']}><EmployeeTypes /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute allowedRoles={['ADMIN']}><Employees /></ProtectedRoute>} />
            <Route path="/item-categories" element={<ProtectedRoute allowedRoles={['ADMIN']}><ItemCategories /></ProtectedRoute>} />
            <Route path="/items" element={<ProtectedRoute allowedRoles={['ADMIN']}><Items /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute allowedRoles={['ADMIN']}><Suppliers /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute allowedRoles={['ADMIN']}><Services /></ProtectedRoute>} />
            <Route path="/construction-types" element={<ProtectedRoute allowedRoles={['ADMIN']}><ConstructionTypes /></ProtectedRoute>} />
            <Route path="/project-types" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProjectTypes /></ProtectedRoute>} />
            <Route path="/construction-stages" element={<ProtectedRoute allowedRoles={['ADMIN']}><ConstructionStages /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute allowedRoles={['ADMIN']}><Clients /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute allowedRoles={['ADMIN']}><Projects /></ProtectedRoute>} />
            <Route path="/projects/create" element={<ProtectedRoute allowedRoles={['ADMIN']}><CreateProject /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProjectDetails /></ProtectedRoute>} />
            <Route path="/project-planning" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProjectPlanning /></ProtectedRoute>} />
            <Route path="/stage-tracking" element={<ProtectedRoute allowedRoles={['ADMIN']}><StageTracking /></ProtectedRoute>} />
            <Route path="/progress-updates" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProgressUpdates /></ProtectedRoute>} />
            <Route path="/site-updates" element={<ProtectedRoute allowedRoles={['ADMIN']}><SiteUpdates /></ProtectedRoute>} />
            <Route path="/materials/requests" element={<ProtectedRoute allowedRoles={['ADMIN']}><MaterialRequests /></ProtectedRoute>} />
            <Route path="/materials/quotations" element={<ProtectedRoute allowedRoles={['ADMIN']}><Quotations /></ProtectedRoute>} />
            <Route path="/materials/orders" element={<ProtectedRoute allowedRoles={['ADMIN']}><Orders /></ProtectedRoute>} />
            <Route path="/materials/deliveries" element={<ProtectedRoute allowedRoles={['ADMIN']}><Deliveries /></ProtectedRoute>} />
            <Route path="/materials/inventory" element={<ProtectedRoute allowedRoles={['ADMIN']}><Inventory /></ProtectedRoute>} />
            <Route path="/inspections" element={<ProtectedRoute allowedRoles={['ADMIN']}><Inspections /></ProtectedRoute>} />
            <Route path="/rework" element={<ProtectedRoute allowedRoles={['ADMIN']}><Rework /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />

            {/* CLIENT Protected Routes */}
            <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientDashboard /></ProtectedRoute>} />
            <Route path="/client/buy" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientBuy /></ProtectedRoute>} />
            <Route path="/client/sell" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientSell /></ProtectedRoute>} />
            <Route path="/client/requests" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientRequests /></ProtectedRoute>} />
            <Route path="/client/transactions" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientTransactions /></ProtectedRoute>} />
            <Route path="/client/documents" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientDocuments /></ProtectedRoute>} />
            <Route path="/client/notifications" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientNotifications /></ProtectedRoute>} />
            <Route path="/client/profile" element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientProfile /></ProtectedRoute>} />

            {/* Redirect legacy /buyer/... and /seller/... routes to /client/... */}
            <Route path="/buyer/dashboard" element={<Navigate to="/client/dashboard" replace />} />
            <Route path="/buyer/properties" element={<Navigate to="/client/buy" replace />} />
            <Route path="/buyer/requests" element={<Navigate to="/client/requests" replace />} />
            <Route path="/buyer/negotiations" element={<Navigate to="/client/requests" replace />} />
            <Route path="/buyer/transactions" element={<Navigate to="/client/transactions" replace />} />
            <Route path="/buyer/documents" element={<Navigate to="/client/documents" replace />} />
            <Route path="/buyer/notifications" element={<Navigate to="/client/notifications" replace />} />
            <Route path="/buyer/profile" element={<Navigate to="/client/profile" replace />} />

            <Route path="/seller/dashboard" element={<Navigate to="/client/dashboard" replace />} />
            <Route path="/seller/properties" element={<Navigate to="/client/requests" replace />} />
            <Route path="/seller/requests" element={<Navigate to="/client/sell" replace />} />
            <Route path="/seller/verification" element={<Navigate to="/client/requests" replace />} />
            <Route path="/seller/buyer-interest" element={<Navigate to="/client/requests" replace />} />
            <Route path="/seller/negotiations" element={<Navigate to="/client/requests" replace />} />
            <Route path="/seller/transactions" element={<Navigate to="/client/transactions" replace />} />
            <Route path="/seller/documents" element={<Navigate to="/client/documents" replace />} />
            <Route path="/seller/notifications" element={<Navigate to="/client/notifications" replace />} />
            <Route path="/seller/profile" element={<Navigate to="/client/profile" replace />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AppProvider>
  )
}
