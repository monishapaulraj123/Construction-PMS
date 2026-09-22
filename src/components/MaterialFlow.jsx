import { ClipboardList, Truck, FileSpreadsheet, CheckCircle2, ShoppingCart, PackageCheck, Warehouse, HardHat } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

const steps = [
  { label: 'Supervisor Request', icon: ClipboardList },
  { label: 'Supplier Availability', icon: Truck },
  { label: 'Quotation', icon: FileSpreadsheet },
  { label: 'Admin Approval', icon: CheckCircle2 },
  { label: 'Order', icon: ShoppingCart },
  { label: 'Delivery', icon: PackageCheck },
  { label: 'Inventory', icon: Warehouse },
  { label: 'Material Usage', icon: HardHat },
]

export default function MaterialFlow() {  
  return (
    <div className="card card-pad" style={{ marginBottom: 22 }}>
      <div className="flow-row scrollbar-thin">
        {steps.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="flow-step">
              <div className="flow-step-icon">
                <step.icon size={19} />
              </div>
              <span>{step.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={16} className="flow-arrow" />}
          </div>
        ))}
      </div>
    </div>
  )
}
