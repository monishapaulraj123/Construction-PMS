export function PrimaryButton({ children, icon: Icon, className = '', ...rest }) {
  return (
    <button className={`btn btn-primary ${className}`} {...rest}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

export function SecondaryButton({ children, icon: Icon, className = '', ...rest }) {
  return (
    <button className={`btn btn-secondary ${className}`} {...rest}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

export function GhostButton({ children, icon: Icon, className = '', ...rest }) {
  return (
    <button className={`btn btn-ghost ${className}`} {...rest}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

export function DangerButton({ children, icon: Icon, className = '', ...rest }) {
  return (
    <button className={`btn btn-danger ${className}`} {...rest}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
