import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import { suppliers } from '../data/mockData'
import { Star } from 'lucide-react'
import { supplierAPI } from '../services/api'

// Preset metadata matching the exact Screenshot 2 design
const SUPPLIER_PRESETS = {
  'SUP-01': {
    supplier_name: 'Sri Balaji Cement Traders',
    contact_person: 'Mohan',
    phone: '9884401122',
    city: 'Chennai',
    payment_terms: 'Net 30 Days',
    rating: 4.8,
  },
  'SUP-02': {
    supplier_name: 'Chennai Steel House',
    contact_person: 'Prakash',
    phone: '9884401123',
    city: 'Chennai',
    payment_terms: 'Net 15 Days',
    rating: 4.6,
  },
  'SUP-03': {
    supplier_name: 'Voltage Electricals',
    contact_person: 'Anitha',
    phone: '9884401124',
    city: 'Coimbatore',
    payment_terms: 'Immediate / COD',
    rating: 4.4,
  },
  'SUP-04': {
    supplier_name: 'AquaFlow Pipes & Fittings',
    contact_person: 'Bala',
    phone: '9884401125',
    city: 'Madurai',
    payment_terms: 'Net 30 Days',
    rating: 4.2,
  },
}

export default function Suppliers() {
  const fetchSuppliers = async () => {
    try {
      const data = await supplierAPI.getAll()
      if (Array.isArray(data) && data.length > 0) {
        return data.map((s) => {
          const def = SUPPLIER_PRESETS[s.supplier_code] || {}
          return {
            ...s,
            supplier_name: s.supplier_name || def.supplier_name,
            contact_person: def.contact_person || s.contact_person,
            phone: def.phone || s.phone,
            city: def.city || s.city,
            payment_terms: s.payment_terms || def.payment_terms || 'Net 30 Days',
            rating: s.rating !== undefined ? Number(s.rating) : (def.rating || 4.5),
          }
        })
      }
    } catch (e) {
      console.error('Error fetching suppliers:', e)
    }
    return suppliers
  }

  return (
    <MasterDataPage
      title="Suppliers"
      addLabel="+ Add Supplier"
      initialData={suppliers}
      keyField="supplier_id"
      fetchApi={fetchSuppliers}
      createApi={supplierAPI.create}
      updateApi={supplierAPI.update}
      deleteApi={supplierAPI.delete}
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
        {
          key: 'payment_terms',
          label: 'Payment Terms',
          render: (r) => r.payment_terms || SUPPLIER_PRESETS[r.supplier_code]?.payment_terms || 'Net 30 Days',
        },
        {
          key: 'rating',
          label: 'Rating',
          render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber-600, #d97706)' }}>
              <Star size={14} fill="currentColor" />
              <span>{r.rating || SUPPLIER_PRESETS[r.supplier_code]?.rating || '4.5'}</span>
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
