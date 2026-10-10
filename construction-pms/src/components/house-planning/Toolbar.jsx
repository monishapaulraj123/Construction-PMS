/**
 * Toolbar.jsx
 * House Planning Editor Toolbar matching PMS Design System (Forest Green / Warm Gold / Cream)
 */

import { useEffect } from 'react'
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Save,
  CheckCircle,
  Sparkles,
  Box,
  Eye,
  Grid,
  BarChart2,
  Layers,
} from 'lucide-react'
import { useHousePlanning } from '../../context/HousePlanningContext'
import { useToast } from '../ToastContext'

export default function Toolbar({ onBack, onOpenAiBuilder }) {
  const {
    building,
    undo,
    redo,
    isDirty,
    isSaving,
    undoStack,
    redoStack,
    viewMode,
    setViewMode,
    cameraMode,
    setCameraMode,
    runValidation,
    saveHousePlan,
  } = useHousePlanning()

  const showToast = useToast()

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const handleSave = async () => {
    try {
      await saveHousePlan()
      showToast('House plan saved successfully!')
    } catch (e) {
      showToast('Failed to save house plan', 'error')
    }
  }

  const handleValidate = async () => {
    const res = await runValidation()
    if (res.status === 'passed') {
      showToast('Structural and floor plan validation passed with 0 issues!')
    } else {
      showToast(`Validation found ${res.totalIssues} issue(s). Inspect Validation Panel below.`, 'warning')
    }
  }

  return (
    <div
      className="card card-pad"
      style={{
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--paper)',
        border: '1px solid var(--line-200)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 16,
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      {/* Left: Back button + Building name & status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        {onBack && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onBack}
            title="Back to Project Details"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {building?.metadata?.name || 'Untitled House Plan'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{building?.floors?.length || 1} Floors</span>
            <span>•</span>
            <span style={{ color: isSaving ? 'var(--amber-600)' : isDirty ? 'var(--red-500)' : 'var(--green-700)', fontWeight: 600 }}>
              {isSaving ? 'Saving…' : isDirty ? '● Unsaved changes' : '✓ Saved'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: 2D/3D Switcher + Camera Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* 2D / 3D Mode Toggle Group */}
        <div
          style={{
            display: 'flex',
            background: 'var(--cream-100)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--line-200)',
            gap: 2,
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${viewMode === '2d' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '5px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
            onClick={() => setViewMode('2d')}
          >
            <Layers size={15} /> 2D CAD Plan
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === '3d' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '5px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
            onClick={() => setViewMode('3d')}
          >
            <Box size={15} /> 3D View
          </button>
        </div>

        {/* Undo / Redo */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 10px', opacity: undoStack.length === 0 ? 0.4 : 1 }}
            disabled={undoStack.length === 0}
            onClick={undo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 10px', opacity: redoStack.length === 0 ? 0.4 : 1 }}
            disabled={redoStack.length === 0}
            onClick={redo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* 3D Camera Controls */}
        {viewMode === '3d' && (
          <div style={{ display: 'flex', background: 'var(--cream-100)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-200)', gap: 2 }}>
            <button
              type="button"
              className={`btn btn-sm ${cameraMode === 'orbit' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '4px 8px' }}
              onClick={() => setCameraMode('orbit')}
            >
              Orbit
            </button>
            <button
              type="button"
              className={`btn btn-sm ${cameraMode === 'topdown' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '4px 8px' }}
              onClick={() => setCameraMode('topdown')}
            >
              Top-Down
            </button>
            <button
              type="button"
              className={`btn btn-sm ${cameraMode === 'walkthrough' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '4px 8px' }}
              onClick={() => setCameraMode('walkthrough')}
            >
              Walkthrough
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions (AI Builder, Validate, Save) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onOpenAiBuilder && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onOpenAiBuilder}
            style={{ borderColor: 'var(--gold-600)', color: 'var(--forest-900)' }}
          >
            <Sparkles size={15} color="var(--gold-600)" /> AI Generator
          </button>
        )}
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleValidate}>
          <CheckCircle size={15} /> Validate
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
          <Save size={15} /> {isSaving ? 'Saving…' : 'Save Plan'}
        </button>
      </div>
    </div>
  )
}
