/**
 * HousePlanningEditor.jsx
 * Main Architectural Editor Shell combining 2D CAD canvas, 3D R3F viewport, sidebars, properties inspector, and toolbar.
 * Beautifully balanced 3-column workspace without panel clipping or horizontal scrolling.
 */

import { useState } from 'react'
import Toolbar from './Toolbar'
import FloorPanel from './FloorPanel'
import LayerTree from './LayerTree'
import DrawingModeCanvas from './DrawingModeCanvas'
import SceneCanvas from './SceneCanvas'
import PropertiesPanel from './PropertiesPanel'
import ValidationPanel from './ValidationPanel'
import AIHouseBuilderModal from './AIHouseBuilderModal'
import { useHousePlanning } from '../../context/HousePlanningContext'

export default function HousePlanningEditor({ onBack }) {
  const { viewMode, setViewMode, building } = useHousePlanning()
  const [aiModalOpen, setAiModalOpen] = useState(false)

  if (!building) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-500)' }}>
        Loading House Planning Engine…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 640, overflow: 'hidden' }}>
      {/* Top Architectural Toolbar */}
      <Toolbar onBack={onBack} onOpenAiBuilder={() => setAiModalOpen(true)} />

      {/* Main Workspace 3-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr 310px',
          flex: 1,
          gap: 12,
          minHeight: 0,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Left Panel: Floors & Layers */}
        <div
          className="card card-pad"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
            background: 'var(--paper)',
            border: '1px solid var(--line-200)',
            padding: '14px',
            maxHeight: '100%',
            boxSizing: 'border-box',
          }}
        >
          <FloorPanel />
          <div style={{ borderTop: '1px solid var(--line-100)', paddingTop: 14 }}>
            <LayerTree />
          </div>
        </div>

        {/* Center: CAD Drawing Canvas / 3D Viewport */}
        <div
          className="card"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--paper)',
            border: '1px solid var(--line-200)',
            minWidth: 0,
          }}
        >
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            {viewMode === '2d' ? (
              <DrawingModeCanvas onSwitchTo3D={() => setViewMode('3d')} />
            ) : (
              <SceneCanvas />
            )}
          </div>

          {/* Validation Drawer Overlay */}
          <div style={{ position: 'relative', zIndex: 20 }}>
            <ValidationPanel />
          </div>
        </div>

        {/* Right Inspector Panel: Edit Room & Object Properties */}
        <div
          className="card card-pad"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            background: 'var(--paper)',
            border: '1px solid var(--line-200)',
            padding: '16px',
            maxHeight: '100%',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          <PropertiesPanel />
        </div>
      </div>

      {/* AI Builder Modal */}
      <AIHouseBuilderModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  )
}
