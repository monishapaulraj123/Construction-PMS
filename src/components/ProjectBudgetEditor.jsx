import { useState, useMemo } from 'react'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Sparkles,
  Calculator,
  Layers,
  Wrench,
  Users,
  PackageCheck,
} from 'lucide-react'
import { FormInput } from './FormInputs'
import { formatCurrencyINR } from '../utils/format'
import {
  SCOPE_CATEGORIES,
  SCOPE_TEMPLATES,
  createInitialCategoryData,
  calculateProjectBudget,
  calculateCategoryTotals,
} from '../utils/budgetCalculations'

export default function ProjectBudgetEditor({ initialEstimation, onChange, readOnly = false }) {
  const [estimationState, setEstimationState] = useState(() => {
    if (initialEstimation && initialEstimation.categories && initialEstimation.categories.length > 0) {
      return initialEstimation
    }
    const defaultCategoryIds = SCOPE_TEMPLATES.standard.categoryIds
    const cats = SCOPE_CATEGORIES.map((c) => {
      const catData = createInitialCategoryData(c.id)
      catData.selected = defaultCategoryIds.includes(c.id)
      if (['interior', 'exterior', 'finishing', 'other'].includes(c.id)) {
        catData.is_optional_addon = true
      }
      return catData
    })
    return calculateProjectBudget(cats, 'percentage', 5)
  })

  const [expandedCategoryId, setExpandedCategoryId] = useState('structural')

  const budget = useMemo(() => {
    return calculateProjectBudget(
      estimationState.categories,
      estimationState.contingencyType,
      estimationState.contingencyValue
    )
  }, [estimationState])

  function updateStateAndNotify(newCategories, contingencyType, contingencyValue) {
    const type = contingencyType !== undefined ? contingencyType : estimationState.contingencyType
    const val = contingencyValue !== undefined ? contingencyValue : estimationState.contingencyValue
    const updatedBudget = calculateProjectBudget(newCategories, type, val)
    setEstimationState(updatedBudget)
    if (onChange) {
      onChange(updatedBudget)
    }
  }

  function handleApplyTemplate(templateKey) {
    if (readOnly) return
    const template = SCOPE_TEMPLATES[templateKey]
    if (!template) return

    const newCategories = estimationState.categories.map((cat) => ({
      ...cat,
      selected: template.categoryIds.includes(cat.id),
    }))
    updateStateAndNotify(newCategories)
  }

  function toggleCategorySelected(catId) {
    if (readOnly) return
    const newCategories = estimationState.categories.map((cat) =>
      cat.id === catId ? { ...cat, selected: !cat.selected } : cat
    )
    updateStateAndNotify(newCategories)
  }

  function toggleOptionalAddon(catId) {
    if (readOnly) return
    const newCategories = estimationState.categories.map((cat) =>
      cat.id === catId ? { ...cat, is_optional_addon: !cat.is_optional_addon } : cat
    )
    updateStateAndNotify(newCategories)
  }

  function updateCategory(catId, updater) {
    if (readOnly) return
    const newCategories = estimationState.categories.map((cat) => {
      if (cat.id !== catId) return cat
      const updated = updater(cat)
      return calculateCategoryTotals(updated)
    })
    updateStateAndNotify(newCategories)
  }

  function addMaterialRow(catId) {
    updateCategory(catId, (cat) => ({
      ...cat,
      materials: [
        ...(cat.materials || []),
        { name: 'New Material Item', quantity: 100, unit: 'sq.ft', rate: 50 },
      ],
    }))
  }

  function updateMaterialRow(catId, idx, field, value) {
    updateCategory(catId, (cat) => {
      const mats = [...(cat.materials || [])]
      mats[idx] = { ...mats[idx], [field]: field === 'name' || field === 'unit' ? value : parseFloat(value) || 0 }
      return { ...cat, materials: mats }
    })
  }

  function removeMaterialRow(catId, idx) {
    updateCategory(catId, (cat) => {
      const mats = (cat.materials || []).filter((_, i) => i !== idx)
      return { ...cat, materials: mats }
    })
  }

  function addLabourRow(catId) {
    updateCategory(catId, (cat) => ({
      ...cat,
      labour: [
        ...(cat.labour || []),
        { worker_type: 'Skilled Labour', no_of_workers: 2, days: 10, daily_rate: 800 },
      ],
    }))
  }

  function updateLabourRow(catId, idx, field, value) {
    updateCategory(catId, (cat) => {
      const labs = [...(cat.labour || [])]
      labs[idx] = {
        ...labs[idx],
        [field]: field === 'worker_type' ? value : parseFloat(value) || 0,
      }
      return { ...cat, labour: labs }
    })
  }

  function removeLabourRow(catId, idx) {
    updateCategory(catId, (cat) => {
      const labs = (cat.labour || []).filter((_, i) => i !== idx)
      return { ...cat, labour: labs }
    })
  }

  return (
    <div className="stack-24">
      {/* 1. Scope Level Presets */}
      <div>
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color="var(--gold-600)" /> Quick Construction Scope Presets
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: 0 }}>
            Click a scope preset to quickly select default construction categories.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {Object.entries(SCOPE_TEMPLATES).map(([key, template]) => {
            const isApplied = template.categoryIds.every((id) =>
              budget.categories.find((c) => c.id === id)?.selected
            )
            return (
              <button
                key={key}
                type="button"
                disabled={readOnly}
                onClick={() => handleApplyTemplate(key)}
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-md)',
                  border: isApplied ? '2px solid var(--forest-900)' : '1px solid var(--line-200)',
                  background: isApplied ? 'var(--gold-050)' : '#fff',
                  cursor: readOnly ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isApplied ? 'var(--shadow-card)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink-900)' }}>
                    {template.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: 'var(--forest-900)', color: 'var(--gold-400)', fontWeight: 700 }}>
                    {template.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', lineHeight: 1.4 }}>
                  {template.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Category Scope Selection Grid */}
      <div>
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={16} color="var(--forest-900)" /> Select Required Scope Categories ({budget.categories.filter((c) => c.selected).length} / {budget.categories.length} Selected)
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: 0 }}>
            Check the categories required for this project.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {budget.categories.map((cat) => {
            const def = SCOPE_CATEGORIES.find((c) => c.id === cat.id) || {}
            return (
              <div
                key={cat.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: cat.selected ? '1.5px solid var(--forest-900)' : '1px solid var(--line-100)',
                  background: cat.selected ? 'var(--cream-050)' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: readOnly ? 'default' : 'pointer', flex: 1 }}
                  onClick={() => toggleCategorySelected(cat.id)}
                >
                  {cat.selected ? (
                    <CheckSquare size={18} color="var(--forest-900)" />
                  ) : (
                    <Square size={18} color="var(--ink-300)" />
                  )}
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: cat.selected ? 700 : 500, color: cat.selected ? 'var(--ink-900)' : 'var(--ink-500)' }}>
                      {def.icon || '📌'} {cat.name}
                    </div>
                    {cat.is_optional_addon && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--gold-600)', fontWeight: 600 }}>
                        + Optional Client Add-on
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {cat.selected && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                      {formatCurrencyINR(cat.category_total)}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setExpandedCategoryId(expandedCategoryId === cat.id ? null : cat.id)}
                    style={{ width: 28, height: 28, padding: 0 }}
                  >
                    {expandedCategoryId === cat.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Detailed Cost Breakdown Accordion */}
      <div>
        <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wrench size={16} color="var(--forest-900)" /> Itemized Category Cost Breakdown & Annexure
        </h4>

        <div className="stack-14">
          {budget.categories.filter((c) => c.selected).map((cat) => {
            const isExpanded = expandedCategoryId === cat.id
            const def = SCOPE_CATEGORIES.find((c) => c.id === cat.id) || {}

            return (
              <div
                key={cat.id}
                style={{
                  border: '1px solid var(--line-200)',
                  borderRadius: 'var(--radius-md)',
                  background: '#fff',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--cream-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>{def.icon || '📌'}</span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                        {cat.name}
                        {cat.is_optional_addon && (
                          <span style={{ marginLeft: 8, fontSize: '0.72rem', background: 'var(--gold-100)', color: 'var(--gold-600)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            Optional Add-on
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)', textTransform: 'uppercase' }}>Category Total</span>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                        {formatCurrencyINR(cat.category_total)}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Details */}
                {isExpanded && (
                  <div style={{ padding: 16 }} className="stack-16">
                    {/* Optional Add-on toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sand-100)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 8, cursor: readOnly ? 'default' : 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={cat.is_optional_addon || false}
                          disabled={readOnly}
                          onChange={() => toggleOptionalAddon(cat.id)}
                        />
                        Treat as Optional Client Add-on (Calculates separately from Base Construction)
                      </label>
                    </div>

                    {/* Material Table */}
                    <div style={{ border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h5 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--forest-900)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                          <PackageCheck size={16} /> Material Cost ({formatCurrencyINR(cat.material_cost)})
                        </h5>
                        {!readOnly && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                            onClick={() => addMaterialRow(cat.id)}
                          >
                            <Plus size={12} /> Add Material Item
                          </button>
                        )}
                      </div>

                      {cat.materials && cat.materials.length > 0 ? (
                        <div className="table-responsive">
                          <table className="data-table" style={{ fontSize: '0.82rem' }}>
                            <thead>
                              <tr>
                                <th style={{ width: '35%' }}>Material Name</th>
                                <th style={{ width: '15%' }}>Quantity</th>
                                <th style={{ width: '15%' }}>Unit</th>
                                <th style={{ width: '15%' }}>Rate (₹)</th>
                                <th style={{ width: '20%' }}>Amount (₹)</th>
                                {!readOnly && <th style={{ width: 30 }}></th>}
                              </tr>
                            </thead>
                            <tbody>
                              {cat.materials.map((mat, idx) => (
                                <tr key={idx}>
                                  <td>
                                    {readOnly ? (
                                      mat.name
                                    ) : (
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                        value={mat.name}
                                        onChange={(e) => updateMaterialRow(cat.id, idx, 'name', e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    {readOnly ? (
                                      mat.quantity
                                    ) : (
                                      <input
                                        type="number"
                                        className="form-input"
                                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                        value={mat.quantity}
                                        onChange={(e) => updateMaterialRow(cat.id, idx, 'quantity', e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    {readOnly ? (
                                      mat.unit
                                    ) : (
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                        value={mat.unit}
                                        onChange={(e) => updateMaterialRow(cat.id, idx, 'unit', e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    {readOnly ? (
                                      mat.rate
                                    ) : (
                                      <input
                                        type="number"
                                        className="form-input"
                                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                        value={mat.rate}
                                        onChange={(e) => updateMaterialRow(cat.id, idx, 'rate', e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td style={{ fontWeight: 700, color: 'var(--forest-900)' }}>
                                    {formatCurrencyINR((Number(mat.quantity) || 0) * (Number(mat.rate) || 0))}
                                  </td>
                                  {!readOnly && (
                                    <td>
                                      <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => removeMaterialRow(cat.id, idx)}
                                        style={{ color: 'var(--red-600)', width: 24, height: 24, padding: 0 }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <FormInput
                          label="Direct Material Cost (₹)"
                          type="number"
                          value={cat.material_cost || 0}
                          disabled={readOnly}
                          onChange={(e) =>
                            updateCategory(cat.id, (c) => ({ ...c, material_cost: parseFloat(e.target.value) || 0 }))
                          }
                        />
                      )}
                    </div>

                    {/* Labour Table */}
                    <div style={{ border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h5 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--forest-900)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                          <Users size={16} /> Labour Cost ({formatCurrencyINR(cat.labour_cost)})
                        </h5>
                        {!readOnly && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                            onClick={() => addLabourRow(cat.id)}
                          >
                            <Plus size={12} /> Add Labour Item
                          </button>
                        )}
                      </div>

                      {cat.labour && cat.labour.length > 0 ? (
                        <div className="table-responsive">
                          <table className="data-table" style={{ fontSize: '0.82rem' }}>
                            <thead>
                              <tr>
                                <th style={{ width: '35%' }}>Worker Type</th>
                                <th style={{ width: '15%' }}>No. of Workers</th>
                                <th style={{ width: '15%' }}>Est. Days</th>
                                <th style={{ width: '15%' }}>Daily Rate (₹)</th>
                                <th style={{ width: '20%' }}>Amount (₹)</th>
                                {!readOnly && <th style={{ width: 30 }}></th>}
                              </tr>
                            </thead>
                            <tbody>
                              {cat.labour.map((lab, idx) => (
                                <tr key={idx}>
                                  <td>
                                    {readOnly ? (
                                      lab.worker_type
                                    ) : (
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                        value={lab.worker_type}
                                        onChange={(e) => updateLabourRow(cat.id, idx, 'worker_type', e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    {readOnly ? (
                                      lab.no_of_workers
                                    ) : (
                                      <input
                                        type="number"
                                        className="form-input"
                                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                        value={lab.no_of_workers}
                                        onChange={(e) => updateLabourRow(cat.id, idx, 'no_of_workers', e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    {readOnly ? (
                                      lab.days
                                    ) : (
                                      <input
                                        type="number"
                                        className="form-input"
                                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                        value={lab.days}
                                        onChange={(e) => updateLabourRow(cat.id, idx, 'days', e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    {readOnly ? (
                                      lab.daily_rate
                                    ) : (
                                      <input
                                        type="number"
                                        className="form-input"
                                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                        value={lab.daily_rate}
                                        onChange={(e) => updateLabourRow(cat.id, idx, 'daily_rate', e.target.value)}
                                      />
                                    )}
                                  </td>
                                  <td style={{ fontWeight: 700, color: 'var(--forest-900)' }}>
                                    {formatCurrencyINR(
                                      (Number(lab.no_of_workers) || 0) *
                                        (Number(lab.days) || 0) *
                                        (Number(lab.daily_rate) || 0)
                                    )}
                                  </td>
                                  {!readOnly && (
                                    <td>
                                      <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => removeLabourRow(cat.id, idx)}
                                        style={{ color: 'var(--red-600)', width: 24, height: 24, padding: 0 }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <FormInput
                          label="Direct Labour Cost (₹)"
                          type="number"
                          value={cat.labour_cost || 0}
                          disabled={readOnly}
                          onChange={(e) =>
                            updateCategory(cat.id, (c) => ({ ...c, labour_cost: parseFloat(e.target.value) || 0 }))
                          }
                        />
                      )}
                    </div>

                    {/* Service & Other Costs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <FormInput
                        label="Service Module Cost (₹)"
                        type="number"
                        value={cat.service_cost || 0}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateCategory(cat.id, (c) => ({ ...c, service_cost: parseFloat(e.target.value) || 0 }))
                        }
                      />
                      <FormInput
                        label="Misc / Other Cost (₹)"
                        type="number"
                        value={cat.other_cost || 0}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateCategory(cat.id, (c) => ({ ...c, other_cost: parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Contingency & Itemized Summary */}
      <div style={{ background: 'var(--cream-050)', border: '1px solid var(--line-200)', borderRadius: 'var(--radius-md)', padding: 16 }}>
        <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calculator size={16} color="var(--gold-600)" /> Contingency Reserve & Itemized Budget Summary
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--ink-500)', fontWeight: 600 }}>Contingency Mode</label>
            <select
              className="filter-select"
              style={{ width: '100%', marginTop: 4 }}
              value={budget.contingencyType}
              disabled={readOnly}
              onChange={(e) => updateStateAndNotify(budget.categories, e.target.value, budget.contingencyValue)}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--ink-500)', fontWeight: 600 }}>
              {budget.contingencyType === 'percentage' ? 'Contingency Rate (%)' : 'Reserve Amount (₹)'}
            </label>
            <input
              type="number"
              className="form-input"
              style={{ marginTop: 4 }}
              value={budget.contingencyValue}
              disabled={readOnly}
              onChange={(e) => updateStateAndNotify(budget.categories, budget.contingencyType, parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--ink-500)' }}>Calculated Reserve</span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--amber-600)' }}>{formatCurrencyINR(budget.contingencyAmount)}</strong>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="table-responsive">
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Category</th>
                <th style={{ width: '15%' }}>Type</th>
                <th style={{ width: '13%' }}>Material</th>
                <th style={{ width: '13%' }}>Labour</th>
                <th style={{ width: '14%' }}>Service / Misc</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {budget.categories
                .filter((c) => c.selected)
                .map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: cat.is_optional_addon ? 'var(--gold-100)' : 'var(--cream-100)', color: cat.is_optional_addon ? 'var(--gold-600)' : 'var(--forest-900)' }}>
                        {cat.is_optional_addon ? 'Optional Add-on' : 'Base Scope'}
                      </span>
                    </td>
                    <td>{formatCurrencyINR(cat.material_cost)}</td>
                    <td>{formatCurrencyINR(cat.labour_cost)}</td>
                    <td>{formatCurrencyINR((cat.service_cost || 0) + (cat.other_cost || 0))}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--forest-900)' }}>
                      {formatCurrencyINR(cat.category_total)}
                    </td>
                  </tr>
                ))}
              <tr style={{ background: '#fff', fontWeight: 700 }}>
                <td colSpan={2}>SUBTOTAL (SELECTED SCOPE)</td>
                <td>{formatCurrencyINR(budget.totalMaterial)}</td>
                <td>{formatCurrencyINR(budget.totalLabour)}</td>
                <td>{formatCurrencyINR((budget.totalService || 0) + (budget.totalOther || 0))}</td>
                <td style={{ textAlign: 'right', color: 'var(--forest-900)', fontSize: '0.98rem' }}>{formatCurrencyINR(budget.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={5} style={{ fontWeight: 600 }}>Contingency Reserve</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--amber-600)' }}>{formatCurrencyINR(budget.contingencyAmount)}</td>
              </tr>
              {/* TOTAL ESTIMATED BUDGET ROW WITH FORCED WARM GOLD TEXT */}
              <tr className="total-budget-row" style={{ background: 'var(--forest-900)' }}>
                <td colSpan={5} style={{ color: 'var(--gold-500)', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.8px', padding: '16px 18px' }}>
                  TOTAL ESTIMATED BUDGET
                </td>
                <td style={{ textAlign: 'right', color: 'var(--gold-500)', fontWeight: 900, fontSize: '1.2rem', padding: '16px 18px' }}>
                  {formatCurrencyINR(budget.totalEstimatedBudget)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
