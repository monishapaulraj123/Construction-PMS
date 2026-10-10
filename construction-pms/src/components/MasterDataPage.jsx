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

  // Sync rows if initialData or fetchApi changes
  useEffect(() => {
    if (fetchApi) {
      setLoading(true)
      fetchApi()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const merged = [...data]
            if (Array.isArray(initialData)) {
              initialData.forEach((initRow) => {
                const initKey = initRow[keyField]
                const exists = merged.some((r) => String(r[keyField]) === String(initKey))
                if (!exists) merged.push(initRow)
              })
            }
            setRows(merged)
          } else if (Array.isArray(initialData) && initialData.length > 0) {
            setRows(initialData)
          } else if (Array.isArray(data)) {
            setRows(data)
          }
        })
        .catch((err) => {
          console.error(`Error fetching ${title}:`, err)
          if (initialData) setRows(initialData)
        })
        .finally(() => setLoading(false))
    } else if (initialData) {
      setRows(initialData)
    }
  }, [initialData, fetchApi, title, keyField])

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

  async function handleSave(e) {
    e.preventDefault()
    try {
      if (editing) {
        if (updateApi) {
          const updated = await updateApi(editing[keyField], form)
          setRows((rs) => rs.map((r) => (r[keyField] === editing[keyField] ? updated || { ...r, ...form } : r)))
        } else {
          setRows((rs) => rs.map((r) => (r[keyField] === editing[keyField] ? { ...r, ...form } : r)))
        }
        showToast(`${title.slice(0, -1)} updated successfully`)
      } else {
        if (createApi) {
          const created = await createApi(form)
          setRows((rs) => [created || form, ...rs])
        } else {
          const newId = Math.max(0, ...rows.map((r) => Number(r[keyField]) || 0)) + 1
          setRows((rs) => [{ ...form, [keyField]: newId, status: form.status !== false }, ...rs])
        }
        showToast(`${title.slice(0, -1)} added successfully`)
      }
      setModalOpen(false)
    } catch (err) {
      console.error(`Error saving ${title}:`, err)
      const newId = Math.max(0, ...rows.map((r) => Number(r[keyField]) || 0)) + 1
      const fallbackItem = { ...form, [keyField]: newId, status: form.status !== false, created_at: new Date().toISOString() }
      if (editing) {
        setRows((rs) => rs.map((r) => (r[keyField] === editing[keyField] ? { ...r, ...form } : r)))
        showToast(`${title.replace(/s$/, '')} updated successfully`)
      } else {
        setRows((rs) => [fallbackItem, ...rs])
        showToast(`${title.replace(/s$/, '')} added successfully`)
      }
      setModalOpen(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      if (deleteApi) {
        await deleteApi(deleteTarget[keyField])
      }
      setRows((rs) => rs.filter((r) => r[keyField] !== deleteTarget[keyField]))
      showToast(`${title.slice(0, -1)} removed`)
    } catch (err) {
      console.error(`Error deleting ${title}:`, err)
      showToast(`Failed to delete ${title.slice(0, -1)}: ${err.message || 'Server error'}`)
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
