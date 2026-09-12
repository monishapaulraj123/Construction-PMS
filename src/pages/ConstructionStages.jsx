import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import Modal from '../components/Modal'
import { FormInput, SelectInput } from '../components/FormInputs'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import HorizontalTimeline from '../components/HorizontalTimeline'
import { constructionTypes, constructionStages } from '../data/mockData'
import { useToast } from '../components/ToastContext'

export default function ConstructionStages() {
  const [typeId, setTypeId] = useState(1)
  const [stagesByType, setStagesByType] = useState(constructionStages)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ stage_name: '', estimated_duration_days: '', description: '' })
  const showToast = useToast()

  const activeType = constructionTypes.find((t) => t.construction_type_id === Number(typeId))
  const stages = stagesByType[typeId] || []

  function handleSave(e) {
    e.preventDefault()
    const nextSeq = stages.length + 1
    const newStage = {
      stage_id: Date.now(),
      stage_code: `STG-${String(nextSeq).padStart(2, '0')}`,
      stage_sequence: nextSeq,
      status: true,
      ...form,
    }
    setStagesByType((s) => ({ ...s, [typeId]: [...(s[typeId] || []), newStage] }))
    setModalOpen(false)
    setForm({ stage_name: '', estimated_duration_days: '', description: '' })
    showToast('Construction stage added successfully')
  }

  const sortedStages = stages.slice().sort((a, b) => a.stage_sequence - b.stage_sequence)

  return (
    <div>
      <div className="stage-select-row">
        <SelectInput
          label="Construction Type"
          options={constructionTypes.map((t) => ({ value: t.construction_type_id, label: t.construction_type_name }))}
          value={typeId}
          onChange={(e) => setTypeId(Number(e.target.value))}
        />
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>
          + Add Stage
        </PrimaryButton>
      </div>

      <div className="card card-pad">
        <div className="section-head" style={{ marginBottom: 16 }}>
          <div>
            <h3>
              {activeType?.icon} {activeType?.construction_type_name} Stage Sequence
            </h3>
            <p className="section-desc">{stages.length} stages configured for this construction type</p>
          </div>
        </div>

        {stages.length === 0 ? (
          <EmptyState title="No stages configured" description="Add the first stage for this construction type to get started." />
        ) : (
          <HorizontalTimeline stages={sortedStages} />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Construction Stage"
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>Add</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Stage Name" required full value={form.stage_name} onChange={(e) => setForm({ ...form, stage_name: e.target.value })} />
          <FormInput
            label="Estimated Duration (days)"
            value={form.estimated_duration_days}
            onChange={(e) => setForm({ ...form, estimated_duration_days: e.target.value })}
          />
          <FormInput label="Description" type="textarea" full value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}
