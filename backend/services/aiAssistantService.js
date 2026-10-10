import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  getProjects,
  getProjectDetails,
  getProjectProgress,
  getAvailableProperties,
  getPropertyDetails,
  getClientDetails,
  getClientProjects,
  getPayments,
  getPendingPayments,
  getTransactions,
  getBuyRequests,
  getSellRequests,
  getNegotiations,
  getEmployees,
  getSuppliers,
  getConstructionStages,
  getProjectBudget,
  getProjectBOQ,
  createBuyRequestAction,
  createSellRequestAction,
} from './aiTools.js'
import { createNotification } from '../controllers/notificationController.js'

// Robust Language Detection (Unicode Tamil + Tanglish / Spoken Tamil Keywords)
function isTamilText(text) {
  if (!text) return false
  const tamilUnicodeRegex = /[\u0B80-\u0BFF]/
  if (tamilUnicodeRegex.test(text)) return true

  const lower = text.toLowerCase()
  const tanglishKeywords = [
    'eppadi',
    'eppdi',
    'enoda',
    'ennoda',
    'ethana',
    'ethanai',
    'evvalavu',
    'yevvalavu',
    'irukku',
    'iruku',
    'kattunom',
    'sollo',
    'katunga',
    'panna',
    'pannanum',
    'panrathu',
    'panganum',
    'kudukanum',
    'kudukkanum',
    'kuduka',
    'enga',
    'enna',
    'vannakam',
    'vanakkam',
    'kaatu',
    'kaatunga',
    'kattu',
    'illai',
    'podu',
    'paru',
    'kaattu',
    'show pannu',
    'status enna',
    'irukanga',
    'irukkira',
    'enga poganum',
    'poganum',
    'patti',
    'paarkalam',
    'parkalam',
    'pakanum',
    'seiya',
    'seyya',
    'senju',
    'poka',
    'poga',
    'po',
  ]

  return tanglishKeywords.some((kw) => lower.includes(kw))
}

// Text Normalization & Typo Tolerance Layer
function normalizeQuery(text) {
  if (!text) return ''
  let cleaned = text.trim()
  
  // Minor spelling correction mappings & STT misrecognition fixes
  const replacements = [
    { regex: /\bprojets?\b/gi, replacement: 'projects' },
    { regex: /\bprojectss?\b/gi, replacement: 'projects' },
    { regex: /\bpaymants?\b/gi, replacement: 'payments' },
    { regex: /\btransections?\b/gi, replacement: 'transactions' },
    { regex: /\bpropetys?\b/gi, replacement: 'properties' },
    { regex: /\bsupplers?\b/gi, replacement: 'suppliers' },
    { regex: /\bserviss?\b/gi, replacement: 'services' },
    { regex: /\bplannig\b/gi, replacement: 'planning' },
    { regex: /\breqests?\b/gi, replacement: 'requests' },
  ]

  for (const item of replacements) {
    cleaned = cleaned.replace(item.regex, item.replacement)
  }

  return cleaned
}

// Format Currency INR
function formatINR(val) {
  const num = Number(val) || 0
  return '₹' + num.toLocaleString('en-IN')
}

/**
 * Main AI Assistant Handler for both Chatbot and Voice Assistant
 */
