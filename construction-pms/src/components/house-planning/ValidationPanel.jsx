/**
 * ValidationPanel.jsx
 * Structural and floor plan validation output drawer styled for PMS
 */

import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react'
import { useHousePlanning } from '../../context/HousePlanningContext'

export default function ValidationPanel() {
  const { validationResult, setValidationResult } = useHousePlanning()

  if (!validationResult) return null

  const isPassed = validationResult.status === 'passed'
  const issues = validationResult.issues || []

  return (
    <div
      className="card card-pad"
      style={{
        background: isPassed ? 'var(--cream-050)' : '#fef2f2',
        border: `1px solid ${isPassed ? 'var(--forest-600)' : 'var(--red-500)'}`,
        boxShadow: 'var(--shadow-pop)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        margin: '0 16px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isPassed ? (
            <CheckCircle2 size={20} color="var(--green-700)" />
          ) : (
            <AlertTriangle size={20} color="var(--red-600)" />
          )}
          <strong style={{ fontSize: '0.95rem', color: isPassed ? 'var(--forest-950)' : '#991b1b' }}>
            {isPassed ? 'Structural Validation Passed' : `Validation Found ${validationResult.totalIssues} Issue(s)`}
          </strong>
        </div>

        <button
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--ink-500)', cursor: 'pointer', padding: 2 }}
          onClick={() => setValidationResult(null)}
        >
          <X size={16} />
        </button>
      </div>

      {isPassed ? (
        <p style={{ fontSize: '0.82rem', color: 'var(--forest-900)', margin: 0 }}>
          Building floor plan meets structural containment, room geometry, door reachability, and staircase clearance checks.
        </p>
      ) : (
        <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: '0.83rem', color: '#7f1d1d', lineHeight: 1.6 }}>
          {issues.map((iss, i) => (
            <li key={i}>{typeof iss === 'string' ? iss : iss.message || String(iss)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
