import { UserCheck } from 'lucide-react'
import { FormInput } from '../../components/FormInputs'
import { PrimaryButton } from '../../components/Buttons'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ToastContext'

export default function SellerProfile() {
  const { currentUser } = useApp()
  const showToast = useToast()

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#16a34a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{currentUser.name || 'Santhosh Landowner'}</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>Client Role: Land Seller</div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            showToast('Seller profile updated successfully')
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <FormInput label="Full Name / Entity" defaultValue={currentUser.name || 'Santhosh Landowner'} />
            <FormInput label="Email Address" defaultValue={currentUser.email || 'santhosh@landowners.in'} />
            <FormInput label="Phone Number" defaultValue="9841029384" />
            <FormInput label="District / State" defaultValue="Chennai, Tamil Nadu" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PrimaryButton type="submit">Save Profile</PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
