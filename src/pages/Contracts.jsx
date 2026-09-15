import { useState } from 'react'
import { Plus, FileText, Calendar, Building, DollarSign } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { contracts as initialContracts, projects, services } from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useToast } from '../components/ToastContext'

export default function Contracts() {
  const [contractList, setContractList] = useState(initialContracts)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const showToast = useToast()

  const filtered = contractList.filter(
    (c) =>
      (!search ||
        c.contract_number.toLowerCase().includes(search.toLowerCase()) ||
        c.project_name.toLowerCase().includes(search.toLowerCase()) ||
        c.contractor_name.toLowerCase().includes(search.toLowerCase())) &&
      (!typeFilter || c.contract_type === typeFilter)
  )

  function openAdd() {
    setEditing(null)
    setForm({ contract_type: 'Full Contract', status: 'Active', amount: 0 })
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
      setContractList((rs) => rs.map((r) => (r.contract_id === editing.contract_id ? { ...r, ...form } : r)))
      showToast('Contract updated successfully')
    } else {
      const newId = Math.max(0, ...contractList.map((r) => r.contract_id)) + 1
      setContractList((rs) => [
        {
          ...form,
          contract_id: newId,
          contract_number: form.contract_number || `CNT-2026-${String(newId).padStart(3, '0')}`,
          status: form.status || 'Active',
        },
        ...rs,
      ])
      showToast('Contract added successfully')
    }
    setModalOpen(false)
  }

  function handleDelete() {
    setContractList((rs) => rs.filter((r) => r.contract_id !== deleteTarget.contract_id))
    showToast('Contract deleted')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search contracts by number, project or contractor..." value={search} onChange={setSearch} />
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Contract Types</option>
          <option value="Full Contract">Full Contract</option>
          <option value="Labour Contract">Labour Contract</option>
        </select>
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={openAdd}>
          + Create Contract
        </PrimaryButton>
      </div>

      <DataTable
        columns={[
          { key: 'contract_number', label: 'Contract No.' },
          { key: 'contract_type', label: 'Contract Type', render: (r) => <span className="stage-code">{r.contract_type}</span> },
          { key: 'project_name', label: 'Project', render: (r) => <span className="cell-primary">{r.project_name}</span> },
          { key: 'service_name', label: 'Service' },
          { key: 'contractor_name', label: 'Contractor / Vendor' },
          { key: 'amount', label: 'Contract Value', render: (r) => formatCurrencyINR(r.amount) },
          { key: 'start_date', label: 'Start Date', render: (r) => formatDate(r.start_date) },
          { key: 'end_date', label: 'End Date', render: (r) => formatDate(r.end_date) },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'Active' ? 'Active' : 'Inactive'} /> },
        ]}
        rows={filtered}
        keyField="contract_id"
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Contract' : 'Create Contract'}
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? 'Save Changes' : 'Create Contract'}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Contract Number" required value={form.contract_number || ''} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} />
          <SelectInput
            label="Contract Type"
            required
            options={['Full Contract', 'Labour Contract']}
            value={form.contract_type || 'Full Contract'}
            onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
          />
          <SelectInput
            label="Project"
            required
            options={projects.map((p) => p.project_name)}
            value={form.project_name || ''}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
          />
          <SelectInput
            label="Service"
            options={services.map((s) => s.service_name)}
            value={form.service_name || ''}
            onChange={(e) => setForm({ ...form, service_name: e.target.value })}
          />
          <FormInput label="Contractor / Vendor Name" required value={form.contractor_name || ''} onChange={(e) => setForm({ ...form, contractor_name: e.target.value })} />
          <FormInput label="Contract Amount (₹)" type="number" required value={form.amount ?? ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
          <DateInput label="Start Date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <DateInput label="End Date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <FormInput label="Terms & Conditions" type="textarea" full value={form.terms_conditions || ''} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })} />
          <FormInput label="Remarks / Notes" type="textarea" full value={form.remarks || ''} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <SelectInput
            label="Status"
            options={['Active', 'Completed', 'Terminated', 'Draft']}
            value={form.status || 'Active'}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Contract?"
        description="This action cannot be undone. The contract record will be removed."
      />
    </div>
  )
}
