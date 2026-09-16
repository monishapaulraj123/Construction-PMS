import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building,
  PlusCircle,
  Tag,
  CreditCard,
  FileText,
  Bell,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import StatCard from '../../components/StatCard'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function ClientDashboard() {
  const { properties, buyRequests, sellRequests, transactions, currentUser } = useApp()
  const navigate = useNavigate()

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

  const availablePropertiesCount = properties.filter(
    (p) => p.status === 'Approved' && p.publication_status === 'Published'
  ).length

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink-900)' }}>
            Welcome back, {currentUser?.name || 'Client'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--ink-500)', marginTop: 4 }}>
            Real Estate Client Portal — Browse properties to buy, submit plots for sale, and track request status.
          </p>
        </div>
        <div className="page-header-actions" style={{ gap: 10 }}>
          <SecondaryButton icon={PlusCircle} onClick={() => navigate('/client/sell')}>
            Sell Property
          </SecondaryButton>
          <PrimaryButton icon={Building} onClick={() => navigate('/client/buy')}>
            Buy Land / Property
          </PrimaryButton>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Buy Land', icon: Building, path: '/client/buy', color: '#2563eb' },
          { label: 'Sell Property', icon: PlusCircle, path: '/client/sell', color: '#16a34a' },
          { label: 'My Requests', icon: Tag, path: '/client/requests', color: '#d97706' },
          { label: 'Transactions', icon: CreditCard, path: '/client/transactions', color: '#9333ea' },
          { label: 'Documents', icon: FileText, path: '/client/documents', color: '#0284c7' },
          { label: 'Notifications', icon: Bell, path: '/client/notifications', color: '#ea580c' },
          { label: 'My Profile', icon: UserCheck, path: '/client/profile', color: '#4b5563' },
        ].map((opt) => {
          const IconComp = opt.icon
          return (
            <div
              key={opt.label}
              onClick={() => navigate(opt.path)}
              className="card"
              style={{
                padding: '14px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${opt.color}15`,
                  color: opt.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComp size={20} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-800)' }}>
                {opt.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Metrics Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard title="Available Properties" value={availablePropertiesCount} icon={Building} trend="Approved Listings" />
        <StatCard title="My Buy Requests" value={myBuyRequests.length} icon={Tag} trend="Submitted Intent" />
        <StatCard title="My Sell Submissions" value={mySellRequests.length + myProperties.length} icon={PlusCircle} trend="Land Listings" />
        <StatCard title="My Transactions" value={myTransactions.length} icon={CreditCard} trend="In Progress / Complete" />
      </div>

      {/* Main Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* My Buy Requests */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>My Purchase Requests</h3>
            <SecondaryButton style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => navigate('/client/requests')}>
              View All
            </SecondaryButton>
          </div>
          {myBuyRequests.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              No active buy requests. Browse properties to submit a purchase enquiry.
            </div>
          ) : (
            <DataTable
              columns={[
                { header: 'Property', accessor: 'property_name' },
                { header: 'Budget', accessor: (r) => formatCurrencyINR(r.budget) },
                { header: 'Status', accessor: (r) => <StatusBadge status={r.status} /> },
              ]}
              data={myBuyRequests}
            />
          )}
        </div>

        {/* My Listed Properties & Sell Submissions */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>My Listed Properties</h3>
            <SecondaryButton style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => navigate('/client/sell')}>
              Submit New
            </SecondaryButton>
          </div>
          {myProperties.length === 0 && mySellRequests.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              No land parcels listed for sale yet. Click "Submit New" to list land for verification.
            </div>
          ) : (
            <DataTable
              columns={[
                { header: 'Property / Survey', accessor: (p) => p.property_name || p.survey_number },
                { header: 'Asking Price', accessor: (p) => formatCurrencyINR(p.total_amount || p.expected_total) },
                { header: 'Verification', accessor: (p) => <StatusBadge status={p.verification_status || p.status} /> },
              ]}
              data={[...myProperties, ...mySellRequests]}
            />
          )}
        </div>
      </div>
    </div>
  )
}
