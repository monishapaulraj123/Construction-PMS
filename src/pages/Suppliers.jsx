import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import { suppliers } from '../data/mockData'
import { Star } from 'lucide-react'

export default function Suppliers() {
  return (
    <MasterDataPage
      title="Suppliers"
      addLabel="+ Add Supplier"
      initialData={suppliers}
      keyField="supplier_id"
      searchKeys={['supplier_name', 'supplier_code', 'city', 'contact_person', 'gst_number']}
      columns={[
        { key: 'supplier_code', label: 'Code' },
        {
          key: 'supplier_name',
          label: 'Supplier Name',
          render: (r) => <span className="cell-primary">{r.supplier_name}</span>,
        },
        { key: 'contact_person', label: 'Contact Person' },
        { key: 'phone', label: 'Phone' },
        { key: 'city', label: 'City' },
        { key: 'payment_terms', label: 'Payment Terms' },
        {
          key: 'rating',
          label: 'Rating',
          render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber-600, #d97706)' }}>
              <Star size={14} fill="currentColor" />
              <span>{r.rating || 'N/A'}</span>
            </div>
          ),
        },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
      ]}
      fields={[
        { section: 'Basic & Contact Information' },
        { name: 'supplier_code', label: 'Supplier Code', required: true },
        { name: 'supplier_name', label: 'Supplier Name', required: true },
        { name: 'contact_person', label: 'Contact Person' },
        { name: 'phone', label: 'Phone', required: true },
        { name: 'alternate_phone', label: 'Alternate Phone' },
        { name: 'email', label: 'Email', type: 'email' },

        { section: 'Address Details' },
        { name: 'address_line1', label: 'Address Line 1' },
        { name: 'address_line2', label: 'Address Line 2' },
        { name: 'city', label: 'City' },
        { name: 'district', label: 'District' },
        { name: 'state', label: 'State' },
        { name: 'pincode', label: 'Pincode' },

        { section: 'Tax & Legal Credentials' },
        { name: 'gst_number', label: 'GST Number' },
        { name: 'pan_number', label: 'PAN Number' },

        { section: 'Banking Details' },
        { name: 'bank_name', label: 'Bank Name' },
        { name: 'bank_branch', label: 'Bank Branch' },
        { name: 'account_number', label: 'Account Number' },
        { name: 'ifsc_code', label: 'IFSC Code' },

        { section: 'Terms & Capability' },
        { name: 'payment_terms', label: 'Payment Terms' },
        { name: 'delivery_capability', label: 'Delivery Capability' },
        { name: 'rating', label: 'Rating (0.00 - 5.00)', type: 'number' },
        { name: 'remarks', label: 'Remarks / Notes', type: 'textarea', full: true },

        { section: 'Status' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' },
          ],
        },
      ]}
    />
  )
}
