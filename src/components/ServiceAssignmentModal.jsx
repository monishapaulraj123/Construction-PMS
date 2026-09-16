import { useState, useMemo } from 'react'
import { UserCheck, CheckCircle2, Clock, AlertCircle, Eye, ShieldCheck, Briefcase, Award, Filter } from 'lucide-react'
import Modal from './Modal'
import ConfirmationDialog from './ConfirmationDialog'
import { PrimaryButton, SecondaryButton } from './Buttons'
import { useApp } from '../context/AppContext'
import { useToast } from './ToastContext'

export default function ServiceAssignmentModal({ open, onClose, service, project }) {
  const { employees, assignServicePerson } = useApp()
  const showToast = useToast()

  const [filterMode, setFilterMode] = useState('category') // 'category' | 'all'
  const [profilePerson, setProfilePerson] = useState(null)
  const [confirmingPerson, setConfirmingPerson] = useState(null)

  // Service-Specific Filtering: Match service category to employee specialization
  const eligiblePersons = useMemo(() => {
    if (!service) return employees
    if (filterMode === 'all') return employees

    const srvName = (service.service_name || '').toLowerCase()

    const categoryMatches = employees.filter((emp) => {
      const empSrv = (emp.service || emp.specialization || '').toLowerCase()
      const empType = (emp.employee_type_name || '').toLowerCase()

      if (srvName.includes('carpent')) return empSrv.includes('carpent') || empType.includes('carpent') || empType.includes('wood')
      if (srvName.includes('electr')) return empSrv.includes('electr') || empType.includes('electr')
      if (srvName.includes('plumb')) return empSrv.includes('plumb') || empType.includes('plumb')
      if (srvName.includes('paint')) return empSrv.includes('paint') || empType.includes('paint')
      if (srvName.includes('floor') || srvName.includes('tile')) return empSrv.includes('floor') || empSrv.includes('tile') || empSrv.includes('vitrif')
      if (srvName.includes('interior') || srvName.includes('structur')) return empSrv.includes('interior') || empSrv.includes('structur') || empType.includes('engineer')

      return empSrv.includes(srvName) || srvName.includes(empSrv)
    })

    // If no specific category match, fallback to returning available employees
    return categoryMatches.length > 0 ? categoryMatches : employees
  }, [employees, service, filterMode])

  if (!open || !service) return null

  function handleConfirmAssignment() {
    if (!confirmingPerson) return
    assignServicePerson(service.service_id, confirmingPerson.employee_id, project?.project_id || service.project_id)
    showToast(`Successfully assigned ${confirmingPerson.first_name} ${confirmingPerson.last_name} to ${service.service_name}`)
    setConfirmingPerson(null)
    onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Select & Assign Specialist for ${service.service_name}`}
        maxWidth={860}
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

        {/* Side-by-side Candidate Comparison Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 16,
            maxHeight: 480,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {eligiblePersons.map((person) => {
            const isAvailable = (person.availability || 'Available') === 'Available'
            const isCurrentlyAssigned = service.assigned_person_name === `${person.first_name} ${person.last_name}`

            return (
              <div
                key={person.employee_id}
                className="card"
                style={{
                  padding: 16,
                  border: isCurrentlyAssigned ? '2px solid var(--gold-500)' : '1px solid var(--cream-200)',
                  background: isCurrentlyAssigned ? 'var(--gold-050)' : '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <img
                      src={
                        person.profile_image ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
                      }
                      alt={person.first_name}
                      style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cream-200)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--ink-900)' }}>
                          {person.first_name} {person.last_name}
                        </h4>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: isAvailable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: isAvailable ? '#15803d' : '#a16207',
                          }}
                        >
                          {person.availability || 'Available'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gold-600)', fontWeight: 700, marginTop: 2 }}>
                        {person.service || service.service_name} Specialist
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--ink-500)', marginTop: 2 }}>
                        Experience: <strong>{person.experience_years || 5} Years</strong> · {person.qualification || 'Certified'}
                      </div>
                    </div>
                  </div>

                  {/* Work details comparison grid */}
                  <div
                    style={{
                      background: 'var(--cream-050)',
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 12,
                      fontSize: '0.78rem',
                      border: '1px solid var(--line-100)',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
                      <div>
                        <span style={{ color: 'var(--ink-500)' }}>Current Project:</span>
                        <div style={{ fontWeight: 600 }}>{person.current_project_name || 'None'}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--ink-500)' }}>Current Work:</span>
                        <div style={{ fontWeight: 600 }}>{person.current_work || 'None'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 6, borderTop: '1px dashed var(--line-200)' }}>
                      <div>
                        <span style={{ color: 'var(--ink-500)' }}>Completed Projects:</span>
                        <div style={{ fontWeight: 800, color: 'var(--forest-950)', fontSize: '0.88rem' }}>
                          {person.completed_projects_count || 8} Projects
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--ink-500)' }}>Completed Work:</span>
                        <div style={{ fontWeight: 800, color: 'var(--forest-950)', fontSize: '0.88rem' }}>
                          {person.completed_work_count || 12} Tasks
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <SecondaryButton
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem' }}
                    icon={Eye}
                    onClick={() => setProfilePerson(person)}
                  >
                    View History
                  </SecondaryButton>
                  <PrimaryButton
                    style={{ flex: 1.2, padding: '7px 10px', fontSize: '0.78rem' }}
                    icon={UserCheck}
                    onClick={() => setConfirmingPerson(person)}
                  >
                    {isCurrentlyAssigned ? 'Assigned Person' : 'Select & Assign'}
                  </PrimaryButton>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>

      {/* Person Full Profile & History Modal */}
      {profilePerson && (
        <Modal
          open={Boolean(profilePerson)}
          onClose={() => setProfilePerson(null)}
          title={`Service Person Details — ${profilePerson.first_name} ${profilePerson.last_name}`}
          maxWidth={600}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img
              src={
                profilePerson.profile_image ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
              }
              alt={profilePerson.first_name}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px auto', border: '3px solid var(--gold-500)' }}
            />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              {profilePerson.first_name} {profilePerson.last_name}
            </h3>
            <p style={{ color: 'var(--gold-600)', fontWeight: 700, fontSize: '0.85rem', margin: '2px 0' }}>
              {profilePerson.service || service.service_name} Specialist
            </p>
            <p style={{ color: 'var(--ink-500)', fontSize: '0.8rem' }}>Phone: {profilePerson.phone || '9840012345'} · City: {profilePerson.city || 'Chennai'}</p>
          </div>

          <div className="card" style={{ padding: 16, marginBottom: 16, background: 'var(--cream-050)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--forest-950)' }}>
              <Briefcase size={16} /> Active Assignment Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Availability State:</span>
                <div style={{ fontWeight: 700, color: 'var(--gold-600)' }}>{profilePerson.availability || 'Available'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Assigned Project:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.current_project_name || 'None'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Current Task:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.current_work || 'None'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Progress %:</span>
                <div style={{ fontWeight: 700 }}>{profilePerson.current_progress || 0}%</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16, background: 'var(--cream-050)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--forest-950)' }}>
              <Award size={16} /> Work & Experience History
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Completed Projects:</span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ink-900)' }}>
                  {profilePerson.completed_projects_count || 8} Projects
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Completed Tasks:</span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ink-900)' }}>
                  {profilePerson.completed_work_count || 12} Tasks
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Years Experience:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.experience_years || 5} Years</div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-500)' }}>Qualification:</span>
                <div style={{ fontWeight: 600 }}>{profilePerson.qualification || 'Certified'}</div>
              </div>
            </div>
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

      {/* Confirmation Dialog */}
      {confirmingPerson && (
        <ConfirmationDialog
          open={Boolean(confirmingPerson)}
          onClose={() => setConfirmingPerson(null)}
          onConfirm={handleConfirmAssignment}
          title="Confirm Specialist Assignment"
          message={`Assign ${confirmingPerson.first_name} ${confirmingPerson.last_name} (${confirmingPerson.service || service.service_name} Specialist) to ${
            project?.project_name || service.project_name || 'Project'
          } – ${service.service_name}?`}
          confirmLabel="Confirm Assignment"
          cancelLabel="Cancel"
        />
      )}
    </>
  )
}
