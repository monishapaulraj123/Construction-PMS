import { useMemo, useState } from 'react'
import { Plus, LayoutGrid, TableProperties, Wrench, Clock, Calendar, UserCheck, Eye } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { FormInput, SelectInput, DateInput } from '../components/FormInputs'
import { formatCurrencyINR, formatDate } from '../utils/format'
import { useToast } from '../components/ToastContext'
import { useApp } from '../context/AppContext'
import ServiceAssignmentModal from '../components/ServiceAssignmentModal'

export default function Services() {
  const { services: serviceList, projects, employees, assignServicePerson } = useApp()
  const [search, setSearch] = useState('')
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL') // 'ALL' or project_id / project_name
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL')
  const [view, setView] = useState('card')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [assignModalSrv, setAssignModalSrv] = useState(null)
  const [expandedSrvId, setExpandedSrvId] = useState(null)
  const showToast = useToast()

  // Extract unique service categories
  const categories = useMemo(() => {
    const set = new Set(serviceList.map((s) => s.service_name))
    return ['ALL', ...Array.from(set)]
  }, [serviceList])

  const selectedProject = useMemo(() => {
    if (selectedProjectFilter === 'ALL') return null
    return projects.find((p) => String(p.project_id) === String(selectedProjectFilter) || p.project_name === selectedProjectFilter)
  }, [projects, selectedProjectFilter])

  const filtered = useMemo(() => {
    return serviceList.filter((s) => {
      const matchSearch =
        !search ||
        s.service_name.toLowerCase().includes(search.toLowerCase()) ||
        (s.service_code || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.project_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.assigned_person_name || '').toLowerCase().includes(search.toLowerCase())

      const matchProject =
        selectedProjectFilter === 'ALL' ||
        String(s.project_id) === String(selectedProjectFilter) ||
        s.project_name === selectedProjectFilter

      const matchCategory = selectedCategoryFilter === 'ALL' || s.service_name === selectedCategoryFilter

      return matchSearch && matchProject && matchCategory
    })
  }, [serviceList, search, selectedProjectFilter, selectedCategoryFilter])

  function openAdd() {
    setEditing(null)
    setForm({ status: true, unit_of_measure: 'Sq. Ft', base_rate: 0, estimated_duration_days: 10 })
    setModalOpen(true)
  }

  // Get tied-up service persons matching a service category
  function getTieUpPersons(srvName) {
    if (!srvName) return employees
    const lowerSrv = srvName.toLowerCase()
    return employees.filter((emp) => {
      const empSrv = (emp.service || emp.specialization || '').toLowerCase()
      const empType = (emp.employee_type_name || '').toLowerCase()

      if (lowerSrv.includes('carpent')) return empSrv.includes('carpent') || empType.includes('carpent')
      if (lowerSrv.includes('electr')) return empSrv.includes('electr') || empType.includes('electr')
      if (lowerSrv.includes('plumb')) return empSrv.includes('plumb') || empType.includes('plumb')
      if (lowerSrv.includes('paint')) return empSrv.includes('paint') || empType.includes('paint')
      if (lowerSrv.includes('floor') || lowerSrv.includes('tile')) return empSrv.includes('floor') || empSrv.includes('tile')
      if (lowerSrv.includes('interior') || lowerSrv.includes('structur')) return empSrv.includes('interior') || empSrv.includes('structur') || empType.includes('engineer')

      return empSrv.includes(lowerSrv) || lowerSrv.includes(empSrv)
    })
  }

  function handleSelectPerson(srv, person) {
    const projId = selectedProject?.project_id || srv.project_id || 1
    assignServicePerson(srv.service_id, person.employee_id, projId)
    showToast(`Successfully assigned ${person.first_name} ${person.last_name} (${person.service || srv.service_name} Specialist) to ${srv.service_name}`)
  }

  return (
    <div>
      {/* Top Filter Controls: Project Selection & Service Category Selection */}
      <div className="card" style={{ padding: 16, marginBottom: 20, background: 'var(--cream-050)', border: '1px solid var(--line-200)' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Project Selection Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 280 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest-950)', whiteSpace: 'nowrap' }}>
              Select Project:
            </span>
            <select
              className="input-field"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem', fontWeight: 600, borderColor: 'var(--gold-400)' }}
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_name} ({p.project_code})
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <SearchBar placeholder="Search service, code, or specialist..." value={search} onChange={setSearch} />
          </div>

          {/* View toggle & Add button */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="icon-btn"
              style={{ background: view === 'card' ? 'var(--cream-200)' : undefined }}
              onClick={() => setView('card')}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className="icon-btn"
              style={{ background: view === 'table' ? 'var(--cream-200)' : undefined }}
              onClick={() => setView('table')}
              title="Table View"
            >
              <TableProperties size={16} />
            </button>
            <PrimaryButton icon={Plus} onClick={openAdd}>
              Add Service Category
            </PrimaryButton>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className="btn btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '5px 12px',
                borderRadius: 20,
                background: selectedCategoryFilter === cat ? 'var(--forest-900)' : '#fff',
                color: selectedCategoryFilter === cat ? '#fff' : 'var(--ink-700)',
                border: '1px solid var(--line-200)',
                fontWeight: selectedCategoryFilter === cat ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {cat === 'ALL' ? 'All Service Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Project Highlight Context Banner */}
      {selectedProject && (
        <div
          className="card"
          style={{
            padding: '14px 18px',
            marginBottom: 20,
            background: 'linear-gradient(135deg, var(--forest-950) 0%, var(--forest-900) 100%)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-400)', fontWeight: 700 }}>
              Selected Project Category
            </div>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', color: '#fff' }}>
              {selectedProject.project_name} ({selectedProject.project_code})
            </h3>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              Client: <strong>{selectedProject.client_name}</strong> · Location: <strong>{selectedProject.city}, {selectedProject.state}</strong> · Type: <strong>{selectedProject.construction_type_name}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Total Services</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-300)' }}>
                {serviceList.filter((s) => s.project_name === selectedProject.project_name || String(s.project_id) === String(selectedProject.project_id)).length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Status</div>
              <StatusBadge status={selectedProject.project_status} />
            </div>
          </div>
        </div>
      )}

      {/* Service Cards / Table with Tie-Up Persons Details */}
      {view === 'card' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filtered.map((srv) => {
            const tieUpPersons = getTieUpPersons(srv.service_name)
            const isExpanded = expandedSrvId === srv.service_id

            return (
              <div
                className="entity-card"
                key={srv.service_id}
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  border: isExpanded ? '2px solid var(--gold-500)' : '1px solid var(--cream-200)',
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--gold-050)',
                        border: '1px solid var(--gold-200)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--forest-900)',
                      }}
                    >
                      <Wrench size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: '1.08rem', fontWeight: 700, margin: 0 }}>{srv.service_name}</h3>
                        <span className="stage-code" style={{ fontSize: '0.75rem' }}>
                          {srv.service_code || `SRV-0${srv.service_id}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginTop: 2 }}>
                        Project: <strong>{srv.project_name || 'General Project'}</strong> · Est. Duration: <strong>{srv.estimated_duration_days} days</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusBadge status={srv.status ? 'Active' : 'Inactive'} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                      {formatCurrencyINR(srv.base_rate)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ink-500)' }}>/ {srv.unit_of_measure}</span>
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--ink-600)', margin: 0, lineHeight: 1.5 }}>
                  {srv.description || 'Specialist contractor service for construction project execution.'}
                </p>

                {/* Current Assigned Specialist Bar */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: srv.assigned_person_name ? 'rgba(34, 197, 94, 0.08)' : 'var(--cream-050)',
                    borderRadius: 'var(--radius-sm)',
                    border: srv.assigned_person_name ? '1px solid rgba(34, 197, 94, 0.25)' : '1px dashed var(--line-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserCheck size={18} color={srv.assigned_person_name ? 'var(--forest-900)' : 'var(--coral-500)'} />
                    <span style={{ fontSize: '0.84rem' }}>
                      Assigned Service Person:
                    </span>
                    <strong style={{ fontSize: '0.9rem', color: srv.assigned_person_name ? 'var(--forest-900)' : 'var(--coral-500)' }}>
                      {srv.assigned_person_name ? `${srv.assigned_person_name} (Active Assignee)` : 'Unassigned — Admin Selection Required'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <SecondaryButton
                      style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                      onClick={() => setExpandedSrvId(isExpanded ? null : srv.service_id)}
                    >
                      {isExpanded ? 'Hide Tie-Up Persons' : `View Tie-Up Persons (${tieUpPersons.length})`}
                    </SecondaryButton>
                    <PrimaryButton
                      style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                      icon={UserCheck}
                      onClick={() => setAssignModalSrv(srv)}
                    >
                      Select & Assign Person
                    </PrimaryButton>
                  </div>
                </div>

                {/* Expanded Section: Display Tie-Up Service Persons with Details */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 14,
                      background: 'var(--cream-050)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gold-200)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--forest-950)' }}>
                        Tie-Up Service Persons for {srv.service_name} ({tieUpPersons.length} Available)
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                        Empanelled specialists available for admin selection
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                      {tieUpPersons.map((person) => {
                        const isAssigned = srv.assigned_person_name === `${person.first_name} ${person.last_name}`

                        return (
                          <div
                            key={person.employee_id}
                            style={{
                              padding: 12,
                              borderRadius: 'var(--radius-sm)',
                              background: isAssigned ? 'var(--gold-050)' : '#fff',
                              border: isAssigned ? '2px solid var(--gold-500)' : '1px solid var(--line-200)',
                              display: 'flex',
                              flexDirection: 'column',
                              justify: 'space-between',
                              gap: 10,
                            }}
                          >
                            <div style={{ display: 'flex', gap: 10 }}>
                              <img
                                src={
                                  person.profile_image ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
                                }
                                alt={person.first_name}
                                style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cream-200)' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                                    {person.first_name} {person.last_name}
                                  </h5>
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      padding: '2px 6px',
                                      borderRadius: 10,
                                      background: 'var(--gold-100)',
                                      color: 'var(--gold-800)',
                                    }}
                                  >
                                    Tie-Up Specialist
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--gold-600)', fontWeight: 600 }}>
                                  {person.service || srv.service_name} Specialist
                                </div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--ink-500)', marginTop: 2 }}>
                                  📞 {person.phone || '9840012345'} · {person.city || 'Chennai'}
                                </div>
                              </div>
                            </div>

                            {/* Person details breakdown */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 6,
                                padding: 8,
                                background: 'var(--cream-050)',
                                borderRadius: 6,
                                fontSize: '0.74rem',
                              }}
                            >
                              <div>
                                <span className="text-muted">Experience:</span>
                                <div style={{ fontWeight: 600 }}>{person.experience_years || 5} Years</div>
                              </div>
                              <div>
                                <span className="text-muted">Completed Projects:</span>
                                <div style={{ fontWeight: 700, color: 'var(--forest-900)' }}>
                                  {person.completed_projects_count || 8} Projects
                                </div>
                              </div>
                              <div>
                                <span className="text-muted">Availability:</span>
                                <div style={{ fontWeight: 600, color: person.availability === 'Available' ? 'green' : 'orange' }}>
                                  {person.availability || 'Available'}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted">Qualification:</span>
                                <div style={{ fontWeight: 600 }}>{person.qualification || 'Certified Specialist'}</div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <PrimaryButton
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                fontSize: '0.76rem',
                                background: isAssigned ? 'var(--forest-950)' : undefined,
                              }}
                              icon={UserCheck}
                              onClick={() => handleSelectPerson(srv, person)}
                            >
                              {isAssigned ? 'Assigned Person' : 'Select & Assign This Person'}
                            </PrimaryButton>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'service_code', label: 'Service Code' },
            {
              key: 'service_name',
              label: 'Service Category',
              render: (r) => <span className="cell-primary">{r.service_name}</span>,
            },
            { key: 'project_name', label: 'Assigned Project' },
            {
              key: 'assigned_person_name',
              label: 'Assigned Specialist',
              render: (r) =>
                r.assigned_person_name ? (
                  <span style={{ fontWeight: 700, color: 'var(--forest-900)' }}>{r.assigned_person_name}</span>
                ) : (
                  <span style={{ color: 'var(--coral-500)', fontWeight: 600 }}>Unassigned</span>
                ),
            },
            { key: 'base_rate', label: 'Base Rate', render: (r) => formatCurrencyINR(r.base_rate) },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ? 'Active' : 'Inactive'} /> },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <PrimaryButton style={{ padding: '4px 10px', fontSize: '0.75rem' }} icon={UserCheck} onClick={() => setAssignModalSrv(r)}>
                  Select & Assign
                </PrimaryButton>
              ),
            },
          ]}
          rows={filtered}
          keyField="service_id"
        />
      )}

      {/* Service Person Assignment Modal */}
      {assignModalSrv && (
        <ServiceAssignmentModal
          open={Boolean(assignModalSrv)}
          onClose={() => setAssignModalSrv(null)}
          service={assignModalSrv}
          project={projects.find((p) => p.project_name === assignModalSrv.project_name || String(p.project_id) === String(assignModalSrv.project_id))}
        />
      )}
    </div>
  )
}

