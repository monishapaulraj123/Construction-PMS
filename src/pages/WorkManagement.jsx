import { useState } from 'react'
import { Plus, CheckSquare, Clock, User } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { workRecords as initialWork, projects, employees, services } from '../data/mockData'
import { formatDate } from '../utils/format'
import { useToast } from '../components/ToastContext'

export default function WorkManagement() {
  const [workList, setWorkList] = useState(initialWork)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const showToast = useToast()

  const filtered = workList.filter(
    (w) =>
      (!search ||
        w.work_name.toLowerCase().includes(search.toLowerCase()) ||
        w.project_name.toLowerCase().includes(search.toLowerCase()) ||
        w.employee_name.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || w.status === statusFilter)
  )

  function openAdd() {
    setEditing(null)
    setForm({ status: 'In Progress', progress_percentage: 0 })
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm(row)
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (editing) {
      setWorkList((rs) => rs.map((r) => (r.work_id === editing.work_id ? { ...r, ...form } : r)))
      showToast('Work record updated')
    } else {
      const newId = Math.max(0, ...workList.map((r) => r.work_id)) + 1
      setWorkList((rs) => [
        {
          ...form,
          work_id: newId,
          status: form.status || 'In Progress',
        },
        ...rs,
      ])
      showToast('Work task assigned successfully')
    }
    setModalOpen(false)
  }

  function handleDelete() {
    setWorkList((rs) => rs.filter((r) => r.work_id !== deleteTarget.work_id))
    showToast('Work record removed')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search work tasks by name, project or assigned staff..." value={search} onChange={setSearch} />
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Delayed">Delayed</option>
          <option value="Planned">Planned</option>
        </select>
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={openAdd}>
          + Assign Work
        </PrimaryButton>
      </div>

      <DataTable
        columns={[
          { key: 'work_name', label: 'Work / Task Name', render: (r) => <span className="cell-primary">{r.work_name}</span> },
          { key: 'project_name', label: 'Project' },
          { key: 'service_name', label: 'Service / Trade' },
          { key: 'employee_name', label: 'Assigned Engineer / Supervisor' },
          {
            key: 'progress_percentage',
            label: 'Progress',
            render: (r) => (
              <div style={{ minWidth: 120 }}>
                <ProgressBar value={r.progress_percentage || 0} showLabel tone={r.progress_percentage >= 100 ? 'green' : 'amber'} />
              </div>
            ),
          },
          { key: 'start_date', label: 'Start Date', render: (r) => formatDate(r.start_date) },
          { key: 'end_date', label: 'End Date', render: (r) => formatDate(r.end_date) },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'Completed' ? 'Active' : 'Pending'} /> },
        ]}
        rows={filtered}
        keyField="work_id"
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Work Task' : 'Assign Work Task'}
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? 'Save Changes' : 'Assign Work'}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Work / Task Name" required full value={form.work_name || ''} onChange={(e) => setForm({ ...form, work_name: e.target.value })} />
          <SelectInput
            label="Project"
            required
            options={projects.map((p) => p.project_name)}
            value={form.project_name || ''}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
          />
          <SelectInput
            label="Assigned Employee / Manager"
            required
            options={employees.map((e) => `${e.first_name} ${e.last_name}`)}
            value={form.employee_name || ''}
            onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
          />
          <SelectInput
            label="Associated Service"
            options={services.map((s) => s.service_name)}
            value={form.service_name || ''}
            onChange={(e) => setForm({ ...form, service_name: e.target.value })}
          />
          <FormInput label="Construction Stage Name" value={form.stage_name || ''} onChange={(e) => setForm({ ...form, stage_name: e.target.value })} />
          <FormInput label="Progress (%)" type="number" value={form.progress_percentage ?? ''} onChange={(e) => setForm({ ...form, progress_percentage: parseInt(e.target.value) || 0 })} />
          <DateInput label="Start Date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <DateInput label="Target End Date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <FormInput label="Task Scope & Description" type="textarea" full value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormInput label="Remarks / Site Notes" type="textarea" full value={form.remarks || ''} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <SelectInput
            label="Task Status"
            options={['Planned', 'In Progress', 'Completed', 'Delayed']}
            value={form.status || 'In Progress'}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Work Task?"
        description="This action cannot be undone."
      />
    </div>
  )
}
