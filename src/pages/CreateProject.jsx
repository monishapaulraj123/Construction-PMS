import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  Calculator,
  Printer,
  Sparkles,
  Layers,
  DollarSign,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react'
import Breadcrumb from '../components/Breadcrumb'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import ProjectBudgetEditor from '../components/ProjectBudgetEditor'
import {
  constructionTypes,
  projectTypes,
  employees,
  clients,
  constructionStages,
} from '../data/mockData'
import { getDefaultProjectEstimation } from '../utils/budgetCalculations'
import { generateBudgetPDFReport } from '../utils/pdfReportGenerator'
import { formatCurrencyINR } from '../utils/format'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastContext'

const supervisors = employees.filter(
  (e) => e.employee_type_name === 'Site Supervisor' || e.employee_type_name === 'Civil Engineer'
)
const defaultStagesList = (constructionStages[1] || []).map((s) => s.stage_name)

export default function CreateProject() {
  const navigate = useNavigate()
  const { addProject } = useApp()
  const showToast = useToast()

  const [budgetEstimation, setBudgetEstimation] = useState(() =>
    getDefaultProjectEstimation('standard')
  )

  const [form, setForm] = useState({
    project_name: 'Sunset Hill Residential Villa',
    construction_type_name: constructionTypes[0]?.construction_type_name || 'Residential',
    project_type_name: projectTypes[0]?.project_type_name || 'Independent Villa',
    client_name: clients[0]?.client_name || 'Ravi',
    builtup_area: 2400,
    no_of_floors: 2,
    site_address: 'Plot 42, ECR Main Road, Kottivakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600041',
    start_date: new Date().toISOString().split('T')[0],
    expected_end_date: '2026-11-30',
    employee_name: supervisors[0] ? `${supervisors[0].first_name} ${supervisors[0].last_name}`.trim() : 'Arun',
    construction_stage_name: defaultStagesList[0] || 'Structural Work',
    project_description: 'Turnkey luxury residential villa construction with itemized scope, material, labour and contingency planning.',
    project_status: 'Planning',
    status: true,
  })

  function handleBudgetChange(updatedEstimation) {
    setBudgetEstimation(updatedEstimation)
    setForm((prev) => ({
      ...prev,
      estimated_budget: updatedEstimation.totalEstimatedBudget,
    }))
  }

  function handleGeneratePDF() {
    if (!form.project_name) {
      showToast('Please enter a project name first.')
      return
    }
    generateBudgetPDFReport(form, budgetEstimation)
    showToast('PDF Budget Report generated successfully')
  }

  function handleSaveProject(e) {
    if (e) e.preventDefault()
    if (!form.project_name) {
      showToast('Project Name is required!')
      return
    }

    const constType = constructionTypes.find((c) => c.construction_type_name === form.construction_type_name)
    const projType = projectTypes.find((pt) => pt.project_type_name === form.project_type_name)
    const client = clients.find((cl) => cl.client_name === form.client_name)
    const sup = employees.find((s) => `${s.first_name} ${s.last_name}` === form.employee_name)

    const created = addProject({
      ...form,
      construction_type_id: constType?.construction_type_id || 1,
      project_type_id: projType?.project_type_id || 1,
      client_id: client?.client_id || 1,
      employee_id: sup?.employee_id || 1,
      supervisor_name: form.employee_name || 'Arun',
      estimated_budget: budgetEstimation.totalEstimatedBudget,
      budget_estimation: budgetEstimation,
    })

    showToast('Project & Cost Estimation created successfully!')
    navigate(`/projects/${created.project_id}`)
  }

  return (
    <div className="animate-fade-slide stack-24" style={{ paddingBottom: 60, maxWidth: 1200, margin: '0 auto' }}>
      {/* Navigation Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Breadcrumb items={[{ label: 'Projects', to: '/projects' }, { label: 'Create New Project' }]} />
        <SecondaryButton icon={ArrowLeft} onClick={() => navigate('/projects')}>
          Cancel & Return to Projects
        </SecondaryButton>
      </div>

      {/* Hero Banner Header */}
      <div
        className="card card-pad dark-green-banner"
        style={{
          background: 'linear-gradient(135deg, var(--forest-950) 0%, var(--forest-900) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gold-500)',
          boxShadow: 'var(--shadow-pop)',
          padding: '28px 32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212, 176, 106, 0.2)', color: 'var(--gold-400)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, marginBottom: 10 }}>
              <Sparkles size={14} /> Official Construction PMS Project Setup
            </div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--gold-500)', fontWeight: 800, margin: '4px 0 8px', letterSpacing: '-0.5px' }}>
              Create Project & Cost Estimation Plan
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, maxWidth: '68ch', lineHeight: 1.6 }}>
              Define project specifications, site address, timeline, select construction scope categories, and configure itemized material & labour estimates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <SecondaryButton
              type="button"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
              icon={Printer}
              onClick={handleGeneratePDF}
            >
              Generate PDF Report
            </SecondaryButton>

            <PrimaryButton type="button" icon={CheckCircle2} onClick={handleSaveProject}>
              Save & Launch Project
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="card card-pad" style={{ background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--cream-050)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-200)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--forest-900)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>1</div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink-900)' }}>Specifications</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--ink-500)' }}>Project & Client</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--cream-050)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-200)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--forest-900)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>2</div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink-900)' }}>Site Location</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--ink-500)' }}>Address & City</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--cream-050)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-200)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--forest-900)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>3</div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink-900)' }}>Schedule</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--ink-500)' }}>Dates & Manager</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--gold-050)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold-400)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>4</div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--ink-900)' }}>Cost Estimation</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--gold-600)', fontWeight: 600 }}>Scope & Budget</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Cards Stack */}
      <form onSubmit={handleSaveProject} className="stack-24">
        {/* Card 1: Project Information */}
        <div className="card card-pad">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-950)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color="var(--forest-900)" /> 1. Project Specifications & Client Details
          </h3>

          <div className="form-grid">
            <FormInput
              label="Project Name"
              required
              full
              placeholder="e.g. Green Valley Residence"
              value={form.project_name || ''}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
            />

            <SelectInput
              label="Construction Type"
              required
              options={constructionTypes.map((t) => t.construction_type_name)}
              value={form.construction_type_name || ''}
              onChange={(e) => setForm({ ...form, construction_type_name: e.target.value })}
            />

            <SelectInput
              label="Project Type"
              required
              options={projectTypes.map((pt) => pt.project_type_name)}
              value={form.project_type_name || ''}
              onChange={(e) => setForm({ ...form, project_type_name: e.target.value })}
            />

            <SelectInput
              label="Client Name"
              required
              options={clients.map((c) => c.client_name)}
              value={form.client_name || ''}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            />

            <FormInput
              label="Built-up Area / Project Area (sq.ft)"
              type="number"
              value={form.builtup_area || ''}
              onChange={(e) => setForm({ ...form, builtup_area: parseFloat(e.target.value) || 0 })}
            />

            <FormInput
              label="Number of Floors"
              type="number"
              value={form.no_of_floors || ''}
              onChange={(e) => setForm({ ...form, no_of_floors: parseInt(e.target.value) || 1 })}
            />

            <FormInput
              label="Project Description & Overview Scope"
              type="textarea"
              full
              value={form.project_description || ''}
              onChange={(e) => setForm({ ...form, project_description: e.target.value })}
            />
          </div>
        </div>

        {/* Card 2: Site Location */}
        <div className="card card-pad">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-950)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="var(--forest-900)" /> 2. Site Address & Location
          </h3>

          <div className="form-grid">
            <FormInput
              label="Site Address"
              full
              value={form.site_address || ''}
              onChange={(e) => setForm({ ...form, site_address: e.target.value })}
            />
            <FormInput label="City" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <FormInput label="State" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <FormInput label="Pincode" value={form.pincode || ''} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
        </div>

        {/* Card 3: Planning & Schedule */}
        <div className="card card-pad">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-950)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color="var(--forest-900)" /> 3. Schedule & Site Management
          </h3>

          <div className="form-grid">
            <SelectInput
              label="Initial Construction Stage"
              options={defaultStagesList}
              value={form.construction_stage_name || ''}
              onChange={(e) => setForm({ ...form, construction_stage_name: e.target.value })}
            />

            <SelectInput
              label="Assigned Lead Engineer / Manager"
              options={employees.map((e) => e.first_name + (e.last_name ? ' ' + e.last_name : ''))}
              value={form.employee_name || ''}
              onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
            />

            <DateInput label="Start Date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <DateInput label="Expected End Date" value={form.expected_end_date || ''} onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })} />
          </div>
        </div>

        {/* Card 4: Project Cost Estimation & Construction Scope */}
        <div className="card card-pad">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-950)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={20} color="var(--forest-900)" /> 4. Project Cost Estimation & Construction Scope
          </h3>

          <ProjectBudgetEditor
            initialEstimation={budgetEstimation}
            onChange={handleBudgetChange}
          />
        </div>

        {/* Card 5: TOTAL ESTIMATED BUDGET BANNER (FOREST GREEN & WARM GOLD) */}
        <div
          className="card card-pad dark-green-banner"
          style={{
            background: 'var(--forest-950)',
            border: '2px solid var(--gold-500)',
            boxShadow: 'var(--shadow-pop)',
            padding: '24px 30px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold-500)', fontWeight: 800 }}>
                TOTAL ESTIMATED BUDGET
              </div>
              <div style={{ fontSize: '2.3rem', fontWeight: 900, color: 'var(--gold-500)', marginTop: 4 }}>
                {formatCurrencyINR(budgetEstimation.totalEstimatedBudget)}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: 4 }}>
                Base Scope ({formatCurrencyINR(budgetEstimation.baseScopeTotal)}) + Add-ons ({formatCurrencyINR(budgetEstimation.optionalAddonsTotal)}) + Reserve ({formatCurrencyINR(budgetEstimation.contingencyAmount)})
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <SecondaryButton
                type="button"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                icon={Printer}
                onClick={handleGeneratePDF}
              >
                Generate PDF Report
              </SecondaryButton>

              <PrimaryButton type="submit" icon={CheckCircle2}>
                Save & Launch Project
              </PrimaryButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
