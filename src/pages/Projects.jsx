import { useMemo, useState } from 'react'
import { Plus, Download } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import ProjectCard from '../components/ProjectCard'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import {
  projects as initialProjects,
  constructionTypes,
  projectTypes,
  employees,
  clients,
  constructionStages,
} from '../data/mockData'
import { useToast } from '../components/ToastContext'

const supervisors = employees.filter((e) => e.employee_type_name === 'Site Supervisor' || e.employee_type_name === 'Civil Engineer')
const defaultStagesList = (constructionStages[1] || []).map((s) => s.stage_name)

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState('')
  const [constructionTypeFilter, setConstructionTypeFilter] = useState('')
  const [projectTypeFilter, setProjectTypeFilter] = useState('')
  const [supervisorFilter, setSupervisorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({})
  const showToast = useToast()

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!search ||
            p.project_name.toLowerCase().includes(search.toLowerCase()) ||
            p.project_code.toLowerCase().includes(search.toLowerCase()) ||
            (p.city || '').toLowerCase().includes(search.toLowerCase())) &&
          (!constructionTypeFilter || p.construction_type_name === constructionTypeFilter) &&
          (!projectTypeFilter || p.project_type_name === projectTypeFilter) &&
          (!supervisorFilter || p.supervisor_name === supervisorFilter) &&
          (!statusFilter || p.project_status === statusFilter)
      ),
    [projects, search, constructionTypeFilter, projectTypeFilter, supervisorFilter, statusFilter]
  )

  function handleSave(e) {
    e.preventDefault()
    const newId = Math.max(0, ...projects.map((p) => p.project_id)) + 1
    const constType = constructionTypes.find((c) => c.construction_type_name === form.construction_type_name)
    const projType = projectTypes.find((pt) => pt.project_type_name === form.project_type_name)
    const client = clients.find((cl) => cl.client_name === form.client_name)
    const sup = employees.find((s) => `${s.first_name} ${s.last_name}` === form.employee_name)

    setProjects((ps) => [
      {
        ...form,
        project_id: newId,
        project_code: `PRJ-2026-${String(newId).padStart(3, '0')}`,
        construction_type_id: constType?.construction_type_id || 1,
        project_type_id: projType?.project_type_id || 1,
        client_id: client?.client_id || 1,
        employee_id: sup?.employee_id || 1,
        supervisor_name: form.employee_name || 'Arun Kumar',
        overall_progress_percentage: 0,
        project_status: form.project_status || 'In Progress',
        status: form.status !== false,
        image: 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=800&auto=format&fit=crop',
      },
      ...ps,
    ])
    setModalOpen(false)
    showToast('Project created successfully')
  }

  return (
    <div>
      <div className="page-header">
        <div />
        <div className="page-header-actions">
          <SecondaryButton icon={Download}>Export</SecondaryButton>
          <PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>
            Create Project
          </PrimaryButton>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar placeholder="Search projects by name, code or city..." value={search} onChange={setSearch} />
        <select className="filter-select" value={constructionTypeFilter} onChange={(e) => setConstructionTypeFilter(e.target.value)}>
          <option value="">All Construction Types</option>
          {constructionTypes.map((t) => (
            <option key={t.construction_type_id} value={t.construction_type_name}>
              {t.construction_type_name}
            </option>
          ))}
        </select>
        <select className="filter-select" value={projectTypeFilter} onChange={(e) => setProjectTypeFilter(e.target.value)}>
          <option value="">All Project Types</option>
          {projectTypes.map((pt) => (
            <option key={pt.project_type_id} value={pt.project_type_name}>
              {pt.project_type_name}
            </option>
          ))}
        </select>
        <select className="filter-select" value={supervisorFilter} onChange={(e) => setSupervisorFilter(e.target.value)}>
          <option value="">All Supervisors</option>
          {supervisors.map((s) => (
            <option key={s.employee_id} value={`${s.first_name} ${s.last_name}`}>
              {s.first_name} {s.last_name}
            </option>
          ))}
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option>Planning</option>
          <option>In Progress</option>
          <option>Near Completion</option>
          <option>Delayed</option>
          <option>Completed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No projects found" description="Try adjusting your search or filters." />
      ) : (
        <div className="project-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.project_id} project={p} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Project"
        wide
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>Create Project</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <div className="form-section-header full">
            <h4>Project Information</h4>
          </div>
          <FormInput label="Project Name" required full value={form.project_name || ''} onChange={(e) => setForm({ ...form, project_name: e.target.value })} />

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
            label="Client"
            required
            options={clients.map((c) => c.client_name)}
            value={form.client_name || ''}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          />

          <FormInput label="Project Description" type="textarea" full value={form.project_description || ''} onChange={(e) => setForm({ ...form, project_description: e.target.value })} />

          <div className="form-section-header full">
            <h4>Site Information</h4>
          </div>
          <FormInput label="Site Address" full value={form.site_address || ''} onChange={(e) => setForm({ ...form, site_address: e.target.value })} />
          <FormInput label="City" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <FormInput label="State" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <FormInput label="Pincode" value={form.pincode || ''} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />

          <div className="form-section-header full">
            <h4>Planning Details</h4>
          </div>
          <SelectInput
            label="Construction Stage"
            options={defaultStagesList}
            value={form.construction_stage_name || ''}
            onChange={(e) => setForm({ ...form, construction_stage_name: e.target.value })}
          />
          <SelectInput
            label="Assigned Employee / Manager"
            options={employees.map((e) => `${e.first_name} ${e.last_name}`)}
            value={form.employee_name || ''}
            onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
          />
          <FormInput label="Number of Floors" type="number" value={form.no_of_floors || ''} onChange={(e) => setForm({ ...form, no_of_floors: parseInt(e.target.value) || 1 })} />
          <FormInput label="Estimated Budget (₹)" type="number" value={form.estimated_budget || ''} onChange={(e) => setForm({ ...form, estimated_budget: parseFloat(e.target.value) || 0 })} />

          <div className="form-section-header full">
            <h4>Dates</h4>
          </div>
          <DateInput label="Start Date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <DateInput label="Expected End Date" value={form.expected_end_date || ''} onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })} />
          <DateInput label="Actual End Date (optional)" value={form.actual_end_date || ''} onChange={(e) => setForm({ ...form, actual_end_date: e.target.value })} />

          <div className="form-section-header full">
            <h4>Location</h4>
          </div>
          <FormInput label="Latitude" type="number" value={form.latitude || ''} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })} />
          <FormInput label="Longitude" type="number" value={form.longitude || ''} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })} />

          <div className="form-section-header full">
            <h4>Status</h4>
          </div>
          <SelectInput
            label="Project Status"
            options={['Planning', 'In Progress', 'Near Completion', 'Completed', 'Delayed']}
            value={form.project_status || 'In Progress'}
            onChange={(e) => setForm({ ...form, project_status: e.target.value })}
          />
          <SelectInput
            label="Active Record Status"
            options={[
              { label: 'Active', value: 'true' },
              { label: 'Inactive', value: 'false' },
            ]}
            value={form.status !== false ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, status: e.target.value === 'true' })}
          />
        </form>
      </Modal>
    </div>
  )
}
