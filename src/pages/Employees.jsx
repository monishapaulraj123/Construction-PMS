import { useState } from 'react'
import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { SecondaryButton } from '../components/Buttons'
import { employees, employeeTypes, employeeAssignments, workRecords } from '../data/mockData'
import { formatDate } from '../utils/format'
import { Briefcase, Building, ShieldCheck, CreditCard, UserCheck, CheckCircle2 } from 'lucide-react'

export default function Employees() {
  const [viewEmployee, setViewEmployee] = useState(null)

  return (
    <div>
      <MasterDataPage
        title="Employees"
        addLabel="+ Add Employee"
        initialData={employees}
        keyField="employee_id"
        onView={(emp) => setViewEmployee(emp)}
        searchKeys={['first_name', 'last_name', 'employee_code', 'email', 'city', 'phone']}
        columns={[
          { key: 'employee_code', label: 'Employee Code' },
          {
            key: 'employee_name',
            label: 'Employee Name',
            render: (r) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundImage: `url(${r.profile_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid var(--line-100)',
                    flexShrink: 0,
                  }}
                />
                <span className="cell-primary">{r.first_name}{r.last_name ? ' ' + r.last_name : ''}</span>
              </div>
            ),
          },
          { key: 'employee_type_name', label: 'Employee Type' },
          { key: 'phone', label: 'Phone' },
          { key: 'city', label: 'City' },
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
          { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
          {
            name: 'gender',
            label: 'Gender',
            type: 'select',
            options: ['Male', 'Female', 'Other'],
          },

          { section: 'Contact & Address' },
          { name: 'phone', label: 'Phone', required: true },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'address_line1', label: 'Address Line 1' },
          { name: 'address_line2', label: 'Address Line 2' },
          { name: 'city', label: 'City' },
          { name: 'district', label: 'District' },
          { name: 'state', label: 'State' },

          { section: 'Identity Details' },
          { name: 'aadhaar_number', label: 'Aadhaar Number' },
          { name: 'pan_number', label: 'PAN Number' },

          { section: 'Bank Details' },
          { name: 'bank_name', label: 'Bank Name' },
          { name: 'bank_branch', label: 'Bank Branch' },
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

          { section: 'Emergency Contact' },
          { name: 'emergency_contact_name', label: 'Emergency Contact Name' },
          { name: 'emergency_contact_phone', label: 'Emergency Contact Phone' },

          { section: 'Profile / Status' },
          { name: 'profile_image', label: 'Profile Image URL', full: true },
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

      {viewEmployee && (
        <Modal
          open={!!viewEmployee}
          onClose={() => setViewEmployee(null)}
          title={`Employee Profile — ${viewEmployee.first_name}`}
          wide
          footer={<SecondaryButton onClick={() => setViewEmployee(null)}>Close</SecondaryButton>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header profile info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--cream-100)', borderRadius: 'var(--radius-md)' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundImage: `url(${viewEmployee.profile_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid var(--forest-900)',
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  {viewEmployee.first_name}{viewEmployee.last_name ? ' ' + viewEmployee.last_name : ''}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                  {viewEmployee.employee_type_name} · Code: <strong>{viewEmployee.employee_code}</strong> · {viewEmployee.employment_status || 'Permanent'}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-700)', marginTop: 4 }}>
                  📞 {viewEmployee.phone} | ✉️ {viewEmployee.email || 'N/A'} | 📍 {viewEmployee.city}, {viewEmployee.state}
                </div>
              </div>
              <StatusBadge status={viewEmployee.status ? 'Active' : 'Inactive'} />
            </div>

            {/* Current Project & Service Assignments */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={16} color="var(--forest-900)" /> Current Site Assignments & Work Tasks
              </h4>
              {employeeAssignments.filter((a) => a.employee_id === viewEmployee.employee_id || a.employee_name.includes(viewEmployee.first_name)).length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', fontStyle: 'italic', padding: 12, background: 'var(--paper)', borderRadius: 'var(--radius-sm)' }}>
                  No active project assignments currently recorded for this employee.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {employeeAssignments
                    .filter((a) => a.employee_id === viewEmployee.employee_id || a.employee_name.includes(viewEmployee.first_name))
                    .map((asg) => (
                      <div key={asg.assignment_id} style={{ padding: 12, background: 'var(--paper)', border: '1px solid var(--line-200)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--forest-900)' }}>{asg.project_name}</strong>
                          <span style={{ fontSize: '0.74rem', background: 'var(--gold-100)', color: 'var(--ink-900)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                            {asg.role_in_project}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-700)' }}>
                          Service: <strong>{asg.service_name}</strong> | Task: <strong>{asg.work_name}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: 4 }}>
                          Assigned: {asg.assigned_date} | Target Release: {asg.release_date}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Credentials & Financial details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} color="var(--forest-900)" /> Identity & Credentials
                </h5>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>Aadhaar: <strong>{viewEmployee.aadhaar_number || 'N/A'}</strong></div>
                  <div>PAN: <strong>{viewEmployee.pan_number || 'N/A'}</strong></div>
                  <div>Qualification: <strong>{viewEmployee.qualification || 'Civil Engineering'}</strong></div>
                  <div>Experience: <strong>{viewEmployee.experience_years || 5} Years</strong></div>
                </div>
              </div>

              <div style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={14} color="var(--forest-900)" /> Bank Details
                </h5>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>Bank: <strong>{viewEmployee.bank_name || 'HDFC Bank'}</strong> ({viewEmployee.bank_branch || 'Branch'})</div>
                  <div>Account: <strong>{viewEmployee.account_number || 'N/A'}</strong></div>
                  <div>IFSC: <strong>{viewEmployee.ifsc_code || 'N/A'}</strong> | MICR: <strong>{viewEmployee.micr_code || 'N/A'}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
