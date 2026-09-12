import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import { services } from '../data/mockData'
import { formatCurrencyINR } from '../utils/format'

export default function Services() {
  return (
    <MasterDataPage
      title="Services"
      addLabel="+ Add Service"
      initialData={services}
      keyField="service_id"
      searchKeys={['service_name', 'service_code']}
      columns={[
        { key: 'service_code', label: 'Service Code' },
        { key: 'service_name', label: 'Service Name', render: (r) => <span className="cell-primary">{r.service_name}</span> },
        { key: 'unit_of_measure', label: 'Unit' },
        { key: 'base_rate', label: 'Base Rate', render: (r) => formatCurrencyINR(r.base_rate) },
        { key: 'estimated_duration_days', label: 'Est. Duration', render: (r) => `${r.estimated_duration_days} days` },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
      ]}
      fields={[
        { name: 'service_code', label: 'Service Code', required: true },
        { name: 'service_name', label: 'Service Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', full: true },
        { name: 'unit_of_measure', label: 'Unit of Measure' },
        { name: 'base_rate', label: 'Base Rate (₹)' },
        { name: 'estimated_duration_days', label: 'Estimated Duration (days)' },
      ]}
    />
  )
}
