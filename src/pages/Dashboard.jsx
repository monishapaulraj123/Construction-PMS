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
  Landmark,
  Wallet,
  Wrench,
  ClipboardList,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ProjectCard from '../components/ProjectCard'
import ActivityFeed from '../components/ActivityFeed'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { projects, recentActivities, payments, items as materialsList, landBuying } from '../data/mockData'
import { formatCurrencyINR } from '../utils/format'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'

export default function Dashboard() {
  const { currentUser } = useApp()
  const { t } = useTranslation()
  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : t('administrator', 'Administrator')

  const activeProjects = projects.filter((p) => p.project_status !== 'Planning')
  const nearCompletion = projects.filter((p) => p.overall_progress_percentage >= 85).length
  const delayed = projects.filter((p) => p.project_status === 'Delayed').length
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.overall_progress_percentage, 0) / projects.length)

  const totalIncome = payments.filter((p) => p.payment_type === 'Income').reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalExpense = payments.filter((p) => p.payment_type === 'Expense').reduce((sum, p) => sum + (p.amount || 0), 0)
  const netBalance = totalIncome - totalExpense

  const lowStockMaterials = materialsList.filter((m) => (m.quantity_inhand ?? 0) <= (m.minimum_stock_level ?? 0))

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-banner-inner">
          <h2>{t('dash_header_title', 'Construction & Real Estate Dashboard')} — {userName} 👋</h2>
          <p>{t('dash_header_desc', 'Overview of construction projects, real estate metrics, teams and site activities.')}</p>
          <div className="hero-banner-actions">
            <Link to="/projects">
              <PrimaryButton icon={Plus}>{t('projects', 'Projects')}</PrimaryButton>
            </Link>
            <Link to="/real-estate/overview">
              <SecondaryButton icon={Landmark} className="btn-on-dark">
                {t('real_estate', 'Real Estate')}
              </SecondaryButton>
            </Link>
            <Link to="/payments">
              <SecondaryButton icon={Wallet} className="btn-on-dark">
                {t('payments', 'Payments')}
              </SecondaryButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={FolderKanban} iconBg="var(--forest-900)" iconColor="#fff" value={projects.length.toString()} label={t('total_projects', 'Total Projects')} trend="+8.4%" />
        <StatCard icon={Activity} iconBg="var(--gold-050)" iconColor="var(--gold-600)" value={activeProjects.length.toString()} label={t('active_sites', 'Active Sites')} trend="+12.5%" />
        <StatCard icon={Landmark} iconBg="var(--green-100)" iconColor="var(--forest-900)" value={landBuying.length.toString()} label={t('land_properties', 'Land Properties')} trend="+1 parcel" />
        <StatCard icon={Wallet} iconBg="var(--gold-050)" iconColor="var(--forest-900)" value={formatCurrencyINR(netBalance)} label={t('net_balance', 'Net Balance')} trend="Positive" />
      </div>

      <div className="mini-stat-row">
        <div className="card mini-stat">
          <div className="mini-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <ArrowDownLeft size={19} />
          </div>
          <div>
            <h4>{formatCurrencyINR(totalIncome)}</h4>
            <span>{t('income', 'Income')}</span>
          </div>
        </div>
        <div className="card mini-stat">
          <div className="mini-stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <ArrowUpRight size={19} />
          </div>
          <div>
            <h4>{formatCurrencyINR(totalExpense)}</h4>
            <span>{t('expense', 'Expense')}</span>
          </div>
        </div>
        <div className="card mini-stat">
          <div className="mini-stat-icon" style={{ background: 'var(--gold-050)', color: 'var(--forest-900)' }}>
            <Gauge size={19} />
          </div>
          <div>
            <h4>{avgProgress}%</h4>
            <span>{t('progress_updates', 'Progress Updates')}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="section-head">
            <div>
              <h3>{t('project_overview', 'Project Overview')}</h3>
              <p className="section-desc">{t('dash_header_desc', 'Stage-wise execution progress on active sites')}</p>
            </div>
            <Link to="/projects" className="btn btn-secondary btn-sm">
              {t('view', 'View')} {t('projects', 'Projects')}
            </Link>
          </div>
          <div className="project-grid">
            {activeProjects.slice(0, 4).map((p) => (
              <ProjectCard key={p.project_id} project={p} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {lowStockMaterials.length > 0 && (
            <div className="card card-pad" style={{ borderLeft: '4px solid var(--gold-500)', background: 'var(--gold-050)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <AlertTriangle size={18} style={{ color: 'var(--amber-600, #d97706)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{t('materials', 'Materials')} Alert</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-700)', marginBottom: 10 }}>
                {lowStockMaterials.length} {t('materials', 'materials')} reached threshold:
              </p>
              {lowStockMaterials.map((m) => (
                <div key={m.material_id || m.item_id} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--line-200)' }}>
                  <span><strong>{m.material_name || m.item_name}</strong></span>
                  <span style={{ color: '#b45309', fontWeight: 700 }}>{m.quantity_inhand} / Min {m.minimum_stock_level} {m.unit_of_measure}</span>
                </div>
              ))}
              <Link to="/items" className="btn btn-secondary btn-sm" style={{ marginTop: 10, alignSelf: 'flex-start' }}>
                {t('inventory', 'Inventory')}
              </Link>
            </div>
          )}

          <div className="card card-pad">
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <h3>{t('recent_activity', 'Recent Activity')}</h3>
                <p className="section-desc">{t('site_updates', 'Site Updates')}</p>
              </div>
            </div>
            <ActivityFeed items={recentActivities} />
            <Link to="/progress-updates" className="btn btn-ghost btn-block" style={{ marginTop: 16 }}>
              <ClipboardList size={15} /> {t('view', 'View')} {t('recent_activity', 'Recent Activity')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
