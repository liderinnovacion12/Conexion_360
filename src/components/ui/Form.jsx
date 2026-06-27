// Campos de formulario con validación visual.
export function Field({ label, required, error, children, hint }) {
  return (
    <div className="field">
      {label && (
        <label>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="card-sub">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function Input({ error, ...rest }) {
  return <input className="input" style={error ? { borderColor: 'var(--danger)' } : undefined} {...rest} />
}

export function Textarea({ error, ...rest }) {
  return <textarea className="textarea" style={error ? { borderColor: 'var(--danger)' } : undefined} {...rest} />
}

export function Select({ options = [], placeholder, children, ...rest }) {
  return (
    <select className="select" {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) =>
        typeof o === 'string' ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )
      )}
      {children}
    </select>
  )
}
