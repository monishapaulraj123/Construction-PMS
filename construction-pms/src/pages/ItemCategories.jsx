import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { Plus } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput } from '../components/FormInputs'
import { itemCategories as initialCategories } from '../data/mockData'
import { useToast } from '../components/ToastContext'
import { itemCategoryAPI } from '../services/api'

function getCategoryPhoto(cat) {
  const name = (cat?.category_name || '').toLowerCase()
  if (name.includes('brick')) return '/images/categories/bricks.jpg'
  if (name.includes('sand')) return '/images/categories/sand.jpg'
  if (name.includes('steel') || name.includes('tmt')) return '/images/categories/steel.jpg'
  if (name.includes('cement')) return '/images/categories/cement.jpg'
  if (name.includes('elect') || name.includes('wire')) return '/images/categories/electrical.jpg'
  if (name.includes('plumb') || name.includes('pipe')) return '/images/categories/plumbing.jpg'
  if (name.includes('tile')) return '/images/categories/tiles.jpg'
  if (name.includes('paint')) return '/images/categories/paint.jpg'
  return cat?.image || '/images/categories/cement.jpg'
}

export default function ItemCategories() {
  const [categories, setCategories] = useState(initialCategories)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ category_code: '', category_name: '', description: '' })
  const showToast = useToast()

  useEffect(() => {
    itemCategoryAPI.getAll()
      .then((data) => { if (Array.isArray(data) && data.length > 0) setCategories(data) })
      .catch((err) => console.error('Error fetching categories:', err))
  }, [])

  const filtered = categories.filter((c) => (c.category_name || '').toLowerCase().includes(search.toLowerCase()))

  async function handleSave(e) {
    e.preventDefault()
    try {
      const created = await itemCategoryAPI.create(form)
      if (created) {
        setCategories((cs) => [created, ...cs])
        showToast('Material category added successfully', 'success')
        setModalOpen(false)
        setForm({ category_code: '', category_name: '', description: '' })
      } else {
        showToast('Failed to create category', 'error')
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create category in database', 'error')
    }
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search material categories..." value={search} onChange={setSearch} />
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>
          + Add Category
        </PrimaryButton>
      </div>

      <div className="card-grid">
        {filtered.map((cat) => {
          const Icon = Icons[cat.icon] || Icons.Boxes
          return (
            <div className="entity-card" key={cat.category_id} style={{ padding: 0, overflow: 'hidden' }}>
              <div className="entity-card-media" style={{ backgroundImage: `url(${getCategoryPhoto(cat)})`, height: 160, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div className="entity-card-icon-badge" style={{ position: 'absolute', top: 12, left: 12, background: 'var(--paper)', padding: 8, borderRadius: 'var(--radius-sm)', display: 'flex', boxShadow: 'var(--shadow-card)' }}>
                  <Icon size={18} style={{ color: 'var(--forest-900)' }} />
                </div>
              </div>
              <div className="entity-card-body" style={{ padding: 16 }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{cat.category_name}</h3>
                <p className="entity-meta" style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginBottom: 12 }}>{cat.description}</p>
                <div className="entity-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                    {cat.items_count} materials
                  </span>
                  <StatusBadge status={cat.status ? 'Active' : 'Inactive'} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Material Category"
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>Add</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput
            label="Category Code"
            required
            value={form.category_code}
            onChange={(e) => setForm({ ...form, category_code: e.target.value })}
          />
          <FormInput
            label="Category Name"
            required
            value={form.category_name}
            onChange={(e) => setForm({ ...form, category_name: e.target.value })}
          />
          <FormInput
            label="Description"
            type="textarea"
            full
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  )
}
