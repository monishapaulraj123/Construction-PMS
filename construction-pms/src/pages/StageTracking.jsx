import { useState } from 'react'
import { SelectInput } from '../components/FormInputs'
import Timeline from '../components/Timeline'
import ProgressBar from '../components/ProgressBar'
import { projects, projectStages } from '../data/mockData'

export default function StageTracking() {
  const [projectId, setProjectId] = useState(projects[0].project_id)
  const project = projects.find((p) => p.project_id === Number(projectId))
  const stages = projectStages[projectId] || projectStages[1]
  const currentStage = stages.find((s) => s.status === 'current') || stages[0]
  const [selected, setSelected] = useState(currentStage)

  return (
    <div>
      <div className="stage-select-row">
        <SelectInput
          label="Project"
          options={projects.map((p) => ({ value: p.project_id, label: p.project_name }))}
          value={projectId}
          onChange={(e) => {
            setProjectId(Number(e.target.value))
            setSelected(null)
          }}
        />
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-head">
          <div>
            <h3>{project.project_name}</h3>
            <p className="section-desc">Construction timeline · {project.construction_type_name}</p>
          </div>
        </div>
        <Timeline stages={stages} onSelect={setSelected} selected={selected} />
      </div>

      <div className="card card-pad">
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>{(selected || currentStage).name}</h3>
          {(selected || currentStage).status === 'current' && (
            <ProgressBar value={(selected || currentStage).progress} showLabel tone="green" />
          )}
          <div className="stack-16 mt-24">
            <div>
              <span className="text-muted" style={{ fontSize: '0.76rem' }}>Status</span>
              <div className="cell-primary" style={{ textTransform: 'capitalize' }}>
                {(selected || currentStage).status === 'current' ? 'In Progress' : (selected || currentStage).status}
              </div>
            </div>
            {(selected || currentStage).start && (
              <div>
                <span className="text-muted" style={{ fontSize: '0.76rem' }}>Start Date</span>
                <div className="cell-primary">{(selected || currentStage).start}</div>
              </div>
            )}
            {(selected || currentStage).end && (
              <div>
                <span className="text-muted" style={{ fontSize: '0.76rem' }}>Expected Completion</span>
                <div className="cell-primary">{(selected || currentStage).end}</div>
              </div>
            )}
            <div>
              <span className="text-muted" style={{ fontSize: '0.76rem', display: 'block', marginBottom: 8 }}>Tasks</span>
              <div className="chip-list">
                {['Column Work', 'Beam Work', 'Slab Work'].map((t) => (
                  <span className="chip" key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.76rem', display: 'block', marginBottom: 8 }}>Materials</span>
              <div className="chip-list">
                {['Cement', 'Steel', 'Sand'].map((m) => (
                  <span className="chip" key={m}>{m}</span>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--line-100)', paddingTop: 14 }}>
              <span className="text-muted" style={{ fontSize: '0.76rem' }}>Latest Supervisor Update</span>
              <p style={{ fontSize: '0.85rem', marginTop: 6 }}>
                "Structural work completed up to 65%."
              </p>
              <span className="text-muted" style={{ fontSize: '0.74rem' }}>Last Updated: Today, 04:35 PM</span>
            </div>
          </div>
        </div>
    </div>
  )
}
