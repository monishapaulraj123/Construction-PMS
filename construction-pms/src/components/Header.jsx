import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, MessageSquare, ChevronDown, LogOut, User, Sun, Moon, Globe, Mic, MicOff, Volume2, X } from 'lucide-react'
import SearchBar from './SearchBar'
import NotificationPanel from './NotificationPanel'
import { getPageMeta } from '../data/pageMeta'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'
import { startListening, speakText, stopSpeaking } from '../utils/speech'
import { aiAPI } from '../services/api'

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout, theme, toggleTheme } = useApp()
  const { language, setLanguage, t, languages } = useTranslation()
  const { title, description } = getPageMeta(location.pathname, t)

  const [showNotif, setShowNotif] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Voice Assistant Push-to-Talk State
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false)
  const [showVoicePopover, setShowVoicePopover] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceResponseText, setVoiceResponseText] = useState('')
  const [voiceNotice, setVoiceNotice] = useState('')
  const recognitionRef = useRef(null)

  const handleProcessVoiceTranscript = async (queryText) => {
    setIsVoiceListening(false)

    if (!queryText || !queryText.trim()) {
      setIsVoiceProcessing(false)
      setVoiceNotice("I didn't hear anything. Please try again.")
      return
    }

    const trimmed = queryText.trim()
    setVoiceTranscript(trimmed)
    setVoiceNotice('')
    setIsVoiceProcessing(true)
    stopSpeaking()

    try {
      const res = await aiAPI.chat(trimmed, false, null, 'voice')
      setIsVoiceProcessing(false)

      if (res && res.text) {
        setVoiceResponseText(res.text)
        const isTamilResp = res.lang === 'ta' || /[\u0B80-\u0BFF]/.test(res.text)
        speakText(res.text, isTamilResp ? 'ta-IN' : 'en-US')

        if (res.navigateTo) {
          setTimeout(() => {
            navigate(res.navigateTo)
          }, 800)
        }
      } else {
        setVoiceNotice("I couldn't understand that. Please try again.")
      }
    } catch (e) {
      console.error('Voice Assistant query error:', e)
      setIsVoiceProcessing(false)
      setVoiceNotice("Could not process voice request right now. Please try again.")
    }
  }

  // Click-to-Talk / Push-to-Talk Handler
  const handleHeaderVoiceToggle = () => {
    // SECOND CLICK: Stop microphone, retrieve final accumulated speech transcript & process
    if (isVoiceListening) {
      if (recognitionRef.current) {
        const finalRecordedText = recognitionRef.current.getTranscript()
        recognitionRef.current.stop()
        handleProcessVoiceTranscript(finalRecordedText)
      } else {
        handleProcessVoiceTranscript(voiceTranscript)
      }
      return
    }

    // FIRST CLICK: SILENTLY start listening ONLY (NO automatic initial greeting or voice output)
    stopSpeaking()
    setVoiceTranscript('')
    setVoiceResponseText('')
    setVoiceNotice('')
    setShowVoicePopover(true)

    // Determine recognition language: if PMS app language is set to 'ta', use 'ta-IN', else default to 'en-US'
    const recLang = language === 'ta' ? 'ta-IN' : 'en-US'

    const rec = startListening({
      lang: recLang,
      onInterim: (interimText) => {
        setVoiceTranscript(interimText)
      },
      onResult: (finalText) => {
        // Handled directly via second click stop() invocation
      },
      onError: (err) => {
        setIsVoiceListening(false)
        setIsVoiceProcessing(false)
        setVoiceNotice(err || "I couldn't understand that. Please try again.")
      },
      onEnd: (finalRecorded) => {
        // Do not auto-submit on random silence end; retain accumulated transcript until user clicks stop
        if (finalRecorded) {
          setVoiceTranscript(finalRecorded)
        }
      },
    })

    if (rec) {
      recognitionRef.current = rec
      setIsVoiceListening(true)
    }
  }

  const handleLogout = () => {
    logout()
    setShowUserDropdown(false)
    navigate('/login')
  }

  const userRole = String(currentUser?.role || '').toUpperCase()

  return (
    <header className="app-header" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <button className="icon-btn menu-toggle" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="app-header-title">
          {location.pathname === '/' || location.pathname === '/dashboard' || (title && String(title).includes('Construction & Real Estate')) ? (
            <h2 className="dashboard-header-title">
              <span className="title-line-1">Construction &amp; Real Estate</span>
              <span className="title-line-2">Dashboard</span>
            </h2>
          ) : (
            <h2>{title}</h2>
          )}
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      <div className="app-header-search">
        <SearchBar placeholder={t('search_placeholder', 'Search projects, properties, clients, materials...')} />
      </div>

      <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Language Selector Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--cream-100, rgba(0,0,0,0.04))', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border-color, #E2D9CC)' }}>
          <Globe size={15} color="var(--forest-700, #2F5D50)" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--ink-900, #162923)',
              cursor: 'pointer',
              outline: 'none',
              padding: '2px 0',
            }}
            aria-label="Select Language"
          >
            {languages.map((opt) => (
              <option key={opt.code} value={opt.code} style={{ background: 'var(--card-bg, #FFF)', color: '#000' }}>
                {opt.native} ({opt.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Theme Toggle Button */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('switch_to_light', 'Switch to Light Theme') : t('switch_to_dark', 'Switch to Dark Theme')}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} color="#D4B06A" /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="header-pop-wrap">
          <button className="icon-btn" onClick={() => setShowNotif((s) => !s)} aria-label="Notifications">
            <Bell size={17} />
            <span className="dot" />
          </button>
          {showNotif && <NotificationPanel />}
        </div>

        {/* Voice Assistant Push-to-Talk Header Control */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={handleHeaderVoiceToggle}
            title={
              isVoiceListening
                ? 'Listening... Click again to stop & process'
                : isVoiceProcessing
                ? 'Processing...'
                : t('voice_assistant', 'Voice Assistant (Click to talk)')
            }
            aria-label="Voice Assistant"
            style={{
              background: isVoiceListening ? '#dc2626' : isVoiceProcessing ? 'var(--gold-500)' : 'transparent',
              color: isVoiceListening || isVoiceProcessing ? '#ffffff' : 'inherit',
              borderColor: isVoiceListening ? '#dc2626' : 'var(--line-100)',
              transition: 'all 0.2s ease',
              boxShadow: isVoiceListening ? '0 0 12px rgba(220, 38, 38, 0.5)' : 'none',
            }}
          >
            {isVoiceListening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          {/* Minimal Voice Status Popover */}
          {showVoicePopover && (
            <div
              className="card animate-fade-slide"
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 320,
                padding: '14px 16px',
                zIndex: 1000,
                boxShadow: 'var(--shadow-pop, 0 12px 32px rgba(0,0,0,0.22))',
                background: 'var(--paper)',
                border: '1.5px solid var(--gold-500)',
                borderRadius: 'var(--radius-md, 12px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--forest-950)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mic size={15} color="var(--gold-600)" />
                  <span>Voice Assistant</span>
                </div>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--ink-500)', cursor: 'pointer', padding: 2 }}
                  onClick={() => {
                    setShowVoicePopover(false)
                    stopSpeaking()
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {isVoiceListening && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--gold-050)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--gold-500)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.2s infinite' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--forest-950)' }}>
                    Listening... Speak and click mic again to process
                  </span>
                </div>
              )}

              {isVoiceProcessing && (
                <div style={{ fontSize: '0.82rem', color: 'var(--forest-900)', fontWeight: 600, padding: '8px 0' }}>
                  Processing voice request...
                </div>
              )}

              {voiceNotice && !isVoiceListening && !isVoiceProcessing && (
                <div style={{ fontSize: '0.8rem', color: 'var(--amber-600)', background: 'var(--amber-100)', padding: '8px 10px', borderRadius: 6, fontWeight: 600 }}>
                  {voiceNotice}
                </div>
              )}

              {voiceTranscript && (
                <div style={{ marginTop: 8, fontSize: '0.82rem', background: 'var(--cream-100)', padding: '8px 10px', borderRadius: 6, color: 'var(--ink-900)' }}>
                  <strong>You:</strong> "{voiceTranscript}"
                </div>
              )}

              {voiceResponseText && (
                <div style={{ marginTop: 8, fontSize: '0.82rem', background: 'var(--sand-100)', padding: '10px', borderRadius: 6, color: 'var(--forest-950)', lineHeight: 1.45 }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--gold-600)' }}>
                    <Volume2 size={14} /> Assistant:
                  </strong>
                  {voiceResponseText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chatbot Trigger Button */}
        <button
          className="icon-btn"
          title={t('ai_chatbot', 'AI Assistant Chatbot')}
          aria-label="AI Assistant Chatbot"
          onClick={() => {
            if (typeof window.toggleChatbot === 'function') {
              window.toggleChatbot()
            } else {
              window.dispatchEvent(new CustomEvent('toggle-chatbot'))
            }
          }}
        >
          <MessageSquare size={17} />
        </button>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserDropdown((s) => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}
          >
            <div
              className="sidebar-user-avatar"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#F5F0E6',
                color: '#2F5D50',
                border: '1.5px solid #D4B06A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0,
              }}
            >
              {(currentUser?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="hide-on-mobile" style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{currentUser?.name ? currentUser.name.split(' ')[0] : t('administrator', 'Administrator')}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>
                {t('role', 'Role')}: <strong>{userRole || 'ADMIN'}</strong>
              </div>
            </div>
            <ChevronDown size={15} color="var(--ink-500)" />
          </div>

          {showUserDropdown && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: 220,
                padding: 10,
                zIndex: 100,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                {currentUser?.name}
              </div>
              <div style={{ padding: '0 10px 8px 10px', fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                {currentUser?.email}
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--line-100)', margin: '4px 0 8px 0' }} />

              {userRole === 'CLIENT' && (
                <button
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: 8,
                    fontSize: '0.82rem',
                    padding: '8px 10px',
                    marginBottom: 4,
                  }}
                  onClick={() => {
                    setShowUserDropdown(false)
                    navigate('/client/profile')
                  }}
                >
                  <User size={15} /> {t('my_client_profile', 'My Client Profile')}
                </button>
              )}

              <button
                className="btn btn-logout"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  gap: 8,
                  fontSize: '0.82rem',
                  padding: '8px 10px',
                }}
                onClick={handleLogout}
              >
                <LogOut size={15} /> {t('sign_out', 'Sign Out')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
