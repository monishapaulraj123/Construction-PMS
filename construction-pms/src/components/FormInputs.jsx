export function FormInput({ label, full, type = 'text', ...rest }) {
  return (
    <div className={`form-field ${full ? 'full' : ''}`}>
      <label>{label}</label>
      {type === 'textarea' ? <textarea {...rest} /> : <input type={type} {...rest} />}
    </div>
  )
}

export function SelectInput({ label, options = [], full, ...rest }) {
  return (
    <div className={`form-field ${full ? 'full' : ''}`}>
      <label>{label}</label>
      <select {...rest}>
        <option value="">Select {label?.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export function DateInput({ label, full, ...rest }) {
  return (
    <div className={`form-field ${full ? 'full' : ''}`}>
      <label>{label}</label>
      <input type="date" {...rest} />
    </div>
  )
}
