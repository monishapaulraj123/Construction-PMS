import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  Activity,
  AlertTriangle,
  Gauge,
  Plus,
  Landmark,
  Wallet,
  ClipboardList,
  ArrowDownLeft,
  ArrowUpRight,
  Mic,
  MicOff,
  Sparkles,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ProjectCard from '../components/ProjectCard'
import ActivityFeed from '../components/ActivityFeed'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { projects, recentActivities, payments, items as materialsList, landBuying } from '../data/mockData'
import { formatCurrencyINR } from '../utils/format'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'
import { startListening, speakText, stopSpeaking } from '../utils/speech'
import { aiAPI } from '../services/api'

export default function Dashboard() {
  const { currentUser, projects: contextProjects, payments: contextPayments } = useApp()
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : t('administrator', 'Administrator')

  const [isListening, setIsListening] = useState(false)
  const [voiceQuery, setVoiceQuery] = useState('')
  const [voiceResponse, setVoiceResponse] = useState('')
  const [voiceLoading, setVoiceLoading] = useState(false)

  const projectsList = contextProjects && contextProjects.length > 0 ? contextProjects : projects
  const paymentsList = contextPayments && contextPayments.length > 0 ? contextPayments : payments

  const activeProjects = projectsList.filter((p) => p.project_status !== 'Completed')
  const avgProgress = projectsList.length > 0
    ? Math.round(projectsList.reduce((sum, p) => sum + (Number(p.overall_progress_percentage) || 0), 0) / projectsList.length)
    : 0

  const totalIncome = paymentsList.filter((p) => p.payment_type === 'Income').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const totalExpense = paymentsList.filter((p) => p.payment_type === 'Expense').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const netBalance = totalIncome - totalExpense

  const lowStockMaterials = materialsList.filter((m) => (m.quantity_inhand ?? 0) <= (m.minimum_stock_level ?? 0))

  // Admin Voice Assistant Handler
  const handleAdminVoiceQuery = async (queryText) => {
    if (!queryText) return
    setVoiceQuery(queryText)
    setVoiceLoading(true)
    stopSpeaking()

    try {
      const res = await aiAPI.chat(queryText)
      setVoiceLoading(false)
      if (res && res.text) {
        setVoiceResponse(res.text)
        speakText(res.text, language === 'ta' ? 'ta-IN' : 'en-US')

        if (res.navigateTo) {
          setTimeout(() => {
            navigate(res.navigateTo)
          }, 1000)
        }
      }
    } catch (e) {
      setVoiceLoading(false)
      setVoiceResponse('Could not process voice query.')
    }
  }

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    startListening({
      lang: language === 'ta' ? 'ta-IN' : 'en-US',
      onResult: (transcript) => {
        setIsListening(false)
        handleAdminVoiceQuery(transcript)
      },
      onError: (err) => {
        setIsListening(false)
        setVoiceResponse(err)
      },
      onEnd: () => {
        setIsListening(false)
      },
    })
    setIsListening(true)
  }

  return (
    <div>
      {/* 1. HERO BANNER WITH VOICE ASSISTANT */}
      <div className="hero-banner">
        <div className="hero-banner-inner">
          <div>
            <h2>{t('dash_header_title', 'Construction & Real Estate Dashboard')} — {userName} 👋</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <button
                onClick={toggleVoice}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: isListening ? '#dc2626' : 'rgba(212, 176, 106, 0.25)',
                  color: isListening ? '#ffffff' : '#D4B06A',
                  border: '1px solid rgba(212, 176, 106, 0.4)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{isListening ? 'Listening...' : 'Voice Assistant'}</span>
                <Sparkles size={13} />
              </button>

              {voiceQuery && (
                <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', italic: true }}>
                  "{voiceQuery}"
                </span>
              )}
            </div>
          </div>

          <div className="hero-banner-actions">
            <Link to="/projects">
              <PrimaryButton icon={Plus}>{t('projects', 'Projects')}</PrimaryButton>
            </Link>
            <Link to="/real-estate/properties">
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

        {/* Voice Feedback Banner */}
        {(voiceLoading || voiceResponse) && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 16px',
              borderRadius: 8,
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(212, 176, 106, 0.3)',
              color: '#ffffff',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{voiceLoading ? 'Querying database...' : voiceResponse}</span>
            <button
              onClick={() => setVoiceResponse('')}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.75rem', opacity: 0.7 }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="stat-grid">
        <StatCard icon={FolderKanban} iconBg="var(--forest-900)" iconColor="#fff" value={projectsList.length.toString()} label={t('total_projects', 'Total Projects')} trend="+8.4%" />
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
            <Link to="/progress-updates" className="btn btn-secondary btn-block btn-recent-activity" style={{ marginTop: 16 }}>
              <ClipboardList size={15} /> {t('view', 'View')} {t('recent_activity', 'Recent Activity')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
