/**
 * Multilingual Rule-Based Chatbot Knowledge Base & Intent Engine.
 * Supports English (en), Tamil (ta), and Hindi (hi).
 * Zero external AI APIs, LLMs, or paid dependencies.
 */

export function matchChatbotRule(query, currentUser, contextData = {}, lang = 'en') {
  if (!query || typeof query !== 'string') return null

  const normalized = query.toLowerCase().trim().replace(/[^\w\s]/gi, '')
  const role = String(currentUser?.role || '').toUpperCase()
  const isAdmin = role === 'ADMIN'

  const {
    projects = [],
    properties = [],
    buyRequests = [],
    sellRequests = [],
    transactions = [],
    clients = [],
  } = contextData

  // Multi-language quick reply dictionary
  const getQuickReplies = (keys) => {
    const dict = {
      en: {
        summary: 'Dashboard Summary',
        clients: 'Clients',
        projects: 'Projects',
        properties: 'Properties',
        pending: 'Pending Requests',
        transactions: 'Transactions',
        buy: 'Buy Property',
        sell: 'Sell Property',
        my_requests: 'My Requests',
        my_transactions: 'My Transactions',
        contact: 'Contact Support',
        available: 'Available Properties',
      },
      ta: {
        summary: 'டாஷ்போர்டு சுருக்கம்',
        clients: 'வாடிக்கையாளர்கள்',
        projects: 'திட்டங்கள்',
        properties: 'சொத்துக்கள்',
        pending: 'நிலுவை கோரிக்கைகள்',
        transactions: 'பரிவர்த்தனைகள்',
        buy: 'சொத்து வாங்குதல்',
        sell: 'சொத்து விற்பனை',
        my_requests: 'என் கோரிக்கைகள்',
        my_transactions: 'என் பரிவர்த்தனைகள்',
        contact: 'ஆதரவைத் தொடர்பு கொள்ளவும்',
        available: 'கிடைக்கும் சொத்துக்கள்',
      },
      hi: {
        summary: 'डैशबोर्ड सारांश',
        clients: 'ग्राहक',
        projects: 'परियोजनाएं',
        properties: 'संपत्तियां',
        pending: 'लंबित अनुरोध',
        transactions: 'लेनदेन',
        buy: 'संपत्ति खरीदें',
        sell: 'संपत्ति बेचें',
        my_requests: 'मेरे अनुरोध',
        my_transactions: 'मेरे लेनदेन',
        contact: 'सहायता से संपर्क करें',
        available: 'उपलब्ध संपत्तियां',
      },
    }
    const current = dict[lang] || dict.en
    return keys.map((k) => current[k] || dict.en[k] || k)
  }

  // --- ADMIN CHATBOT INTENTS ---
  if (isAdmin) {
    // 1. Dashboard Summary
    if (
      normalized.includes('summary') ||
      normalized.includes('overview') ||
      normalized.includes('சுருக்கம்') ||
      normalized.includes('सारांश')
    ) {
      const activeProjectsCount = projects.filter((p) => p.project_status !== 'Completed').length
      const pendingBuyCount = buyRequests.filter((b) => b.status !== 'Completed' && b.status !== 'Rejected').length
      const pendingSellCount = sellRequests.filter((s) => s.status !== 'Approved' && s.status !== 'Rejected').length

      let responseText = ''
      if (lang === 'ta') {
        responseText = `தற்போதைய மேலாண்மை சுருக்கம்:\n\n• 👤 **${clients.length || 3}** பதிவுசெய்த வாடிக்கையாளர்கள்\n• 🏗️ **${activeProjectsCount || projects.length || 2}** செயலில் உள்ள கட்டுமான திட்டங்கள்\n• 🏢 **${properties.length || 3}** பட்டியலிடப்பட்ட சொத்துக்கள்\n• 📥 **${pendingBuyCount || buyRequests.length || 2}** நிலுவையில் உள்ள வாங்கல் கோரிக்கைகள்\n• 📤 **${pendingSellCount || sellRequests.length || 1}** நிலுவையில் உள்ள விற்பனை கோரிக்கைகள்\n• 💳 **${transactions.length || 2}** ரியல் எஸ்டேட் பரிவர்த்தனைகள்`
      } else if (lang === 'hi') {
        responseText = `वर्तमान प्रबंधन सारांश:\n\n• 👤 **${clients.length || 3}** पंजीकृत ग्राहक\n• 🏗️ **${activeProjectsCount || projects.length || 2}** सक्रिय निर्माण परियोजनाएं\n• 🏢 **${properties.length || 3}** सूचीबद्ध संपत्तियां\n• 📥 **${pendingBuyCount || buyRequests.length || 2}** लंबित खरीद अनुरोध\n• 📤 **${pendingSellCount || sellRequests.length || 1}** लंबित बिक्री अनुरोध\n• 💳 **${transactions.length || 2}** रियल एस्टेट लेनदेन`
      } else {
        responseText = `Current Management Summary:\n\n• 👤 **${clients.length || 3}** Registered Clients\n• 🏗️ **${activeProjectsCount || projects.length || 2}** Active Construction Projects\n• 🏢 **${properties.length || 3}** Listed Properties\n• 📥 **${pendingBuyCount || buyRequests.length || 2}** Pending Buy Requests\n• 📤 **${pendingSellCount || sellRequests.length || 1}** Pending Sell Requests\n• 💳 **${transactions.length || 2}** Real Estate Transactions`
      }

      return {
        response: responseText,
        quickReplies: getQuickReplies(['projects', 'properties', 'pending', 'transactions']),
      }
    }

    // 2. Client Statistics
    if (normalized.includes('client') || normalized.includes('வாடிக்கையாளர்') || normalized.includes('ग्राहक')) {
      let responseText = ''
      if (lang === 'ta') {
        responseText = `தரவுத்தள அமைப்பில் தற்போது **${clients.length || 3}** பதிவுசெய்த வாடிக்கையாளர்கள் உள்ளனர். வாடிக்கையாளர்கள் பிரிவின் கீழ் நீங்கள் முழு விவரங்களையும் காணலாம்.`
      } else if (lang === 'hi') {
        responseText = `डेटाबेस सिस्टम में वर्तमान में **${clients.length || 3}** पंजीकृत ग्राहक हैं। आप ग्राहक अनुभाग के तहत पूर्ण विवरण देख सकते हैं।`
      } else {
        responseText = `There are currently **${clients.length || 3}** registered clients in the database system. You can view full profile details under the Clients section.`
      }

      return {
        response: responseText,
        quickReplies: getQuickReplies(['summary', 'projects', 'pending']),
      }
    }

    // 3. Project Statistics
    if (normalized.includes('project') || normalized.includes('திட்டம்') || normalized.includes('परियोजना')) {
      const active = projects.filter((p) => p.project_status !== 'Completed')
      let responseText = ''
      if (lang === 'ta') {
        responseText = `தற்போது **${active.length || projects.length || 2}** செயலில் உள்ள கட்டுமான திட்டங்கள் செயல்பாட்டில் உள்ளன.`
      } else if (lang === 'hi') {
        responseText = `वर्तमान में **${active.length || projects.length || 2}** सक्रिय निर्माण परियोजनाएं प्रगति पर हैं।`
      } else {
        responseText = `There are currently **${active.length || projects.length || 2}** active construction projects in progress.`
      }

      return {
        response: responseText,
        quickReplies: getQuickReplies(['summary', 'properties', 'pending']),
      }
    }

    // Default Admin Fallback
    let fallbackText = ''
    if (lang === 'ta') {
      fallbackText = 'மன்னிக்கவும், என்னால் இதைப் புரிந்து கொள்ள முடியவில்லை. டாஷ்போர்டு சுருக்கம், வாடிக்கையாளர்கள், திட்டங்கள் அல்லது கோரிக்கைகள் பற்றி கேட்கலாம்.'
    } else if (lang === 'hi') {
      fallbackText = 'क्षमा करें, मैं इसे समझ नहीं सका। आप मुझसे डैशबोर्ड सारांश, ग्राहक, परियोजनाएं या अनुरोध पूछ सकते हैं।'
    } else {
      fallbackText = "Sorry, I couldn't understand that. You can ask me for a Dashboard Summary, Clients, Active Projects, Available Properties, Pending Requests, or Transactions."
    }

    return {
      response: fallbackText,
      quickReplies: getQuickReplies(['summary', 'clients', 'projects', 'properties', 'pending', 'transactions']),
    }
  }

  // --- CLIENT CHATBOT INTENTS ---

  // 1. Available Properties & Location
  if (
    normalized.includes('property') ||
    normalized.includes('properties') ||
    normalized.includes('location') ||
    normalized.includes('சொத்து') ||
    normalized.includes('மனை') ||
    normalized.includes('संपत्ति')
  ) {
    if (properties && properties.length > 0) {
      const propListText = properties
        .slice(0, 3)
        .map((p) => `• **${p.property_name}** (${p.property_type || 'Land'}) - ${p.location || ''} (₹${((p.total_amount || 0) / 10000000).toFixed(2)} Cr)`)
        .join('\n')

      let headerText = 'Here are available properties from our database:'
      let footerText = 'You can browse full property details and submit a Buy Request directly from the Properties section.'

      if (lang === 'ta') {
        headerText = 'எங்கள் தரவுத்தளத்தில் இருந்து கிடைக்கும் சொத்துக்கள்:'
        footerText = 'சொத்துக்கள் பிரிவில் இருந்து நீங்கள் முழு விவரங்களையும் கண்டு வாங்கல் கோரிக்கையை சமர்ப்பிக்கலாம்.'
      } else if (lang === 'hi') {
        headerText = 'हमारे डेटाबेस से उपलब्ध संपत्तियां:'
        footerText = 'आप संपत्ति अनुभाग से पूर्ण विवरण देख सकते हैं और खरीद अनुरोध जमा कर सकते हैं।'
      }

      return {
        response: `${headerText}\n\n${propListText}\n\n${footerText}`,
        quickReplies: getQuickReplies(['buy', 'sell', 'my_requests', 'contact']),
      }
    }
  }

  // 2. Buy Property
  if (normalized.includes('buy') || normalized.includes('வாங்க') || normalized.includes('खरीद')) {
    let responseText = ''
    if (lang === 'ta') {
      responseText = 'சொத்துக்கள் பிரிவில் இருந்து கிடைக்கும் மனைகளை உலாவலாம். ஒரு மனையைத் தேர்ந்தெடுத்து உங்கள் பட்ஜெட்டுடன் வாங்கல் கோரிக்கையை சமர்ப்பிக்கவும்.'
    } else if (lang === 'hi') {
      responseText = 'आप संपत्ति अनुभाग से उपलब्ध संपत्तियों को ब्राउज़ कर सकते हैं। संपत्ति चुनें और अपने बजट के साथ खरीद अनुरोध सबमिट करें।'
    } else {
      responseText = 'You can browse available properties from the Properties section. Select a property and submit a Buy Request with your budget. You can track your request status from your Requests section.'
    }

    return {
      response: responseText,
      quickReplies: getQuickReplies(['available', 'my_requests', 'my_transactions', 'contact']),
    }
  }

  // 3. Sell Property
  if (normalized.includes('sell') || normalized.includes('விற்க') || normalized.includes('बिक्री')) {
    let responseText = ''
    if (lang === 'ta') {
      responseText = 'ரியல் எஸ்டேட் பிரிவு மூலம் நீங்கள் விற்பனை கோரிக்கையை சமர்ப்பிக்கலாம். சர்வே எண், இடம் மற்றும் பரப்பளவு விவரங்களை வழங்கவும்.'
    } else if (lang === 'hi') {
      responseText = 'आप रियल एस्टेट अनुभाग के माध्यम से बिक्री अनुरोध जमा कर सकते हैं। कृपया सर्वेक्षण संख्या, स्थान और क्षेत्र का विवरण प्रदान करें।'
    } else {
      responseText = 'You can submit a sell request through the Real Estate section. Please provide the required property details such as survey number, location, total area, and expected rate for admin review.'
    }

    return {
      response: responseText,
      quickReplies: getQuickReplies(['available', 'my_requests', 'contact']),
    }
  }

  // 4. Contact Admin / WhatsApp
  if (
    normalized.includes('contact') ||
    normalized.includes('support') ||
    normalized.includes('whatsapp') ||
    normalized.includes('தொடர்பு') ||
    normalized.includes('संपर्क')
  ) {
    let responseText = ''
    if (lang === 'ta') {
      responseText = 'உங்கள் டாஷ்போர்டில் உள்ள வாட்ஸ்அப் பொத்தானைப் பயன்படுத்தி நீங்கள் நிர்வாகியை நேரடியாகத் தொடர்பு கொள்ளலாம்.'
    } else if (lang === 'hi') {
      responseText = 'आप अपने डैशबोर्ड पर हरे रंग के व्हाट्सएप बटन का उपयोग करके सीधे एडमिन से संपर्क कर सकते हैं।'
    } else {
      responseText = 'You can contact the admin directly using the green WhatsApp communication button on your dashboard.'
    }

    return {
      response: responseText,
      quickReplies: getQuickReplies(['available', 'buy', 'sell', 'my_requests']),
    }
  }

  // General Client Fallback
  let clientFallback = ''
  if (lang === 'ta') {
    clientFallback = 'மன்னிக்கவும், என்னால் இதைப் புரிந்து கொள்ள முடியவில்லை. சொத்துக்கள், வாங்கல் கோரிக்கைகள், விற்பனை அல்லது பரிவர்த்தனைகள் பற்றி கேட்கலாம்.'
  } else if (lang === 'hi') {
    clientFallback = 'क्षमा करें, मैं इसे समझ नहीं सका। आप मुझसे संपत्तियों, खरीद अनुरोधों, बिक्री या लेनदेन के बारे में पूछ सकते हैं।'
  } else {
    clientFallback = "Sorry, I couldn't understand that. You can ask me about properties, buy requests, sell requests, transactions, projects, or support."
  }

  return {
    response: clientFallback,
    quickReplies: getQuickReplies(['available', 'buy', 'sell', 'my_requests', 'my_transactions', 'contact']),
  }
}
