/**
 * AIHouseBuilderModal.jsx
 * AI House Generator Modal wizard matching PMS Modal component aesthetics
 */

import { useState } from 'react'
import { Sparkles, CheckCircle2, ArrowRight, Home, Building, Layers } from 'lucide-react'
import Modal from '../Modal'
import { PrimaryButton, SecondaryButton } from '../Buttons'
import { FormInput, SelectInput } from '../FormInputs'
import { useHousePlanning } from '../../context/HousePlanningContext'
import { TEMPLATES } from '../../data/housePlanTemplates'
import { useToast } from '../ToastContext'

export default function AIHouseBuilderModal({ open, onClose }) {
  const { setBuilding, loadTemplate } = useHousePlanning()
  const showToast = useToast()

  const [prompt, setPrompt] = useState('2 BHK Modern Villa with 2 Bedrooms, Kitchen, Dining, and Terrace')
  const [templateKey, setTemplateKey] = useState('house_2bhk')
  const [floorsCount, setFloorsCount] = useState(1)
  const [bedroomsCount, setBedroomsCount] = useState(2)
  const [generating, setGenerating] = useState(false)

  if (!open) return null

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      if (templateKey === 'house_3bhk_2floor') {
        loadTemplate('house_3bhk_2floor')
      } else {
        loadTemplate('house_2bhk')
      }
      setGenerating(false)
      onClose()
      showToast('AI House Plan generated and loaded into 2D CAD / 3D Visualizer!')
    }, 600)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI House Builder & Architectural Generator"
      wide
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton icon={Sparkles} onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating Plan…' : 'Generate & Load House Plan'}
          </PrimaryButton>
        </>
      }
    >
      <div className="form-grid stack-16">
        <div style={{ background: 'var(--cream-050)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--line-200)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--forest-950)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={18} color="var(--gold-600)" /> Natural Language Architectural Prompt
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: 0 }}>
            Describe your building layout requirements and room specifications.
          </p>
        </div>

        <FormInput
          label="Building Requirements Prompt"
          type="textarea"
          full
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <SelectInput
          label="Base Architectural Template"
          options={[
            { label: '2 BHK Modern Villa Plan (1 Floor)', value: 'house_2bhk' },
            { label: '3 BHK Duplex Villa Plan (2 Floors)', value: 'house_3bhk_2floor' },
          ]}
          value={templateKey}
          onChange={(e) => setTemplateKey(e.target.value)}
        />

        <FormInput
          label="Number of Floors"
          type="number"
          min="1"
          max="5"
          value={floorsCount}
          onChange={(e) => setFloorsCount(parseInt(e.target.value) || 1)}
        />

        <FormInput
          label="Target Bedrooms Count"
          type="number"
          min="1"
          max="8"
          value={bedroomsCount}
          onChange={(e) => setBedroomsCount(parseInt(e.target.value) || 2)}
        />
      </div>
    </Modal>
  )
}
