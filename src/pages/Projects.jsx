import { useMemo, useState } from 'react'
import { Plus, Download } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import ProjectCard from '../components/ProjectCard'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { projects as initialProjects, constructionTypes, employees, clients } from '../data/mockData'
import { useToast } from '../components/ToastContext'

const supervisors = employees.filter((e) => e.employee_type_name === 'Site Supervisor')

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [supervisorFilter, setSupervisorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({})
  const showToast = useToast()

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!search || p.project_name.toLowerCase().includes(search.toLowerCase()) || p.project_code.toLowerCase().includes(search.toLowerCase())) &&
          (!typeFilter || p.construction_type_name === typeFilter) &&
          (!supervisorFilter || p.supervisor_name === supervisorFilter) &&
          (!statusFilter || p.project_status === statusFilter)
      ),
    [projects, search, typeFilter, supervisorFilter, statusFilter]
  )

  function handleSave(e) {
    e.preventDefault()
    const newId = Math.max(0, ...projects.map((p) => p.project_id)) + 1
    setProjects((ps) => [
      {
        ...form,
        project_id: newId,
        project_code: `PRJ-2026-${String(newId).padStart(3, '0')}`,
        overall_progress_percentage: 0,
        project_status: 'Planning',
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
        <SearchBar placeholder="Search projects..." value={search} onChange={setSearch} />
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Construction Types</option>
          {constructionTypes.map((t) => (
            <option key={t.construction_type_id} value={t.construction_type_name}>
              {t.construction_type_name}
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
        footer={
          <>
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>Create Project</PrimaryButton>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <FormInput label="Project Name" required full value={form.project_name || ''} onChange={(e) => setForm({ ...form, project_name: e.target.value })} />
          <SelectInput
            label="Construction Type"
            options={constructionTypes.map((t) => t.construction_type_name)}
            value={form.construction_type_name || ''}
            onChange={(e) => setForm({ ...form, construction_type_name: e.target.value })}
          />
          <SelectInput
            label="Client"
            options={clients.map((c) => c.client_name)}
            value={form.client_name || ''}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          />
          <SelectInput
            label="Supervisor"
            options={supervisors.map((s) => `${s.first_name} ${s.last_name}`)}
            value={form.supervisor_name || ''}
            onChange={(e) => setForm({ ...form, supervisor_name: e.target.value })}
          />
          <FormInput label="City" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <FormInput label="Site Address" full value={form.site_address || ''} onChange={(e) => setForm({ ...form, site_address: e.target.value })} />
          <FormInput label="Estimated Budget (₹)" value={form.estimated_budget || ''} onChange={(e) => setForm({ ...form, estimated_budget: e.target.value })} />
          <DateInput label="Start Date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <DateInput label="Expected End Date" value={form.expected_end_date || ''} onChange={(e) => setForm({ ...form, expected_end_date: e.target.value })} />
          <FormInput label="Project Description" type="textarea" full value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}
