import { Plus } from 'lucide-react'
import MaterialFlow from '../components/MaterialFlow'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { PrimaryButton } from '../components/Buttons'
import { materialRequests } from '../data/mockData'

export default function MaterialRequests() {
  return (
    <div>
      <MaterialFlow />
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus}>+ New Request</PrimaryButton>
      </div>
      <DataTable
        keyField="id"
        rows={materialRequests}
        columns={[
          { key: 'code', label: 'Request Code' },
          { key: 'project', label: 'Project' },
          { key: 'item', label: 'Item', render: (r) => <span className="cell-primary">{r.item}</span> },
          { key: 'quantity', label: 'Quantity' },
          { key: 'requested_by', label: 'Requested By' },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  )
}
