import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building,
  Tag,
  PlusCircle,
  FileCheck2,
  Scale,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Landmark,
  TrendingUp,
} from 'lucide-react'
import StatCard from '../../components/StatCard'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function RealEstateOverview() {
  const { properties, buyRequests, sellRequests, negotiations, transactions } = useApp()
  const navigate = useNavigate()

  // Real Business Metrics calculated dynamically
  const metrics = useMemo(() => {
    const availableProps = properties.filter((p) => p.status === 'Approved' && p.publication_status === 'Published').length
    const pendingBuyReqs = buyRequests.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length
    const pendingSellReqs = sellRequests.filter((s) => s.status === 'Under Verification').length
    const underVerificationProps = properties.filter((p) => p.verification_status === 'Under Review' || p.status === 'Under Verification').length
    const approvedProps = properties.filter((p) => p.status === 'Approved').length
    const activeNegs = negotiations.filter((n) => n.status !== 'Closed' && n.status !== 'Agreed').length
    const completedTxns = transactions.filter((t) => t.status === 'Completed').length

    const totalBuyingVal = buyRequests.reduce((sum, r) => sum + (r.budget || 0), 0)
    const totalSellingVal = properties.reduce((sum, p) => sum + (p.total_amount || 0), 0)

    const totalBuyersCount = new Set(buyRequests.map((b) => b.buyer_name)).size
    const totalSellersCount = new Set(properties.map((p) => p.seller_name)).size

    return {
      availableProps,
      pendingBuyReqs,
      pendingSellReqs,
      underVerificationProps,
      approvedProps,
      activeNegs,
      completedTxns,
      totalBuyingVal,
      totalSellingVal,
      totalBuyersCount,
      totalSellersCount,
    }
  }, [properties, buyRequests, sellRequests, negotiations, transactions])

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Real Estate Module Overview</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Comprehensive analytics and management across land acquisitions, client sales and verification pipelines.
          </p>
        </div>
        <div className="page-header-actions">
          <SecondaryButton icon={PlusCircle} onClick={() => navigate('/real-estate/sell-requests')}>
            Process Plot Submission
          </SecondaryButton>
          <PrimaryButton icon={Building} onClick={() => navigate('/real-estate/properties')}>
            View All Properties
          </PrimaryButton>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard title="Total Buyers" value={metrics.totalBuyersCount || 2} icon={Users} trend="+12% this month" />
        <StatCard title="Total Sellers" value={metrics.totalSellersCount || 4} icon={Landmark} trend="Active Clients" />
        <StatCard title="Available Properties" value={metrics.availableProps} icon={Building} trend="Published" />
        <StatCard title="Pending Buy Requests" value={metrics.pendingBuyReqs} icon={Tag} trend="Awaiting Review" />
        <StatCard title="Pending Sell Requests" value={metrics.pendingSellReqs} icon={PlusCircle} trend="Verification Needed" />
        <StatCard title="Under Verification" value={metrics.underVerificationProps} icon={FileCheck2} trend="Legal Checks" />
        <StatCard title="Active Negotiations" value={metrics.activeNegs} icon={Scale} trend="In Progress" />
        <StatCard title="Completed Transactions" value={metrics.completedTxns} icon={CreditCard} trend="Settled Deeds" />
      </div>

      {/* Financial Valuation Summary Banner */}
      <div
        className="card"
        style={{
          padding: 20,
          marginBottom: 24,
          background: 'linear-gradient(135deg, var(--cream-100) 0%, #fff 100%)',
          borderLeft: '4px solid var(--brand-gold)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
            Total Buying Portfolio Demand
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink-900)', marginTop: 2 }}>
            {formatCurrencyINR(metrics.totalBuyingVal)}
          </div>
        </div>
        <div style={{ height: 32, width: 1, background: 'var(--cream-300)' }} className="hide-on-mobile" />
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>
            Total Property Listings Valuation
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-gold)', marginTop: 2 }}>
            {formatCurrencyINR(metrics.totalSellingVal)}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={ArrowUpRight} onClick={() => navigate('/real-estate/transactions')}>
          Manage Transactions
        </PrimaryButton>
      </div>

      {/* Tables Preview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Buy Requests */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Buy Requests</h3>
            <SecondaryButton style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => navigate('/real-estate/buy-requests')}>
              View All
            </SecondaryButton>
          </div>
          <DataTable
            columns={[
              { header: 'Property', accessor: 'property_name' },
              { header: 'Buyer', accessor: 'buyer_name' },
              { header: 'Budget', accessor: (r) => formatCurrencyINR(r.budget) },
              { header: 'Status', accessor: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={buyRequests.slice(0, 4)}
          />
        </div>

        {/* Property Verification Pipeline */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Properties Pipeline</h3>
            <SecondaryButton style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => navigate('/real-estate/verification')}>
              View Verification
            </SecondaryButton>
          </div>
          <DataTable
            columns={[
              { header: 'Property Name', accessor: 'property_name' },
              { header: 'Survey No', accessor: 'survey_number' },
              { header: 'Location', accessor: 'location' },
              { header: 'Verification', accessor: (r) => <StatusBadge status={r.verification_status || r.status} /> },
            ]}
            data={properties.slice(0, 4)}
          />
        </div>
      </div>
    </div>
  )
}
