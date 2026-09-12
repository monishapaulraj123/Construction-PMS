import { CheckCircle2, ClipboardX, Hammer, RefreshCcw, ChevronRight, ArrowRight } from 'lucide-react'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { reworks } from '../data/mockData'

const workflow = [
  { label: 'Inspection Failed', icon: ClipboardX },
  { label: 'Rework Created', icon: Hammer },
  { label: 'Correction', icon: RefreshCcw },
  { label: 'Re-inspection', icon: ClipboardX },
  { label: 'Approved', icon: CheckCircle2 },
  { label: 'Next Stage', icon: ArrowRight },
]

export default function Rework() {
  return (
    <div>
      <div className="card card-pad" style={{ marginBottom: 22 }}>
        <div className="flow-row scrollbar-thin">
          {workflow.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="flow-step">
                <div className="flow-step-icon">
                  <step.icon size={19} />
                </div>
                <span>{step.label}</span>
              </div>
              {i < workflow.length - 1 && <ChevronRight size={16} className="flow-arrow" />}
            </div>
          ))}
        </div>
      </div>

      <DataTable
        keyField="id"
        rows={reworks}
        columns={[
          { key: 'inspection', label: 'Inspection' },
          { key: 'project', label: 'Project', render: (r) => <span className="cell-primary">{r.project}</span> },
          { key: 'stage', label: 'Stage' },
          { key: 'task', label: 'Task' },
          { key: 'issue', label: 'Issue' },
          { key: 'severity', label: 'Severity', render: (r) => <StatusBadge status={r.severity} /> },
          { key: 'assigned_supervisor', label: 'Assigned Supervisor' },
          { key: 'due_date', label: 'Due Date' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  )
}
