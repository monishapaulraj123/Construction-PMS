import { useState, useMemo } from 'react'
import { UserCheck, Eye, Briefcase, Award, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import Modal from './Modal'
import StatusBadge from './StatusBadge'
import { PrimaryButton, SecondaryButton } from './Buttons'
import { useApp } from '../context/AppContext'
import { useToast } from './ToastContext'
import { formatCurrencyINR } from '../utils/format'

export function getTieUpPersons(srvName, employeesList) {
  if (!srvName || !employeesList) return employeesList || []
  const lower = srvName.toLowerCase()

  return employeesList.filter((emp) => {
    const empSrv = (emp.service || emp.specialization || '').toLowerCase()
    const empType = (emp.employee_type_name || '').toLowerCase()

    if (lower.includes('carpent') || lower.includes('wood')) {
      return empSrv.includes('carpent') || empSrv.includes('wood') || empType.includes('carpent')
    }
    if (lower.includes('electr') || lower.includes('wir')) {
      return empSrv.includes('electr') || empSrv.includes('wir') || empType.includes('electr')
    }
    if (lower.includes('plumb') || lower.includes('sanitar')) {
      return empSrv.includes('plumb') || empSrv.includes('sanitar') || empSrv.includes('pipe') || empType.includes('plumb')
    }
    if (lower.includes('paint')) {
      return empSrv.includes('paint') || empSrv.includes('primer') || empSrv.includes('emulsion') || empType.includes('paint')
    }
    if (lower.includes('floor') || lower.includes('tile') || lower.includes('granite') || lower.includes('marble')) {
      return empSrv.includes('floor') || empSrv.includes('tile') || empSrv.includes('granite') || empSrv.includes('marble') || empSrv.includes('vitrif')
    }
    if (lower.includes('interior') || lower.includes('structur') || lower.includes('design')) {
      return empSrv.includes('interior') || empSrv.includes('structur') || empSrv.includes('design') || empType.includes('engineer')
    }

    return empSrv.includes(lower) || lower.includes(empSrv)
  })
}

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
        WORK HISTORY — {person?.first_name}
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

function TieUpPersonCard({ person, srv, isAssigned, onSelectPerson, onViewDetails }) {
  const [showHistory, setShowHistory] = useState(false)

  const projectsCount = person.completed_projects_count || (person.completed_projects_list?.length || 8)
  const tasksCount = person.completed_work_count || (person.completed_tasks_list?.length || 12)
  const rateValue = person.service_rate || person.serviceRate || 1500
  const rateUnitStr = person.rate_unit || person.rateUnit || 'Day'

  return (
    <div
      className="card"
      style={{
        padding: 16,
        borderRadius: 10,
        background: isAssigned ? 'var(--gold-050)' : '#ffffff',
        border: isAssigned ? '2px solid var(--gold-500)' : '1px solid var(--line-200)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Current Assigned Badge Header */}
      {isAssigned && (
        <div
          style={{
            padding: '4px 10px',
            background: 'var(--gold-500)',
            color: '#ffffff',
            fontSize: '0.72rem',
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
          <UserCheck size={14} /> Current Assigned Person
        </div>
      )}

      {/* Person Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <img
          src={
            person.profile_image ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
          }
          alt={person.first_name}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--cream-200)',
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'var(--ink-900)' }}>
              {person.first_name}{person.last_name ? ' ' + person.last_name : ''}
            </h4>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: person.availability === 'Available' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: person.availability === 'Available' ? '#15803d' : '#a16207',
              }}
            >
              {person.availability || 'Available'}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--gold-600)', fontWeight: 700, marginTop: 2 }}>
            {person.service || srv.service_name} Specialist
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--ink-500)', marginTop: 3 }}>
            📍 {person.city || 'Chennai'} · Experience: <strong>{person.experience_years || 5} Years</strong>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--forest-900)', fontWeight: 800, marginTop: 4 }}>
            Service Rate: <span style={{ color: 'var(--gold-600)' }}>{formatCurrencyINR(rateValue)} / {rateUnitStr}</span>
          </div>
        </div>
      </div>

      {/* Current Assignment Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: 10,
          background: 'var(--cream-050)',
          borderRadius: 8,
          fontSize: '0.76rem',
          border: '1px solid var(--line-100)',
        }}
      >
        <div>
          <span style={{ color: 'var(--ink-400)', display: 'block', fontSize: '0.7rem' }}>Current Project:</span>
          <strong style={{ color: 'var(--ink-800)' }}>{person.current_project_name && person.current_project_name !== 'None' ? person.current_project_name : 'None'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-400)', display: 'block', fontSize: '0.7rem' }}>Current Service:</span>
          <strong style={{ color: 'var(--ink-800)' }}>{person.current_service_name || person.service || 'None'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-400)', display: 'block', fontSize: '0.7rem' }}>Current Task:</span>
          <strong style={{ color: 'var(--ink-800)' }}>{person.current_work && person.current_work !== 'None' ? person.current_work : 'None'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--ink-400)', display: 'block', fontSize: '0.7rem' }}>Progress:</span>
          <strong style={{ color: 'var(--forest-900)' }}>{person.current_progress || 0}%</strong>
        </div>
      </div>

      {/* Summary Metrics Row with Integrated Expand Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: '#ffffff',
          borderRadius: 6,
          border: showHistory ? '1.5px solid var(--gold-500)' : '1px solid var(--cream-200)',
          fontSize: '0.78rem',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--ink-500)', fontSize: '0.7rem', display: 'block' }}>Completed Projects</span>
            <strong style={{ color: 'var(--forest-900)', fontSize: '0.88rem', fontWeight: 800 }}>
              {projectsCount} Projects
            </strong>
          </div>
          <div style={{ borderLeft: '1px solid var(--line-200)', paddingLeft: 12 }}>
            <span style={{ color: 'var(--ink-500)', fontSize: '0.7rem', display: 'block' }}>Completed Tasks</span>
            <strong style={{ color: 'var(--forest-900)', fontSize: '0.88rem', fontWeight: 800 }}>
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
            padding: '5px 10px',
            borderRadius: 6,
            background: showHistory ? 'var(--forest-900)' : 'var(--cream-100)',
            color: showHistory ? '#ffffff' : 'var(--forest-900)',
            border: '1px solid var(--gold-400)',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {showHistory ? (
            <>
              Collapse <ChevronUp size={14} />
            </>
          ) : (
            <>
              Expand Details <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {/* Expandable History Section */}
      {showHistory && <CompletedItemsHistory person={person} defaultService={srv?.service_name} />}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <SecondaryButton
          style={{ padding: '6px 8px', fontSize: '0.75rem', fontWeight: 700 }}
          icon={Eye}
          onClick={() => onViewDetails(person)}
        >
          View Details
        </SecondaryButton>
        <PrimaryButton
          style={{ padding: '6px 8px', fontSize: '0.75rem', fontWeight: 700, background: isAssigned ? 'var(--forest-950)' : undefined }}
          icon={UserCheck}
          onClick={() => onSelectPerson(srv, person)}
        >
          {isAssigned ? 'Assigned' : 'Select & Assign'}
        </PrimaryButton>
      </div>
    </div>
  )
}

export default function ServiceAssignmentModal({ open, onClose, service, project }) {
  const { employees, assignServicePerson } = useApp()
  const showToast = useToast()

  const [filterMode, setFilterMode] = useState('category') // 'category' | 'all'
  const [profilePerson, setProfilePerson] = useState(null)
  const [showModalHistory, setShowModalHistory] = useState(false)
  const [confirmingPerson, setConfirmingPerson] = useState(null)

  const eligiblePersons = useMemo(() => {
    if (!service) return employees
    if (filterMode === 'all') return employees
    return getTieUpPersons(service.service_name, employees)
  }, [employees, service, filterMode])

  if (!open || !service) return null

  function handleSelectPerson(srv, person) {
    setConfirmingPerson(person)
  }

  function handleConfirmAssignment() {
    if (!confirmingPerson) return
    assignServicePerson(service.service_id, confirmingPerson.employee_id, project?.project_id || service.project_id)
    showToast(`Successfully assigned ${confirmingPerson.first_name} to ${service.service_name}`)
    setConfirmingPerson(null)
    onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Select & Assign Specialist for ${service.service_name}`}
        maxWidth={920}
      >
        {/* Header & Filter Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            background: 'var(--cream-050)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line-200)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-900)' }}>
              Project: {project?.project_name || service.project_name || 'Selected Project'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: 2 }}>
              Service Category: <strong>{service.service_name}</strong> ({service.service_code || 'SRV'})
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'var(--cream-100)', padding: 3, borderRadius: 6 }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: filterMode === 'category' ? 'var(--paper)' : 'transparent',
                color: filterMode === 'category' ? 'var(--forest-950)' : 'var(--ink-600)',
                fontWeight: 700,
                border: 'none',
              }}
              onClick={() => setFilterMode('category')}
            >
              {service.service_name} Specialists ({eligiblePersons.length})
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: filterMode === 'all' ? 'var(--paper)' : 'transparent',
                color: filterMode === 'all' ? 'var(--forest-950)' : 'var(--ink-600)',
                fontWeight: 700,
                border: 'none',
              }}
              onClick={() => setFilterMode('all')}
            >
              All Personnel ({employees.length})
            </button>
          </div>
        </div>

        {/* Side-by-side Candidate Comparison Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: 16,
            maxHeight: 520,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {eligiblePersons.map((person) => {
            const isCurrentlyAssigned = service.assigned_person_name === person.first_name || service.assigned_person_name === `${person.first_name} ${person.last_name}`.trim()

            return (
              <TieUpPersonCard
                key={person.employee_id}
                person={person}
                srv={service}
                isAssigned={isCurrentlyAssigned}
                onSelectPerson={handleSelectPerson}
                onViewDetails={(p) => {
                  setProfilePerson(p)
                  setShowModalHistory(false)
                }}
              />
            )
          })}
        </div>
      </Modal>

      {/* Person Full Profile Modal */}
      {profilePerson && (
        <Modal
          open={Boolean(profilePerson)}
          onClose={() => setProfilePerson(null)}
          title={`Service Person Details — ${profilePerson.first_name}`}
          maxWidth={620}
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
            <h3 style={{ margin: 0, color: 'var(--ink-900)', fontSize: '1.2rem', fontWeight: 800 }}>
              {profilePerson.first_name} {profilePerson.last_name}
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--gold-600)', fontWeight: 700, fontSize: '0.88rem' }}>
              {profilePerson.service || service.service_name} Specialist
            </p>
            <p style={{ margin: '2px 0 0 0', color: 'var(--ink-500)', fontSize: '0.8rem' }}>
              📍 {profilePerson.city || 'Chennai'} · {profilePerson.email} · {profilePerson.phone}
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
                <span style={{ color: 'var(--ink-500)' }}>Service Rate:</span>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--forest-900)' }}>
                  {formatCurrencyINR(profilePerson.service_rate || profilePerson.serviceRate || 1500)} / {profilePerson.rate_unit || profilePerson.rateUnit || 'Day'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Completed Projects:</span>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--ink-900)' }}>
                  {profilePerson.completed_projects_count || (profilePerson.completed_projects_list?.length || 8)} Projects
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Completed Tasks:</span>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--ink-900)' }}>
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
              <CompletedItemsHistory person={profilePerson} defaultService={profilePerson.service || service.service_name} />
            )}
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <SecondaryButton onClick={() => setProfilePerson(null)}>Close Profile</SecondaryButton>
            <PrimaryButton
              icon={UserCheck}
              onClick={() => {
                setConfirmingPerson(profilePerson)
                setProfilePerson(null)
              }}
            >
              Select & Assign This Person
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {confirmingPerson && (
        <Modal
          open={Boolean(confirmingPerson)}
          onClose={() => setConfirmingPerson(null)}
          title="Confirm Specialist Assignment"
          maxWidth={540}
          footer={
            <>
              <SecondaryButton onClick={() => setConfirmingPerson(null)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton icon={UserCheck} onClick={handleConfirmAssignment}>
                Confirm Assignment
              </PrimaryButton>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-700)', lineHeight: 1.5 }}>
              Are you sure you want to assign this specialist to this service?
            </p>

            <div
              style={{
                padding: 14,
                background: 'var(--cream-050)',
                borderRadius: 8,
                border: '1px solid var(--gold-300)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, fontSize: '0.84rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-500)', fontWeight: 600 }}>Specialist:</span>
                <strong style={{ color: 'var(--ink-900)', fontSize: '0.9rem' }}>
                  {confirmingPerson.first_name} {confirmingPerson.last_name}
                </strong>

                <span style={{ color: 'var(--ink-500)', fontWeight: 600 }}>Service:</span>
                <strong style={{ color: 'var(--forest-950)' }}>
                  {service.service_name}
                </strong>

                <span style={{ color: 'var(--ink-500)', fontWeight: 600 }}>Service Rate:</span>
                <strong style={{ color: 'var(--forest-900)', fontSize: '0.92rem' }}>
                  {formatCurrencyINR(confirmingPerson.service_rate || confirmingPerson.serviceRate || 1500)} / {confirmingPerson.rate_unit || confirmingPerson.rateUnit || 'Day'}
                </strong>

                <span style={{ color: 'var(--ink-500)', fontWeight: 600 }}>Current Availability:</span>
                <div>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: confirmingPerson.availability === 'Available' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: confirmingPerson.availability === 'Available' ? '#15803d' : '#a16207',
                    }}
                  >
                    {confirmingPerson.availability || 'Available'}
                  </span>
                </div>
              </div>

              {confirmingPerson.availability !== 'Available' && confirmingPerson.current_project_name && confirmingPerson.current_project_name !== 'None' && (
                <div
                  style={{
                    marginTop: 6,
                    padding: '8px 10px',
                    background: 'rgba(234, 179, 8, 0.1)',
                    borderRadius: 6,
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    fontSize: '0.78rem',
                    color: '#854d0e',
                  }}
                >
                  ⚠️ <strong>Current Assignment Information:</strong> Currently assigned to <strong>{confirmingPerson.current_project_name}</strong> ({confirmingPerson.current_service_name || confirmingPerson.service || service.service_name}, Progress: {confirmingPerson.current_progress || 0}%).
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
