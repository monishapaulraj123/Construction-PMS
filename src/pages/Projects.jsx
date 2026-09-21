import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import ProjectCard from '../components/ProjectCard'
import EmptyState from '../components/EmptyState'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import {
  constructionTypes,
  projectTypes,
  employees,
} from '../data/mockData'
import { useApp } from '../context/AppContext'

const supervisors = employees.filter(
  (e) => e.employee_type_name === 'Site Supervisor' || e.employee_type_name === 'Civil Engineer'
)

export default function Projects() {
  const navigate = useNavigate()
  const { projects } = useApp()
  const [search, setSearch] = useState('')
  const [constructionTypeFilter, setConstructionTypeFilter] = useState('')
  const [projectTypeFilter, setProjectTypeFilter] = useState('')
  const [supervisorFilter, setSupervisorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

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

  return (
    <div className="animate-fade-slide">
      <div className="page-header">
        <div />
        <div className="page-header-actions">
          <SecondaryButton icon={Download}>Export</SecondaryButton>
          <PrimaryButton icon={Plus} onClick={() => navigate('/projects/create')}>
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
            <option key={s.employee_id} value={s.first_name + (s.last_name ? ' ' + s.last_name : '')}>
              {s.first_name}{s.last_name ? ' ' + s.last_name : ''}
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
    </div>
  )
}
