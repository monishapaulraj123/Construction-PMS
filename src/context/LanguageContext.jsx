import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations, getTranslation, LANGUAGE_OPTIONS } from '../translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('cpms_language')
      if (saved === 'ta' || saved === 'hi' || saved === 'en') {
        return saved
      }
      if (saved === 'Tamil') return 'ta'
      if (saved === 'Hindi') return 'hi'
      if (saved === 'English') return 'en'
    } catch (e) {
      console.error('Error reading cpms_language from localStorage', e)
    }
    return 'en'
  })

  const setLanguage = useCallback((newLang) => {
    let normalized = newLang
    if (newLang === 'Tamil') normalized = 'ta'
    else if (newLang === 'Hindi') normalized = 'hi'
    else if (newLang === 'English') normalized = 'en'

    if (['en', 'ta', 'hi'].includes(normalized)) {
      setLanguageState(normalized)
      try {
        localStorage.setItem('cpms_language', normalized)
      } catch (e) {
        console.error('Error saving cpms_language to localStorage', e)
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('cpms_language', language)
    } catch (e) {}
  }, [language])

  const t = useCallback(
    (key, fallback = '') => {
      return getTranslation(language, key, fallback)
    },
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
