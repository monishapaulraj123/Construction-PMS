import { useState } from 'react'
import { Plus } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput } from '../components/FormInputs'
import { constructionTypes as initialTypes } from '../data/mockData'
import { useToast } from '../components/ToastContext'

export default function ConstructionTypes() {
  const [types, setTypes] = useState(initialTypes)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ construction_type_name: '', description: '', icon: '🏗️', image: '' })
  const showToast = useToast()

  const filtered = types.filter((t) => t.construction_type_name.toLowerCase().includes(search.toLowerCase()))

  function handleSave(e) {
    e.preventDefault()
    const newId = Math.max(0, ...types.map((t) => t.construction_type_id)) + 1
    setTypes((ts) => [
      {
        ...form,
        construction_type_id: newId,
        stages_count: 0,
        status: true,
        image: form.image || 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=600&auto=format&fit=crop',
      },
      ...ts,
    ])
    setModalOpen(false)
    setForm({ construction_type_name: '', description: '', icon: '🏗️', image: '' })
    showToast('Construction type added successfully')
  }

  return (
    <div>
      <div className="toolbar">
        <SearchBar placeholder="Search construction types..." value={search} onChange={setSearch} />
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>
          + Add Construction Type
        </PrimaryButton>
      </div>

      <div className="card-grid">
        {filtered.map((t) => (
          <div className="entity-card" key={t.construction_type_id} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 160, backgroundImage: `url(${t.image || 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: 12, fontSize: '1.4rem', background: 'var(--paper)', width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)' }}>
                {t.icon || '🏗️'}
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <StatusBadge status={t.status ? 'Active' : 'Inactive'} />
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{t.construction_type_name}</h3>
              <p className="entity-meta" style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginBottom: 12 }}>{t.description}</p>
              <div className="entity-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line-100)' }}>
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                  {t.stages_count || 12} stages sequence
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--forest-900)', fontWeight: 600 }}>Active Blueprint</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Construction Type"
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>Add</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput
            label="Construction Type Name"
            required
            full
            value={form.construction_type_name}
            onChange={(e) => setForm({ ...form, construction_type_name: e.target.value })}
          />
          <FormInput label="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <FormInput label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
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
