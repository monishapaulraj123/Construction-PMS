import { useMemo, useState } from 'react'
import { Plus, LayoutGrid, TableProperties } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput } from '../components/FormInputs'
import { items as initialItems, itemCategories } from '../data/mockData'
import { formatCurrencyINR } from '../utils/format'
import { useToast } from '../components/ToastContext'

export default function Items() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [view, setView] = useState('table')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const showToast = useToast()

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (!search || i.item_name.toLowerCase().includes(search.toLowerCase()) || i.item_code.toLowerCase().includes(search.toLowerCase())) &&
          (!categoryFilter || i.category_name === categoryFilter)
      ),
    [items, search, categoryFilter]
  )

  function openAdd() {
    setEditing(null)
    setForm({ status: true })
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
      setItems((rs) => rs.map((r) => (r.item_id === editing.item_id ? { ...r, ...form } : r)))
      showToast('Item updated successfully')
    } else {
      const newId = Math.max(0, ...items.map((r) => r.item_id)) + 1
      setItems((rs) => [{ ...form, item_id: newId, image: form.image_url || items[0].image }, ...rs])
      showToast('Item added successfully')
    }
    setModalOpen(false)
  }
  function handleDelete() {
    setItems((rs) => rs.filter((r) => r.item_id !== deleteTarget.item_id))
    showToast('Item removed')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search items..." value={search} onChange={setSearch} />
        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {itemCategories.map((c) => (
            <option key={c.category_id} value={c.category_name}>
              {c.category_name}
            </option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn" style={{ background: view === 'table' ? 'var(--cream-100)' : undefined }} onClick={() => setView('table')} aria-label="Table view">
            <TableProperties size={16} />
          </button>
          <button className="icon-btn" style={{ background: view === 'card' ? 'var(--cream-100)' : undefined }} onClick={() => setView('card')} aria-label="Card view">
            <LayoutGrid size={16} />
          </button>
        </div>
        <PrimaryButton icon={Plus} onClick={openAdd}>
          + Add Item
        </PrimaryButton>
      </div>

      {view === 'table' ? (
        <DataTable
          columns={[
            { key: 'item_code', label: 'Item Code' },
            {
              key: 'item_name',
              label: 'Item Name',
              render: (r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-sm)',
                      backgroundImage: `url(${r.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      border: '1px solid var(--line-100)',
                    }}
                  />
                  <span className="cell-primary">{r.item_name}</span>
                </div>
              ),
            },
            { key: 'category_name', label: 'Category' },
            { key: 'brand', label: 'Brand' },
            { key: 'unit_of_measure', label: 'Unit' },
            { key: 'standard_rate', label: 'Standard Rate', render: (r) => formatCurrencyINR(r.standard_rate) },
            { key: 'minimum_stock_level', label: 'Min. Stock' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
          ]}
          rows={filtered}
          keyField="item_id"
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      ) : (
        <div className="card-grid">
          {filtered.map((item) => (
            <div className="entity-card" key={item.item_id} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 140, backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: 18 }}>
                <h3 style={{ fontSize: '0.95rem' }}>{item.item_name}</h3>
                <p className="entity-meta">{item.brand} · {item.unit_of_measure}</p>
                <div className="entity-card-foot">
                  <span className="cell-primary">{formatCurrencyINR(item.standard_rate)}</span>
                  <StatusBadge status={item.status ? 'Active' : 'Inactive'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Item' : 'Add Item'}
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>{editing ? 'Save Changes' : 'Add'}</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Item Code" required value={form.item_code || ''} onChange={(e) => setForm({ ...form, item_code: e.target.value })} />
          <SelectInput
            label="Item Category"
            options={itemCategories.map((c) => c.category_name)}
            value={form.category_name || ''}
            onChange={(e) => setForm({ ...form, category_name: e.target.value })}
          />
          <FormInput label="Item Name" required full value={form.item_name || ''} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
          <FormInput label="Brand" value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <FormInput label="Unit of Measure" value={form.unit_of_measure || ''} onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })} />
          <FormInput label="Standard Rate (₹)" value={form.standard_rate || ''} onChange={(e) => setForm({ ...form, standard_rate: e.target.value })} />
          <FormInput label="Minimum Stock Level" value={form.minimum_stock_level || ''} onChange={(e) => setForm({ ...form, minimum_stock_level: e.target.value })} />
          <FormInput label="Image URL" full value={form.image_url || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <FormInput label="Description" type="textarea" full value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Item?"
        description="This action cannot be undone. The item will be permanently removed from the catalogue."
      />
    </div>
  )
}
