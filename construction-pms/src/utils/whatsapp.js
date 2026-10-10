/**
 * Helper utility for WhatsApp click-to-chat & group community URL generation.
 * Number is configured via VITE_WHATSAPP_NUMBER environment variable in international format without '+', spaces, or hyphens.
 * Group link is configured via VITE_WHATSAPP_GROUP_LINK environment variable.
 */

export function getWhatsAppNumber() {
  const envNumber = import.meta.env.VITE_WHATSAPP_NUMBER || ''
  return envNumber ? envNumber.replace(/[^0-9]/g, '') : ''
}

export function getWhatsAppGroupLink() {
  const envLink = import.meta.env.VITE_WHATSAPP_GROUP_LINK || ''
  if (!envLink || envLink.includes('ExampleGroupLink')) {
    return ''
  }
  return envLink
}

export function openWhatsAppGroup() {
  const link = getWhatsAppGroupLink()
  if (link) {
    window.open(link, '_blank', 'noopener,noreferrer')
    return true
  }
  return false
}

export function generateWhatsAppMessage(currentUser, customText) {
  if (customText) return customText

  if (currentUser) {
    return `Hello Admin, I am ${currentUser.name} (${currentUser.email || currentUser.phone || 'Client'}). I need assistance regarding my property/request.`
  }

  return 'Hello Admin, I need assistance regarding my property/request.'
}

export function openWhatsAppChat(currentUser, customText) {
  const cleanNumber = getWhatsAppNumber()
  const message = generateWhatsAppMessage(currentUser, customText)
  const encodedMsg = encodeURIComponent(message)
  const url = `https://wa.me/${cleanNumber}?text=${encodedMsg}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
