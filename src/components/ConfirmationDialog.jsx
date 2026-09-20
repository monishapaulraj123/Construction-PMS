import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import { PrimaryButton, SecondaryButton, DangerButton } from './Buttons'

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmVariant,
  children,
}) {
  const isDeleteAction =
    confirmVariant === 'danger' ||
    (confirmLabel && confirmLabel.toLowerCase().includes('delete')) ||
    (!confirmLabel && title.toLowerCase().includes('delete'))

  const labelToUse = confirmLabel || (isDeleteAction ? 'Delete' : 'Confirm')
  const ConfirmButtonComponent = isDeleteAction ? DangerButton : PrimaryButton

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <SecondaryButton onClick={onClose}>{cancelLabel}</SecondaryButton>
          <ConfirmButtonComponent onClick={onConfirm}>{labelToUse}</ConfirmButtonComponent>
        </>
      }
    >
      {children ? (
        children
      ) : (
        <>
          <div className="confirm-icon">
            <AlertTriangle size={20} />
          </div>
          <p style={{ color: 'var(--ink-700)', fontSize: '0.88rem' }}>{message || description}</p>
        </>
      )}
    </Modal>
  )
}
