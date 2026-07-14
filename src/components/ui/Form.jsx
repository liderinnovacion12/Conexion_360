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

// Interruptor on/off controlado (mismo lenguaje visual del Toggle de Settings,
// pero reutilizable y controlado por props `checked`/`onChange`).
export function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!checked)}
      aria-pressed={checked}
      aria-label={label}
      disabled={disabled}
      style={{
        width: 40, height: 22, borderRadius: 99, border: 'none', flexShrink: 0,
        background: checked ? 'var(--grad-teal)' : 'rgba(120,120,140,0.28)',
        position: 'relative', transition: 'background .2s',
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3, width: 16, height: 16,
          borderRadius: '50%', background: '#fff', transition: 'left .2s',
        }}
      />
    </button>
  )
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
