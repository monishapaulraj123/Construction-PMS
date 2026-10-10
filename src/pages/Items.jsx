import { useMemo, useState } from 'react'
import { Plus, LayoutGrid, TableProperties, AlertTriangle } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput } from '../components/FormInputs'
import { items as initialItems, itemCategories, suppliers } from '../data/mockData'
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
          (!search ||
            (i.material_name || i.item_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (i.item_code || '').toLowerCase().includes(search.toLowerCase()) ||
            (i.brand || '').toLowerCase().includes(search.toLowerCase())) &&
          (!categoryFilter || i.category_name === categoryFilter)
      ),
    [items, search, categoryFilter]
  )

  function openAdd() {
    setEditing(null)
    setForm({ status: true, quantity_inhand: 0, minimum_stock_level: 100 })
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
      setItems((rs) => rs.map((r) => (r.item_id === editing.item_id ? { ...r, ...form, item_name: form.material_name || form.item_name } : r)))
      showToast('Material item updated successfully')
    } else {
      const newId = Math.max(0, ...items.map((r) => r.item_id)) + 1
      setItems((rs) => [
        {
          ...form,
          item_id: newId,
          material_id: newId,
          item_code: form.item_code || `ITM-${String(newId).padStart(3, '0')}`,
          item_name: form.material_name || form.item_name || 'New Material',
          image: form.image_url || items[0].image,
        },
        ...rs,
      ])
      showToast('Material item added successfully')
    }
    setModalOpen(false)
  }
  function handleDelete() {
    setItems((rs) => rs.filter((r) => r.item_id !== deleteTarget.item_id))
    showToast('Material item removed')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search materials by name, code or brand..." value={search} onChange={setSearch} />
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
          + Add Material
        </PrimaryButton>
      </div>

      {view === 'table' ? (
        <DataTable
          columns={[
            { key: 'item_code', label: 'Material Code' },
            {
              key: 'material_name',
              label: 'Material Name',
              render: (r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-sm)',
                      backgroundImage: `url(${r.image_url || r.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      border: '1px solid var(--line-100)',
                    }}
                  />
                  <div>
                    <span className="cell-primary">{r.material_name || r.item_name}</span>
                    {r.quantity_inhand <= r.minimum_stock_level && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 8, fontSize: '0.72rem', color: 'var(--amber-600, #d97706)', fontWeight: 600 }}>
                        <AlertTriangle size={12} /> Low Stock
                      </span>
                    )}
                  </div>
                </div>
              ),
            },
            { key: 'category_name', label: 'Category' },
            { key: 'brand', label: 'Brand' },
            { key: 'supplier_name', label: 'Supplier' },
            { key: 'quantity_inhand', label: 'In-Hand Stock', render: (r) => `${r.quantity_inhand ?? 0} ${r.unit_of_measure || ''}` },
            { key: 'standard_rate', label: 'Standard Rate', render: (r) => formatCurrencyINR(r.standard_rate) },
            { key: 'minimum_stock_level', label: 'Min Stock' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
          ]}
          rows={filtered}
          keyField="item_id"
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      ) : (
        <div className="card-grid">
          {filtered.map((item) => {
            const isLowStock = (item.quantity_inhand ?? 0) <= (item.minimum_stock_level ?? 0)
            return (
              <div className="entity-card" key={item.material_id || item.item_id} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 160, backgroundImage: `url(${item.image_url || item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                    <StatusBadge status={item.status ? 'Active' : 'Inactive'} />
                    {isLowStock ? (
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <AlertTriangle size={11} /> Low Stock
                      </span>
                    ) : (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700 }}>
                        In Stock
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4 }}>{item.material_name || item.item_name}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginBottom: 12 }}>
                    <span>Category: <strong>{item.category_name || 'General'}</strong></span> · <span>Brand: <strong>{item.brand || 'N/A'}</strong></span>
                  </div>
                  <div style={{ padding: '10px 12px', background: 'var(--cream-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <span className="text-muted" style={{ display: 'block', fontSize: '0.72rem' }}>Quantity in Hand</span>
                      <strong>{item.quantity_inhand ?? 0} {item.unit_of_measure}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="text-muted" style={{ display: 'block', fontSize: '0.72rem' }}>Min Level</span>
                      <span>{item.minimum_stock_level} {item.unit_of_measure}</span>
                    </div>
                  </div>
                  <div className="entity-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line-100)' }}>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Standard Rate</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                      {formatCurrencyINR(item.standard_rate)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ink-500)' }}>/ {item.unit_of_measure}</span>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Material' : 'Add Material'}
        wide
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
            label="Category (category_id)"
            options={itemCategories.map((c) => c.category_name)}
            value={form.category_name || ''}
            onChange={(e) => {
              const cat = itemCategories.find((c) => c.category_name === e.target.value)
              setForm({ ...form, category_name: e.target.value, category_id: cat?.category_id || 1 })
            }}
          />
          <FormInput
            label="Material Name"
            required
            full
            value={form.material_name || form.item_name || ''}
            onChange={(e) => setForm({ ...form, material_name: e.target.value, item_name: e.target.value })}
          />
          <FormInput label="Brand" value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <SelectInput
            label="Preferred Supplier (supplier_id)"
            options={suppliers.map((s) => s.supplier_name)}
            value={form.supplier_name || ''}
            onChange={(e) => {
              const sup = suppliers.find((s) => s.supplier_name === e.target.value)
              setForm({ ...form, supplier_name: e.target.value, supplier_id: sup?.supplier_id || 1 })
            }}
          />
          <FormInput label="Unit of Measure" value={form.unit_of_measure || ''} onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })} />
          <FormInput label="Quantity In-Hand" type="number" value={form.quantity_inhand ?? ''} onChange={(e) => setForm({ ...form, quantity_inhand: parseFloat(e.target.value) || 0 })} />
          <FormInput label="Standard Rate (₹)" type="number" value={form.standard_rate ?? ''} onChange={(e) => setForm({ ...form, standard_rate: parseFloat(e.target.value) || 0 })} />
          <FormInput label="Minimum Stock Level" type="number" value={form.minimum_stock_level ?? ''} onChange={(e) => setForm({ ...form, minimum_stock_level: parseFloat(e.target.value) || 0 })} />
          <FormInput label="Image URL" full value={form.image_url || form.image || ''} onChange={(e) => setForm({ ...form, image_url: e.target.value, image: e.target.value })} />
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
        title="Delete Material Item?"
        description="This action cannot be undone. The material will be permanently removed from the catalogue."
      />
    </div>
  )
}