export async function processAiQuery({ query, confirmAction, actionData, user, source = 'chat' }) {
  if (!query || !query.trim()) {
    const isTa = isTamilText(query)
    return {
      text: isTa ? 'தயவுசெய்து உங்கள் கேள்வியைக் கேட்கவும்.' : 'Please enter your question.',
      lang: isTa ? 'ta' : 'en',
    }
  }

  const normalized = normalizeQuery(query)
  const lowerQuery = normalized.toLowerCase()
  const isTamil = isTamilText(normalized)
  const langCode = isTamil ? 'ta' : 'en'
  const role = String(user?.role || '').toUpperCase()
  const isAdmin = role === 'ADMIN'

  // 1. Handle Pending Action Confirmation execution
  if (confirmAction && actionData) {
    if (actionData.type === 'CREATE_BUY_REQUEST') {
      const created = await createBuyRequestAction(actionData, user)
      await createNotification({
        user_id: user?.user_id,
        title: 'Buy Request Submitted',
        message: `Buy request ${created.request_code} for ${created.property_name} was created successfully.`,
        type: 'info',
      })
      await createNotification({
        user_id: 1, // Admin
        title: 'New Buy Request Received',
        message: `Client ${user?.name || 'Client'} submitted buy request for ${created.property_name}.`,
        type: 'warning',
      })

      const successText = isTamil
        ? `வாங்குதல் கோரிக்கை ${created.request_code} (${created.property_name}) வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!`
        : `Successfully created buy request ${created.request_code} for ${created.property_name}.`

      return {
        text: successText,
        lang: langCode,
        navigateTo: isTamil ? '/client/requests' : isAdmin ? '/buy-requests' : '/client/requests',
      }
    }

    if (actionData.type === 'CREATE_SELL_REQUEST') {
      const created = await createSellRequestAction(actionData, user)
      await createNotification({
        user_id: user?.user_id,
        title: 'Sell Request Submitted',
        message: `Property sell request ${created.request_code} for ${created.property_name} submitted for verification.`,
        type: 'info',
      })
      await createNotification({
        user_id: 1,
        title: 'New Property Listing Request',
        message: `Seller ${user?.name || 'Client'} submitted ${created.property_name} for verification.`,
        type: 'warning',
      })

      const successText = isTamil
        ? `விற்பனை கோரிக்கை ${created.request_code} (${created.property_name}) வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!`
        : `Successfully submitted sell request ${created.request_code} for ${created.property_name}.`

      return {
        text: successText,
        lang: langCode,
        navigateTo: isAdmin ? '/sell-requests' : '/client/requests',
      }
    }
  }

  const isWorker = role === 'WORKER'
  const isSupervisor = role === 'SUPERVISOR'

  // 1.5 Worker Assistant Specialized Intents
  if (isWorker) {
    if (
      lowerQuery === 'hi' ||
      lowerQuery === 'hello' ||
      lowerQuery === 'hey' ||
      lowerQuery.includes('how are you') ||
      lowerQuery.includes('வணக்கம்')
    ) {
      return {
        text: isTamil
          ? 'வணக்கம்! 👋 நான் உங்கள் Worker Assistant. GPS வருகை பதிவு (Check-in/out), ஒதுக்கப்பட்ட தளம், வருகை வரலாறு அல்லது திருத்த கோரிக்கைகள் குறித்து என்னிடம் கேட்கலாம்.'
          : 'Hello! 👋 I am your Worker Assistant. Ask me about GPS attendance check-in/out, your assigned construction site, attendance history, or submitting correction requests.',
        lang: langCode,
      }
    }

    if (
      lowerQuery.includes('setting') ||
      lowerQuery.includes('profile') ||
      lowerQuery.includes('theme') ||
      lowerQuery.includes('color') ||
      lowerQuery.includes('font')
    ) {
      return {
        text: isTamil
          ? 'தீம், நிறம், எழுத்துரு அளவு அல்லது சுயவிவரத்தை மாற்ற Settings பக்கத்திற்கு செல்லவும்.'
          : 'You can change theme, color scheme, font size, or edit your personal profile (Name & Phone) on the Settings page or via "My Profile" in the top-right user menu.',
        lang: langCode,
        navigateTo: '/settings',
      }
    }

    if (
      lowerQuery.includes('check out') ||
      lowerQuery.includes('checkout') ||
      lowerQuery.includes('leaving') ||
      lowerQuery.includes('end shift')
    ) {
      return {
        text: isTamil
          ? 'Check-Out செய்ய: Site Attendance -> Spot Attendance (GPS) சென்று "Mark Check-Out" பட்டனை அழுத்தவும்.'
          : 'To mark your daily Check-Out:\n1. Open Site Attendance -> Spot Attendance (GPS) tab.\n2. Click "Mark Check-Out" to record your departure timestamp and calculate shift hours.',
        lang: langCode,
        navigateTo: '/attendance',
      }
    }

    if (
      lowerQuery.includes('check in') ||
      lowerQuery.includes('checkin') ||
      lowerQuery.includes('gps') ||
      lowerQuery.includes('geofence') ||
      lowerQuery.includes('attendance') ||
      lowerQuery.includes('mark')
    ) {
      return {
        text: isTamil
          ? 'GPS வருகை பதிவு செய்ய: Site Attendance -> Spot Attendance (GPS) சென்று "Acquire GPS" கிளிக் செய்து உங்கள் தள எல்லைக்குள் உள்ளதை உறுதிசெய்து "Mark Check-In" கொடுக்கவும்.'
          : 'To mark your daily GPS Spot Attendance:\n1. Open Site Attendance -> Spot Attendance (GPS) tab.\n2. Click "Acquire GPS" to capture your device location.\n3. Ensure you are physically inside the site geofence radius (check-in will be rejected if outside).\n4. Click "Mark Check-In".',
        lang: langCode,
        navigateTo: '/attendance',
      }
    }

    if (
      lowerQuery.includes('assigned site') ||
      lowerQuery.includes('my site') ||
      lowerQuery.includes('site') ||
      lowerQuery.includes('location')
    ) {
      return {
        text: isTamil
          ? 'உங்களுக்கு ஒதுக்கப்பட்ட கட்டுமான தளத்தின் பெயர், முகவரி, ஜியோஃபென்ஸ் ஆரம் மற்றும் மேற்பார்வையாளர் விவரங்களை Spot Attendance (GPS) தாவலில் பார்க்கலாம்.'
          : 'Your assigned construction site details (Site Name, Address, Geofence Radius, Shift Timings, and Supervisor) are displayed directly on the "Spot Attendance (GPS)" tab of the Site Attendance page.',
        lang: langCode,
        navigateTo: '/attendance',
      }
    }

    if (
      lowerQuery.includes('history') ||
      lowerQuery.includes('report') ||
      lowerQuery.includes('past attendance') ||
      lowerQuery.includes('hours')
    ) {
      return {
        text: isTamil
          ? 'உங்கள் முந்தைய வருகை விவரங்களைப் பார்க்க Site Attendance -> History & Reports தாவலுக்குச் செல்லவும்.'
          : 'To view your personal attendance history and reports:\n1. Open Site Attendance -> History & Reports tab.\n2. Review your check-in/out timestamps, hours worked, and statuses, or export a CSV report.',
        lang: langCode,
        navigateTo: '/attendance',
      }
    }

    if (
      lowerQuery.includes('correction') ||
      lowerQuery.includes('missed') ||
      lowerQuery.includes('request')
    ) {
      return {
        text: isTamil
          ? 'வருகை திருத்த கோரிக்கை சமர்ப்பிக்க: Site Attendance -> Correction Requests சென்று "+ Submit Correction Request" கிளிக் செய்து காரணம் மற்றும் நேரத்தை பதிவு செய்யவும்.'
          : 'To submit an attendance correction request:\n1. Open Site Attendance -> Correction Requests tab.\n2. Click "+ Submit Correction Request".\n3. Enter your requested check-in/out time and reason for supervisor review.',
        lang: langCode,
        navigateTo: '/attendance',
      }
    }
  }

  // 2. Greetings & Conversational Queries ("hi", "hello", "how are you")
  if (
    lowerQuery === 'hi' ||
    lowerQuery === 'hello' ||
    lowerQuery === 'hey' ||
    lowerQuery.includes('how are you') ||
    lowerQuery.includes('how r u') ||
    lowerQuery.includes('வணக்கம்') ||
    lowerQuery.includes('எப்படி இருக்கீங்க')
  ) {
    const greetingResponse = isTamil
      ? 'வணக்கம்! 👋 நான் உங்கள் கட்டுமான மற்றும் சொத்து மேலாண்மை உதவியாளராக செயல்படுகிறேன். நீங்கள் திட்டங்கள், சொத்துக்கள், செலுத்துதல்கள் அல்லது கோரிக்கைகள் பற்றி கேட்கலாம்.'
      : 'Hello! 👋 How can I help you today with active projects, available properties, or payments?'

    return {
      text: greetingResponse,
      lang: langCode,
    }
  }

  // 3. Payment Guidance & Navigation Intent
  if (
    lowerQuery.includes('payment') ||
    lowerQuery.includes('pay') ||
    lowerQuery.includes('பணம்') ||
    lowerQuery.includes('செலுத்து')
  ) {
    if (
      lowerQuery.includes('how to') ||
      lowerQuery.includes('how do i') ||
      lowerQuery.includes('how can i') ||
      lowerQuery.includes('eppadi') ||
      lowerQuery.includes('எப்படி') ||
      lowerQuery.includes('pannanum') ||
      lowerQuery.includes('panrathu')
    ) {
      if (source === 'voice') {
        const voiceText = isTamil
          ? 'இது Payments பக்கம். இங்கு உங்களின் நிலுவைத் தொகைகளைப் பார்த்து, தொகை மற்றும் கட்டண முறையைத் (UPI / NetBanking / Card) தேர்வு செய்து கட்டணம் செலுத்தலாம்.'
          : 'This is the Payments page. Here you can view your pending payments, choose your payment method, and complete your payment.'
        return {
          text: voiceText,
          lang: langCode,
          navigateTo: isAdmin ? '/payments' : '/client/payments',
        }
      } else {
        const chatText = isTamil
          ? 'Payment செய்ய: 1. Payments பக்கத்திற்கு செல்லவும். 2. நிலுவையில் உள்ள கட்டணப் பதிவைத் தேர்ந்தெடுக்கவும். 3. தொகை மற்றும் கட்டண முறையை (UPI / Net Banking / Card) தேர்வு செய்து கட்டணத்தை பூர்த்தி செய்யவும்.'
          : 'To make a payment: 1. Go to the Payments page. 2. Select the pending payment record. 3. Choose your payment method (UPI / Card / NetBanking) and complete the payment.'
        return {
          text: chatText,
          lang: langCode,
        }
      }
    }
  }

  // 4. Buy Request Guidance & Navigation Intent
  if (
    lowerQuery.includes('buy request') ||
    lowerQuery.includes('purchase request') ||
    lowerQuery.includes('வாங்கல் கோரிக்கை') ||
    lowerQuery.includes('வாங்குதல் கோரிக்கை') ||
    lowerQuery.includes('வாங்கல்')
  ) {
    if (
      lowerQuery.includes('how to') ||
      lowerQuery.includes('how do i') ||
      lowerQuery.includes('how can i') ||
      lowerQuery.includes('eppadi') ||
      lowerQuery.includes('எப்படி') ||
      lowerQuery.includes('kudukanum') ||
      lowerQuery.includes('kudukkanum') ||
      lowerQuery.includes('create') ||
      lowerQuery.includes('submit')
    ) {
      if (source === 'voice') {
        const voiceText = isTamil
          ? 'இது Buy Request பக்கம். இங்கு நீங்கள் விரும்பும் சொத்தைத் தேர்ந்தெடுத்து, பட்ஜெட் மற்றும் தேவைகளைப் பூர்த்தி செய்து "Submit Request" கொடுக்கலாம்.'
          : 'This is the Buy Request page. Here you can select a property, fill in your budget and requirements, and submit your buy request.'
        return {
          text: voiceText,
          lang: langCode,
          navigateTo: isAdmin ? '/buy-requests' : '/client/buy',
        }
      } else {
        const chatText = isTamil
          ? 'வாங்குதல் கோரிக்கை சமர்ப்பிக்க: 1. Buy Request பக்கத்திற்கு செல்லவும். 2. நீங்கள் விரும்பும் சொத்தைத் தேர்ந்தெடுக்கவும். 3. உங்கள் பட்ஜெட் மற்றும் தேவை விவரங்களை உள்ளிட்டு "Submit Request" பட்டனை அழுத்தவும். 4. நிர்வாகி சரிபார்த்து உறுதிசெய்வார்.'
          : 'To submit a buy request: 1. Navigate to the Buy Request page. 2. Select your desired property. 3. Enter your budget and requirements. 4. Click "Submit Request" for admin verification.'
        return {
          text: chatText,
          lang: langCode,
        }
      }
    }
  }

  // 5. Sell Request Guidance & Navigation Intent
  if (
    lowerQuery.includes('sell request') ||
    lowerQuery.includes('virpana') ||
    lowerQuery.includes('விற்பனை கோரிக்கை') ||
    lowerQuery.includes('விற்பனை')
  ) {
    if (
      lowerQuery.includes('how to') ||
      lowerQuery.includes('how do i') ||
      lowerQuery.includes('how can i') ||
      lowerQuery.includes('eppadi') ||
      lowerQuery.includes('எப்படி') ||
      lowerQuery.includes('kudukanum') ||
      lowerQuery.includes('kudukkanum') ||
      lowerQuery.includes('create') ||
      lowerQuery.includes('submit')
    ) {
      if (source === 'voice') {
        const voiceText = isTamil
          ? 'இது Sell Request பக்கம். இங்கு உங்கள் சொத்தின் விவரங்கள், விற்பனை விலை மற்றும் ஆவணங்களைப் பதிவேற்றி சமர்ப்பிக்கலாம்.'
          : 'This is the Sell Request page. Here you can enter your property details, asking price, upload documents, and submit your listing.'
        return {
          text: voiceText,
          lang: langCode,
          navigateTo: isAdmin ? '/sell-requests' : '/client/sell',
        }
      } else {
        const chatText = isTamil
          ? 'விற்பனை கோரிக்கை சமர்ப்பிக்க: 1. Sell Request பக்கத்திற்கு செல்லவும். 2. உங்கள் சொத்தின் பெயர், இடம் மற்றும் விற்பனை விலையை உள்ளிடவும். 3. ஆவணங்களைப் பதிவேற்றி சமர்ப்பிக்கவும்.'
          : 'To submit a sell request: 1. Go to the Sell Request page. 2. Enter your property details and asking price. 3. Upload verification documents and click submit.'
        return {
          text: chatText,
          lang: langCode,
        }
      }
    }
  }

  // 6. House Planning Guidance & Navigation Intent
  if (
    lowerQuery.includes('house plan') ||
    lowerQuery.includes('house planning') ||
    lowerQuery.includes('வீட்டு வரைபடம்')
  ) {
    if (source === 'voice') {
      const voiceText = isTamil
        ? 'House Planning பக்கத்திற்கு உங்களை அழைத்துச் செல்கிறேன். இங்கு 2D CAD வரைபடம் வரைந்து, 3D காட்சியைப் பார்த்து அறைகளை அமைத்து சேமிக்கலாம்.'
        : 'Navigating to House Planning. Here you can draw 2D CAD floor plans, customize room palettes, and inspect the 3D model view.'
      return {
        text: voiceText,
        lang: langCode,
        navigateTo: isAdmin ? '/projects' : '/client/projects',
      }
    } else {
      const chatText = isTamil
        ? 'வீட்டு வரைபடம் உருவாக்க: 1. Projects பக்கத்தில் உள்ள House Planning வசதியைத் திறக்கவும். 2. 2D CAD வரைபட தளத்தில் சுவர்கள் மற்றும் கதவுகளை வரையவும். 3. Room Palette மூலம் அறைகளை அமைத்து 3D View-ல் பார்வையிடலாம்.'
        : 'To create a house plan: 1. Open House Planning under your target project. 2. Use the 2D CAD drawing tool to layout walls and doors. 3. Assign room colors from the palette and toggle 3D View to inspect.'
      return {
        text: chatText,
        lang: langCode,
      }
    }
  }

  // 7. Project Planning & Project Creation Intent
  if (
    lowerQuery.includes('project plan') ||
    lowerQuery.includes('create project') ||
    lowerQuery.includes('create a project') ||
    lowerQuery.includes('how to create a project') ||
    lowerQuery.includes('how do i create a project') ||
    lowerQuery.includes('project creation') ||
    lowerQuery.includes('திட்டம் உருவாக்கு')
  ) {
    if (source === 'voice') {
      const voiceText = isTamil
        ? 'திட்ட உருவாக்கப் பக்கத்திற்கு உங்களை அழைத்துச் செல்கிறேன். இங்கு திட்ட விவரங்களை உள்ளிட்டு, கட்டுமான வகை மற்றும் நிலையைத் தேர்ந்தெடுத்து திட்டத்தைச் சேமிக்கலாம்.'
        : 'Navigating to Project Planning. You can enter project details, choose construction type and stage, and save your project here.'
      return {
        text: voiceText,
        lang: langCode,
        navigateTo: isAdmin ? '/projects/create' : '/client/projects',
      }
    } else {
      const chatText = isTamil
        ? 'புதிய திட்டம் உருவாக்க: 1. Projects/Project Planning பக்கத்திற்கு செல்லவும். 2. திட்ட பெயர், இடம் மற்றும் பட்ஜெட்டை உள்ளிடவும். 3. கட்டுமான வகை மற்றும் நிலையைத் தேர்ந்தெடுத்து "Save Project" கொடுக்கவும்.'
        : 'To create a project: 1. Navigate to Project Planning. 2. Enter project name, location, and budget. 3. Select construction type and stage, then click Save Project.'
      return {
        text: chatText,
        lang: langCode,
      }
    }
  }

  // Handle specific project queries like "tech park"
  if (lowerQuery.includes('tech park') || lowerQuery.includes('techpark')) {
    const projects = await getProjects({}, user)
    const techParkProj = projects.find((p) => p.project_name?.toLowerCase().includes('tech park')) || projects[0]
    if (techParkProj) {
      const resp = isTamil
        ? `'${techParkProj.project_name}' திட்டத்தின் தற்போதைய முன்னேற்றம் ${techParkProj.overall_progress_percentage}%. நிலை: ${techParkProj.construction_stage_name || 'கட்டுமானம்'}.`
        : `Project '${techParkProj.project_name}' is currently at ${techParkProj.overall_progress_percentage}% overall completion. Stage: ${techParkProj.construction_stage_name || 'In Progress'}.`
      return {
        text: resp,
        lang: langCode,
        navigateTo: isAdmin ? `/projects/${techParkProj.project_id}` : '/client/projects',
      }
    }
  }

  // 8. General Direct Navigation Mapping ("Buy Request pageக்கு போ", "Open Payments", etc.)
  const navMap = [
    { keywords: ['attendance', 'spot attendance', 'site attendance', 'workforce attendance', 'checkin', 'check in', 'site management', 'geofence', 'correction'], route: '/attendance', labelTa: 'Workforce Attendance', labelEn: 'Attendance Management' },
    { keywords: ['setting', 'settings', 'account settings', 'profile'], route: '/settings', labelTa: 'Settings', labelEn: 'Account Settings' },
    { keywords: ['buy request', 'buyrequest', 'வாங்கல் கோரிக்கை'], route: isAdmin ? '/buy-requests' : '/client/buy', labelTa: 'Buy Request', labelEn: 'Buy Request' },
    { keywords: ['sell request', 'sellrequest', 'விற்பனை கோரிக்கை'], route: isAdmin ? '/sell-requests' : '/client/sell', labelTa: 'Sell Request', labelEn: 'Sell Request' },
    { keywords: ['project planning', 'create project', 'திட்டம் உருவாக்கு'], route: isAdmin ? '/projects/create' : '/client/projects', labelTa: 'Project Planning', labelEn: 'Project Planning' },
    { keywords: ['payment', 'pay', 'செலுத்துதல்', 'பணம்'], route: isAdmin ? '/payments' : '/client/payments', labelTa: 'Payments', labelEn: 'Payments' },
    { keywords: ['project', 'திட்டம்', 'திட்டங்கள்'], route: isAdmin ? '/projects' : '/client/projects', labelTa: 'Projects', labelEn: 'Projects' },
    { keywords: ['propert', 'சொத்து', 'மனை'], route: isAdmin ? '/properties' : '/client/buy', labelTa: 'Properties', labelEn: 'Properties' },
    { keywords: ['transaction', 'பரிவர்த்தனை'], route: isAdmin ? '/transactions' : '/client/transactions', labelTa: 'Transactions', labelEn: 'Transactions' },
    { keywords: ['negotiation', 'பேச்சுவார்த்தை'], route: isAdmin ? '/negotiations' : '/client/requests', labelTa: 'Negotiations', labelEn: 'Negotiations' },
    { keywords: ['employee', 'ஊழியர்கள்'], route: '/employees', labelTa: 'Employees', labelEn: 'Employees' },
    { keywords: ['supplier', 'வழங்குநர்கள்'], route: '/suppliers', labelTa: 'Suppliers', labelEn: 'Suppliers' },
    { keywords: ['client', 'வாடிக்கையாளர்'], route: '/clients', labelTa: 'Clients', labelEn: 'Clients' },
  ]

  for (const item of navMap) {
    if (item.keywords.some((kw) => lowerQuery.includes(kw))) {
      const isNavCmd = lowerQuery.includes('go') || lowerQuery.includes('open') || lowerQuery.includes('show') || lowerQuery.includes('po') || lowerQuery.includes('poganum') || lowerQuery.includes('போ') || lowerQuery.includes('செல்ல') || lowerQuery.includes('காட்டு')
      if (isNavCmd || source === 'voice') {
        const navText = isTamil
          ? `${item.labelTa} பக்கத்திற்கு உங்களை அழைத்துச் செல்கிறேன்.`
          : `Navigating to ${item.labelEn} page.`
        return {
          text: navText,
          lang: langCode,
          navigateTo: item.route,
        }
      }
    }
  }

  // 9. Action Request Parsing (Confirmation Trigger)
  if (
    lowerQuery.includes('create buy request') ||
    lowerQuery.includes('buy property') ||
    lowerQuery.includes('i want to buy') ||
    lowerQuery.includes('வாங்க விரும்பு') ||
    lowerQuery.includes('வாங்கல் கோரிக்கை')
  ) {
    const props = await getAvailableProperties({}, user)
    if (props && props.length > 0) {
      const selectedProp = props[0]
      const confirmText = isTamil
        ? `நான் '${selectedProp.property_name}' (${formatINR(selectedProp.total_amount)}) சொத்திற்குக் கோரிக்கை உருவாக்கவா?`
        : `I found '${selectedProp.property_name}' (${formatINR(selectedProp.total_amount)}). Do you want me to create the buy request?`

      return {
        text: confirmText,
        lang: langCode,
        requiresConfirmation: true,
        pendingAction: {
          type: 'CREATE_BUY_REQUEST',
          property_id: selectedProp.property_id,
          property_name: selectedProp.property_name,
          budget: selectedProp.total_amount,
          requirements: 'Submitted via AI Assistant voice/chat',
        },
      }
    }
  }

  // 10. Database Data Intent Understanding & Tool Execution
  let toolData = null
  let intentType = ''

  if (
    lowerQuery.includes('project') ||
    lowerQuery.includes('திட்டம்') ||
    lowerQuery.includes('திட்டங்கள்')
  ) {
    if (
      lowerQuery.includes('progress') ||
      lowerQuery.includes('stage') ||
      lowerQuery.includes('முன்னேற்றம்') ||
      lowerQuery.includes('status') ||
      lowerQuery.includes('நிலை')
    ) {
      intentType = 'PROJECT_PROGRESS'
      const projects = await getProjects({}, user)
      if (projects.length > 0) {
        toolData = await getProjectProgress(projects[0].project_id, user)
      } else {
        toolData = []
      }
    } else if (
      lowerQuery.includes('budget') ||
      lowerQuery.includes('boq') ||
      lowerQuery.includes('பட்ஜெட்')
    ) {
      intentType = 'PROJECT_BUDGET'
      const projects = await getProjects({}, user)
      if (projects.length > 0) {
        toolData = await getProjectBudget(projects[0].project_id, user)
      }
    } else {
      intentType = 'PROJECTS'
      toolData = await getProjects({}, user)
    }
  } else if (
    lowerQuery.includes('propert') ||
    lowerQuery.includes('land') ||
    lowerQuery.includes('plot') ||
    lowerQuery.includes('சொத்து') ||
    lowerQuery.includes('மனை')
  ) {
    intentType = 'PROPERTIES'
    toolData = await getAvailableProperties({}, user)
  } else if (
    lowerQuery.includes('payment') ||
    lowerQuery.includes('pending payment') ||
    lowerQuery.includes('பணம்') ||
    lowerQuery.includes('செலுத்து')
  ) {
    if (lowerQuery.includes('pending') || lowerQuery.includes('நிலுவை')) {
      intentType = 'PENDING_PAYMENTS'
      toolData = await getPendingPayments({}, user)
    } else {
      intentType = 'PAYMENTS'
      toolData = await getPayments({}, user)
    }
  } else if (lowerQuery.includes('transaction') || lowerQuery.includes('பரிவர்த்தனை')) {
    intentType = 'TRANSACTIONS'
    toolData = await getTransactions({}, user)
  } else if (lowerQuery.includes('buy request') || lowerQuery.includes('purchase request') || lowerQuery.includes('வாங்கல்')) {
    intentType = 'BUY_REQUESTS'
    toolData = await getBuyRequests({}, user)
  } else if (lowerQuery.includes('sell request') || lowerQuery.includes('விற்பனை')) {
    intentType = 'SELL_REQUESTS'
    toolData = await getSellRequests({}, user)
  } else if (lowerQuery.includes('negotiation') || lowerQuery.includes('பேச்சுவார்த்தை')) {
    intentType = 'NEGOTIATIONS'
    toolData = await getNegotiations({}, user)
  } else if (lowerQuery.includes('employee') || lowerQuery.includes('worker') || lowerQuery.includes('supervisor') || lowerQuery.includes('ஊழியர்')) {
    intentType = 'EMPLOYEES'
    toolData = await getEmployees({}, user)
  } else if (lowerQuery.includes('supplier') || lowerQuery.includes('vendor') || lowerQuery.includes('வழங்குநர்')) {
    intentType = 'SUPPLIERS'
    toolData = await getSuppliers({}, user)
  } else if (lowerQuery.includes('client') || lowerQuery.includes('customer') || lowerQuery.includes('வாடிக்கையாளர்')) {
    intentType = 'CLIENTS'
    toolData = await getClientDetails(null, user)
  }

  // 11. Generate Natural Language Response using Gemini API (if key present) or Local DB Formatter
  if (toolData && process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `You are an AI Assistant for a Real Estate & Construction Management System.
User Role: ${role} (${user?.name || 'User'})
User Query: "${normalized}"
Spoken Language: ${isTamil ? 'Tamil' : 'English'}
Database Query Data: ${JSON.stringify(toolData)}

Instructions:
1. Provide a concise, clear, natural language response strictly using the Database Query Data.
2. Do NOT mention raw SQL, table names, tokens, or API credentials.
3. CRITICAL: If Spoken Language is Tamil or Tanglish, you MUST respond fluently in TAMIL text (Tamil script)!
4. If no records found, respond honestly that no matching data was found in the database.
`
      const result = await model.generateContent(prompt)
      const aiResponseText = result.response.text()
      if (aiResponseText) {
        return { text: aiResponseText.trim(), lang: langCode }
      }
    } catch (e) {
      console.error('[Gemini API Call Error - Falling back to local NLP generator]', e.message)
    }
  }

  // 12. Local DB Data Natural Language Generator (Strictly Real DB Data & Matching Language Script)
  let responseText = ''

  if (intentType === 'PROJECT_PROGRESS' && toolData) {
    if (isTamil) {
      responseText = `உங்கள் திட்டம் '${toolData.project_name}' தற்போது ${toolData.overall_progress_percentage}% நிறைவடைந்துள்ளது. தற்போதைய நிலை: ${toolData.construction_stage_name}. கண்காணிப்பாளர்: ${toolData.supervisor_name || 'பொறுப்பாளர்'}.`
    } else {
      responseText = `Your project '${toolData.project_name}' is currently at ${toolData.overall_progress_percentage}% overall completion. Current stage: ${toolData.construction_stage_name}. Site supervisor: ${toolData.supervisor_name || 'Assigned Supervisor'}.`
    }
  } else if (intentType === 'PROJECTS' && Array.isArray(toolData)) {
    if (toolData.length === 0) {
      responseText = isTamil ? 'தரவுத்தளத்தில் திட்டங்கள் எதுவும் காணப்படவில்லை.' : 'No matching projects were found in the database.'
    } else if (isTamil) {
      const listStr = toolData.map((p) => `'${p.project_name}' (${p.overall_progress_percentage}%)`).join(', ')
      responseText = `உங்களிடம் ${toolData.length} செயலாக்கத்தில் உள்ள திட்டங்கள் உள்ளன: ${listStr}.`
    } else {
      const listStr = toolData.map((p) => `'${p.project_name}' (${p.overall_progress_percentage}% complete)`).join(', ')
      responseText = `You currently have ${toolData.length} active project(s): ${listStr}.`
    }
  } else if (intentType === 'PROPERTIES' && Array.isArray(toolData)) {
    if (toolData.length === 0) {
      responseText = isTamil ? 'தற்போது சொத்துக்கள் எதுவும் இல்லை.' : 'No matching properties are currently available.'
    } else if (isTamil) {
      const propStr = toolData.slice(0, 3).map((p) => `'${p.property_name}' (${p.location}, ${formatINR(p.total_amount)})`).join(', ')
      responseText = `வாங்குவதற்கு ${toolData.length} சரிபார்க்கப்பட்ட மனைகள் உள்ளன. உதாரணம்: ${propStr}.`
    } else {
      const propStr = toolData.slice(0, 3).map((p) => `'${p.property_name}' in ${p.location} (${formatINR(p.total_amount)})`).join(', ')
      responseText = `There are ${toolData.length} available verified properties. Featured: ${propStr}.`
    }
  } else if ((intentType === 'PAYMENTS' || intentType === 'PENDING_PAYMENTS') && Array.isArray(toolData)) {
    if (toolData.length === 0) {
      responseText = isTamil ? 'நிலுவை தொகைகள் எதுவும் இல்லை.' : 'No payment records found.'
    } else {
      const totalAmt = toolData.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
      if (isTamil) {
        responseText = `${toolData.length} செலுத்துதல் பதிவுகள் கண்டறியப்பட்டன. மொத்த தொகை: ${formatINR(totalAmt)}.`
      } else {
        responseText = `Found ${toolData.length} payment record(s) totaling ${formatINR(totalAmt)}.`
      }
    }
  } else if (intentType === 'TRANSACTIONS' && Array.isArray(toolData)) {
    if (toolData.length === 0) {
      responseText = isTamil ? 'பரிவர்த்தனை பதிவுகள் எதுவும் இல்லை.' : 'No transaction records found.'
    } else if (isTamil) {
      responseText = `உங்களிடம் ${toolData.length} பரிவர்த்தனை பதிவுகள் உள்ளன. தற்போதைய பரிவர்த்தனை: ${toolData[0]?.property_name || 'நிலம்'}.`
    } else {
      responseText = `You have ${toolData.length} transaction record(s). Latest: ${toolData[0]?.property_name} (${formatINR(toolData[0]?.agreed_amount)}).`
    }
  } else if (intentType === 'BUY_REQUESTS' && Array.isArray(toolData)) {
    if (toolData.length === 0) {
      responseText = isTamil ? 'வாங்கல் கோரிக்கைகள் எதுவும் இல்லை.' : 'No buy requests found.'
    } else if (isTamil) {
      responseText = `உங்களிடம் ${toolData.length} வாங்கல் கோரிக்கைகள் உள்ளன. தற்போதைய நிலை: ${toolData[0]?.status || 'சமர்ப்பிக்கப்பட்டது'}.`
    } else {
      responseText = `You have ${toolData.length} buy request(s). Latest status for '${toolData[0]?.property_name}': ${toolData[0]?.status}.`
    }
  } else if (intentType === 'EMPLOYEES' && Array.isArray(toolData)) {
    if (isTamil) {
      responseText = `${toolData.length} ஊழியர்கள் கண்டறியப்பட்டனர். தளம் மேற்பார்வையாளர்கள் மற்றும் தொழில்நுட்ப வல்லுநர்கள் உள்ளனர்.`
    } else {
      responseText = `Retrieved ${toolData.length} active employees and site technical specialists.`
    }
  } else if (intentType === 'SUPPLIERS' && Array.isArray(toolData)) {
    if (isTamil) {
      responseText = `${toolData.length} பதிவுசெய்யப்பட்ட சப்ளையர்கள் உள்ளனர். சிமெண்ட், ஸ்டீல், எலக்ட்ரிக்கல் மற்றும் குழாய் சப்ளையர்கள்.`
    } else {
      responseText = `Retrieved ${toolData.length} verified material suppliers.`
    }
  } else {
    // Specific query clarification response matching detected language
    if (isTamil) {
      responseText = `மன்னிக்கவும், உங்கள் கோரிக்கை தெளிவாகப் புரியவில்லை. தயவுசெய்து திட்டங்கள், சொத்துக்கள், செலுத்துதல்கள் அல்லது கோரிக்கைகள் குறித்து மீண்டும் கேட்கவும்.`
    } else {
      responseText = `I couldn't clearly understand that request. Please try asking about active projects, available properties, payments, buy/sell requests, or navigation.`
    }
  }

  return { text: responseText, lang: langCode }
}
