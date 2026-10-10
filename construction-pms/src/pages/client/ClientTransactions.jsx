import { CreditCard, FileText, CheckCircle2, ShieldCheck } from 'lucide-react'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import { useApp } from '../../context/AppContext'
import { formatCurrencyINR, formatDate } from '../../utils/format'

export default function ClientTransactions() {
  const { transactions, currentUser } = useApp()

  const myTxns = transactions.filter(
    (t) =>
      t.buyer_id === currentUser?.user_id ||
      t.seller_id === currentUser?.user_id ||
      t.buyer_name === currentUser?.name ||
      t.seller_name === currentUser?.name
  )

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Transactions</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: 2 }}>
            Track sale deed execution, advance receipts, final settlements and legal document handover.
          </p>
        </div>
      </div>

      <div className="card">
        {myTxns.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-500)' }}>
            No active property transactions found.
          </div>
        ) : (
          <DataTable
            columns={[
              { header: 'Txn Code', accessor: 'transaction_code' },
              { header: 'Property Name', accessor: 'property_name' },
              { header: 'Buyer', accessor: 'buyer_name' },
              { header: 'Seller', accessor: 'seller_name' },
              { header: 'Agreed Price', accessor: (t) => formatCurrencyINR(t.agreed_amount) },
              { header: 'Advance Amount', accessor: (t) => formatCurrencyINR(t.advance_amount) },
              { header: 'Payment Status', accessor: (t) => <StatusBadge status={t.payment_status} /> },
              { header: 'Deed Ref', accessor: (t) => t.document_reference || 'Pending' },
            ]}
            data={myTxns}
          />
        )}
      </div>
    </div>
  )
}
