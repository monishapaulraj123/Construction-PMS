import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building,
  PlusCircle,
  Tag,
  CreditCard,
  FileText,
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Scale,
  FileCheck2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Mic,
  MicOff,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { useTranslation } from '../../context/LanguageContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'
import { useToast } from '../../components/ToastContext'
import { startListening, speakText, stopSpeaking } from '../../utils/speech'
import { aiAPI } from '../../services/api'

export default function ClientDashboard() {
  const { properties, buyRequests, sellRequests, transactions, currentUser, submitBuyRequest } = useApp()
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const showToast = useToast()

  const [activeRequestTab, setActiveRequestTab] = useState('buy')
  const [selectedPropModal, setSelectedPropModal] = useState(null)
  const [enquiryBudget, setEnquiryBudget] = useState('')
  const [enquiryNotes, setEnquiryNotes] = useState('')

  const [isListening, setIsListening] = useState(false)
  const [voiceQuery, setVoiceQuery] = useState('')
  const [voiceResponse, setVoiceResponse] = useState('')
  const [voiceLoading, setVoiceLoading] = useState(false)

  const handleClientVoiceQuery = async (queryText) => {
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
        handleClientVoiceQuery(transcript)
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

  // Filter client specific data based on user_id or email
  const myBuyRequests = useMemo(() => {
    if (!currentUser) return []
    return buyRequests.filter(
      (r) => r.buyer_id === currentUser.user_id || r.buyer_email === currentUser.email
    )
  }, [buyRequests, currentUser])

  const mySellRequests = useMemo(() => {
    if (!currentUser) return []
    return sellRequests.filter(
      (s) => s.seller_id === currentUser.user_id || s.seller_email === currentUser.email
    )
  }, [sellRequests, currentUser])

  const myProperties = useMemo(() => {
    if (!currentUser) return []
    return properties.filter(
      (p) => p.seller_id === currentUser.user_id || p.seller_email === currentUser.email
    )
  }, [properties, currentUser])

  const myTransactions = useMemo(() => {
    if (!currentUser) return []
    return transactions.filter(
      (t) =>
        t.buyer_id === currentUser.user_id ||
        t.seller_id === currentUser.user_id ||
        t.buyer_name === currentUser.name ||
        t.seller_name === currentUser.name
    )
  }, [transactions, currentUser])

  // Count available published/approved properties
  const availableProperties = useMemo(() => {
    return properties.filter(
      (p) => p.status === 'Approved' || p.publication_status === 'Published'
    )
  }, [properties])

  // Featured 3 available properties for display
  const featuredProperties = useMemo(() => {
    return availableProperties.slice(0, 3)
  }, [availableProperties])

  // Active request for stage stepper (use client's latest or first available request)
  const activeRequest = useMemo(() => {
    if (myBuyRequests.length > 0) return { ...myBuyRequests[0], type: 'Buy Request' }
    if (mySellRequests.length > 0) return { ...mySellRequests[0], type: 'Sell Request' }
    if (buyRequests.length > 0) return { ...buyRequests[0], type: 'Buy Request' }
    return {
      request_code: 'REQ-2026-891',
      property_name: 'ECR Sea Breeze Coastal Plot',
      current_stage: 'Negotiation',
      status: 'Negotiation',
      type: 'Buy Request',
    }
  }, [myBuyRequests, mySellRequests, buyRequests])

  // Active transaction
  const currentTransaction = useMemo(() => {
    if (myTransactions.length > 0) return myTransactions[0]
    if (transactions.length > 0) return transactions[0]
    return null
  }, [myTransactions, transactions])

  // Stepper stages definition
  const stepperStages = [
    { label: 'Submitted', key: 'Submitted', icon: Clock },
    { label: 'Under Review', key: 'Under Review', icon: FileCheck2 },
    { label: 'Verification', key: 'Verification', icon: ShieldCheck },
    { label: 'Negotiation', key: 'Negotiation', icon: Scale },
    { label: 'Approved', key: 'Approved', icon: CheckCircle2 },
    { label: 'Completed', key: 'Completed', icon: Sparkles },
  ]

  // Get index of active stage
  const getStageIndex = (stageName) => {
    if (!stageName) return 3
    const normalized = stageName.toLowerCase()
    if (normalized.includes('subm')) return 0
    if (normalized.includes('review')) return 1
    if (normalized.includes('verif')) return 2
    if (normalized.includes('nego')) return 3
    if (normalized.includes('appr')) return 4
    if (normalized.includes('comp') || normalized.includes('clos')) return 5
    return 3
  }

  const activeStageIndex = getStageIndex(activeRequest?.current_stage || activeRequest?.status)

  // Handle Quick Modal for Property Enquiry
  const handleOpenEnquiryModal = (prop) => {
    setSelectedPropModal(prop)
    setEnquiryBudget(prop.total_amount || '')
    setEnquiryNotes('Interested in scheduling site visit and reviewing title deed.')
  }

  const handleSubmitEnquiry = (e) => {
    e.preventDefault()
    if (!selectedPropModal) return
    submitBuyRequest({
      property_id: selectedPropModal.property_id,
      property_name: selectedPropModal.property_name,
      buyer_id: currentUser?.user_id,
      buyer_name: currentUser?.name || 'Client Buyer',
      buyer_email: currentUser?.email,
      buyer_phone: currentUser?.phone || '9840001122',
      budget: Number(enquiryBudget) || selectedPropModal.total_amount,
      requirements: enquiryNotes,
    })
    showToast(`Buy request submitted for ${selectedPropModal.property_name}!`)
    setSelectedPropModal(null)
    navigate('/client/requests')
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* 1. TOP HEADER & WELCOME */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          marginBottom: 20,
          background: 'linear-gradient(135deg, #2F5D50 0%, #1f4037 100%)',
          color: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(47, 93, 80, 0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {t('client_welcome', 'Welcome back')}, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Client'}
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                background: 'rgba(212, 176, 106, 0.25)',
                color: '#D4B06A',
                border: '1px solid rgba(212, 176, 106, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('client_portal_badge', 'Real Estate Client Portal')}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: 6, margin: '6px 0 0 0' }}>
            {t('client_banner_sub', 'Manage your property purchases, property listings and transactions from one place.')}
          </p>
        </div>

        <div className="page-header-actions" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={toggleVoice}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 8,
              background: isListening ? '#dc2626' : 'rgba(212, 176, 106, 0.25)',
              color: isListening ? '#ffffff' : '#D4B06A',
              border: '1px solid rgba(212, 176, 106, 0.4)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            <span>{isListening ? 'Listening...' : 'Voice Assistant'}</span>
            <Sparkles size={14} />
          </button>
          <button
            onClick={() => navigate('/client/sell')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          >
            <PlusCircle size={16} /> {t('sell_property', 'Sell Property')}
          </button>
          <button
            onClick={() => navigate('/client/buy')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 8,
              background: '#D4B06A',
              color: '#111827',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#c5a059')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#D4B06A')}
          >
            <Building size={16} /> {t('buy_land_property', 'Buy Land / Property')}
          </button>
        </div>
      </div>

      {/* 2. QUICK ACTIONS SECTION */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            title: t('client_buy_title', 'Buy Land / Property'),
            desc: t('client_buy_desc_short', 'Browse available properties.'),
            icon: Building,
            path: '/client/buy',
            accent: '#2F5D50',
          },
          {
            title: t('sell_property', 'Sell Property'),
            desc: t('client_sell_desc_short', 'Submit your land/property for verification.'),
            icon: PlusCircle,
            path: '/client/sell',
            accent: '#D4B06A',
          },
          {
            title: t('my_requests', 'My Requests'),
            desc: t('my_requests_desc_short', 'Track your buy and sell requests.'),
            icon: Tag,
            path: '/client/requests',
            accent: '#2F5D50',
          },
          {
            title: t('transactions', 'Transactions'),
            desc: t('my_txn_desc_short', 'View active and completed transactions.'),
            icon: CreditCard,
            path: '/client/transactions',
            accent: '#D4B06A',
          },
        ].map((act) => {
          const IconComp = act.icon
          return (
            <div
              key={act.path}
              onClick={() => navigate(act.path)}
              className="card"
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: '1px solid var(--cream-200)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: `${act.accent}15`,
                  color: act.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComp size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                  {act.title}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--ink-500)', marginTop: 2 }}>
                  {act.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. KEY STATUS SUMMARY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: t('available_properties', 'Available Properties'),
            value: availableProperties.length > 0 ? availableProperties.length : 12,
            icon: Building,
            sub: t('verified_listings_sub', 'Verified Listings'),
            color: '#2F5D50',
          },
          {
            label: t('my_buy_requests', 'My Buy Requests'),
            value: myBuyRequests.length > 0 ? myBuyRequests.length : 2,
            icon: Tag,
            sub: t('purchase_requests_sub', 'Purchase Requests'),
            color: '#D4B06A',
          },
          {
            label: t('my_sell_requests', 'My Sell Requests'),
            value: mySellRequests.length + myProperties.length > 0 ? mySellRequests.length + myProperties.length : 1,
            icon: PlusCircle,
            sub: t('property_submissions_sub', 'Property Submissions'),
            color: '#2F5D50',
          },
          {
            label: t('my_transactions', 'Active Transactions'),
            value: myTransactions.length > 0 ? myTransactions.length : 1,
            icon: CreditCard,
            sub: t('active_completed_sub', 'Active / Completed'),
            color: '#D4B06A',
          },
        ].map((item, index) => {
          const IconComponent = item.icon
          return (
            <div
              key={index}
              className="card"
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                borderLeft: `4px solid ${item.color}`,
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-500)' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink-900)', marginTop: 2 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-400)', marginTop: 2 }}>
                  {item.sub}
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${item.color}12`,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent size={20} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 4. AVAILABLE PROPERTIES — MOST IMPORTANT SECTION */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2F5D50', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('available_properties', 'AVAILABLE PROPERTIES')}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginTop: 2, margin: '2px 0 0 0' }}>
              {t('verified_listings_desc', 'Verified land parcels and residential plots available for immediate purchase')}
            </p>
          </div>
          <button
            onClick={() => navigate('/client/buy')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2F5D50',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            {t('view_all_properties', 'View All Properties')} <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {featuredProperties.map((p) => (
            <div
              key={p.property_id}
              className="card"
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                border: '1px solid var(--cream-200)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              {/* Property Image */}
              <div style={{ position: 'relative', height: 160, width: '100%', overflow: 'hidden', background: '#e5e7eb' }}>
                <img
                  src={p.image}
                  alt={p.property_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <StatusBadge status={p.verification_status || 'Approved'} />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 10,
                    background: 'rgba(17, 24, 39, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  {t(p.property_type?.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_'), p.property_type)}
                </div>
              </div>

              {/* Property Details */}
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--ink-900)' }}>
                    {p.property_name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--ink-600)', marginBottom: 8 }}>
                    <MapPin size={14} color="#2F5D50" /> {p.location}, {p.district}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginBottom: 12 }}>
                    {t('area', 'Area')}: <strong style={{ color: 'var(--ink-800)' }}>{p.area} {p.unit}</strong> • {t('rate', 'Rate')}: <strong style={{ color: 'var(--ink-800)' }}>{formatCurrencyINR(p.rate_per_unit)} / {p.unit}</strong>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--cream-200)',
                    paddingTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ink-400)', textTransform: 'uppercase' }}>{t('total_amount_label', 'Total Amount')}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D4B06A' }}>
                      {formatCurrencyINR(p.total_amount)}
                    </div>
                  </div>
                  <SecondaryButton
                    style={{ fontSize: '0.78rem', padding: '6px 12px', fontWeight: 700 }}
                    onClick={() => handleOpenEnquiryModal(p)}
                  >
                    {t('view_details', 'View Details')}
                  </SecondaryButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MY REQUESTS SECTION */}
      <div className="card" style={{ padding: 20, marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2F5D50', margin: 0, textTransform: 'uppercase' }}>
              {t('my_requests', 'MY REQUESTS')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginTop: 2, margin: '2px 0 0 0' }}>
              {t('client_req_desc', 'Track approval, title verification, and negotiation progress for your requests')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'var(--cream-100)', padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setActiveRequestTab('buy')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 6,
                border: 'none',
                background: activeRequestTab === 'buy' ? '#2F5D50' : 'transparent',
                color: activeRequestTab === 'buy' ? '#ffffff' : 'var(--ink-600)',
                cursor: 'pointer',
              }}
            >
              {t('buy_requests', 'BUY REQUESTS')} ({myBuyRequests.length > 0 ? myBuyRequests.length : buyRequests.length})
            </button>
            <button
              onClick={() => setActiveRequestTab('sell')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 6,
                border: 'none',
                background: activeRequestTab === 'sell' ? '#2F5D50' : 'transparent',
                color: activeRequestTab === 'sell' ? '#ffffff' : 'var(--ink-600)',
                cursor: 'pointer',
              }}
            >
              {t('sell_requests', 'SELL REQUESTS')} ({mySellRequests.length > 0 ? mySellRequests.length : sellRequests.length})
            </button>
          </div>
        </div>

        {activeRequestTab === 'buy' && (
          <div>
            <DataTable
              columns={[
                { header: t('properties', 'Property Name'), accessor: 'property_name' },
                { header: t('budget_vs_actual', 'Offered Budget'), accessor: (r) => formatCurrencyINR(r.budget) },
                { header: t('date', 'Submitted Date'), accessor: (r) => formatDate(r.submitted_date) },
                { header: t('status', 'Current Stage'), accessor: (r) => r.current_stage || 'Negotiation' },
                { header: t('status', 'Status'), accessor: (r) => <StatusBadge status={r.status} /> },
              ]}
              data={myBuyRequests.length > 0 ? myBuyRequests : buyRequests.slice(0, 3)}
            />
          </div>
        )}

        {activeRequestTab === 'sell' && (
          <div>
            <DataTable
              columns={[
                { header: t('properties', 'Property Name'), accessor: 'property_name' },
                { header: t('reference_no', 'Survey No.'), accessor: 'survey_number' },
                { header: t('amount', 'Asking Amount'), accessor: (s) => formatCurrencyINR(s.expected_total || s.total_amount) },
                { header: t('date', 'Submitted Date'), accessor: (s) => formatDate(s.submitted_date) },
                { header: t('status', 'Status'), accessor: (s) => <StatusBadge status={s.status} /> },
              ]}
              data={mySellRequests.length > 0 ? mySellRequests : sellRequests.slice(0, 3)}
            />
          </div>
        )}
      </div>

      {/* 6. REQUEST STATUS STEPPER */}
      <div className="card" style={{ padding: 20, marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2F5D50', margin: 0 }}>
              {t('request_status_progress', 'Request Status Progress Stepper')}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginTop: 2 }}>
              Active Request: <strong style={{ color: 'var(--ink-900)' }}>{activeRequest.property_name}</strong> ({activeRequest.request_code || 'REQ-2026-891'})
            </div>
          </div>
          <StatusBadge status={activeRequest.status || 'Negotiation'} />
        </div>

        {/* Horizontal Compact Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap', paddingTop: 10 }}>
          {stepperStages.map((stage, idx) => {
            const isDone = idx < activeStageIndex
            const isCurrent = idx === activeStageIndex
            const StageIcon = stage.icon

            return (
              <div
                key={stage.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 80,
                  position: 'relative',
                }}
              >
                {/* Circle Icon */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: isCurrent
                      ? '#2F5D50'
                      : isDone
                      ? '#16a34a'
                      : 'var(--cream-200)',
                    color: isCurrent || isDone ? '#ffffff' : 'var(--ink-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(47, 93, 80, 0.2)' : 'none',
                    zIndex: 2,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <StageIcon size={16} />
                </div>

                {/* Stage Text */}
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                    color: isCurrent ? '#2F5D50' : isDone ? '#16a34a' : 'var(--ink-500)',
                    marginTop: 8,
                    textAlign: 'center',
                  }}
                >
                  {t(stage.key, stage.label)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 7. ACTIVE TRANSACTION & MY SELLING PROPERTIES (2 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Current Transaction */}
        <div className="card" style={{ padding: 20, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2F5D50', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={18} /> {t('current_transaction', 'CURRENT TRANSACTION')}
              </h3>
              <StatusBadge status={currentTransaction?.status || 'Processing'} />
            </div>

            <div
              style={{
                background: 'var(--cream-50)',
                padding: 16,
                borderRadius: 10,
                border: '1px solid var(--cream-200)',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--ink-400)', textTransform: 'uppercase', fontWeight: 700 }}>
                {t('properties', 'Property')}
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--ink-900)', marginTop: 2 }}>
                {currentTransaction?.property_name || 'Green Valley Residential Land'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>{t('transactions', 'Transaction')}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink-800)', marginTop: 2 }}>
                    {currentTransaction?.transaction_type || 'Purchase'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>{t('amount', 'Agreed Amount')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#D4B06A', marginTop: 2 }}>
                    {formatCurrencyINR(currentTransaction?.agreed_amount || 4800000)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>{t('date', 'Transaction Date')}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink-700)', marginTop: 2 }}>
                    {currentTransaction?.created_at ? formatDate(currentTransaction.created_at) : '12 Sep 2026'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>{t('status', 'Current Status')}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#16a34a', marginTop: 2 }}>
                    {t('processing', 'Transaction Processing')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SecondaryButton
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}
            onClick={() => navigate('/client/transactions')}
          >
            {t('view_details', 'View Transaction')}
          </SecondaryButton>
        </div>

        {/* My Selling Properties */}
        <div className="card" style={{ padding: 20, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2F5D50', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building size={18} /> {t('my_properties_card', 'MY PROPERTIES')}
              </h3>
              <button
                onClick={() => navigate('/client/sell')}
                style={{ background: 'none', border: 'none', color: '#2F5D50', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                + {t('add', 'Submit New')}
              </button>
            </div>

            {myProperties.length === 0 ? (
              <div
                style={{
                  background: 'var(--cream-50)',
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid var(--cream-200)',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=300&auto=format&fit=crop"
                    alt="Property preview"
                    style={{ width: 80, height: 70, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--ink-900)' }}>
                      2,000 sq.ft Residential Land
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: 2 }}>
                      Coimbatore
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D4B06A', marginTop: 4 }}>
                      Expected Amount: ₹38,00,000
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--ink-500)' }}>{t('status', 'Status')}:</span>
                  <StatusBadge status="Under Verification" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {myProperties.slice(0, 2).map((p) => (
                  <div
                    key={p.property_id}
                    style={{
                      background: 'var(--cream-50)',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid var(--cream-200)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                        {p.property_name || p.survey_number}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--ink-500)' }}>
                        {p.location} ({p.area} {p.unit})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#D4B06A' }}>
                        {formatCurrencyINR(p.total_amount)}
                      </div>
                      <StatusBadge status={p.verification_status || p.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SecondaryButton
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}
            onClick={() => navigate('/client/sell')}
          >
            {t('view_details', 'View Property')}
          </SecondaryButton>
        </div>
      </div>

      {/* 8. ACTION REQUIRED & RECENT NOTIFICATIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>

        {/* Action Required */}
        <div className="card" style={{ padding: 20, borderRadius: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2F5D50', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} color="#d97706" /> {t('action_required', 'ACTION REQUIRED')}
          </h3>

          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: 8,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
              {t('details', 'Documents pending for:')}
            </div>
            <ul style={{ fontSize: '0.78rem', color: '#b45309', margin: '6px 0 0 18px', padding: 0 }}>
              <li>{t('verification', 'Property Verification')}</li>
              <li>{t('transactions', 'Purchase Transaction')}</li>
            </ul>
          </div>

          <SecondaryButton
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
            onClick={() => navigate('/client/documents')}
          >
            <FileText size={15} style={{ marginRight: 6 }} /> {t('view_documents', 'View Documents')}
          </SecondaryButton>
        </div>

        {/* Recent Notifications */}
        <div className="card" style={{ padding: 20, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2F5D50', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} /> {t('recent_notifications', 'Recent Notifications')}
            </h3>
            <button
              onClick={() => navigate('/client/notifications')}
              style={{ background: 'none', border: 'none', color: '#2F5D50', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
            >
              {t('view_all', 'View All')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'Admin approved your property.', time: '2h ago', icon: CheckCircle2, color: '#16a34a' },
              { title: 'Your buy request moved to Negotiation.', time: '1d ago', icon: Scale, color: '#D4B06A' },
              { title: 'Document verification completed.', time: '3d ago', icon: ShieldCheck, color: '#2563eb' },
              { title: 'Transaction status updated.', time: '4d ago', icon: CreditCard, color: '#2F5D50' },
            ].map((n, idx) => {
              const IconComp = n.icon
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: 'var(--cream-50)',
                  }}
                >
                  <IconComp size={16} color={n.color} />
                  <div style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-800)' }}>
                    {n.title}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-400)' }}>{n.time}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 9. SUBMIT PURCHASE ENQUIRY MODAL */}
      {selectedPropModal && (
        <Modal
          open={Boolean(selectedPropModal)}
          onClose={() => setSelectedPropModal(null)}
          title={`${t('details', 'Property Details')} — ${selectedPropModal.property_name}`}
          maxWidth={560}
        >
          <form onSubmit={handleSubmitEnquiry}>
            <div style={{ position: 'relative', height: 160, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
              <img
                src={selectedPropModal.image}
                alt={selectedPropModal.property_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <StatusBadge status={selectedPropModal.verification_status || 'Verified'} />
              </div>
            </div>

            <div className="card" style={{ padding: 12, background: 'var(--cream-50)', marginBottom: 14 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ink-900)' }}>
                {selectedPropModal.property_name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-600)', marginTop: 2 }}>
                {t('reference_no', 'Survey No.')}: <strong>{selectedPropModal.survey_number}</strong> | Location: <strong>{selectedPropModal.location}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-600)', marginTop: 2 }}>
                {t('area', 'Area')}: <strong>{selectedPropModal.area} {selectedPropModal.unit}</strong> @ {formatCurrencyINR(selectedPropModal.rate_per_unit)} / {selectedPropModal.unit}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#D4B06A', marginTop: 4 }}>
                {t('total_amount_label', 'Asking Total')}: {formatCurrencyINR(selectedPropModal.total_amount)}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>{t('budget_vs_actual', 'Your Offered Budget')} (₹ INR)</label>
              <input
                type="number"
                className="form-control"
                value={enquiryBudget}
                onChange={(e) => setEnquiryBudget(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.82rem', fontWeight: 600 }}>{t('notes', 'Notes / Special Requirements')}</label>
              <textarea
                className="form-control"
                rows={3}
                value={enquiryNotes}
                onChange={(e) => setEnquiryNotes(e.target.value)}
                placeholder="..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <SecondaryButton type="button" onClick={() => setSelectedPropModal(null)}>
                {t('cancel', 'Cancel')}
              </SecondaryButton>
              <PrimaryButton type="submit" icon={ArrowRight}>
                {t('submit', 'Submit Buy Request')}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
