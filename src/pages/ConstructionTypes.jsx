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
  const [form, setForm] = useState({ construction_type_name: '', description: '', icon: '🏗️' })
  const showToast = useToast()

  const filtered = types.filter((t) => t.construction_type_name.toLowerCase().includes(search.toLowerCase()))

  function handleSave(e) {
    e.preventDefault()
    const newId = Math.max(0, ...types.map((t) => t.construction_type_id)) + 1
    setTypes((ts) => [{ ...form, construction_type_id: newId, stages_count: 0, status: true }, ...ts])
    setModalOpen(false)
    setForm({ construction_type_name: '', description: '', icon: '🏗️' })
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
          <div className="entity-card type-card" key={t.construction_type_id}>
            <div className="emoji-badge">{t.icon}</div>
            <h3>{t.construction_type_name}</h3>
            <p className="entity-meta">{t.description}</p>
            <div className="entity-card-foot">
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                {t.stages_count} stages
              </span>
              <StatusBadge status={t.status ? 'Active' : 'Inactive'} />
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
