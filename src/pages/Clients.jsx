import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import { clients } from '../data/mockData'

export default function Clients() {
  return (
    <MasterDataPage
      title="Clients"
      addLabel="+ Add Client"
      initialData={clients}
      keyField="client_id"
      searchKeys={['client_name', 'client_code', 'company_name']}
      columns={[
        { key: 'client_code', label: 'Client Code' },
        { key: 'client_name', label: 'Client Name', render: (r) => <span className="cell-primary">{r.client_name}</span> },
        { key: 'client_type', label: 'Client Type' },
        { key: 'company_name', label: 'Company' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'City' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
      ]}
      fields={[
        { name: 'client_code', label: 'Client Code', required: true },
        { name: 'client_name', label: 'Client Name', required: true },
        {
          name: 'client_type',
          label: 'Client Type',
          type: 'select',
          options: ['Individual', 'Company', 'Organization', 'Government'],
        },
        { name: 'company_name', label: 'Company Name' },
        { name: 'contact_person', label: 'Contact Person' },
        { name: 'phone', label: 'Phone' },
        { name: 'alternate_phone', label: 'Alternate Phone' },
        { name: 'email', label: 'Email' },
        { name: 'address', label: 'Address', full: true },
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State' },
        { name: 'pincode', label: 'Pincode' },
        { name: 'gst_number', label: 'GST Number', full: true },
      ]}
    />
  )
}
