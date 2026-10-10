import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { orders } from '../data/mockData'
import { formatCurrencyINR } from '../utils/format'

export default function Orders() {
  return (
    <div>
      <DataTable
        keyField="id"
        rows={orders}
        columns={[
          { key: 'code', label: 'Order Code' },
          { key: 'project', label: 'Project' },
          { key: 'supplier', label: 'Supplier', render: (r) => <span className="cell-primary">{r.supplier}</span> },
          { key: 'item', label: 'Item' },
          { key: 'amount', label: 'Amount', render: (r) => formatCurrencyINR(r.amount) },
          { key: 'order_date', label: 'Order Date' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  )
}
