import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import { suppliers } from '../data/mockData'

const CATEGORY_OPTIONS = [
  'Cement Supplier',
  'Steel Supplier',
  'Electrical Supplier',
  'Plumbing Supplier',
  'Flooring Supplier',
  'Paint Supplier',
  'General Supplier',
]

export default function Suppliers() {
  return (
    <MasterDataPage
      title="Suppliers"
      addLabel="+ Add Supplier"
      initialData={suppliers}
      keyField="supplier_id"
      searchKeys={['supplier_name', 'supplier_code', 'city']}
      columns={[
        { key: 'supplier_code', label: 'Code' },
        { key: 'supplier_name', label: 'Supplier Name', render: (r) => <span className="cell-primary">{r.supplier_name}</span> },
        { key: 'supplier_category', label: 'Category' },
        { key: 'contact_person', label: 'Contact Person' },
        { key: 'phone', label: 'Phone' },
        { key: 'city', label: 'City' },
        { key: 'gst_number', label: 'GST Number' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
      ]}
      fields={[
        { name: 'supplier_code', label: 'Supplier Code', required: true },
        { name: 'supplier_name', label: 'Supplier Name', required: true },
        { name: 'supplier_category', label: 'Supplier Category', type: 'select', options: CATEGORY_OPTIONS },
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
