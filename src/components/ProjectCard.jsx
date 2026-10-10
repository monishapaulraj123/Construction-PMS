import { Link } from 'react-router-dom'
import { MapPin, User2, HardHat, Layers } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'
import { formatCurrencyINR, formatDate } from '../utils/format'

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="project-card-media" style={{ backgroundImage: `url(${project.image})` }}>
        <div className="project-card-badge">
          <StatusBadge status={project.project_status} />
        </div>
      </div>
      <div className="project-card-body">
        <div>
          <div className="project-card-title cell-primary">{project.project_name}</div>
          <div className="project-card-code">
            {project.project_code} · {project.construction_type_name} {project.project_type_name ? `(${project.project_type_name})` : ''}
          </div>
        </div>
        <div className="project-card-meta">
          <span>
            <User2 size={13} /> {project.client_name}
          </span>
          <span>
            <HardHat size={13} /> {project.supervisor_name}
          </span>
          <span>
            <MapPin size={13} /> {project.city} {project.state ? `, ${project.state}` : ''}
          </span>
          {project.no_of_floors && (
            <span>
              <Layers size={13} /> {project.no_of_floors} Floors
            </span>
          )}
        </div>
        <ProgressBar value={project.overall_progress_percentage} showLabel />
        <div className="project-card-stats">
          <span>
            Budget
            <br />
            <strong>{formatCurrencyINR(project.estimated_budget)}</strong>
          </span>
          <span style={{ textAlign: 'right' }}>
            Deadline
            <br />
            <strong>{formatDate(project.expected_end_date)}</strong>
          </span>
        </div>
        <Link to={`/projects/${project.project_id}`} className="btn btn-secondary btn-block">
          View Details
        </Link>
      </div>
    </div>
  )
}
