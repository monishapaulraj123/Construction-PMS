import { useState } from 'react'
import { Plus } from 'lucide-react'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { inspections } from '../data/mockData'
import { useToast } from '../components/ToastContext'

export default function Inspections() {
  const [reworkTarget, setReworkTarget] = useState(null)
  const showToast = useToast()

  return (
    <div>
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <PrimaryButton icon={Plus}>+ New Inspection</PrimaryButton>
      </div>
      <DataTable
        keyField="id"
        rows={inspections}
        columns={[
          { key: 'project', label: 'Project', render: (r) => <span className="cell-primary">{r.project}</span> },
          { key: 'stage', label: 'Stage' },
          { key: 'inspection_type', label: 'Inspection Type' },
          { key: 'inspector', label: 'Inspector' },
          { key: 'date', label: 'Date' },
          { key: 'quality_score', label: 'Quality Score', render: (r) => (r.quality_score ? `${r.quality_score}%` : '-') },
          {
            key: 'status',
            label: 'Status',
            render: (r) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                <StatusBadge status={r.status} />
                {r.status === 'Rework Required' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setReworkTarget(r)}>
                    Create Rework
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={!!reworkTarget}
        onClose={() => setReworkTarget(null)}
        title="Create Rework"
        footer={
          <>
            <SecondaryButton onClick={() => setReworkTarget(null)}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={() => {
                showToast('Rework task created')
                setReworkTarget(null)
              }}
            >
              Create Rework
            </PrimaryButton>
          </>
        }
      >
        {reworkTarget && (
          <div className="stack-16">
            <p style={{ fontSize: '0.88rem' }}>
              A rework task will be created for <strong>{reworkTarget.stage}</strong> on{' '}
              <strong>{reworkTarget.project}</strong>.
            </p>
            <p className="text-muted" style={{ fontSize: '0.84rem' }}>
              Issue: {reworkTarget.issue}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
