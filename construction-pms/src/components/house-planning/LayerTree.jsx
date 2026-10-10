/**
 * LayerTree.jsx
 * Layer visibility panel styled for PMS
 */

import { Eye, EyeOff, Layers } from 'lucide-react'
import { useHousePlanning } from '../../context/HousePlanningContext'

export default function LayerTree() {
  const { layerVisibility, toggleLayer } = useHousePlanning()

  const layers = [
    { id: 'walls', label: 'Walls' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'roof', label: 'Roof' },
    { id: 'windows', label: 'Windows & Openings' },
    { id: 'doors', label: 'Doors' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest-900)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Layers size={16} /> CAD Layers
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {layers.map((layer) => {
          const isVisible = layerVisibility[layer.id] !== false
          return (
            <div
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line-100)',
                background: isVisible ? 'var(--paper)' : 'var(--cream-100)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: isVisible ? 'var(--ink-900)' : 'var(--ink-500)' }}>
                {layer.label}
              </span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: isVisible ? 'var(--forest-900)' : 'var(--ink-300)', cursor: 'pointer', padding: 0 }}
              >
                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
