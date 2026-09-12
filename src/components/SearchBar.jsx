import { Search } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search...', value, onChange, className = '' }) {
  return (
    <div className={`search-bar ${className}`}>
      <Search size={16} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}
