import React, { useState, useEffect, useCallback } from 'react'
import {
  Warehouse,
  Boxes,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Truck,
  Award,
  Sparkles,
  BarChart3,
  ListFilter,
  DollarSign,
  Building2,
  Calendar,
  PieChart as PieIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { inventoryAPI, procurementAPI, itemCategoryAPI, supplierAPI, projectAPI } from '../services/api'
import { useToast } from '../components/ToastContext'
import PageHeader from '../components/PageHeader'
import Breadcrumb from '../components/Breadcrumb'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'

// HSL / Luxury PMS Chart Color Palette
const CHART_COLORS = ['#2F5D50', '#D4B06A', '#3A7D6B', '#E2C485', '#1D3B33', '#806634', '#4E9381']
const HEALTH_COLORS = {
  Healthy: '#3A7D6B',
  'Low Stock': '#D4B06A',
  'Out of Stock': '#C85A5A',
}

export default function Inventory() {
  const { showToast } = useToast()

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState('catalog')

  // Dashboard State
  const [dashData, setDashData] = useState(null)
  const [loadingDash, setLoadingDash] = useState(false)

  // Materials State
  const [materials, setMaterials] = useState([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [materialsError, setMaterialsError] = useState('')
  const [filters, setFilters] = useState({ search: '', category_id: '', stock_health: '', sortBy: 'id', sortOrder: 'DESC' })

  // Master Lists for Select Dropdowns
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [projects, setProjects] = useState([])

  // Modal States
  const [materialModalOpen, setMaterialModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [materialForm, setMaterialForm] = useState({
    item_code: '',
    item_name: '',
    category_id: '',
    brand: '',
    storage_location: 'Main Warehouse',
    unit: 'Units',
    unit_price: '0',
    stock_quantity: '0',
    min_stock_level: '10',
    supplier_id: '',
  })

  // Stock In / Out Modal
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [stockType, setStockType] = useState('IN')
  const [stockForm, setStockForm] = useState({
    item_id: '',
    quantity: '',
    unit_cost: '',
    supplier_id: '',
    project_id: '',
    issued_to: '',
    purpose: '',
    reference_no: '',
    storage_location: 'Main Warehouse',
    remarks: '',
  })

  // Allocations State
  const [allocations, setAllocations] = useState([])
  const [loadingAllocations, setLoadingAllocations] = useState(false)
  const [alcModalOpen, setAlcModalOpen] = useState(false)
  const [alcForm, setAlcForm] = useState({ item_id: '', project_id: '', allocated_quantity: '', remarks: '' })

  const [issueAlcModalOpen, setIssueAlcModalOpen] = useState(false)
  const [selectedAlc, setSelectedAlc] = useState(null)
  const [issueAlcForm, setIssueAlcForm] = useState({ issue_quantity: '', recipient: '', remarks: '' })

  const [returnAlcModalOpen, setReturnAlcModalOpen] = useState(false)
  const [returnAlcForm, setReturnAlcForm] = useState({ return_quantity: '', remarks: '' })

  // RFQ & Recommendation State
  const [rfqs, setRfqs] = useState([])
  const [loadingRfqs, setLoadingRfqs] = useState(false)
  const [rfqModalOpen, setRfqModalOpen] = useState(false)
  const [rfqForm, setRfqForm] = useState({
    title: '',
    project_id: '',
    required_delivery_date: '',
    remarks: '',
    items: [{ item_id: '', requested_quantity: '100' }],
  })

  const [recModalOpen, setRecModalOpen] = useState(false)
  const [recData, setRecData] = useState(null)
  const [loadingRec, setLoadingRec] = useState(false)

  // Quotations Modal State
  const [qtnModalOpen, setQtnModalOpen] = useState(false)
  const [qtnForm, setQtnForm] = useState({
    rfq_id: '',
    supplier_id: '',
    delivery_days: '7',
    remarks: '',
    items: [{ item_id: '', quoted_quantity: '100', unit_price: '500', tax_amount: '0', discount_amount: '0' }],
  })

  // PO State
  const [pos, setPos] = useState([])
  const [loadingPos, setLoadingPos] = useState(false)
  const [payPoModalOpen, setPayPoModalOpen] = useState(false)
  const [payPoId, setPayPoId] = useState(null)
  const [payPoAmount, setPayPoAmount] = useState('')

  // Reports State
  const [reportsData, setReportsData] = useState(null)
  const [loadingReports, setLoadingReports] = useState(false)

  // Fetch Master Dropdown Options
  useEffect(() => {
    itemCategoryAPI.getAll().then(setCategories).catch(() => {})
    supplierAPI.getAll().then(setSuppliers).catch(() => {})
    projectAPI.getAll().then(setProjects).catch(() => {})
  }, [])

  // 1. Fetch Dashboard Metrics
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true)
    try {
      const res = await inventoryAPI.getDashboard()
      if (res.success) setDashData(res)
    } catch (err) {
      console.error('Error fetching inventory dashboard:', err)
    } finally {
      setLoadingDash(false)
    }
  }, [])

  // 2. Fetch Materials from Real Database
  const fetchMaterials = useCallback(async () => {
    setLoadingMaterials(true)
    setMaterialsError('')
    try {
      const data = await inventoryAPI.getMaterials(filters)
      if (Array.isArray(data)) {
        setMaterials(data)
      } else {
        setMaterials([])
      }
    } catch (err) {
      console.error('Error fetching materials:', err)
      setMaterialsError(err.response?.data?.error || err.message || 'Failed to load materials from database.')
      showToast('Failed to load material catalog.', 'error')
    } finally {
      setLoadingMaterials(false)
    }
  }, [filters, showToast])

  // 3. Fetch Allocations
  const fetchAllocations = useCallback(async () => {
    setLoadingAllocations(true)
    try {
      const data = await inventoryAPI.getAllocations()
      setAllocations(data || [])
    } catch (err) {
      console.error('Error fetching allocations:', err)
    } finally {
      setLoadingAllocations(false)
    }
  }, [])

  // 4. Fetch RFQs
  const fetchRfqs = useCallback(async () => {
    setLoadingRfqs(true)
    try {
      const data = await procurementAPI.getRFQs()
      setRfqs(data || [])
    } catch (err) {
      console.error('Error fetching RFQs:', err)
    } finally {
      setLoadingRfqs(false)
    }
  }, [])

  // 5. Fetch Purchase Orders
  const fetchPOs = useCallback(async () => {
    setLoadingPos(true)
    try {
      const data = await procurementAPI.getPOs()
      setPos(data || [])
    } catch (err) {
      console.error('Error fetching POs:', err)
    } finally {
      setLoadingPos(false)
    }
  }, [])

  // 6. Fetch Reports & Chart Analytics
  const fetchReports = useCallback(async () => {
    setLoadingReports(true)
    try {
      const data = await inventoryAPI.getReports()
      if (data.success) setReportsData(data)
    } catch (err) {
      console.error('Error fetching inventory reports:', err)
    } finally {
      setLoadingReports(false)
    }
  }, [])

  // Load active tab data on change
  useEffect(() => {
    fetchMaterials()
    if (activeTab === 'dashboard') fetchDashboard()
    if (activeTab === 'allocations') fetchAllocations()
    if (activeTab === 'rfq') fetchRfqs()
    if (activeTab === 'po') fetchPOs()
    if (activeTab === 'reports') fetchReports()
  }, [activeTab, fetchMaterials, fetchDashboard, fetchAllocations, fetchRfqs, fetchPOs, fetchReports])

  // Save / Update Material
  const handleSaveMaterial = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      if (editingMaterial) {
        await inventoryAPI.updateMaterial(editingMaterial.item_id, materialForm)
        showToast('Material updated successfully!', 'success')
      } else {
        await inventoryAPI.createMaterial(materialForm)
        showToast('Material added to inventory master catalog!', 'success')
      }
      setMaterialModalOpen(false)
      fetchMaterials()
      if (activeTab === 'dashboard') fetchDashboard()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save material.', 'error')
    }
  }

  // Archive Material
  const handleArchiveMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to archive this material master?')) return
    try {
      await inventoryAPI.archiveMaterial(id)
      showToast('Material archived successfully.', 'success')
      fetchMaterials()
    } catch (err) {
      showToast('Failed to archive material.', 'error')
    }
  }

  // Handle Stock In / Stock Out Submit
  const handleSaveStockTxn = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      if (stockType === 'IN') {
        const res = await inventoryAPI.stockIn(stockForm)
        showToast(res.message || 'Stock Intake recorded successfully!', 'success')
      } else {
        const res = await inventoryAPI.stockOut(stockForm)
        showToast(res.message || 'Material Issue recorded successfully!', 'success')
      }
      setStockModalOpen(false)
      fetchMaterials()
      if (activeTab === 'dashboard') fetchDashboard()
    } catch (err) {
      showToast(err.response?.data?.error || 'Stock transaction failed.', 'error')
    }
  }

  // Handle Create Allocation
  const handleSaveAllocation = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      const res = await inventoryAPI.createAllocation(alcForm)
      showToast(res.message || 'Project allocation created successfully.', 'success')
      setAlcModalOpen(false)
      fetchAllocations()
      fetchMaterials()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create allocation.', 'error')
    }
  }

  // Handle Issue from Allocation
  const handleSaveIssueAlc = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      const res = await inventoryAPI.issueAllocation({
        allocation_id: selectedAlc.allocation_id,
        ...issueAlcForm,
      })
      showToast(res.message || 'Material issued from allocation successfully!', 'success')
      setIssueAlcModalOpen(false)
      fetchAllocations()
      fetchMaterials()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to issue material from allocation.', 'error')
    }
  }

  // Handle Return from Site (with Safeguard Fix)
  const handleSaveReturnAlc = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      const res = await inventoryAPI.returnSite({
        allocation_id: selectedAlc.allocation_id,
        ...returnAlcForm,
      })
      showToast(res.message || 'Site material return recorded successfully.', 'success')
      setReturnAlcModalOpen(false)
      fetchAllocations()
      fetchMaterials()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to process site return.', 'error')
    }
  }

  // Handle Create RFQ
  const handleSaveRFQ = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      const res = await procurementAPI.createRFQ(rfqForm)
      showToast(res.message || 'RFQ created successfully!', 'success')
      setRfqModalOpen(false)
      fetchRfqs()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create RFQ.', 'error')
    }
  }

  // Trigger Multi-Criteria Supplier Recommendation Engine
  const handleRunRecommendations = async (rfqId) => {
    setLoadingRec(true)
    setRecModalOpen(true)
    try {
      const data = await procurementAPI.getRecommendations(rfqId)
      setRecData(data)
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate recommendations.', 'error')
      setRecModalOpen(false)
    } finally {
      setLoadingRec(false)
    }
  }

  // Handle Create Quotation
  const handleSaveQuotation = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      const res = await procurementAPI.createQuotation(qtnForm)
      showToast(res.message || 'Supplier quotation submitted successfully!', 'success')
      setQtnModalOpen(false)
      fetchRfqs()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit quotation.', 'error')
    }
  }

  // Accept Quotation & Generate PO
  const handleAcceptQuotation = async (quotationId) => {
    if (!window.confirm('Are you sure you want to accept this quotation and generate a Purchase Order?')) return
    try {
      const res = await procurementAPI.createPOFromQuotation({ quotation_id: quotationId })
      showToast(res.message || 'Purchase Order generated successfully!', 'success')
      setRecModalOpen(false)
      setActiveTab('po')
      fetchPOs()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create PO from quotation.', 'error')
    }
  }

  // PO Delivery Transition (Triggers Central Stock Increase)
  const handleUpdatePOStatus = async (poId, status) => {
    if (!window.confirm(`Are you sure you want to update PO status to ${status}?`)) return
    try {
      const res = await procurementAPI.updatePOStatus(poId, status)
      showToast(res.message || `PO status updated to ${status}.`, 'success')
      fetchPOs()
      fetchMaterials()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update PO status.', 'error')
    }
  }

  // Add PO Payment
  const handleSavePOPayment = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    try {
      const res = await procurementAPI.addPOPayment(payPoId, payPoAmount)
      showToast(res.message || 'Payment recorded successfully!', 'success')
      setPayPoModalOpen(false)
      setPayPoAmount('')
      fetchPOs()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to record payment.', 'error')
    }
  }

  // Prepare Data for Visual Recharts Pie/Donut Charts
  const categoryValuationChartData = (reportsData?.categorySummaryReport || []).map((cat) => ({
    name: cat.category_name,
    value: Number(cat.total_valuation || 0),
    material_count: Number(cat.material_count || 0),
  }))

  const totalValuationAll = categoryValuationChartData.reduce((acc, c) => acc + c.value, 0) || 1

  const stockHealthChartData = [
    { name: 'Healthy', value: Number(reportsData?.stockHealthSummary?.healthy_count || 0) },
    { name: 'Low Stock', value: Number(reportsData?.stockHealthSummary?.low_stock_count || 0) },
    { name: 'Out of Stock', value: Number(reportsData?.stockHealthSummary?.out_of_stock_count || 0) },
  ].filter((d) => d.value > 0)

  const totalHealthCount = stockHealthChartData.reduce((acc, h) => acc + h.value, 0) || 1

  const categoryCountChartData = (reportsData?.categorySummaryReport || []).map((cat) => ({
    name: cat.category_name,
    value: Number(cat.material_count || 0),
  }))

  const projectConsumptionChartData = (reportsData?.projectConsumptionReport || []).map((p) => ({
    name: p.project_name,
    value: Number(p.total_consumed_value || 0),
    units: Number(p.total_quantity_issued || 0),
  }))

  return (
    <div>
      {/* Standard Breadcrumb */}
      <Breadcrumb items={['Material Management', 'Inventory']} />

      {/* Standard Page Header */}
      <PageHeader
        title="Builder Inventory & Procurement Management"
        description="Live database material catalog, transactional stock-in/out, project allocations, weighted supplier recommendation engine & visual analytics."
        actions={
          <PrimaryButton
            onClick={() => {
              setEditingMaterial(null)
              setMaterialForm({
                item_code: `ITM-${Date.now().toString().slice(-6)}`,
                item_name: '',
                category_id: '',
                brand: '',
                storage_location: 'Main Warehouse',
                unit: 'Units',
                unit_price: '0',
                stock_quantity: '0',
                min_stock_level: '10',
                supplier_id: '',
              })
              setMaterialModalOpen(true)
            }}
          >
            <Plus size={16} /> Add New Material Master
          </PrimaryButton>
        }
      />

      {/* Navigation Sub-Tabs */}
      <div className="tabs">
        <button onClick={() => setActiveTab('catalog')} className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}>
          <Package size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Material Catalog ({materials.length})
        </button>

        <button onClick={() => setActiveTab('dashboard')} className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
          <Layers size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Dashboard
        </button>

        <button onClick={() => setActiveTab('allocations')} className={`tab-btn ${activeTab === 'allocations' ? 'active' : ''}`}>
          <Building2 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Project Allocations
        </button>

        <button onClick={() => setActiveTab('rfq')} className={`tab-btn ${activeTab === 'rfq' ? 'active' : ''}`}>
          <FileSpreadsheet size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> RFQs & Quotations
        </button>

        <button onClick={() => setActiveTab('po')} className={`tab-btn ${activeTab === 'po' ? 'active' : ''}`}>
          <ShoppingCart size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Purchase Orders
        </button>

        <button onClick={() => setActiveTab('reports')} className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}>
          <BarChart3 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Reports & Charts
        </button>
      </div>

      {/* TAB 1: MATERIAL CATALOG (POPULATED FROM LIVE DATABASE) */}
      {activeTab === 'catalog' && (
        <div>
          {/* Filters Toolbar */}
          <div className="toolbar">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
              <input
                type="text"
                placeholder="Search name, code, brand, location..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="filter-select"
                style={{ minWidth: 240 }}
              />

              <select
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>

              <select
                value={filters.stock_health}
                onChange={(e) => setFilters({ ...filters, stock_health: e.target.value })}
                className="filter-select"
              >
                <option value="">All Stock Health</option>
                <option value="HEALTHY">Healthy / In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="filter-select"
              >
                <option value="name">Sort by Material Name</option>
                <option value="quantity">Sort by Quantity</option>
                <option value="price">Sort by Unit Price</option>
                <option value="stock_value">Sort by Valuation</option>
              </select>
            </div>

            <SecondaryButton onClick={fetchMaterials}>
              <RefreshCw size={14} className={loadingMaterials ? 'spin' : ''} /> Refresh Catalog
            </SecondaryButton>
          </div>

          {/* Material Catalog Datatable */}
          {loadingMaterials ? (
            <div className="empty-state">
              <RefreshCw className="spin empty-state-icon" size={32} />
              <h4>Loading material catalog from database...</h4>
            </div>
          ) : materialsError ? (
            <div className="empty-state" style={{ color: 'var(--red-600)' }}>
              <AlertTriangle size={32} className="empty-state-icon" />
              <h4>{materialsError}</h4>
              <SecondaryButton onClick={fetchMaterials} style={{ marginTop: 12 }}>Retry Loading</SecondaryButton>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Material Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Storage Location</th>
                    <th>Unit Price</th>
                    <th>Current Stock</th>
                    <th>Stock Value</th>
                    <th>Health Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-500)' }}>
                        No materials found in database matching criteria. Click "Add New Material Master" to create one.
                      </td>
                    </tr>
                  ) : (
                    materials.map((item) => {
                      const stockVal = Number(item.stock_value || (item.stock_quantity * item.unit_price))
                      return (
                        <tr key={item.item_id}>
                          <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.item_code}</td>
                          <td className="cell-primary">{item.item_name}</td>
                          <td>{item.category_name || 'General'}</td>
                          <td>{item.brand || 'N/A'}</td>
                          <td>{item.storage_location || 'Main Warehouse'}</td>
                          <td>₹{Number(item.unit_price).toLocaleString()} / {item.unit}</td>
                          <td style={{ fontWeight: 700, color: item.stock_quantity <= 0 ? 'var(--red-600)' : 'var(--forest-900)' }}>
                            {item.stock_quantity} {item.unit}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--forest-900)' }}>
                            ₹{stockVal.toLocaleString()}
                          </td>
                          <td>
                            <StatusBadge
                              status={item.stock_health || (item.stock_quantity <= 0 ? 'OUT_OF_STOCK' : item.stock_quantity <= item.min_stock_level ? 'LOW_STOCK' : 'HEALTHY')}
                              tone={item.stock_quantity <= 0 ? 'red' : item.stock_quantity <= item.min_stock_level ? 'amber' : 'green'}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {
                                  setStockType('IN')
                                  setStockForm({
                                    item_id: item.item_id,
                                    quantity: '100',
                                    unit_cost: String(item.unit_price),
                                    supplier_id: item.supplier_id || '',
                                    project_id: '',
                                    issued_to: '',
                                    purpose: '',
                                    reference_no: 'STOCK-INTAKE',
                                    storage_location: item.storage_location || 'Main Warehouse',
                                    remarks: 'Manual Stock Intake',
                                  })
                                  setStockModalOpen(true)
                                }}
                                className="btn btn-ghost btn-sm"
                                title="Stock In"
                              >
                                <ArrowDownLeft size={14} color="var(--green-700)" /> Stock In
                              </button>

                              <button
                                onClick={() => {
                                  setStockType('OUT')
                                  setStockForm({
                                    item_id: item.item_id,
                                    quantity: '10',
                                    unit_cost: String(item.unit_price),
                                    supplier_id: '',
                                    project_id: '',
                                    issued_to: 'Site Engineer',
                                    purpose: 'Site Construction Issue',
                                    reference_no: 'MATERIAL-ISSUE',
                                    storage_location: item.storage_location || 'Main Warehouse',
                                    remarks: 'Manual Material Issue',
                                  })
                                  setStockModalOpen(true)
                                }}
                                className="btn btn-ghost btn-sm"
                                title="Stock Out"
                              >
                                <ArrowUpRight size={14} color="var(--amber-600)" /> Stock Out
                              </button>

                              <button
                                onClick={() => {
                                  setEditingMaterial(item)
                                  setMaterialForm({
                                    item_code: item.item_code,
                                    item_name: item.item_name,
                                    category_id: item.category_id || '',
                                    brand: item.brand || '',
                                    storage_location: item.storage_location || 'Main Warehouse',
                                    unit: item.unit || 'Units',
                                    unit_price: String(item.unit_price),
                                    stock_quantity: String(item.stock_quantity),
                                    min_stock_level: String(item.min_stock_level),
                                    supplier_id: item.supplier_id || '',
                                  })
                                  setMaterialModalOpen(true)
                                }}
                                className="btn btn-ghost btn-sm"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleArchiveMaterial(item.item_id)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--red-600)' }}
                              >
                                Archive
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          {loadingDash ? (
            <div className="empty-state">
              <RefreshCw className="spin empty-state-icon" size={32} />
              <h4>Calculating stock metrics & valuation...</h4>
            </div>
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="stat-grid">
                <StatCard icon={Boxes} value={dashData?.metrics?.totalActiveItems || 0} label="Active Inventory Items" />
                <StatCard icon={TrendingUp} iconBg="var(--green-100)" iconColor="var(--green-700)" value={`₹${Number(dashData?.metrics?.totalStockValue || 0).toLocaleString()}`} label="Total Stock Valuation" />
                <StatCard icon={AlertTriangle} iconBg="var(--amber-100)" iconColor="var(--amber-600)" value={dashData?.metrics?.lowStockCount || 0} label="Low-Stock Alerts" />
                <StatCard icon={XCircle} iconBg="var(--red-100)" iconColor="var(--red-600)" value={dashData?.metrics?.outOfStockCount || 0} label="Out of Stock Items" />
              </div>

              {/* Critical Shortage Alerts Table */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} color="var(--amber-600)" /> Critical Stock Shortage Alerts (Ordered by Severity)
                </h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Material Code</th>
                        <th>Material Name</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Min Threshold</th>
                        <th>Stock Health</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashData?.alerts?.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                            ✅ All active inventory items have healthy stock levels above minimum thresholds.
                          </td>
                        </tr>
                      ) : (
                        dashData?.alerts?.map((item) => (
                          <tr key={item.item_id}>
                            <td style={{ fontWeight: 600 }}>{item.item_code}</td>
                            <td className="cell-primary">{item.item_name}</td>
                            <td>{item.category_name || 'General'}</td>
                            <td style={{ color: item.stock_quantity <= 0 ? 'var(--red-600)' : 'var(--amber-600)', fontWeight: 700 }}>
                              {item.stock_quantity} {item.unit}
                            </td>
                            <td>{item.min_stock_level} {item.unit}</td>
                            <td>
                              <StatusBadge
                                status={item.stock_quantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'}
                                tone={item.stock_quantity <= 0 ? 'red' : 'amber'}
                              />
                            </td>
                            <td>
                              <PrimaryButton
                                onClick={() => {
                                  setStockType('IN')
                                  setStockForm({
                                    item_id: item.item_id,
                                    quantity: String(item.min_stock_level * 2),
                                    unit_cost: String(item.unit_price),
                                    supplier_id: item.supplier_id || '',
                                    project_id: '',
                                    issued_to: '',
                                    purpose: '',
                                    reference_no: 'SHORTAGE-REPLENISH',
                                    storage_location: 'Main Warehouse',
                                    remarks: 'Replenishing stock for low-stock alert',
                                  })
                                  setStockModalOpen(true)
                                }}
                                className="btn-sm"
                              >
                                + Restock
                              </PrimaryButton>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Movement Ledger */}
              <div className="card card-pad" style={{ background: 'var(--paper)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 14 }}>
                  Recent Stock Movements Ledger
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>TXN Code</th>
                        <th>Type</th>
                        <th>Material</th>
                        <th>Qty</th>
                        <th>Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashData?.recentMovements?.map((m) => (
                        <tr key={m.transaction_id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.transaction_code}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: m.movement_type === 'STOCK_IN' || m.movement_type === 'DELIVERY' ? 'var(--green-700)' : 'var(--amber-600)' }}>
                              {m.movement_type}
                            </span>
                          </td>
                          <td>{m.item_name}</td>
                          <td style={{ fontWeight: 600 }}>{m.quantity} {m.unit}</td>
                          <td>₹{Number(m.total_cost).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: PROJECT ALLOCATIONS */}
      {activeTab === 'allocations' && (
        <div>
          <div className="toolbar">
            <div style={{ flex: 1 }} />
            <PrimaryButton
              onClick={() => {
                setAlcForm({ item_id: '', project_id: '', allocated_quantity: '500', remarks: '' })
                setAlcModalOpen(true)
              }}
            >
              <Plus size={16} /> Create Project Allocation
            </PrimaryButton>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ALC Code</th>
                  <th>Project Name</th>
                  <th>Material</th>
                  <th>Allocated Qty</th>
                  <th>Issued Qty</th>
                  <th>Returned Qty</th>
                  <th>Remaining Unissued</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                      No active project material allocations found.
                    </td>
                  </tr>
                ) : (
                  allocations.map((alc) => {
                    const remaining = Number(alc.allocated_quantity) - Number(alc.issued_quantity)
                    const eligibleReturn = Number(alc.issued_quantity) - Number(alc.returned_quantity)
                    return (
                      <tr key={alc.allocation_id}>
                        <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{alc.allocation_code}</td>
                        <td className="cell-primary">{alc.project_name}</td>
                        <td>{alc.item_name}</td>
                        <td style={{ fontWeight: 600 }}>{alc.allocated_quantity} {alc.unit}</td>
                        <td style={{ color: 'var(--forest-900)', fontWeight: 600 }}>{alc.issued_quantity} {alc.unit}</td>
                        <td style={{ color: 'var(--amber-600)' }}>{alc.returned_quantity} {alc.unit}</td>
                        <td style={{ fontWeight: 700, color: remaining > 0 ? 'var(--green-700)' : 'var(--ink-400)' }}>
                          {remaining} {alc.unit}
                        </td>
                        <td><StatusBadge status={alc.status} /></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              disabled={remaining <= 0}
                              onClick={() => {
                                setSelectedAlc(alc)
                                setIssueAlcForm({ issue_quantity: String(remaining), recipient: 'Site Engineer', remarks: 'Site Issue against Allocation' })
                                setIssueAlcModalOpen(true)
                              }}
                              className="btn btn-ghost btn-sm"
                            >
                              Issue to Site
                            </button>

                            <button
                              disabled={eligibleReturn <= 0}
                              onClick={() => {
                                setSelectedAlc(alc)
                                setReturnAlcForm({ return_quantity: String(eligibleReturn), remarks: 'Unused material return to central stock' })
                                setReturnAlcModalOpen(true)
                              }}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--amber-600)' }}
                            >
                              Return Stock
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RFQs & QUOTATIONS WITH WEIGHTED RECOMMENDATION ENGINE */}
      {activeTab === 'rfq' && (
        <div>
          <div className="toolbar">
            <div style={{ flex: 1 }} />
            <SecondaryButton
              onClick={() => {
                setQtnForm({
                  rfq_id: rfqs[0]?.rfq_id || '',
                  supplier_id: suppliers[0]?.supplier_id || '',
                  delivery_days: '5',
                  remarks: 'Quotation Submission',
                  items: [{ item_id: materials[0]?.item_id || '', quoted_quantity: '100', unit_price: '450', tax_amount: '0', discount_amount: '0' }],
                })
                setQtnModalOpen(true)
              }}
            >
              + Submit Supplier Quotation
            </SecondaryButton>

            <PrimaryButton
              onClick={() => {
                setRfqForm({
                  title: `Material Procurement for Site Requirement`,
                  project_id: projects[0]?.project_id || '',
                  required_delivery_date: '',
                  remarks: 'Urgent site procurement requirement',
                  items: [{ item_id: materials[0]?.item_id || '', requested_quantity: '200' }],
                })
                setRfqModalOpen(true)
              }}
            >
              <Plus size={16} /> Create New RFQ
            </PrimaryButton>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>RFQ Code</th>
                  <th>Requirement Title</th>
                  <th>Project</th>
                  <th>Item Count</th>
                  <th>Received Quotes</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                      No active RFQs created yet.
                    </td>
                  </tr>
                ) : (
                  rfqs.map((r) => (
                    <tr key={r.rfq_id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{r.rfq_code}</td>
                      <td className="cell-primary">{r.title}</td>
                      <td>{r.project_name || 'General Project'}</td>
                      <td>{r.item_count} items</td>
                      <td style={{ fontWeight: 700, color: 'var(--forest-900)' }}>{r.quotation_count} quotes</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <PrimaryButton
                          onClick={() => handleRunRecommendations(r.rfq_id)}
                          className="btn-sm"
                        >
                          <Sparkles size={14} /> Evaluate Quotes (AI Algorithm)
                        </PrimaryButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PURCHASE ORDERS */}
      {activeTab === 'po' && (
        <div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Code</th>
                  <th>Project Name</th>
                  <th>Supplier</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pos.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-500)' }}>
                      No active Purchase Orders. Accept a supplier quotation from the RFQ tab to generate a PO.
                    </td>
                  </tr>
                ) : (
                  pos.map((po) => (
                    <tr key={po.po_id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{po.po_code}</td>
                      <td className="cell-primary">{po.project_name || 'Central Procurement'}</td>
                      <td>{po.supplier_name}</td>
                      <td style={{ fontWeight: 700 }}>₹{Number(po.total_amount).toLocaleString()}</td>
                      <td style={{ color: 'var(--green-700)', fontWeight: 600 }}>₹{Number(po.paid_amount).toLocaleString()}</td>
                      <td style={{ color: po.balance_due > 0 ? 'var(--amber-600)' : 'var(--ink-400)', fontWeight: 700 }}>
                        ₹{Number(po.balance_due).toLocaleString()}
                      </td>
                      <td>
                        <StatusBadge
                          status={po.status}
                          tone={po.status === 'DELIVERED' ? 'green' : po.status === 'ISSUED' ? 'gold' : 'amber'}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {po.status !== 'DELIVERED' && (
                            <button
                              onClick={() => handleUpdatePOStatus(po.po_id, 'DELIVERED')}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--green-700)' }}
                            >
                              🚚 Mark Delivered (Update Stock)
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setPayPoId(po.po_id)
                              setPayPoAmount(String(po.balance_due))
                              setPayPoModalOpen(true)
                            }}
                            className="btn btn-ghost btn-sm"
                          >
                            💳 Record Payment
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS & VISUAL PIE/DONUT CHARTS (RECHARTS INTEGRATION) */}
      {activeTab === 'reports' && (
        <div>
          {loadingReports ? (
            <div className="empty-state">
              <RefreshCw className="spin empty-state-icon" size={32} />
              <h4>Generating visual inventory pie & donut charts...</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Visual Pie & Donut Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                {/* CHART A: Stock Valuation by Category (Pie Chart) */}
                <div className="card card-pad" style={{ background: 'var(--paper)' }}>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PieIcon size={18} color="var(--forest-800)" /> Chart A: Stock Valuation by Category (₹)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginBottom: 16 }}>
                    Category Share = Sum of (Current Stock × Unit Price). Total: ₹{totalValuationAll.toLocaleString()}
                  </p>

                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryValuationChartData}
                          cx="50%"
                          cy="45%"
                          innerRadius={0}
                          outerRadius={80}
                          minAngle={4}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent }) => (percent >= 0.04 ? `${name} (${(percent * 100).toFixed(1)}%)` : null)}
                        >
                          {categoryValuationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.8rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CHART B: Inventory Stock Health Distribution (Donut Chart) */}
                <div className="card card-pad" style={{ background: 'var(--paper)' }}>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PieIcon size={18} color="var(--gold-600)" /> Chart B: Inventory Stock Health (Donut Chart)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginBottom: 16 }}>
                    Stock health distribution across Healthy, Low Stock, and Out of Stock materials.
                  </p>

                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockHealthChartData}
                          cx="50%"
                          cy="45%"
                          innerRadius={45}
                          outerRadius={80}
                          minAngle={4}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, value, percent }) => (percent >= 0.05 ? `${name}: ${value}` : null)}
                        >
                          {stockHealthChartData.map((entry) => (
                            <Cell key={entry.name} fill={HEALTH_COLORS[entry.name] || '#3A7D6B'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `${val} materials`} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.8rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CHART C: Material Count by Category (Pie Chart) */}
                <div className="card card-pad" style={{ background: 'var(--paper)' }}>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Boxes size={18} color="var(--forest-800)" /> Chart C: Active Material Count by Category
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginBottom: 16 }}>
                    Number of active material masters registered per category.
                  </p>

                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryCountChartData}
                          cx="50%"
                          cy="45%"
                          innerRadius={0}
                          outerRadius={80}
                          minAngle={4}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, value, percent }) => (percent >= 0.05 ? `${name}: ${value}` : null)}
                        >
                          {categoryCountChartData.map((entry, index) => (
                            <Cell key={`cell-cnt-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `${val} active items`} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.8rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CHART D: Project Material Consumption Valuation (Bar Chart) */}
                <div className="card card-pad" style={{ background: 'var(--paper)' }}>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={18} color="var(--green-700)" /> Chart D: Project Consumption Valuation (₹)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginBottom: 16 }}>
                    Total consumed material value issued to each construction project.
                  </p>

                  <div style={{ width: '100%', height: 260 }}>
                    {projectConsumptionChartData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-500)', fontSize: '0.86rem' }}>
                        No material issues recorded for projects yet.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectConsumptionChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                          <Bar dataKey="value" fill="#2F5D50" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Valuation & Health Report Table */}
              <div className="card card-pad" style={{ background: 'var(--paper)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 14 }}>
                  Detailed Stock Valuation & Health Report
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Material Name</th>
                        <th>Category</th>
                        <th>Storage Location</th>
                        <th>Current Stock</th>
                        <th>Unit Price</th>
                        <th>Valuation Total</th>
                        <th>Health Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData?.valuationReport?.map((r) => (
                        <tr key={r.item_id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.item_code}</td>
                          <td className="cell-primary">{r.item_name}</td>
                          <td>{r.category_name || 'General'}</td>
                          <td>{r.storage_location || 'Main Warehouse'}</td>
                          <td style={{ fontWeight: 700 }}>{r.stock_quantity} {r.unit}</td>
                          <td>₹{Number(r.unit_price).toLocaleString()}</td>
                          <td style={{ fontWeight: 700, color: 'var(--forest-900)' }}>₹{Number(r.stock_value).toLocaleString()}</td>
                          <td>
                            <StatusBadge
                              status={r.stock_status}
                              tone={r.stock_status === 'HEALTHY' ? 'green' : r.stock_status === 'LOW_STOCK' ? 'amber' : 'red'}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD/EDIT MATERIAL MASTER */}
      {materialModalOpen && (
        <Modal
          open={materialModalOpen}
          onClose={() => setMaterialModalOpen(false)}
          title={editingMaterial ? 'Edit Material Master' : 'Add New Material Master'}
          footer={
            <>
              <SecondaryButton onClick={() => setMaterialModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="material-modal-form" onClick={handleSaveMaterial}>
                Save Material Master
              </PrimaryButton>
            </>
          }
        >
          <form id="material-modal-form" onSubmit={handleSaveMaterial} className="form-grid">
            <div className="form-field">
              <label>Material Code *</label>
              <input
                type="text"
                required
                value={materialForm.item_code}
                onChange={(e) => setMaterialForm({ ...materialForm, item_code: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Material Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Portland Cement 53 Grade"
                value={materialForm.item_name}
                onChange={(e) => setMaterialForm({ ...materialForm, item_name: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Category</label>
              <select
                value={materialForm.category_id}
                onChange={(e) => setMaterialForm({ ...materialForm, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Brand / Specification</label>
              <input
                type="text"
                placeholder="e.g. UltraTech / Tata Tiscon"
                value={materialForm.brand}
                onChange={(e) => setMaterialForm({ ...materialForm, brand: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Storage Location</label>
              <input
                type="text"
                value={materialForm.storage_location}
                onChange={(e) => setMaterialForm({ ...materialForm, storage_location: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Unit of Measure</label>
              <input
                type="text"
                value={materialForm.unit}
                onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Unit Price (₹) *</label>
              <input
                type="number"
                required
                value={materialForm.unit_price}
                onChange={(e) => setMaterialForm({ ...materialForm, unit_price: e.target.value })}
              />
            </div>

            {!editingMaterial && (
              <div className="form-field">
                <label>Initial Opening Stock</label>
                <input
                  type="number"
                  value={materialForm.stock_quantity}
                  onChange={(e) => setMaterialForm({ ...materialForm, stock_quantity: e.target.value })}
                />
              </div>
            )}

            <div className="form-field">
              <label>Minimum Stock Threshold</label>
              <input
                type="number"
                value={materialForm.min_stock_level}
                onChange={(e) => setMaterialForm({ ...materialForm, min_stock_level: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: STOCK IN / STOCK OUT */}
      {stockModalOpen && (
        <Modal
          open={stockModalOpen}
          onClose={() => setStockModalOpen(false)}
          title={stockType === 'IN' ? '📥 Stock Intake / Receipt (Stock-In)' : '📤 Issue Material to Site (Stock-Out)'}
          footer={
            <>
              <SecondaryButton onClick={() => setStockModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="stock-modal-form" onClick={handleSaveStockTxn}>
                {stockType === 'IN' ? 'Process Stock Receipt' : 'Process Material Issue'}
              </PrimaryButton>
            </>
          }
        >
          <form id="stock-modal-form" onSubmit={handleSaveStockTxn} className="form-grid">
            <div className="form-field full">
              <label>Select Material Master *</label>
              <select
                required
                value={stockForm.item_id}
                onChange={(e) => setStockForm({ ...stockForm, item_id: e.target.value })}
              >
                <option value="">Select Material</option>
                {materials.map((m) => (
                  <option key={m.item_id} value={m.item_id}>
                    {m.item_code} - {m.item_name} (Current Stock: {m.stock_quantity} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Quantity *</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
              />
            </div>

            {stockType === 'IN' ? (
              <div className="form-field">
                <label>Unit Cost (₹)</label>
                <input
                  type="number"
                  value={stockForm.unit_cost}
                  onChange={(e) => setStockForm({ ...stockForm, unit_cost: e.target.value })}
                />
              </div>
            ) : (
              <div className="form-field">
                <label>Target Construction Project *</label>
                <select
                  required
                  value={stockForm.project_id}
                  onChange={(e) => setStockForm({ ...stockForm, project_id: e.target.value })}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-field">
              <label>Reference No.</label>
              <input
                type="text"
                value={stockForm.reference_no}
                onChange={(e) => setStockForm({ ...stockForm, reference_no: e.target.value })}
              />
            </div>

            {stockType === 'OUT' && (
              <div className="form-field">
                <label>Recipient / Issued To</label>
                <input
                  type="text"
                  placeholder="e.g. Site Engineer Arun"
                  value={stockForm.issued_to}
                  onChange={(e) => setStockForm({ ...stockForm, issued_to: e.target.value })}
                />
              </div>
            )}

            <div className="form-field full">
              <label>Remarks / Purpose</label>
              <textarea
                rows="2"
                value={stockForm.remarks}
                onChange={(e) => setStockForm({ ...stockForm, remarks: e.target.value })}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: CREATE PROJECT ALLOCATION */}
      {alcModalOpen && (
        <Modal
          open={alcModalOpen}
          onClose={() => setAlcModalOpen(false)}
          title="🏗️ Allocate Material to Construction Project"
          footer={
            <>
              <SecondaryButton onClick={() => setAlcModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="alc-modal-form" onClick={handleSaveAllocation}>
                Create Allocation
              </PrimaryButton>
            </>
          }
        >
          <form id="alc-modal-form" onSubmit={handleSaveAllocation} className="form-grid">
            <div className="form-field full">
              <label>Select Material *</label>
              <select
                required
                value={alcForm.item_id}
                onChange={(e) => setAlcForm({ ...alcForm, item_id: e.target.value })}
              >
                <option value="">Select Material</option>
                {materials.map((m) => (
                  <option key={m.item_id} value={m.item_id}>
                    {m.item_code} - {m.item_name} (Central Stock: {m.stock_quantity} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field full">
              <label>Select Target Project *</label>
              <select
                required
                value={alcForm.project_id}
                onChange={(e) => setAlcForm({ ...alcForm, project_id: e.target.value })}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div className="form-field full">
              <label>Allocation Quantity *</label>
              <input
                type="number"
                required
                value={alcForm.allocated_quantity}
                onChange={(e) => setAlcForm({ ...alcForm, allocated_quantity: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: ISSUE FROM ALLOCATION */}
      {issueAlcModalOpen && selectedAlc && (
        <Modal
          open={issueAlcModalOpen}
          onClose={() => setIssueAlcModalOpen(false)}
          title={`Issue Material from Allocation (${selectedAlc.allocation_code})`}
          footer={
            <>
              <SecondaryButton onClick={() => setIssueAlcModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="issue-alc-form" onClick={handleSaveIssueAlc}>
                Issue Material
              </PrimaryButton>
            </>
          }
        >
          <form id="issue-alc-form" onSubmit={handleSaveIssueAlc} className="form-grid">
            <div className="form-field full">
              <div><strong>Project:</strong> {selectedAlc.project_name}</div>
              <div><strong>Material:</strong> {selectedAlc.item_name}</div>
              <div><strong>Remaining Unissued:</strong> {Number(selectedAlc.allocated_quantity) - Number(selectedAlc.issued_quantity)} {selectedAlc.unit}</div>
            </div>

            <div className="form-field full">
              <label>Issue Quantity *</label>
              <input
                type="number"
                required
                value={issueAlcForm.issue_quantity}
                onChange={(e) => setIssueAlcForm({ ...issueAlcForm, issue_quantity: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 5: RETURN FROM SITE */}
      {returnAlcModalOpen && selectedAlc && (
        <Modal
          open={returnAlcModalOpen}
          onClose={() => setReturnAlcModalOpen(false)}
          title={`Site Return for Allocation (${selectedAlc.allocation_code})`}
          footer={
            <>
              <SecondaryButton onClick={() => setReturnAlcModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="return-alc-form" onClick={handleSaveReturnAlc}>
                Process Return to Central Stock
              </PrimaryButton>
            </>
          }
        >
          <form id="return-alc-form" onSubmit={handleSaveReturnAlc} className="form-grid">
            <div className="form-field full">
              <div><strong>Issued to Date:</strong> {selectedAlc.issued_quantity} {selectedAlc.unit}</div>
              <div><strong>Already Returned:</strong> {selectedAlc.returned_quantity} {selectedAlc.unit}</div>
              <div style={{ color: 'var(--amber-700)', fontWeight: 700 }}>
                Eligible Return Capacity: {Number(selectedAlc.issued_quantity) - Number(selectedAlc.returned_quantity)} {selectedAlc.unit}
              </div>
            </div>

            <div className="form-field full">
              <label>Return Quantity *</label>
              <input
                type="number"
                required
                value={returnAlcForm.return_quantity}
                onChange={(e) => setReturnAlcForm({ ...returnAlcForm, return_quantity: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 6: MULTI-CRITERIA SUPPLIER RECOMMENDATION BREAKDOWN */}
      {recModalOpen && (
        <Modal
          open={recModalOpen}
          onClose={() => setRecModalOpen(false)}
          title="✨ AI Supplier Recommendation Engine (Weighted Scoring Algorithm)"
          wide
          footer={
            <SecondaryButton onClick={() => setRecModalOpen(false)}>Close Evaluation</SecondaryButton>
          }
        >
          {loadingRec ? (
            <div className="empty-state">
              <RefreshCw className="spin empty-state-icon" size={32} />
              <h4>Evaluating quotes against Price (30%), Delivery (20%), Rating (15%), Stock (15%), MOQ (10%), Location (5%), Quality (5%)...</h4>
            </div>
          ) : recData?.evaluations?.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-500)' }}>
              No submitted supplier quotes available to evaluate for this RFQ.
            </div>
          ) : (
            <div>
              <div style={{ background: 'var(--cream-050)', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 18, border: '1px solid var(--line-100)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 700 }}>{recData?.title} ({recData?.rfq_code})</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-700)' }}>
                  Target Delivery Days: <strong>{recData?.target_delivery_days} days</strong> | Algorithm Weights: Price (30%), Delivery (20%), Rating (15%), Stock (15%), MOQ (10%), Location (5%), Quality (5%)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recData?.evaluations?.map((ev, index) => (
                  <div
                    key={ev.quotation_id}
                    style={{
                      border: index === 0 ? '2px solid var(--gold-500)' : '1px solid var(--line-100)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      background: index === 0 ? 'var(--gold-050)' : 'var(--paper)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        {index === 0 && (
                          <span style={{ background: 'var(--gold-500)', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, marginRight: 8 }}>
                            🏆 TOP RECOMMENDED SUPPLIER
                          </span>
                        )}
                        <h4 style={{ display: 'inline', fontSize: '1.05rem', fontWeight: 700 }}>{ev.supplier_name}</h4>
                        <span style={{ marginLeft: 12, fontSize: '0.86rem', color: 'var(--ink-500)' }}>{ev.quotation_code}</span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                          {ev.final_score} <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>/ 100</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>Quote Total: ₹{ev.total_amount.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Criteria Score Breakdown Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, background: 'var(--cream-050)', padding: 10, borderRadius: 'var(--radius-sm)', marginBottom: 12, textAlign: 'center', fontSize: '0.76rem' }}>
                      <div>Price (30%): <strong>{ev.breakdown.price.score}</strong></div>
                      <div>Delivery (20%): <strong>{ev.breakdown.delivery.score}</strong></div>
                      <div>Rating (15%): <strong>{ev.breakdown.rating.score}</strong></div>
                      <div>Stock (15%): <strong>{ev.breakdown.stock.score}</strong></div>
                      <div>MOQ (10%): <strong>{ev.breakdown.moq.score}</strong></div>
                      <div>Location (5%): <strong>{ev.breakdown.location.score}</strong></div>
                      <div>Quality (5%): <strong>{ev.breakdown.quality.score}</strong></div>
                    </div>

                    {/* Reasons list */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--ink-700)', marginBottom: 12 }}>
                      <strong>Recommendation Rationale:</strong>
                      <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                        {ev.reasons.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div style={{ textAlign: 'right' }}>
                      <PrimaryButton onClick={() => handleAcceptQuotation(ev.quotation_id)} className="btn-sm">
                        Accept Quote & Issue Purchase Order (PO)
                      </PrimaryButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* MODAL 7: CREATE RFQ */}
      {rfqModalOpen && (
        <Modal
          open={rfqModalOpen}
          onClose={() => setRfqModalOpen(false)}
          title="📋 Create Material Requirement (RFQ)"
          footer={
            <>
              <SecondaryButton onClick={() => setRfqModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="rfq-modal-form" onClick={handleSaveRFQ}>
                Publish RFQ
              </PrimaryButton>
            </>
          }
        >
          <form id="rfq-modal-form" onSubmit={handleSaveRFQ} className="form-grid">
            <div className="form-field full">
              <label>Requirement Title *</label>
              <input
                type="text"
                required
                value={rfqForm.title}
                onChange={(e) => setRfqForm({ ...rfqForm, title: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Target Project</label>
              <select
                value={rfqForm.project_id}
                onChange={(e) => setRfqForm({ ...rfqForm, project_id: e.target.value })}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Required Delivery Date</label>
              <input
                type="date"
                value={rfqForm.required_delivery_date}
                onChange={(e) => setRfqForm({ ...rfqForm, required_delivery_date: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 8: RECORD PO PAYMENT */}
      {payPoModalOpen && (
        <Modal
          open={payPoModalOpen}
          onClose={() => setPayPoModalOpen(false)}
          title="💳 Record Payment Against Purchase Order"
          footer={
            <>
              <SecondaryButton onClick={() => setPayPoModalOpen(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" form="pay-po-form" onClick={handleSavePOPayment}>
                Record Payment
              </PrimaryButton>
            </>
          }
        >
          <form id="pay-po-form" onSubmit={handleSavePOPayment} className="form-grid">
            <div className="form-field full">
              <label>Payment Amount (₹) *</label>
              <input
                type="number"
                required
                value={payPoAmount}
                onChange={(e) => setPayPoAmount(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
