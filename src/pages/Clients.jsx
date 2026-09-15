import { useState } from 'react'
import MasterDataPage from '../components/MasterDataPage'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { SecondaryButton } from '../components/Buttons'
import { clients, projects } from '../data/mockData'
import { formatCurrency } from '../utils/format'
import { Building2, Phone, Mail, MapPin, Briefcase, DollarSign, Activity } from 'lucide-react'

export default function Clients() {
  const [viewClient, setViewClient] = useState(null)

  const clientProjects = viewClient
    ? projects.filter((p) => p.client_id === viewClient.client_id || p.client_name === viewClient.client_name)
    : []

  const activeProjects = clientProjects.filter((p) => p.project_status !== 'Completed')
  const completedProjects = clientProjects.filter((p) => p.project_status === 'Completed')
  const totalInvestment = clientProjects.reduce((sum, p) => sum + (p.estimated_budget || 0), 0)
  const avgProgress = clientProjects.length > 0
    ? Math.round(clientProjects.reduce((sum, p) => sum + (p.overall_progress_percentage || 0), 0) / clientProjects.length)
    : 0

  return (
    <div>
      <MasterDataPage
        title="Clients"
        addLabel="+ Add Client"
        initialData={clients}
        keyField="client_id"
        onView={(c) => setViewClient(c)}
        searchKeys={['client_name', 'client_code', 'company_name', 'city', 'phone']}
        columns={[
          { key: 'client_code', label: 'Client Code' },
          { key: 'client_name', label: 'Client Name', render: (r) => <span className="cell-primary">{r.client_name}</span> },
          { key: 'client_type', label: 'Client Type' },
          { key: 'company_name', label: 'Company' },
          { key: 'contact_person', label: 'Contact Person' },
          { key: 'phone', label: 'Phone' },
          { key: 'city', label: 'City' },
          { key: 'district', label: 'District' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
        ]}
        fields={[
          { section: 'Basic Information' },
          { name: 'client_code', label: 'Client Code', required: true },
          { name: 'client_name', label: 'Client Name', required: true },
          {
            name: 'client_type',
            label: 'Client Type',
            type: 'select',
            required: true,
            options: ['Individual', 'Company', 'Organization', 'Government'],
          },
          { name: 'company_name', label: 'Company Name' },
          { name: 'contact_person', label: 'Contact Person' },

          { section: 'Contact Details' },
          { name: 'phone', label: 'Phone', required: true },
          { name: 'alternate_phone', label: 'Alternate Phone' },
          { name: 'email', label: 'Email', type: 'email' },

          { section: 'Address Information' },
          { name: 'address_line1', label: 'Address Line 1', full: true },
          { name: 'address_line2', label: 'Address Line 2', full: true },
          { name: 'city', label: 'City' },
          { name: 'district', label: 'District' },
          { name: 'state', label: 'State' },
          { name: 'pincode', label: 'Pincode' },

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

      {viewClient && (
        <Modal
          open={!!viewClient}
          onClose={() => setViewClient(null)}
          title={`Client Profile — ${viewClient.client_name}`}
          wide
          footer={<SecondaryButton onClick={() => setViewClient(null)}>Close</SecondaryButton>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18, background: 'var(--cream-100)', borderRadius: 'var(--radius-md)' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--forest-900)',
                  color: 'var(--gold-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                }}
              >
                {viewClient.client_name.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--forest-900)' }}>
                    {viewClient.client_name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', background: 'var(--gold-100)', color: 'var(--ink-900)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    {viewClient.client_type}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-600)', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span><Building2 size={13} style={{ verticalAlign: '-1px' }} /> {viewClient.company_name || 'Individual Client'}</span>
                  <span><Phone size={13} style={{ verticalAlign: '-1px' }} /> {viewClient.phone}</span>
                  {viewClient.email && <span><Mail size={13} style={{ verticalAlign: '-1px' }} /> {viewClient.email}</span>}
                  <span><MapPin size={13} style={{ verticalAlign: '-1px' }} /> {viewClient.city}, {viewClient.state}</span>
                </div>
              </div>
              <StatusBadge status={viewClient.status ? 'Active' : 'Inactive'} />
            </div>

            {/* Financial & Project summary stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={14} color="var(--forest-900)" /> Total Project Value
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--forest-900)', marginTop: 4 }}>
                  {formatCurrency(totalInvestment)}
                </div>
              </div>

              <div style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={14} color="var(--forest-900)" /> Total Projects
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--forest-900)', marginTop: 4 }}>
                  {clientProjects.length} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--ink-500)' }}>({activeProjects.length} Active, {completedProjects.length} Completed)</span>
                </div>
              </div>

              <div style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line-100)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={14} color="var(--forest-900)" /> Avg Progress
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--forest-900)', marginTop: 4 }}>
                  {avgProgress}%
                </div>
              </div>
            </div>

            {/* Client Projects List */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={16} color="var(--forest-900)" /> Commissioned Projects
              </h4>
              {clientProjects.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)', fontStyle: 'italic', padding: 14, background: 'var(--paper)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--line-200)' }}>
                  No active or historical projects recorded for this client yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {clientProjects.map((p) => (
                    <div key={p.project_id} style={{ padding: 14, background: 'var(--paper)', border: '1px solid var(--line-200)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--forest-900)' }}>{p.project_name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>({p.project_code})</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-600)', marginTop: 4 }}>
                          {p.construction_type_name} · {p.project_type_name} | Supervisor: <strong>{p.supervisor_name}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--forest-900)' }}>{formatCurrency(p.estimated_budget)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gold-600)', fontWeight: 600, marginTop: 2 }}>
                          Stage: {p.construction_stage_name} ({p.overall_progress_percentage}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

