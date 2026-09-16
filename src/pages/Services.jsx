import { useMemo, useState } from 'react'
import { Plus, LayoutGrid, TableProperties, Wrench, UserCheck, Eye, Briefcase, Award, ChevronDown, ChevronUp } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { formatCurrencyINR } from '../utils/format'
import { useToast } from '../components/ToastContext'
import { useApp } from '../context/AppContext'
import ServiceAssignmentModal, { getTieUpPersons } from '../components/ServiceAssignmentModal'

function CompletedItemsHistory({ person, defaultService }) {
  const projectsList = person?.completed_projects_list || [
    { project_name: 'Green Valley Residence', service: person?.service || defaultService || 'Specialist Work', completed_date: 'Aug 2026', duration: '15 days', status: 'Completed' },
    { project_name: 'Sunrise Villa', service: person?.service || defaultService || 'Specialist Work', completed_date: 'Jun 2026', duration: '12 days', status: 'Completed' },
    { project_name: 'City Apartment', service: person?.service || defaultService || 'Specialist Work', completed_date: 'Apr 2026', duration: '18 days', status: 'Completed' },
  ]

  const tasksList = person?.completed_tasks_list || [
    { task_name: 'Surface preparation & leveling', project_name: 'Green Valley Residence', duration: '2 days', status: 'Completed' },
    { task_name: `${person?.service || defaultService || 'Specialist'} Work Execution`, project_name: 'Green Valley Residence', duration: '7 days', status: 'Completed' },
    { task_name: 'Finishing & Quality Sign-off', project_name: 'Sunrise Villa', duration: '3 days', status: 'Completed' },
  ]

  return (
    <div
      style={{
        marginTop: 8,
        padding: 12,
        background: 'var(--cream-050)',
        borderRadius: 8,
        border: '1px solid var(--gold-300)',
        maxHeight: 280,
        overflowY: 'auto',
      }}
    >
      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--forest-950)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        WORK HISTORY — {person?.first_name} {person?.last_name}
      </div>

      {/* Completed Projects List */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink-800)', marginBottom: 6 }}>
          Completed Projects ({projectsList.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {projectsList.map((p, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 10px',
                background: '#ffffff',
                borderRadius: 6,
                border: '1px solid var(--line-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-900)' }}>{p.project_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ink-500)', marginTop: 1 }}>
                  Service: {p.service} · Duration: {p.duration}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--ink-400)', display: 'block' }}>Completed: {p.completed_date}</span>
                <StatusBadge status={p.status || 'Completed'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Tasks List */}
      <div>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink-800)', marginBottom: 6 }}>
          Completed Tasks ({tasksList.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasksList.map((t, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 10px',
                background: '#ffffff',
                borderRadius: 6,
                border: '1px solid var(--line-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-900)' }}>{t.task_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ink-500)', marginTop: 1 }}>
                  Project: {t.project_name} · Duration: {t.duration}
                </div>
              </div>
              <StatusBadge status={t.status || 'Completed'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ServiceTieUpCard({ person, srv, isAssigned, onSelectPerson, onViewDetails }) {
  const [showHistory, setShowHistory] = useState(false)

  const projectsCount = person.completed_projects_count || (person.completed_projects_list?.length || 8)
  const tasksCount = person.completed_work_count || (person.completed_tasks_list?.length || 12)

  return (
    <div
      className="card"
      style={{
        padding: 14,
        borderRadius: 10,
        background: isAssigned ? 'var(--gold-050)' : '#ffffff',
        border: isAssigned ? '2px solid var(--gold-500)' : '1px solid var(--line-200)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      {/* Assigned Badge */}
      {isAssigned && (
        <div
          style={{
            padding: '3px 8px',
            background: 'var(--gold-500)',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 800,
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <UserCheck size={13} /> Current Assigned Person
        </div>
      )}

      {/* Profile Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <img
          src={
            person.profile_image ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
          }
          alt={`${person.first_name} ${person.last_name}`}
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cream-200)', flexShrink: 0 }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--ink-900)' }}>
              {person.first_name} {person.last_name}
            </h4>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 10,
                background: person.availability === 'Available' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: person.availability === 'Available' ? '#15803d' : '#a16207',
              }}
            >
              {person.availability || 'Available'}
            </span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--gold-600)', fontWeight: 700, marginTop: 1 }}>
            {person.service || srv.service_name} Specialist
          </div>

          <div style={{ fontSize: '0.73rem', color: 'var(--ink-500)', marginTop: 2 }}>
            📍 {person.city || 'Chennai'} · Experience: <strong>{person.experience_years || 5} Years</strong>
          </div>
        </div>
      </div>

      {/* Current Assignment Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          padding: 8,
          background: 'var(--cream-050)',
          borderRadius: 6,
          fontSize: '0.74rem',
          border: '1px solid var(--line-100)',
        }}
      >
        <div>
          <span style={{ color: 'var(--ink-400)', display: 'block', fontSize: '0.68rem' }}>Current Project:</span>
          <strong style={{ color: 'var(--ink-800)' }}>{person.current_project_name && person.current_project_name !== 'None' ? person.current_project_name : 'None'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-400)', display: 'block', fontSize: '0.68rem' }}>Current Service:</span>
          <strong style={{ color: 'var(--ink-800)' }}>{person.current_service_name || person.service || 'None'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-400)', display: 'block', fontSize: '0.68rem' }}>Current Task:</span>
          <strong style={{ color: 'var(--ink-800)' }}>{person.current_work && person.current_work !== 'None' ? person.current_work : 'None'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-400)', display: 'block', fontSize: '0.68rem' }}>Progress:</span>
          <strong style={{ color: 'var(--forest-900)' }}>{person.current_progress || 0}%</strong>
        </div>
      </div>

      {/* Summary Metrics Row with Integrated Expand Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 10px',
          background: '#ffffff',
          borderRadius: 6,
          border: showHistory ? '1.5px solid var(--gold-500)' : '1px solid var(--cream-200)',
          fontSize: '0.76rem',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--ink-500)', fontSize: '0.7rem', display: 'block' }}>Completed Projects</span>
            <strong style={{ color: 'var(--forest-900)', fontSize: '0.85rem', fontWeight: 800 }}>
              {projectsCount} Projects
            </strong>
          </div>
          <div style={{ borderLeft: '1px solid var(--line-200)', paddingLeft: 12 }}>
            <span style={{ color: 'var(--ink-500)', fontSize: '0.7rem', display: 'block' }}>Completed Tasks</span>
            <strong style={{ color: 'var(--forest-900)', fontSize: '0.85rem', fontWeight: 800 }}>
              {tasksCount} Tasks
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
            background: showHistory ? 'var(--forest-900)' : 'var(--cream-100)',
            color: showHistory ? '#ffffff' : 'var(--forest-900)',
            border: '1px solid var(--gold-400)',
            fontSize: '0.71rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {showHistory ? (
            <>
              Collapse <ChevronUp size={13} />
            </>
          ) : (
            <>
              Expand Details <ChevronDown size={13} />
            </>
          )}
        </button>
      </div>

      {/* Expandable History Section */}
      {showHistory && <CompletedItemsHistory person={person} defaultService={srv?.service_name} />}

      {/* Action Buttons (Removed View History button) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <SecondaryButton
          style={{ padding: '5px 6px', fontSize: '0.74rem', fontWeight: 700 }}
          icon={Eye}
          onClick={() => onViewDetails(person)}
        >
          View Details
        </SecondaryButton>
        <PrimaryButton
          style={{ padding: '5px 6px', fontSize: '0.74rem', fontWeight: 700, background: isAssigned ? 'var(--forest-950)' : undefined }}
          icon={UserCheck}
          onClick={() => onSelectPerson(srv, person)}
        >
          {isAssigned ? 'Assigned' : 'Select & Assign'}
        </PrimaryButton>
      </div>
    </div>
  )
}

export default function Services() {
  const { services: serviceList, projects, employees, assignServicePerson } = useApp()
  const [search, setSearch] = useState('')
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL')
  const [view, setView] = useState('card')
  const [assignModalSrv, setAssignModalSrv] = useState(null)
  const [expandedSrvId, setExpandedSrvId] = useState(null)
  const [profilePerson, setProfilePerson] = useState(null)
  const [showModalHistory, setShowModalHistory] = useState(false)
  const [confirmingAssign, setConfirmingAssign] = useState(null) // { srv, person }
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

  function handleTriggerAssign(srv, person) {
    setConfirmingAssign({ srv, person })
  }

  function handleConfirmAssignment() {
    if (!confirmingAssign) return
    const { srv, person } = confirmingAssign
    const projId = selectedProject?.project_id || srv.project_id || 1
    assignServicePerson(srv.service_id, person.employee_id, projId)
    showToast(`Successfully assigned ${person.first_name} ${person.last_name} to ${srv.service_name}`)
    setConfirmingAssign(null)
  }

  return (
    <div>
      {/* Top Filter Controls */}
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

          {/* View toggle */}
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

      {/* Selected Project Highlight Banner */}
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
            justifyContent: 'space-between',
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
            const tieUpPersons = getTieUpPersons(srv.service_name, employees)
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
                  borderRadius: 12,
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
                    padding: '12px 16px',
                    background: srv.assigned_person_name ? 'rgba(34, 197, 94, 0.08)' : 'var(--cream-050)',
                    borderRadius: 'var(--radius-sm)',
                    border: srv.assigned_person_name ? '1px solid rgba(34, 197, 94, 0.25)' : '1px dashed var(--line-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserCheck size={18} color={srv.assigned_person_name ? 'var(--forest-900)' : 'var(--coral-500)'} />
                    <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                      Assigned Service Person:
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: srv.assigned_person_name ? 'var(--forest-900)' : 'var(--coral-500)' }}>
                      {srv.assigned_person_name ? `${srv.assigned_person_name}` : 'Unassigned'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <SecondaryButton
                      style={{ fontSize: '0.8rem', padding: '6px 14px', fontWeight: 700 }}
                      onClick={() => setExpandedSrvId(isExpanded ? null : srv.service_id)}
                    >
                      {isExpanded ? 'Hide Tie-Up Persons' : `View Tie-Up Persons (${tieUpPersons.length})`}
                    </SecondaryButton>
                    <PrimaryButton
                      style={{ fontSize: '0.8rem', padding: '6px 14px', fontWeight: 700 }}
                      icon={UserCheck}
                      onClick={() => setAssignModalSrv(srv)}
                    >
                      Select & Assign Person
                    </PrimaryButton>
                  </div>
                </div>

                {/* Expanded Section: Display Tie-Up Service Persons */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 16,
                      background: 'var(--cream-050)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gold-300)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--forest-950)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Tie-Up Service Persons for {srv.service_name} ({tieUpPersons.length})
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: 2 }}>
                          Compare experience, completed projects, completed tasks, and availability to make the best assignment decision.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
                      {tieUpPersons.map((person) => {
                        const isAssigned = srv.assigned_person_name === `${person.first_name} ${person.last_name}`

                        return (
                          <ServiceTieUpCard
                            key={person.employee_id}
                            person={person}
                            srv={srv}
                            isAssigned={isAssigned}
                            onSelectPerson={handleTriggerAssign}
                            onViewDetails={(p) => setProfilePerson(p)}
                          />
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

      {/* Profile Details Modal */}
      {profilePerson && (
        <Modal
          open={Boolean(profilePerson)}
          onClose={() => setProfilePerson(null)}
          title={`Service Person Details — ${profilePerson.first_name} ${profilePerson.last_name}`}
          maxWidth={600}
        >
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <img
              src={
                profilePerson.profile_image ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
              }
              alt={profilePerson.first_name}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px auto', border: '3px solid var(--gold-500)' }}
            />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink-900)' }}>
              {profilePerson.first_name} {profilePerson.last_name}
            </h3>
            <p style={{ color: 'var(--gold-600)', fontWeight: 700, fontSize: '0.85rem', margin: '3px 0' }}>
              {profilePerson.service || 'Specialist'} Specialist
            </p>
            <p style={{ color: 'var(--ink-500)', fontSize: '0.8rem', margin: 0 }}>
              📞 {profilePerson.phone || '9840012345'} · ✉️ {profilePerson.email || 'specialist@pms.in'} · 📍 {profilePerson.city || 'Chennai'}
            </p>
          </div>

          <div className="card" style={{ padding: 16, marginBottom: 14, background: 'var(--cream-050)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--forest-950)', margin: '0 0 10px 0' }}>
              <Briefcase size={16} /> Current Assignment Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Availability State:</span>
                <div style={{ fontWeight: 700, color: profilePerson.availability === 'Available' ? 'green' : 'orange' }}>
                  {profilePerson.availability || 'Available'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Current Project:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.current_project_name && profilePerson.current_project_name !== 'None' ? profilePerson.current_project_name : 'None'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Current Service:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.current_service_name || profilePerson.service || 'None'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Current Task:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.current_work && profilePerson.current_work !== 'None' ? profilePerson.current_work : 'None'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Current Progress:</span>
                <div style={{ fontWeight: 800, color: 'var(--forest-900)' }}>{profilePerson.current_progress || 0}%</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Employment Type:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.employment_status || 'Permanent'}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16, background: 'var(--cream-050)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--forest-950)', margin: '0 0 10px 0' }}>
              <Award size={16} /> Profile & Qualification
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Experience:</span>
                <div style={{ fontWeight: 700 }}>{profilePerson.experience_years || 5} Years</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Qualification:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.qualification || 'Certified Specialist'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Completed Projects:</span>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink-900)' }}>
                  {profilePerson.completed_projects_count || (profilePerson.completed_projects_list?.length || 8)} Projects
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Completed Tasks:</span>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink-900)' }}>
                  {profilePerson.completed_work_count || (profilePerson.completed_tasks_list?.length || 12)} Tasks
                </div>
              </div>
            </div>

            {/* Expand Button inside Profile & Qualification Modal */}
            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--line-300)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-700)', fontWeight: 700 }}>
                Completed Projects & Tasks History
              </span>
              <button
                type="button"
                onClick={() => setShowModalHistory(!showModalHistory)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 12px',
                  borderRadius: 6,
                  background: showModalHistory ? 'var(--forest-900)' : 'var(--cream-100)',
                  color: showModalHistory ? '#ffffff' : 'var(--forest-900)',
                  border: '1px solid var(--gold-400)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {showModalHistory ? (
                  <>
                    Collapse Details <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Expand Details <ChevronDown size={14} />
                  </>
                )}
              </button>
            </div>

            {showModalHistory && (
              <CompletedItemsHistory person={profilePerson} defaultService={profilePerson.service} />
            )}
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <SecondaryButton onClick={() => setProfilePerson(null)}>Close Profile</SecondaryButton>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      {confirmingAssign && (
        <ConfirmationDialog
          open={Boolean(confirmingAssign)}
          onClose={() => setConfirmingAssign(null)}
          onConfirm={handleConfirmAssignment}
          title="Confirm Specialist Assignment"
          message={`Assign ${confirmingAssign.person.first_name} ${confirmingAssign.person.last_name} (${confirmingAssign.person.service || confirmingAssign.srv.service_name} Specialist) to Project: ${
            selectedProject?.project_name || confirmingAssign.srv.project_name || 'Selected Project'
          } – Service: ${confirmingAssign.srv.service_name}?`}
          confirmLabel="Confirm Assignment"
          cancelLabel="Cancel"
        />
      )}
    </div>
  )
}
