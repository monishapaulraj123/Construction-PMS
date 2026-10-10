import { useState } from 'react'
import { Tag, PlusCircle, Clock, CheckCircle2, FileCheck2, Scale, ArrowRight } from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function ClientRequests() {
  const { buyRequests, sellRequests, currentUser } = useApp()
  const [activeTab, setActiveTab] = useState('buy')

  const myBuyRequests = buyRequests.filter(
    (r) => r.buyer_id === currentUser?.user_id || r.buyer_email === currentUser?.email
  )

  const mySellRequests = sellRequests.filter(
    (s) => s.seller_id === currentUser?.user_id || s.seller_email === currentUser?.email
  )

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Requests & Status Tracker</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Track the verification, negotiation, and approval progress for your land buying enquiries and selling submissions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          borderBottom: '1px solid var(--cream-200)',
          paddingBottom: 10,
        }}
      >
        <button
          className="btn"
          style={{
            padding: '8px 16px',
            fontSize: '0.86rem',
            fontWeight: 700,
            borderRadius: 6,
            background: activeTab === 'buy' ? 'var(--brand-gold)' : 'transparent',
            color: activeTab === 'buy' ? '#fff' : 'var(--ink-600)',
          }}
          onClick={() => setActiveTab('buy')}
        >
          <Tag size={16} style={{ marginRight: 6 }} /> My Buy Requests ({myBuyRequests.length})
        </button>
        <button
          className="btn"
          style={{
            padding: '8px 16px',
            fontSize: '0.86rem',
            fontWeight: 700,
            borderRadius: 6,
            background: activeTab === 'sell' ? 'var(--brand-gold)' : 'transparent',
            color: activeTab === 'sell' ? '#fff' : 'var(--ink-600)',
          }}
          onClick={() => setActiveTab('sell')}
        >
          <PlusCircle size={16} style={{ marginRight: 6 }} /> My Sell Submissions ({mySellRequests.length})
        </button>
      </div>

      {/* Tab 1: Buy Requests */}
      {activeTab === 'buy' && (
        <div className="card">
          {myBuyRequests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-500)' }}>
              No purchase enquiries found. Browse available land listings to submit a buy request.
            </div>
          ) : (
            <DataTable
              columns={[
                { header: 'Request Code', accessor: 'request_code' },
                { header: 'Property Name', accessor: 'property_name' },
                { header: 'Offered Budget', accessor: (r) => formatCurrencyINR(r.budget) },
                { header: 'Submitted Date', accessor: (r) => formatDate(r.submitted_date) },
                { header: 'Current Stage', accessor: 'current_stage' },
                { header: 'Status', accessor: (r) => <StatusBadge status={r.status} /> },
              ]}
              data={myBuyRequests}
            />
          )}
        </div>
      )}

      {/* Tab 2: Sell Requests */}
      {activeTab === 'sell' && (
        <div className="card">
          {mySellRequests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-500)' }}>
              No land selling submissions found. Submit a new property listing for Admin title verification.
            </div>
          ) : (
            <DataTable
              columns={[
                { header: 'Request Code', accessor: 'request_code' },
                { header: 'Property Name', accessor: 'property_name' },
                { header: 'Survey No', accessor: 'survey_number' },
                { header: 'Asking Price', accessor: (s) => formatCurrencyINR(s.expected_total || s.total_amount) },
                { header: 'Submitted Date', accessor: (s) => formatDate(s.submitted_date) },
                { header: 'Status', accessor: (s) => <StatusBadge status={s.status} /> },
              ]}
              data={mySellRequests}
            />
          )}
        </div>
      )}
    </div>
  )
}
