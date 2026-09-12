import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { quotations } from '../data/mockData'
import { formatCurrencyINR } from '../utils/format'

export default function Quotations() {
  return (
    <div>
      <DataTable
        keyField="id"
        rows={quotations}
        columns={[
          { key: 'code', label: 'Quotation Code' },
          { key: 'project', label: 'Project' },
          { key: 'supplier', label: 'Supplier', render: (r) => <span className="cell-primary">{r.supplier}</span> },
          { key: 'item', label: 'Item' },
          { key: 'amount', label: 'Amount', render: (r) => formatCurrencyINR(r.amount) },
          { key: 'valid_till', label: 'Valid Till' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  )
}
