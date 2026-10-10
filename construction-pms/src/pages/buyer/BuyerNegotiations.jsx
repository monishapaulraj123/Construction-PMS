import { useMemo } from 'react'
import { Scale } from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function BuyerNegotiations() {
  const { negotiations, currentUser } = useApp()

  const myNegotiations = useMemo(() => {
    return negotiations.filter((n) => n.buyer_name.includes('Ravi') || n.buyer_name === currentUser.name)
  }, [negotiations, currentUser])

  return (
    <div>
      <div className="card">
        <DataTable
          columns={[
            { header: 'Negotiation ID', accessor: 'negotiation_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Initial Price', accessor: (n) => formatCurrencyINR(n.initial_price) },
            { header: 'Proposed Price', accessor: (n) => formatCurrencyINR(n.proposed_price) },
            { header: 'Counter Offer', accessor: (n) => formatCurrencyINR(n.counter_offer) },
            { header: 'Agreed Price', accessor: (n) => formatCurrencyINR(n.final_agreed_price) },
            { header: 'Date', accessor: (n) => formatDate(n.date) },
            { header: 'Status', accessor: (n) => <StatusBadge status={n.status} /> },
          ]}
          data={myNegotiations}
        />
      </div>
    </div>
  )
}
