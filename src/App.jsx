import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import { ToastProvider } from './components/ToastContext'

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
import LandBuying from './pages/LandBuying'
import LandSales from './pages/LandSales'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/real-estate/land-buying" element={<LandBuying />} />
          <Route path="/real-estate/land-sales" element={<LandSales />} />

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
  )
}
