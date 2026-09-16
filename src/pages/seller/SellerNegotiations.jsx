import { useMemo } from 'react'
import { Scale } from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function SellerNegotiations() {
  const { negotiations, currentUser } = useApp()

  const myNegs = useMemo(() => {
    return negotiations.filter((n) => n.seller_name.includes('Santhosh') || n.seller_name === currentUser.name)
  }, [negotiations, currentUser])

  return (
    <div>
      <div className="card">
        <DataTable
          columns={[
            { header: 'Negotiation Code', accessor: 'negotiation_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Initial Price', accessor: (n) => formatCurrencyINR(n.initial_price) },
            { header: 'Buyer Proposed Price', accessor: (n) => formatCurrencyINR(n.proposed_price) },
            { header: 'Counter Offer Amount', accessor: (n) => formatCurrencyINR(n.counter_offer) },
            { header: 'Agreed Price', accessor: (n) => formatCurrencyINR(n.final_agreed_price) },
            { header: 'Date', accessor: (n) => formatDate(n.date) },
            { header: 'Status', accessor: (n) => <StatusBadge status={n.status} /> },
          ]}
          data={myNegs}
        />
      </div>
    </div>
  )
}
