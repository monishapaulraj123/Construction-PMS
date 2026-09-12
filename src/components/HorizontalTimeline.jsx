import React, { useState } from 'react'
import { Check, Clock, RotateCcw } from 'lucide-react'

export default function HorizontalTimeline({ stages = [], onSelect, selected }) {
  const [animKey, setAnimKey] = useState(0)

  function handleReplay() {
    setAnimKey((prev) => prev + 1)
  }

  return (
    <div className="horizontal-timeline-wrapper" key={animKey}>
      <div className="horizontal-timeline-header">
        <div className="timeline-legend">
          <span className="legend-item legend-completed">
            <span className="legend-dot completed"></span> Completed Stage (#2F5D50)
          </span>
          <span className="legend-item legend-current">
            <span className="legend-dot current"></span> Active / In Progress (#D4B06A)
          </span>
          <span className="legend-item legend-upcoming">
            <span className="legend-dot upcoming"></span> Upcoming Stage
          </span>
        </div>
        <button type="button" className="btn-replay" onClick={handleReplay} title="Replay timeline animation">
          <RotateCcw size={13} /> Replay Sequential Animation
        </button>
      </div>

      <div className="horizontal-timeline-scroll-area">
        <div className="horizontal-timeline-track-wrapper">
          {/* One straight horizontal line */}
          <div className="horizontal-timeline-line-bg">
            <div
              className="horizontal-timeline-line-fill"
              style={{
                animationDuration: `${Math.max(1.2, stages.length * 0.15)}s`,
              }}
            />
          </div>

          <div className="horizontal-timeline-grid">
            {stages.map((stage, index) => {
              const seqNumber = String(stage.stage_sequence || index + 1).padStart(2, '0')
              
              // Normalize status
              let statusType = 'upcoming'
              if (stage.status === 'completed') {
                statusType = 'completed'
              } else if (stage.status === 'current') {
                statusType = 'current'
              } else if (typeof stage.status === 'boolean') {
                if (index < 3) statusType = 'completed'
                else if (index === 3) statusType = 'current'
                else statusType = 'upcoming'
              } else if (stage.status === 'upcoming') {
                statusType = 'upcoming'
              }

              const isSelected =
                (selected && (selected.stage_id === stage.stage_id || selected.name === stage.stage_name || selected.stage_name === stage.stage_name))

              const animationDelay = `${index * 0.14}s`

              return (
                <div
                  key={stage.stage_id || stage.stage_code || index}
                  className={`timeline-col ${statusType} ${isSelected ? 'selected' : ''}`}
                  style={{ animationDelay }}
                  onClick={() => onSelect?.(stage)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Node connected to horizontal line */}
                  <div className={`timeline-node-dot ${statusType}`}>
                    {statusType === 'completed' ? (
                      <Check size={13} strokeWidth={2.8} />
                    ) : statusType === 'current' ? (
                      <span className="pulse-text">{seqNumber}</span>
                    ) : (
                      <span>{seqNumber}</span>
                    )}
                  </div>

                  {/* Stage Card */}
                  <div className={`timeline-card ${statusType}`}>
                    <div className="timeline-card-head">
                      <span className="stage-code">Stage {seqNumber}</span>
                      <span className={`status-badge-mini ${statusType}`}>
                        {statusType === 'completed' && 'Done'}
                        {statusType === 'current' && 'In Progress'}
                        {statusType === 'upcoming' && 'Upcoming'}
                      </span>
                    </div>

                    <h4 className="timeline-card-title">{stage.stage_name || stage.name}</h4>

                    {stage.description && (
                      <p className="timeline-card-desc">{stage.description}</p>
                    )}

                    <div className="timeline-card-foot">
                      {stage.estimated_duration_days && (
                        <span className="duration-tag">
                          <Clock size={12} /> {stage.estimated_duration_days} Days
                        </span>
                      )}
                      {stage.progress !== undefined && (
                        <span className="progress-tag">{stage.progress}%</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
