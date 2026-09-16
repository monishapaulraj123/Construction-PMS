import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import { ToastProvider } from './components/ToastContext'
import { AppProvider } from './context/AppContext'

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

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import AvailableProperties from './pages/buyer/AvailableProperties'
import MyBuyRequests from './pages/buyer/MyBuyRequests'
import BuyerNegotiations from './pages/buyer/BuyerNegotiations'
import BuyerTransactions from './pages/buyer/BuyerTransactions'
import BuyerDocuments from './pages/buyer/BuyerDocuments'
import BuyerNotifications from './pages/buyer/BuyerNotifications'
import BuyerProfile from './pages/buyer/BuyerProfile'

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard'
import MySellerProperties from './pages/seller/MySellerProperties'
import SellPropertyForm from './pages/seller/SellPropertyForm'
import SellerVerification from './pages/seller/SellerVerification'
import SellerBuyerInterest from './pages/seller/SellerBuyerInterest'
import SellerNegotiations from './pages/seller/SellerNegotiations'
import SellerTransactions from './pages/seller/SellerTransactions'
import SellerDocuments from './pages/seller/SellerDocuments'
import SellerNotifications from './pages/seller/SellerNotifications'
import SellerProfile from './pages/seller/SellerProfile'

import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Routes>
          {/* Public Common Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Main App Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />

            {/* Real Estate Admin Routes */}
            <Route path="/real-estate/overview" element={<RealEstateOverview />} />
            <Route path="/real-estate/properties" element={<AdminProperties />} />
            <Route path="/real-estate/buy-requests" element={<BuyRequests />} />
            <Route path="/real-estate/sell-requests" element={<SellRequests />} />
            <Route path="/real-estate/verification" element={<PropertyVerification />} />
            <Route path="/real-estate/negotiations" element={<Negotiations />} />
            <Route path="/real-estate/transactions" element={<Transactions />} />

            {/* Redirect legacy Land Buying / Sales routes to Real Estate Overview */}
            <Route path="/real-estate/land-buying" element={<Navigate to="/real-estate/overview" replace />} />
            <Route path="/real-estate/land-sales" element={<Navigate to="/real-estate/overview" replace />} />

            {/* Buyer Routes */}
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/properties" element={<AvailableProperties />} />
            <Route path="/buyer/requests" element={<MyBuyRequests />} />
            <Route path="/buyer/negotiations" element={<BuyerNegotiations />} />
            <Route path="/buyer/transactions" element={<BuyerTransactions />} />
            <Route path="/buyer/documents" element={<BuyerDocuments />} />
            <Route path="/buyer/notifications" element={<BuyerNotifications />} />
            <Route path="/buyer/profile" element={<BuyerProfile />} />

            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/properties" element={<MySellerProperties />} />
            <Route path="/seller/requests" element={<SellPropertyForm />} />
            <Route path="/seller/verification" element={<SellerVerification />} />
            <Route path="/seller/buyer-interest" element={<SellerBuyerInterest />} />
            <Route path="/seller/negotiations" element={<SellerNegotiations />} />
            <Route path="/seller/transactions" element={<SellerTransactions />} />
            <Route path="/seller/documents" element={<SellerDocuments />} />
            <Route path="/seller/notifications" element={<SellerNotifications />} />
            <Route path="/seller/profile" element={<SellerProfile />} />

            {/* Existing Construction PMS Routes */}
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/work-management" element={<WorkManagement />} />
            <Route path="/payments" element={<Payments />} />

            <Route path="/employee-types" element={<EmployeeTypes />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/item-categories" element={<ItemCategories />} />
            <Route path="/items" element={<Items />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/services" element={<Services />} />
            <Route path="/construction-types" element={<ConstructionTypes />} />
            <Route path="/project-types" element={<ProjectTypes />} />
            <Route path="/construction-stages" element={<ConstructionStages />} />
            <Route path="/clients" element={<Clients />} />

            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/project-planning" element={<ProjectPlanning />} />
            <Route path="/stage-tracking" element={<StageTracking />} />
            <Route path="/progress-updates" element={<ProgressUpdates />} />
            <Route path="/site-updates" element={<SiteUpdates />} />

            <Route path="/materials/requests" element={<MaterialRequests />} />
            <Route path="/materials/quotations" element={<Quotations />} />
            <Route path="/materials/orders" element={<Orders />} />
            <Route path="/materials/deliveries" element={<Deliveries />} />
            <Route path="/materials/inventory" element={<Inventory />} />

            <Route path="/inspections" element={<Inspections />} />
            <Route path="/rework" element={<Rework />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AppProvider>
  )
}
