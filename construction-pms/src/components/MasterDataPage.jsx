import { useMemo, useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import SearchBar from './SearchBar'
import DataTable from './DataTable'
import Modal from './Modal'
import ConfirmationDialog from './ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from './Buttons'
import { FormInput, SelectInput } from './FormInputs'
import { useToast } from './ToastContext'

/**
 * Config-driven master data page.
 * columns: DataTable column defs
 * fields: form field defs [{ name, label, type: 'text'|'select'|'textarea', options, required }]
 * searchKeys: fields to match against the search box
 */
export default function MasterDataPage({
  title,
  addLabel,
  initialData,
  columns,
  fields,
  searchKeys,
  keyField = 'id',
  extraFilter,
  onView,
  fetchApi,
  createApi,
  updateApi,
  deleteApi,
}) {
  const [rows, setRows] = useState(initialData || [])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const showToast = useToast()

  // Sync rows when fetchApi or initialData changes
  useEffect(() => {
    if (fetchApi) {
      setLoading(true)
      fetchApi()
        .then((data) => {
          if (Array.isArray(data)) {
            setRows(data)
          } else if (Array.isArray(initialData)) {
            setRows(initialData)
          }
        })
        .catch((err) => {
          console.error(`Error fetching ${title}:`, err)
          if (Array.isArray(initialData) && rows.length === 0) setRows(initialData)
        })
        .finally(() => setLoading(false))
    } else if (initialData) {
      setRows(initialData)
    }
  }, [fetchApi, title])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        !search ||
        searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(search.toLowerCase()))
      const matchesStatus =
        !statusFilter || (statusFilter === 'Active' ? Boolean(row.status) : !row.status)
      return matchesSearch && matchesStatus
    })
  }, [rows, search, statusFilter, searchKeys])

  function openAdd() {
    setEditing(null)
    const blank = {}
    fields.forEach((f) => {
      if (f.name) blank[f.name] = f.type === 'checkbox' ? true : ''
    })
    setForm({ ...blank, status: true })
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm(row)
    setModalOpen(true)
  }

  function getSingularTitle(tStr) {
    if (!tStr) return 'Item'
    if (tStr.endsWith('ies')) return tStr.slice(0, -3) + 'y'
    if (tStr.endsWith('s')) return tStr.slice(0, -1)
    return tStr
  }

  async function handleSave(e) {
    e.preventDefault()
    const singularName = getSingularTitle(title)
    try {
      if (editing) {
        if (updateApi) {
          const updated = await updateApi(editing[keyField], form)
          setRows((rs) => rs.map((r) => (String(r[keyField]) === String(editing[keyField]) ? (updated || { ...r, ...form }) : r)))
        } else {
          setRows((rs) => rs.map((r) => (String(r[keyField]) === String(editing[keyField]) ? { ...r, ...form } : r)))
        }
        showToast(`${singularName} updated successfully`, 'success')
      } else {
        if (createApi) {
          const created = await createApi(form)
          if (created) {
            setRows((rs) => [created, ...rs])
            showToast(`${singularName} added successfully`, 'success')
          } else {
            showToast(`Failed to add ${singularName}`, 'error')
          }
        } else {
          const newId = Math.max(0, ...rows.map((r) => Number(r[keyField]) || 0)) + 1
          setRows((rs) => [{ ...form, [keyField]: newId, status: form.status !== false, created_at: new Date().toISOString() }, ...rs])
          showToast(`${singularName} added successfully`, 'success')
        }
      }
      setModalOpen(false)
    } catch (err) {
      console.error(`Error saving ${title}:`, err)
      showToast(err.response?.data?.error || `Failed to save ${singularName} to database`, 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const targetId = deleteTarget[keyField]
    const singularName = getSingularTitle(title)

    try {
      if (deleteApi) {
        await deleteApi(targetId)
      }
      setRows((rs) => rs.filter((r) => String(r[keyField]) !== String(targetId)))
      showToast(`${singularName} removed successfully`, 'success')
    } catch (err) {
      console.error(`Error deleting ${title}:`, err)
      showToast(err.response?.data?.error || `Failed to delete ${singularName}`, 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={setSearch} />
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={openAdd}>
          {addLabel}
        </PrimaryButton>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        keyField={keyField}
        onView={onView}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage={loading ? `Loading ${title.toLowerCase()}...` : `No ${title.toLowerCase()} match your filters.`}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${title.slice(0, -1)}` : addLabel}
        wide={fields.some((f) => f.section)}
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? 'Save Changes' : 'Add'}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          {fields.map((f, i) => {
            if (f.section) {
              return (
                <div key={`sec-${i}-${f.section}`} className="form-section-header full">
                  <h4>{f.section}</h4>
                </div>
              )
            }
            if (f.type === 'select') {
              return (
                <SelectInput
                  key={f.name}
                  label={f.label}
                  full={f.full}
                  options={f.options}
                  required={f.required}
                  value={form[f.name] ?? ''}
                  onChange={(e) => {
                    let val = e.target.value
                    if (val === 'true') val = true
                    if (val === 'false') val = false
                    setForm({ ...form, [f.name]: val })
                  }}
                />
              )
            }
            return (
              <FormInput
                key={f.name}
                label={f.label}
                type={f.type || 'text'}
                full={f.full}
                required={f.required}
                value={form[f.name] ?? ''}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
            )
          })}
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${title.slice(0, -1)}?`}
        description="This action cannot be undone. The record will be permanently removed."
      />
    </div>
  )
}
