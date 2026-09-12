import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import { employees, employeeTypes } from '../data/mockData'
import { formatDate } from '../utils/format'

export default function Employees() {
  return (
    <MasterDataPage
      title="Employees"
      addLabel="+ Add Employee"
      initialData={employees}
      keyField="employee_id"
      searchKeys={['first_name', 'last_name', 'employee_code', 'email']}
      columns={[
        { key: 'employee_code', label: 'Employee Code' },
        {
          key: 'employee_name',
          label: 'Employee Name',
          render: (r) => <span className="cell-primary">{r.first_name} {r.last_name}</span>,
        },
        { key: 'employee_type_name', label: 'Employee Type' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'specialization', label: 'Specialization' },
        { key: 'joining_date', label: 'Joining Date', render: (r) => formatDate(r.joining_date) },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
      ]}
      fields={[
        { section: 'Basic Information' },
        { name: 'employee_code', label: 'Employee Code', required: true },
        {
          name: 'employee_type_name',
          label: 'Employee Type',
          type: 'select',
          required: true,
          options: employeeTypes.map((t) => t.employee_type_name),
        },
        { name: 'first_name', label: 'First Name', required: true },
        { name: 'last_name', label: 'Last Name' },

        { section: 'Personal & Contact' },
        { name: 'phone', label: 'Phone', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
        {
          name: 'gender',
          label: 'Gender',
          type: 'select',
          options: ['Male', 'Female', 'Other'],
        },
        { name: 'address', label: 'Address', type: 'textarea', full: true },
        { name: 'profile_image', label: 'Profile Image (URL)', full: true },

        { section: 'Identity Details' },
        { name: 'aadhaar_number', label: 'Aadhaar Number' },
        { name: 'pan_number', label: 'PAN Number' },

        { section: 'Bank Details' },
        { name: 'bank_name', label: 'Bank Name' },
        { name: 'account_name', label: 'Account Name' },
        { name: 'account_number', label: 'Account Number' },
        { name: 'ifsc_code', label: 'IFSC Code' },
        { name: 'micr_code', label: 'MICR Code' },

        { section: 'Employment Details' },
        { name: 'joining_date', label: 'Joining Date', type: 'date' },
        {
          name: 'employment_status',
          label: 'Employment Status',
          type: 'select',
          options: ['Permanent', 'Contract', 'Probation', 'Temporary'],
        },
        { name: 'experience_years', label: 'Experience (Years)', type: 'number' },
        { name: 'qualification', label: 'Qualification' },
        { name: 'specialization', label: 'Specialization' },
        { name: 'role_description', label: 'Role Description', type: 'textarea', full: true },

        { section: 'Compensation' },
        {
          name: 'pay_type',
          label: 'Pay Type',
          type: 'select',
          options: ['Monthly Salary', 'Daily Wage', 'Hourly', 'Project Based'],
        },
        { name: 'pay_amount', label: 'Pay Amount (₹)', type: 'number' },

        { section: 'Emergency Contact & Status' },
        { name: 'emergency_contact_name', label: 'Emergency Contact Name' },
        { name: 'emergency_contact_phone', label: 'Emergency Contact Phone' },
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
