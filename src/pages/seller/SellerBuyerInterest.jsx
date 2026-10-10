import { Eye, Tag, Scale } from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { formatCurrencyINR } from '../../utils/format'

export default function SellerBuyerInterest() {
  const buyerInterests = [
    { code: 'INT-BUY-101', property: 'ECR Sea Breeze Coastal Plot', date: '18 Jan 2026', offer: 19500000, status: 'Negotiation' },
    { code: 'INT-BUY-102', property: 'Avinashi Highway Commercial Land', date: '22 Jan 2026', offer: 34000000, status: 'Under Review' },
  ]

  return (
    <div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Buyer Interest & Purchase Intent</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginBottom: 16 }}>
          Track buyer inquiries and price proposals coordinated by company administration without exposing private client records.
        </p>

        <DataTable
          columns={[
            { header: 'Interest Code', accessor: 'code' },
            { header: 'Property Name', accessor: 'property' },
            { header: 'Buyer Offered Amount', accessor: (b) => formatCurrencyINR(b.offer) },
            { header: 'Inquiry Date', accessor: 'date' },
            { header: 'Status', accessor: (b) => <StatusBadge status={b.status} /> },
          ]}
          data={buyerInterests}
        />
      </div>
    </div>
  )
}
