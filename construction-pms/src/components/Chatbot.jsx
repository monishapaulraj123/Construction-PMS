import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, X, Send, Bot, User, Sparkles, Mic, MicOff, Check, XCircle, Volume2, VolumeX } from 'lucide-react'
import { aiAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../context/LanguageContext'
import { startListening, speakText, stopSpeaking } from '../utils/speech'
import { matchChatbotRule } from './chatbotRules'

export default function Chatbot() {
  const { currentUser, projects = [], properties = [], clients = [], buyRequests = [], sellRequests = [], transactions = [] } = useApp()
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  // Hide Chatbot on Login page or when user is not logged in
  if (!currentUser || location.pathname === '/login') {
    return null
  }

  const role = String(currentUser?.role || '').toUpperCase()
  const isAdmin = role === 'ADMIN'

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [pendingActionData, setPendingActionData] = useState(null)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Listen for navbar header toggle events
  useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev)
    const handleOpen = () => setOpen(true)
    window.toggleChatbot = handleToggle
    window.openChatbot = handleOpen
    window.addEventListener('toggle-chatbot', handleToggle)
    window.addEventListener('open-chatbot', handleOpen)
    return () => {
      window.removeEventListener('toggle-chatbot', handleToggle)
      window.removeEventListener('open-chatbot', handleOpen)
      delete window.toggleChatbot
      delete window.openChatbot
    }
  }, [])

  // Initialize clean welcome message without predefined questions
  useEffect(() => {
    const welcomeText = t(
      isAdmin ? 'chatbot_welcome_admin' : 'chatbot_welcome_client',
      isAdmin
        ? 'Hello Administrator! 👋 I am your AI Management Assistant. Ask me about active projects, payments, clients, properties, or system navigation.'
        : 'Hello! 👋 Welcome to the Construction & Real Estate Management System. Ask me about your projects, available properties, buy/sell requests, or payments.'
    )

    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: welcomeText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [language, isAdmin, t])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) {
      scrollToBottom()
    }
  }, [messages, open])

  // Process message via Backend AI Layer
  const handleSendMessage = async (textToSend, isConfirmation = false, confirmVal = false) => {
    const query = textToSend || input
    if (!query || !query.trim()) return

    const trimmed = query.trim()
    stopSpeaking()

    // 1. Add User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      // 2. Call backend AI API (DB connected tool engine)
      const res = await aiAPI.chat(trimmed, isConfirmation && confirmVal, pendingActionData, 'chat')

      setLoading(false)

      if (res && res.text) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          requiresConfirmation: res.requiresConfirmation || false,
          pendingAction: res.pendingAction || null,
        }

        if (res.pendingAction) {
          setPendingActionData(res.pendingAction)
        } else {
          setPendingActionData(null)
        }

        setMessages((prev) => [...prev, botMsg])

        // Speak AI response aloud if Speech is ON (Text-to-Speech)
        if (speechEnabled) {
          const isTamilResp = res.lang === 'ta' || /[\u0B80-\u0BFF]/.test(res.text)
          speakText(res.text, isTamilResp ? 'ta-IN' : 'en-US')
        }

        // Handle AI-powered page navigation
        if (res.navigateTo) {
          setTimeout(() => {
            navigate(res.navigateTo)
          }, 800)
        }
      }
    } catch (err) {
      setLoading(false)
      const contextData = { projects, properties, clients, buyRequests, sellRequests, transactions }
      const ruleResult = matchChatbotRule(trimmed, currentUser, contextData, language)

      const fallbackText = ruleResult?.text || (
        isAdmin
          ? "I am your AI Construction & Real Estate Assistant. Ask me for dashboard metrics, active projects, property verification, or client details!"
          : "Welcome! You can ask me about available properties, buy/sell requests, construction stage progress, or payment details."
      )

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ruleResult?.quickReplies || [],
      }

      setMessages((prev) => [...prev, botMsg])

      if (speechEnabled) {
        const isTamilResp = language === 'ta' || /[\u0B80-\u0BFF]/.test(fallbackText)
        speakText(fallbackText, isTamilResp ? 'ta-IN' : 'en-US')
      }

      if (ruleResult?.navigateTo) {
        setTimeout(() => {
          navigate(ruleResult.navigateTo)
        }, 800)
      }
    }
  }

  // Voice Speech-to-Text Microphone Handler
  const toggleVoiceInput = () => {
    setVoiceError('')
    if (isListening) {
      if (recognitionRef.current) {
        const finalText = recognitionRef.current.getTranscript()
        recognitionRef.current.stop()
        setIsListening(false)
        if (finalText && finalText.trim()) {
          setInput(finalText.trim())
          handleSendMessage(finalText.trim())
        } else {
          setVoiceError("I didn't hear anything. Please try again.")
        }
      } else {
        setIsListening(false)
      }
      return
    }

    const rec = startListening({
      lang: language === 'ta' ? 'ta-IN' : 'en-US',
      onInterim: (interimText) => {
        setInput(interimText)
      },
      onResult: (finalText) => {
        // Handled directly via second click stop() invocation
      },
      onError: (err) => {
        setVoiceError(err || "I couldn't understand that. Please try again.")
        setIsListening(false)
      },
      onEnd: (finalRecorded) => {
        if (finalRecorded) setInput(finalRecorded)
      },
    })

    if (rec) {
      recognitionRef.current = rec
      setIsListening(true)
    }
  }

  return (
    <>
      {/* Floating Chatbot Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="chatbot-toggle-btn"
        aria-label="Open Assistant Chatbot"
        title="Open Digital Assistant Chatbot"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--forest-900, #23443A) 0%, var(--forest-950, #142D26) 100%)',
          color: 'var(--gold-400, #D4B06A)',
          border: '2px solid var(--gold-500, #D4B06A)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: open ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {open ? <X size={26} color="#ffffff" /> : <MessageSquare size={26} color="var(--gold-400, #D4B06A)" />}
      </button>

      {/* Chatbot Window Panel */}
      {open && (
        <div
          className="chatbot-panel animate-scale-up"
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 'calc(100vw - 32px)',
            maxWidth: 400,
            height: 'min(550px, calc(100vh - 120px))',
            background: 'var(--cream-050, #FDFBF7)',
            borderRadius: 16,
            boxShadow: '0 18px 48px rgba(0, 0, 0, 0.28)',
            border: '1.5px solid var(--gold-400, #D4B06A)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--forest-950, #142D26) 0%, var(--forest-900, #23443A) 100%)',
              padding: '14px 18px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--gold-500, #D4B06A)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(212, 176, 106, 0.2)',
                  border: '1px solid var(--gold-400, #D4B06A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-400, #D4B06A)',
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--gold-400, #D4B06A)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{t(isAdmin ? 'chatbot_title_admin' : 'chatbot_title_client', isAdmin ? 'AI Admin Assistant' : 'AI Client Assistant')}</span>
                  <Sparkles size={13} color="var(--gold-400)" />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                  <span>{t(isAdmin ? 'chatbot_subtitle_admin' : 'chatbot_subtitle_client', isAdmin ? 'MySQL Database AI Assistant' : 'Voice & DB AI Assistant')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => {
                  if (speechEnabled) {
                    stopSpeaking()
                    setSpeechEnabled(false)
                  } else {
                    setSpeechEnabled(true)
                  }
                }}
                title={speechEnabled ? 'Speech ON (Click to Mute)' : 'Speech OFF (Click to Unmute)'}
                aria-label="Toggle Speech"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: speechEnabled ? 'var(--gold-400, #D4B06A)' : 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              <button
                onClick={() => {
                  setOpen(false)
                  stopSpeaking()
                }}
                aria-label="Close Chatbot"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Voice Error / Notice Bar */}
          {voiceError && (
            <div
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                fontSize: '0.76rem',
                padding: '6px 12px',
                borderBottom: '1px solid #fecaca',
                textAlign: 'center',
              }}
            >
              {voiceError}
            </div>
          )}

          {/* Conversation List */}
          <div
            style={{
              flex: 1,
              padding: '16px 14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              background: 'var(--cream-050, #FDFBF7)',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    maxWidth: '88%',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: msg.sender === 'user' ? 'var(--forest-900, #23443A)' : 'var(--gold-400, #D4B06A)',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--forest-950, #142D26)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: msg.sender === 'user' ? 'var(--forest-900, #23443A)' : 'var(--paper, #FFFFFF)',
                      color: msg.sender === 'user' ? '#FFFFFF' : 'var(--ink-900, #162923)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--gold-300, #E2D9CC)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      fontSize: '0.86rem',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {msg.text}

                    {/* Confirmation Dialog Buttons inside Bot Message */}
                    {msg.requiresConfirmation && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
                        <button
                          onClick={() => handleSendMessage('Yes, confirm', true, true)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Check size={14} /> Confirm
                        </button>
                        <button
                          onClick={() => handleSendMessage('No, cancel', true, false)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--ink-500, #786C5E)',
                    marginTop: 3,
                    padding: '0 4px',
                  }}
                >
                  {msg.time}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#786C5E', fontSize: '0.82rem' }}>
                <Bot size={18} color="#D4B06A" />
                <span>AI processing database query...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input & Voice Controls Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            style={{
              padding: 10,
              background: 'var(--paper, #FFFFFF)',
              borderTop: '1px solid var(--line-100, #E2D9CC)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Voice Input (Speak)'}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isListening ? '#dc2626' : 'rgba(212, 176, 106, 0.15)',
                color: isListening ? '#ffffff' : '#23443A',
                border: isListening ? 'none' : '1px solid #D4B06A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : t(
                      isAdmin ? 'chatbot_input_placeholder_admin' : 'chatbot_input_placeholder_client',
                      isAdmin ? 'Ask for projects, client stats, payments...' : 'Ask about properties, buy/sell, progress...'
                    )
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 20,
                border: '1px solid var(--line-100, #E2D9CC)',
                background: 'var(--cream-050, #FDFBF7)',
                fontSize: '0.84rem',
                color: 'var(--ink-900, #162923)',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={loading}
              aria-label="Send message"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--forest-900, #23443A)',
                color: 'var(--gold-400, #D4B06A)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
