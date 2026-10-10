import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building, PlusCircle, FileCheck2, Eye, Scale, CreditCard, ArrowRight } from 'lucide-react'
import StatCard from '../../components/StatCard'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { PrimaryButton, SecondaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function SellerDashboard() {
  const { properties, sellRequests, negotiations, transactions, currentUser } = useApp()
  const navigate = useNavigate()

  const myProperties = useMemo(() => {
    return properties.filter((p) => p.seller_name.includes('Santhosh') || p.seller_email === currentUser.email)
  }, [properties, currentUser])

  const mySellRequests = useMemo(() => {
    return sellRequests.filter((s) => s.seller_name?.includes('Santhosh') || s.seller_email === currentUser.email)
  }, [sellRequests, currentUser])

  const underVerificationCount = myProperties.filter((p) => p.verification_status === 'Under Review' || p.status === 'Under Verification').length

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Welcome, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Seller'}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Manage land submissions, track DTCP verification progress and monitor buyer interest.
          </p>
        </div>
        <div className="page-header-actions">
          <PrimaryButton icon={PlusCircle} onClick={() => navigate('/seller/requests')}>
            Submit Plot for Sale
          </PrimaryButton>
        </div>
      </div>

      {/* Seller Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard title="My Properties" value={myProperties.length} icon={Building} trend="Submitted Plots" />
        <StatCard title="My Sell Requests" value={mySellRequests.length} icon={PlusCircle} trend="Active Submissions" />
        <StatCard title="Under Verification" value={underVerificationCount} icon={FileCheck2} trend="Legal Check" />
        <StatCard title="Buyer Interest" value={2} icon={Eye} trend="Active Offers" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* My Listed Plots */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>My Listed Properties</h3>
            <SecondaryButton style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => navigate('/seller/properties')}>
              View All
            </SecondaryButton>
          </div>
          <DataTable
            columns={[
              { header: 'Property Name', accessor: 'property_name' },
              { header: 'Survey No', accessor: 'survey_number' },
              { header: 'Asking Total', accessor: (p) => formatCurrencyINR(p.total_amount) },
              { header: 'Verification', accessor: (p) => <StatusBadge status={p.verification_status || p.status} /> },
            ]}
            data={myProperties}
          />
        </div>

        {/* Verification Status Banner */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Verification Status</h3>
            <SecondaryButton style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => navigate('/seller/verification')}>
              Details
            </SecondaryButton>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: 'var(--cream-50)',
              border: '1px solid var(--cream-200)',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--brand-gold)' }}>
              <FileCheck2 size={18} /> EC Title Deed Verification
            </div>
            <div style={{ color: 'var(--ink-600)', marginTop: 6, fontSize: '0.8rem' }}>
              Your plot <strong>ECR Sea Breeze Coastal Plot</strong> (SY-142/3A) has passed clear title verification and is published.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
