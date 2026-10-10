/**
 * HousePlanningPage.jsx
 * Standalone House Planning Page Route (/projects/:id/house-plan)
 */

import { useParams, useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import EmptyState from '../components/EmptyState'
import HousePlanningEditor from '../components/house-planning/HousePlanningEditor'
import { HousePlanningProvider } from '../context/HousePlanningContext'
import { useApp } from '../context/AppContext'

export default function HousePlanningPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects } = useApp()

  const project = projects.find((p) => String(p.project_id) === String(id))

  if (!project) {
    return <EmptyState title="Project not found" description="This project may have been removed." />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Projects', to: '/projects' },
          { label: project.project_name, to: `/projects/${project.project_id}` },
          { label: 'House Planning & 3D Model' },
        ]}
      />

      <HousePlanningProvider projectId={project.project_id} initialPlan={project.house_plan}>
        <HousePlanningEditor onBack={() => navigate(`/projects/${project.project_id}`)} />
      </HousePlanningProvider>
    </div>
  )
}
