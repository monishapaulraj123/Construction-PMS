import { useState, useMemo } from 'react'
import { Plus, CheckCircle2, XCircle } from 'lucide-react'
import MaterialFlow from '../components/MaterialFlow'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import SearchBar from '../components/SearchBar'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import {
  materialRequests as initialRequests,
  projects as mockProjects,
  items as mockItems,
} from '../data/mockData'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastContext'
import { formatDate } from '../utils/format'

const DEFAULT_UNITS = [
  'Bags',
  'Tonnes',
  'Kg',
  'Cu. Ft',
  'Piece',
  'Units',
  'Meters',
  'Litres',
  'Bundles',
  'Trucks',
]

function generateNextCode(requestsList) {
  const year = new Date().getFullYear()
  const highestNumber = (requestsList || []).reduce((max, r) => {
    const match = (r.code || '').match(/MR-\d+-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      return num > max ? num : max
    }
    return max
  }, 12)
  return `MR-${year}-${String(highestNumber + 1).padStart(3, '0')}`
}

export default function MaterialRequests() {
  const { currentUser, projects: contextProjects } = useApp() || {}
  const showToast = useToast()

  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('cpms_material_requests')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to parse cpms_material_requests from localStorage', e)
    }
    return initialRequests
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modals & form state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({})

  // Projects and items data
  const projectList =
    Array.isArray(contextProjects) && contextProjects.length > 0
      ? contextProjects
      : mockProjects
  const projectOptions = useMemo(
    () => projectList.map((p) => p.project_name || p.name).filter(Boolean),
    [projectList]
  )
  const itemOptions = useMemo(
    () => mockItems.map((i) => i.material_name || i.item_name).filter(Boolean),
    []
  )

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        !search ||
        (r.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.project || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.item || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.requested_by || '').toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        !statusFilter || (r.status || '').toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [requests, search, statusFilter])

  function saveRequestsToStorage(updated) {
    try {
      localStorage.setItem('cpms_material_requests', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save cpms_material_requests', e)
    }
  }

  // Open Create Modal
  function handleOpenCreate() {
    const nextCode = generateNextCode(requests)
    const defaultProject = projectOptions[0] || 'Green Valley Residence'
    const defaultItem = itemOptions[0] || 'OPC 53 Grade Cement'
    const matched = mockItems.find(
      (i) => (i.material_name || i.item_name) === defaultItem
    )

    setForm({
      code: nextCode,
      project: defaultProject,
      item: defaultItem,
      quantity: '100',
      unit: matched?.unit_of_measure || 'Bags',
      required_date: new Date().toISOString().split('T')[0],
      priority: 'Normal',
      requested_by: currentUser?.name || 'Administrator',
      remarks: '',
      status: 'Pending',
    })
    setIsCreateOpen(true)
  }

  // Handle item dropdown selection
  function handleItemChange(itemName) {
    const matched = mockItems.find(
      (i) => (i.material_name || i.item_name) === itemName
    )
    let suggestedUnit = form.unit || 'Bags'
    if (matched?.unit_of_measure) {
      suggestedUnit = matched.unit_of_measure
    } else if (matched?.unit) {
      suggestedUnit = matched.unit
    }

    setForm((prev) => ({
      ...prev,
      item: itemName,
      unit: suggestedUnit,
    }))
  }

  // Submit New Request
  function handleCreateSubmit(e) {
    if (e) e.preventDefault()

    if (!form.project) {
      showToast('Please select a project')
      return
    }
    if (!form.item) {
      showToast('Please select a material item')
      return
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      showToast('Please enter a valid quantity greater than 0')
      return
    }

    const nextId =
      requests.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1
    const quantityStr = `${form.quantity} ${form.unit || 'Units'}`.trim()

    const newRequest = {
      id: nextId,
      code: form.code || generateNextCode(requests),
      project: form.project,
      item: form.item,
      quantity: quantityStr,
      raw_quantity: Number(form.quantity),
      unit: form.unit || 'Units',
      required_date: form.required_date || '',
      priority: form.priority || 'Normal',
      requested_by: form.requested_by || currentUser?.name || 'Administrator',
      date: formatDate(new Date()),
      status: 'Pending',
      remarks: form.remarks || '',
      created_at: new Date().toISOString(),
    }

    const updated = [newRequest, ...requests]
    setRequests(updated)
    saveRequestsToStorage(updated)
    setIsCreateOpen(false)
    showToast('Material request submitted successfully!')
  }

  // Open View Modal
  function handleView(row) {
    setSelectedRequest(row)
    setIsViewOpen(true)
  }

  // Open Edit Modal
  function handleEdit(row) {
    setSelectedRequest(row)
    let qty = row.raw_quantity
    let u = row.unit
    if (!qty && row.quantity) {
      const parts = String(row.quantity).trim().split(' ')
      qty = parts[0]
      u = parts.slice(1).join(' ') || 'Units'
    }

    setForm({
      ...row,
      quantity: qty || '',
      unit: u || 'Units',
    })
    setIsEditOpen(true)
  }

  // Submit Edit
  function handleEditSubmit(e) {
    if (e) e.preventDefault()
    if (!form.project || !form.item || !form.quantity) {
      showToast('Please fill all required fields')
      return
    }

    const quantityStr = `${form.quantity} ${form.unit || 'Units'}`.trim()
    const updated = requests.map((r) => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          ...form,
          quantity: quantityStr,
          raw_quantity: Number(form.quantity),
          unit: form.unit || 'Units',
        }
      }
      return r
    })

    setRequests(updated)
    saveRequestsToStorage(updated)
    setIsEditOpen(false)
    setSelectedRequest(null)
    showToast('Material request updated successfully!')
  }

  // Delete Request
  function handleDelete(row) {
    setDeleteTarget(row)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    const updated = requests.filter((r) => r.id !== deleteTarget.id)
    setRequests(updated)
    saveRequestsToStorage(updated)
    setDeleteTarget(null)
    showToast('Material request deleted')
  }

  // Quick Status change (Approve / Reject)
  function handleStatusChange(requestId, newStatus) {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return { ...r, status: newStatus }
      }
      return r
    })

    setRequests(updated)
    saveRequestsToStorage(updated)

    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest((prev) => ({ ...prev, status: newStatus }))
    }

    showToast(`Material request marked as ${newStatus}`)
  }

  const columns = [
    {
      key: 'code',
      label: 'Request Code',
      render: (r) => (
        <span style={{ fontWeight: 700, color: 'var(--forest-900)' }}>
          {r.code}
        </span>
      ),
    },
    { key: 'project', label: 'Project' },
    {
      key: 'item',
      label: 'Item',
      render: (r) => <span className="cell-primary">{r.item}</span>,
    },
    { key: 'quantity', label: 'Quantity' },
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => {
        const p = r.priority || 'Normal'
        const tone = p === 'Urgent' ? 'red' : p === 'High' ? 'amber' : 'gray'
        return <StatusBadge status={p} tone={tone} />
      },
    },
    { key: 'requested_by', label: 'Requested By' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ]

  return (
    <div>
      <MaterialFlow />

      <div className="toolbar">
        <SearchBar
          placeholder="Search requests by code, project, material, or requester..."
          value={search}
          onChange={setSearch}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by Status"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="In Progress">In Progress</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Rejected">Rejected</option>
        </select>
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={handleOpenCreate}>
          + New Request
        </PrimaryButton>
      </div>

      <DataTable
        keyField="id"
        rows={filteredRequests}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No material requests found matching your filter."
      />

      {/* Create New Request Modal */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Material Request"
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setIsCreateOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleCreateSubmit}>
              Submit Request
            </PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleCreateSubmit}>
          <FormInput
            label="Request Code"
            value={form.code || ''}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="Auto-generated e.g. MR-2026-013"
          />
          <SelectInput
            label="Project"
            required
            options={projectOptions}
            value={form.project || ''}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
          />
          <SelectInput
            label="Material Item"
            required
            options={itemOptions}
            value={form.item || ''}
            onChange={(e) => handleItemChange(e.target.value)}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 10,
            }}
          >
            <FormInput
              label="Quantity"
              type="number"
              min="1"
              required
              value={form.quantity ?? ''}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="e.g. 100"
            />
            <SelectInput
              label="Unit"
              options={DEFAULT_UNITS}
              value={form.unit || 'Bags'}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <DateInput
            label="Required By Date"
            value={form.required_date || ''}
            onChange={(e) => setForm({ ...form, required_date: e.target.value })}
          />
          <SelectInput
            label="Priority"
            options={['Normal', 'High', 'Urgent', 'Low']}
            value={form.priority || 'Normal'}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />
          <FormInput
            label="Requested By"
            value={form.requested_by || ''}
            onChange={(e) => setForm({ ...form, requested_by: e.target.value })}
            placeholder="e.g. Site Supervisor"
          />
          <FormInput
            label="Purpose / Site Remarks"
            type="textarea"
            full
            value={form.remarks || ''}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            placeholder="Specify reason, target stage/slab, or delivery instructions..."
          />
        </form>
      </Modal>

      {/* Edit Request Modal */}
      <Modal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedRequest(null)
        }}
        title={`Edit Material Request - ${form.code || ''}`}
        wide
        footer={
          <>
            <SecondaryButton
              onClick={() => {
                setIsEditOpen(false)
                setSelectedRequest(null)
              }}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleEditSubmit}>
              Save Changes
            </PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleEditSubmit}>
          <FormInput
            label="Request Code"
            disabled
            value={form.code || ''}
          />
          <SelectInput
            label="Project"
            required
            options={projectOptions}
            value={form.project || ''}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
          />
          <SelectInput
            label="Material Item"
            required
            options={itemOptions}
            value={form.item || ''}
            onChange={(e) => handleItemChange(e.target.value)}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 10,
            }}
          >
            <FormInput
              label="Quantity"
              type="number"
              min="1"
              required
              value={form.quantity ?? ''}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <SelectInput
              label="Unit"
              options={DEFAULT_UNITS}
              value={form.unit || 'Bags'}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <DateInput
            label="Required By Date"
            value={form.required_date || ''}
            onChange={(e) => setForm({ ...form, required_date: e.target.value })}
          />
          <SelectInput
            label="Priority"
            options={['Normal', 'High', 'Urgent', 'Low']}
            value={form.priority || 'Normal'}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />
          <SelectInput
            label="Status"
            options={['Pending', 'Approved', 'In Progress', 'Fulfilled', 'Rejected']}
            value={form.status || 'Pending'}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          <FormInput
            label="Requested By"
            value={form.requested_by || ''}
            onChange={(e) => setForm({ ...form, requested_by: e.target.value })}
          />
          <FormInput
            label="Purpose / Site Remarks"
            type="textarea"
            full
            value={form.remarks || ''}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
        </form>
      </Modal>

      {/* View Details Modal */}
      {selectedRequest && (
        <Modal
          open={isViewOpen}
          onClose={() => {
            setIsViewOpen(false)
            setSelectedRequest(null)
          }}
          title={`Material Request - ${selectedRequest.code}`}
          wide
          footer={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedRequest.status === 'Pending' && (
                  <>
                    <SecondaryButton
                      icon={XCircle}
                      onClick={() =>
                        handleStatusChange(selectedRequest.id, 'Rejected')
                      }
                    >
                      Reject
                    </SecondaryButton>
                    <PrimaryButton
                      icon={CheckCircle2}
                      onClick={() =>
                        handleStatusChange(selectedRequest.id, 'Approved')
                      }
                    >
                      Approve Request
                    </PrimaryButton>
                  </>
                )}
              </div>
              <SecondaryButton
                onClick={() => {
                  setIsViewOpen(false)
                  setSelectedRequest(null)
                }}
              >
                Close
              </SecondaryButton>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 14,
                borderBottom: '1px solid var(--line-100)',
              }}
            >
              <div>
                <span className="stage-code">{selectedRequest.code}</span>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    margin: '6px 0 2px',
                    color: 'var(--ink-900)',
                  }}
                >
                  {selectedRequest.item}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedRequest.priority && (
                  <StatusBadge
                    status={selectedRequest.priority}
                    tone={
                      selectedRequest.priority === 'Urgent'
                        ? 'red'
                        : selectedRequest.priority === 'High'
                        ? 'amber'
                        : 'gray'
                    }
                  />
                )}
                <StatusBadge status={selectedRequest.status} />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                fontSize: '0.88rem',
              }}
            >
              <div>
                <span
                  className="text-muted"
                  style={{ display: 'block', fontSize: '0.75rem', marginBottom: 3 }}
                >
                  Project
                </span>
                <strong>{selectedRequest.project}</strong>
              </div>
              <div>
                <span
                  className="text-muted"
                  style={{ display: 'block', fontSize: '0.75rem', marginBottom: 3 }}
                >
                  Requested Quantity
                </span>
                <strong>{selectedRequest.quantity}</strong>
              </div>
              <div>
                <span
                  className="text-muted"
                  style={{ display: 'block', fontSize: '0.75rem', marginBottom: 3 }}
                >
                  Requested By
                </span>
                <span>{selectedRequest.requested_by}</span>
              </div>
              <div>
                <span
                  className="text-muted"
                  style={{ display: 'block', fontSize: '0.75rem', marginBottom: 3 }}
                >
                  Request Date
                </span>
                <span>{formatDate(selectedRequest.date)}</span>
              </div>
              <div>
                <span
                  className="text-muted"
                  style={{ display: 'block', fontSize: '0.75rem', marginBottom: 3 }}
                >
                  Required By Date
                </span>
                <span>
                  {selectedRequest.required_date
                    ? formatDate(selectedRequest.required_date)
                    : 'Immediate / As scheduled'}
                </span>
              </div>
              <div>
                <span
                  className="text-muted"
                  style={{ display: 'block', fontSize: '0.75rem', marginBottom: 3 }}
                >
                  Current Status
                </span>
                <span style={{ fontWeight: 600 }}>{selectedRequest.status}</span>
              </div>
            </div>

            {selectedRequest.remarks && (
              <div
                style={{
                  background: 'var(--cream-100)',
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--line-200)',
                }}
              >
                <span
                  className="text-muted"
                  style={{
                    display: 'block',
                    fontSize: '0.74rem',
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  Purpose / Site Remarks:
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.86rem',
                    color: 'var(--ink-700)',
                    fontStyle: 'italic',
                  }}
                >
                  "{selectedRequest.remarks}"
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Material Request"
        message={`Are you sure you want to delete material request "${deleteTarget?.code}" for ${deleteTarget?.item}? This action cannot be undone.`}
        confirmLabel="Delete Request"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
