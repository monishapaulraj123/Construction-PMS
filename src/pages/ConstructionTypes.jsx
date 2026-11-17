import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput } from '../components/FormInputs'
import { constructionTypes as initialTypes } from '../data/mockData'
import { useToast } from '../components/ToastContext'
import { constructionTypeAPI } from '../services/api'

// Preset visual metadata matching the Construction PMS Master Data design
const TYPE_CONFIG = {
  'CT-01': {
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    stages_count: 14,
    description: 'Independent homes, villas and apartments',
  },
  'Residential': {
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    stages_count: 14,
    description: 'Independent homes, villas and apartments',
  },
  'CT-02': {
    icon: '🏥',
    image: 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?q=80&w=600&auto=format&fit=crop',
    stages_count: 9,
    description: 'Healthcare and medical facilities',
  },
  'Hospital': {
    icon: '🏥',
    image: 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?q=80&w=600&auto=format&fit=crop',
    stages_count: 9,
    description: 'Healthcare and medical facilities',
  },
  'CT-03': {
    icon: '🏫',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop',
    stages_count: 15,
    description: 'Educational campuses and institutions',
  },
  'College': {
    icon: '🏫',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop',
    stages_count: 15,
    description: 'Educational campuses and institutions',
  },
  'CT-04': {
    icon: '🏢',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    stages_count: 7,
    description: 'Offices, retail and mixed-use towers',
  },
  'Commercial Building': {
    icon: '🏢',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    stages_count: 7,
    description: 'Offices, retail and mixed-use towers',
  },
  'CT-05': {
    icon: '🏭',
    image: '/images/categories/industrial_building.jpg',
    stages_count: 12,
    description: 'Factories, warehouses and plants',
  },
  'Industrial Building': {
    icon: '🏭',
    image: '/images/categories/industrial_building.jpg',
    stages_count: 12,
    description: 'Factories, warehouses and plants',
  },
  'CT-06': {
    icon: '🛣️',
    image: '/images/categories/road.jpg',
    stages_count: 0,
    description: 'Highways and road infrastructure',
  },
  'Road': {
    icon: '🛣️',
    image: '/images/categories/road.jpg',
    stages_count: 0,
    description: 'Highways and road infrastructure',
  },
}

function getTypeMeta(t) {
  const code = t.construction_type_code || ''
  const name = t.construction_type_name || ''
  return TYPE_CONFIG[code] || TYPE_CONFIG[name] || {}
}

export default function ConstructionTypes() {
  const [types, setTypes] = useState(initialTypes)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ construction_type_name: '', description: '', icon: '🏗️', image: '' })
  const showToast = useToast()

  useEffect(() => {
    constructionTypeAPI.getAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((t) => {
            const meta = getTypeMeta(t)
            return {
              ...t,
              icon: t.icon || meta.icon || '🏗️',
              image: t.image || meta.image || '/images/categories/industrial_building.jpg',
              stages_count: t.stages_count !== undefined ? t.stages_count : meta.stages_count,
              description: meta.description || t.description,
            }
          })
          setTypes(enriched)
        }
      })
      .catch((err) => console.error('Error fetching construction types:', err))
  }, [])

  const filtered = types.filter((t) => t.construction_type_name.toLowerCase().includes(search.toLowerCase()))

  async function handleSave(e) {
    e.preventDefault()
    try {
      const created = await constructionTypeAPI.create(form)
      if (created) {
        setTypes((ts) => [created, ...ts])
      } else {
        const newId = Math.max(0, ...types.map((t) => t.construction_type_id)) + 1
        setTypes((ts) => [
          {
            ...form,
            construction_type_id: newId,
            stages_count: 0,
            status: true,
            image: form.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
          },
          ...ts,
        ])
      }
      showToast('Construction type added successfully')
    } catch (err) {
      showToast('Failed to create construction type')
    }
    setModalOpen(false)
    setForm({ construction_type_name: '', description: '', icon: '🏗️', image: '' })
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
        {filtered.map((t) => {
          const meta = getTypeMeta(t)
          const imgUrl = t.image || meta.image || '/images/categories/industrial_building.jpg'
          const icon = t.icon || meta.icon || '🏗️'
          const desc = meta.description || t.description
          const stages = t.stages_count !== undefined ? t.stages_count : meta.stages_count

          return (
            <div className="entity-card" key={t.construction_type_id} style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  height: 160,
                  backgroundImage: `url(${imgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    fontSize: '1.4rem',
                    background: 'var(--paper)',
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {icon}
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <StatusBadge status={t.status ? 'Active' : 'Inactive'} />
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{t.construction_type_name}</h3>
                <p className="entity-meta" style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginBottom: 12 }}>
                  {desc}
                </p>
                {stages > 0 && (
                  <div
                    className="entity-card-foot"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 10,
                      borderTop: '1px solid var(--line-100)',
                    }}
                  >
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      {stages} stages sequence
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--forest-900)', fontWeight: 600 }}>
                      Active Blueprint
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
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
