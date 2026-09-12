import { Link } from 'react-router-dom'
import {
  FolderKanban,
  Activity,
  Users2,
  Truck,
  CalendarCheck2,
  AlertTriangle,
  Gauge,
  Plus,
  UserPlus,
  PackagePlus,
  ClipboardList,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ProjectCard from '../components/ProjectCard'
import ActivityFeed from '../components/ActivityFeed'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { projects, recentActivities } from '../data/mockData'

export default function Dashboard() {
  const activeProjects = projects.filter((p) => p.project_status !== 'Planning')
  const nearCompletion = projects.filter((p) => p.overall_progress_percentage >= 85).length
  const delayed = projects.filter((p) => p.project_status === 'Delayed').length
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.overall_progress_percentage, 0) / projects.length)

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-banner-inner">
          <h2>Good Morning 👋</h2>
          <p>Manage your construction operations from one place.</p>
          <div className="hero-banner-actions">
            <PrimaryButton icon={Plus}>New Project</PrimaryButton>
            <SecondaryButton icon={UserPlus} className="btn-on-dark">
              Add Client
            </SecondaryButton>
            <SecondaryButton icon={PackagePlus} className="btn-on-dark">
              Add Material
            </SecondaryButton>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={FolderKanban} iconBg="var(--forest-900)" iconColor="#fff" value="12" label="Total Projects" trend="+8.4%" />
        <StatCard icon={Activity} iconBg="var(--gold-050)" iconColor="var(--gold-600)" value="8" label="Active Projects" trend="+12.5%" />
        <StatCard icon={Users2} iconBg="var(--green-100)" iconColor="var(--green-700)" value="24" label="Total Clients" trend="+5.2%" />
        <StatCard icon={Truck} iconBg="var(--cream-100)" iconColor="var(--forest-700)" value="18" label="Active Suppliers" trend="+3.1%" />
      </div>

      <div className="mini-stat-row">
        <div className="card mini-stat">
          <div className="mini-stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
            <CalendarCheck2 size={19} />
          </div>
          <div>
            <h4>{nearCompletion} Projects</h4>
            <span>Near Completion</span>
          </div>
        </div>
        <div className="card mini-stat">
          <div className="mini-stat-icon" style={{ background: 'var(--red-100)', color: 'var(--red-600)' }}>
            <AlertTriangle size={19} />
          </div>
          <div>
            <h4>{delayed} Project</h4>
            <span>Delayed Projects</span>
          </div>
        </div>
        <div className="card mini-stat">
          <div className="mini-stat-icon" style={{ background: 'var(--gold-050)', color: 'var(--gold-600)' }}>
            <Gauge size={19} />
          </div>
          <div>
            <h4>{avgProgress}%</h4>
            <span>Overall Project Progress</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="section-head">
            <div>
              <h3>Project Progress</h3>
              <p className="section-desc">Active and upcoming projects across all sites</p>
            </div>
            <Link to="/projects" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <div className="project-grid">
            {activeProjects.slice(0, 4).map((p) => (
              <ProjectCard key={p.project_id} project={p} />
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-head" style={{ marginBottom: 18 }}>
            <div>
              <h3>Recent Activities</h3>
              <p className="section-desc">Latest updates across your projects</p>
            </div>
          </div>
          <ActivityFeed items={recentActivities} />
          <Link to="/progress-updates" className="btn btn-ghost btn-block" style={{ marginTop: 16 }}>
            <ClipboardList size={15} /> View All Activity
          </Link>
        </div>
      </div>
    </div>
  )
}
