import { useMemo } from 'react'
import { CreditCard, FileText } from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function BuyerTransactions() {
  const { transactions, currentUser } = useApp()

  const myTxns = useMemo(() => {
    return transactions.filter((t) => t.buyer_name.includes('Ravi') || t.buyer_name === currentUser.name)
  }, [transactions, currentUser])

  return (
    <div>
      <div className="card">
        <DataTable
          columns={[
            { header: 'Transaction Code', accessor: 'transaction_code' },
            { header: 'Property Name', accessor: 'property_name' },
            { header: 'Agreed Price', accessor: (t) => formatCurrencyINR(t.agreed_amount) },
            { header: 'Payment Stage', accessor: 'payment_status' },
            { header: 'Document Ref', accessor: (t) => t.document_reference || 'SALE-DEED-2026' },
            { header: 'Date', accessor: (t) => formatDate(t.transaction_date) },
            { header: 'Status', accessor: (t) => <StatusBadge status={t.status} /> },
          ]}
          data={myTxns}
        />
      </div>
    </div>
  )
}
