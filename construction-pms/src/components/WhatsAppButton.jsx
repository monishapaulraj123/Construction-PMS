import { useLocation } from 'react-router-dom'
import { openWhatsAppChat } from '../utils/whatsapp'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'

// WhatsApp-style Green Circular Icon SVG
function WhatsAppIcon({ size = 26, color = '#FFFFFF' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 2.152.68 4.145 1.841 5.779L2.5 21.5l3.864-1.309A9.948 9.948 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-8 10c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8a7.95 7.95 0 01-4.28-1.238l-.307-.183-2.287.775.787-2.227-.2-.317A7.953 7.953 0 014 12z"
        fill={color}
      />
    </svg>
  )
}

export default function WhatsAppButton() {
  const { currentUser } = useApp()
  const { t } = useTranslation()
  const location = useLocation()

  const role = String(currentUser?.role || '').toUpperCase()
  const isClientPath =
    location.pathname.startsWith('/client') ||
    location.pathname.startsWith('/buyer') ||
    location.pathname.startsWith('/seller')

  // Render ONLY on Client Dashboard / Client Portal.
  const isClientMode = isClientPath || role === 'CLIENT'
  if (!isClientMode) {
    return null
  }

  const handleOpenWhatsAppChat = () => {
    openWhatsAppChat(currentUser)
  }

  return (
    <button
      onClick={handleOpenWhatsAppChat}
      className="whatsapp-floating-btn"
      title={t('wa_chat_direct_admin', 'Chat Direct with Admin on WhatsApp')}
      aria-label={t('wa_chat_direct_admin', 'Chat Direct with Admin on WhatsApp')}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 92, // Positioned directly beside Chatbot floating icon
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        color: '#FFFFFF',
        border: '2px solid #ffffff',
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
        cursor: 'pointer',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <WhatsAppIcon size={28} color="#ffffff" />
    </button>
  )
}
