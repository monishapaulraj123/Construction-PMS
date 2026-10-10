/**
 * Web Speech API Helper Utility for Voice Assistant & Text-To-Speech (TTS)
 * Supports Tamil (ta-IN) & English (en-US / en-IN).
 */

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
}

export function startListening({ onResult, onInterim, onError, onEnd, lang = 'en-US' }) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) {
      onError('Microphone permission is required to use Voice Assistant.')
    }
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = lang

  let accumulatedTranscript = ''

  recognition.onresult = (event) => {
    let currentFull = ''
    for (let i = 0; i < event.results.length; i++) {
      currentFull += event.results[i][0].transcript
    }
    accumulatedTranscript = currentFull.trim()
    if (onInterim) {
      onInterim(accumulatedTranscript)
    }
  }

  recognition.onerror = (event) => {
    let errorMsg = 'I couldn\'t understand that. Please try again.'
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      errorMsg = 'Microphone permission is required to use Voice Assistant.'
    } else if (event.error === 'no-speech') {
      errorMsg = 'I didn\'t hear anything. Please try again.'
    }
    if (onError) onError(errorMsg)
  }

  recognition.onend = () => {
    if (onEnd) onEnd(accumulatedTranscript)
  }

  try {
    recognition.start()

    // Return a controller object for caller
    return {
      rawRecognition: recognition,
      getTranscript: () => accumulatedTranscript,
      stop: () => {
        try {
          recognition.stop()
        } catch (e) {
          // Ignore stop errors if already stopped
        }
        if (onResult) {
          onResult(accumulatedTranscript)
        }
      },
    }
  } catch (err) {
    if (onError) onError('Could not start microphone listener. Please try again.')
    return null
  }
}

export function speakText(text, lang = 'en-US') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return
  }

  try {
    window.speechSynthesis.cancel() // Stop any current speech

    if (!text || !text.trim()) return

    const utterance = new SpeechSynthesisUtterance(text.trim())

    // Tamil vs English voice selection
    const isTamil = /[\u0B80-\u0BFF]/.test(text) || String(lang).startsWith('ta')
    utterance.lang = isTamil ? 'ta-IN' : 'en-US'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    // Try to find a matching voice from browser
    const voices = window.speechSynthesis.getVoices()
    if (voices && voices.length > 0) {
      const matchingVoice = voices.find((v) =>
        isTamil ? (v.lang.includes('ta') || v.lang.includes('TA')) : (v.lang.includes('en') || v.lang.includes('EN'))
      )
      if (matchingVoice) {
        utterance.voice = matchingVoice
      }
    }

    window.speechSynthesis.speak(utterance)
  } catch (e) {
    console.error('Text-to-speech error:', e)
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

