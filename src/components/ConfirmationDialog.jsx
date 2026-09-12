import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import { SecondaryButton, DangerButton } from './Buttons'

export default function ConfirmationDialog({ open, onClose, onConfirm, title = 'Are you sure?', description }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <DangerButton onClick={onConfirm}>Delete</DangerButton>
        </>
      }
    >
      <div className="confirm-icon">
        <AlertTriangle size={20} />
      </div>
      <p style={{ color: 'var(--ink-700)', fontSize: '0.88rem' }}>{description}</p>
    </Modal>
  )
}
