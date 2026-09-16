import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building, Tag, Scale, CreditCard, FileText, Bell, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react'
import StatCard from '../../components/StatCard'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function BuyerDashboard() {
  const { properties, buyRequests, negotiations, transactions, currentUser } = useApp()
  const navigate = useNavigate()

  // Filter buyer specific data
  const myRequests = useMemo(() => {
    return buyRequests.filter((r) => r.buyer_email === currentUser.email || r.buyer_name.includes('Ravi'))
  }, [buyRequests, currentUser])

  const myNegotiations = useMemo(() => {
    return negotiations.filter((n) => n.buyer_name.includes('Ravi') || n.buyer_name === currentUser.name)
  }, [negotiations, currentUser])

  const myTxns = useMemo(() => {
    return transactions.filter((t) => t.buyer_name.includes('Ravi') || t.buyer_name === currentUser.name)
  }, [transactions, currentUser])

  const availablePropsCount = properties.filter((p) => p.status === 'Approved' && p.publication_status === 'Published').length

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Welcome, {currentUser.name || 'Buyer'}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Track your land purchase requests, price negotiations, deed documents and property search.
          </p>
        </div>
        <div className="page-header-actions">
          <PrimaryButton icon={Building} onClick={() => navigate('/buyer/properties')}>
            Browse Available Properties
          </PrimaryButton>
        </div>
      </div>

      {/* Buyer Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard title="Available Properties" value={availablePropsCount} icon={Building} trend="Approved Listings" />
        <StatCard title="My Buy Requests" value={myRequests.length} icon={Tag} trend="Submitted Intent" />
        <StatCard title="Active Negotiations" value={myNegotiations.length} icon={Scale} trend="In Progress" />
        <StatCard title="Current Transactions" value={myTxns.length} icon={CreditCard} trend="Processing" />
      </div>

      {/* Main Buyer View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* My Buy Requests Status */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>My Buy Requests & Status</h3>
            <SecondaryButton style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => navigate('/buyer/requests')}>
              View Tracker
            </SecondaryButton>
          </div>
          {myRequests.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
              No buy requests submitted yet. Browse properties to submit interest.
            </div>
          ) : (
            <DataTable
              columns={[
                { header: 'Property', accessor: 'property_name' },
                { header: 'Offered Budget', accessor: (r) => formatCurrencyINR(r.budget) },
                { header: 'Status Progression', accessor: (r) => <StatusBadge status={r.status} /> },
              ]}
              data={myRequests}
            />
          )}
        </div>

        {/* Available Properties Spotlight */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Featured Land Listings</h3>
            <SecondaryButton style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => navigate('/buyer/properties')}>
              Explore All
            </SecondaryButton>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {properties.slice(0, 2).map((p) => (
              <div
                key={p.property_id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 10,
                  borderRadius: 8,
                  background: 'var(--cream-50)',
                  border: '1px solid var(--cream-200)',
                }}
              >
                <img src={p.image} alt={p.property_name} style={{ width: 64, height: 64, borderRadius: 6, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{p.property_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>
                    {p.location} · {p.area} {p.unit}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-gold)', marginTop: 2 }}>
                    {formatCurrencyINR(p.total_amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
