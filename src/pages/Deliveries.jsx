import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { deliveries } from '../data/mockData'

export default function Deliveries() {
  return (
    <div>
      <DataTable
        keyField="id"
        rows={deliveries}
        columns={[
          { key: 'code', label: 'Delivery Code' },
          { key: 'project', label: 'Project' },
          { key: 'item', label: 'Item', render: (r) => <span className="cell-primary">{r.item}</span> },
          { key: 'quantity', label: 'Quantity' },
          { key: 'delivered_date', label: 'Delivery Date' },
          { key: 'received_by', label: 'Received By' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  )
}
