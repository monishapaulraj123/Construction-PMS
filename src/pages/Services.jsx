import { useMemo, useState } from 'react'
import { Plus, LayoutGrid, TableProperties, Wrench, Clock, Calendar } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { services as initialServices, projects } from '../data/mockData'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useToast } from '../components/ToastContext'

export default function Services() {
  const [serviceList, setServiceList] = useState(initialServices)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('card')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const showToast = useToast()

  const filtered = useMemo(
    () =>
      serviceList.filter(
        (s) =>
          !search ||
          s.service_name.toLowerCase().includes(search.toLowerCase()) ||
          (s.service_code || '').toLowerCase().includes(search.toLowerCase()) ||
          (s.project_name || '').toLowerCase().includes(search.toLowerCase())
      ),
    [serviceList, search]
  )

  function openAdd() {
    setEditing(null)
    setForm({ status: true, unit_of_measure: 'Sq. Ft', base_rate: 0, estimated_duration_days: 10 })
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm(row)
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const prj = projects.find((p) => p.project_name === form.project_name)
    if (editing) {
      setServiceList((rs) =>
        rs.map((r) =>
          r.service_id === editing.service_id
            ? { ...r, ...form, project_id: prj?.project_id || r.project_id }
            : r
        )
      )
      showToast('Service updated successfully')
    } else {
      const newId = Math.max(0, ...serviceList.map((r) => r.service_id)) + 1
      setServiceList((rs) => [
        {
          ...form,
          service_id: newId,
          service_code: form.service_code || `SRV-${String(newId).padStart(2, '0')}`,
          project_id: prj?.project_id || 1,
          status: form.status !== false,
        },
        ...rs,
      ])
      showToast('Service added successfully')
    }
    setModalOpen(false)
  }

  function handleDelete() {
    setServiceList((rs) => rs.filter((r) => r.service_id !== deleteTarget.service_id))
    showToast('Service removed')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search services by name or project..." value={search} onChange={setSearch} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="icon-btn"
            style={{ background: view === 'card' ? 'var(--cream-100)' : undefined }}
            onClick={() => setView('card')}
            aria-label="Card view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className="icon-btn"
            style={{ background: view === 'table' ? 'var(--cream-100)' : undefined }}
            onClick={() => setView('table')}
            aria-label="Table view"
          >
            <TableProperties size={16} />
          </button>
        </div>
        <PrimaryButton icon={Plus} onClick={openAdd}>
          + Add Service
        </PrimaryButton>
      </div>

      {view === 'card' ? (
        <div className="card-grid">
          {filtered.map((srv) => (
            <div className="entity-card" key={srv.service_id} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', background: 'var(--gold-050)', border: '1px solid var(--gold-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest-900)' }}>
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{srv.service_name}</h3>
                    <span className="stage-code" style={{ fontSize: '0.72rem' }}>{srv.service_code || `SRV-0${srv.service_id}`}</span>
                  </div>
                </div>
                <StatusBadge status={srv.status ? 'Active' : 'Inactive'} />
              </div>

              <p className="entity-meta" style={{ fontSize: '0.82rem', color: 'var(--ink-500)', lineHeight: 1.4 }}>
                {srv.description || 'Specialist contractor service for construction project execution.'}
              </p>

              <div style={{ padding: '10px 12px', background: 'var(--cream-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Assigned Project:</span>
                  <strong>{srv.project_name || 'General Project'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted"><Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> Est. Duration:</span>
                  <span>{srv.estimated_duration_days} days</span>
                </div>
                {srv.start_date && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted"><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} /> Schedule:</span>
                    <span>{formatDate(srv.start_date)} {srv.end_date ? `to ${formatDate(srv.end_date)}` : ''}</span>
                  </div>
                )}
              </div>

              <div className="entity-card-foot" style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--line-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-muted" style={{ fontSize: '0.76rem' }}>Base Rate</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                  {formatCurrencyINR(srv.base_rate)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ink-500)' }}>/ {srv.unit_of_measure}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'service_code', label: 'Service Code' },
            {
              key: 'service_name',
              label: 'Service Name',
              render: (r) => <span className="cell-primary">{r.service_name}</span>,
            },
            { key: 'project_name', label: 'Assigned Project' },
            { key: 'unit_of_measure', label: 'Unit' },
            { key: 'base_rate', label: 'Base Rate', render: (r) => formatCurrencyINR(r.base_rate) },
            { key: 'estimated_duration_days', label: 'Est. Duration', render: (r) => `${r.estimated_duration_days} days` },
            { key: 'start_date', label: 'Start Date', render: (r) => (r.start_date ? formatDate(r.start_date) : '-') },
            { key: 'end_date', label: 'End Date', render: (r) => (r.end_date ? formatDate(r.end_date) : '-') },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
          ]}
          rows={filtered}
          keyField="service_id"
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Service' : 'Add Service'}
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? 'Save Changes' : 'Add'}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Service Code" required value={form.service_code || ''} onChange={(e) => setForm({ ...form, service_code: e.target.value })} />
          <FormInput label="Service Name" required value={form.service_name || ''} onChange={(e) => setForm({ ...form, service_name: e.target.value })} />
          <SelectInput
            label="Assigned Project"
            options={projects.map((p) => p.project_name)}
            value={form.project_name || ''}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
          />
          <FormInput label="Unit of Measure" value={form.unit_of_measure || ''} onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })} />
          <FormInput label="Base Rate (₹)" type="number" value={form.base_rate ?? ''} onChange={(e) => setForm({ ...form, base_rate: parseFloat(e.target.value) || 0 })} />
          <FormInput label="Estimated Duration (Days)" type="number" value={form.estimated_duration_days ?? ''} onChange={(e) => setForm({ ...form, estimated_duration_days: parseInt(e.target.value) || 0 })} />
          <DateInput label="Start Date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <DateInput label="End Date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <FormInput label="Description" type="textarea" full value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <SelectInput
            label="Status"
            options={[
              { label: 'Active', value: 'true' },
              { label: 'Inactive', value: 'false' },
            ]}
            value={form.status !== false ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, status: e.target.value === 'true' })}
          />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service?"
        description="This action cannot be undone. The service will be permanently removed."
      />
    </div>
  )
}
