import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import { employeeTypes } from '../data/mockData'
import { formatDate } from '../utils/format'

export default function EmployeeTypes() {
  return (
    <MasterDataPage
      title="Employee Types"
      addLabel="+ Add Employee Type"
      initialData={employeeTypes}
      keyField="employee_type_id"
      searchKeys={['employee_type_name', 'employee_type_code']}
      columns={[
        { key: 'employee_type_code', label: 'Code' },
        { key: 'employee_type_name', label: 'Employee Type', render: (r) => <span className="cell-primary">{r.employee_type_name}</span> },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
        { key: 'created_at', label: 'Created Date', render: (r) => formatDate(r.created_at) },
      ]}
      fields={[
        { name: 'employee_type_code', label: 'Employee Type Code', required: true },
        { name: 'employee_type_name', label: 'Employee Type Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', full: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: true, label: 'Active' },
            { value: false, label: 'Inactive' },
          ],
        },
      ]}
    />
  )
}
