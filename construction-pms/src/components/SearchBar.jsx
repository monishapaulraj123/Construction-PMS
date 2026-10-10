import { Search } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

export default function SearchBar({ placeholder, value, onChange, className = '' }) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder || t('search_placeholder', 'Search projects, properties, clients, materials...')

  return (
    <div className={`search-bar ${className}`}>
      <Search size={16} />
      <input
        type="text"
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}
