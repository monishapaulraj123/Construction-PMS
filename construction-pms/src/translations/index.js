import { en } from './en'
import { ta } from './ta'
import { hi } from './hi'

export const translations = {
  en,
  ta,
  hi,
}

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
]

export function getTranslation(lang, key, fallback = '') {
  const currentDict = translations[lang] || translations.en
  if (currentDict && currentDict[key] !== undefined) {
    return currentDict[key]
  }
  if (translations.en && translations.en[key] !== undefined) {
    return translations.en[key]
  }
  return fallback || key
}
