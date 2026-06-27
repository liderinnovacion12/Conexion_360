import { useRef, useState } from 'react'
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react'

// Zona de carga con drag-and-drop, validación de tipo y tamaño.
export default function FileDropzone({
  accept = 'application/pdf',
  maxSizeMB = 10,
  onFile,
  label = 'Arrastra tu archivo PDF aquí o haz clic para seleccionar',
}) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const validate = (f) => {
    setError('')
    if (accept && !accept.split(',').some((a) => f.type === a.trim())) {
      setError('Tipo de archivo no permitido. Solo se acepta PDF.')
      return false
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo supera el límite de ${maxSizeMB} MB.`)
      return false
    }
    return true
  }

  const handle = (f) => {
    if (!f) return
    if (validate(f)) {
      setFile(f)
      onFile?.(f)
    }
  }

  return (
    <div>
      <div
        className={`dropzone ${over ? 'over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          handle(e.dataTransfer.files?.[0])
        }}
      >
        <div className="ic">
          <UploadCloud size={22} />
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
        <div className="card-sub" style={{ marginTop: 4 }}>
          Formato PDF · máximo {maxSizeMB} MB
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>

      {error && <div className="field-error" style={{ marginTop: 8 }}>{error}</div>}

      {file && (
        <div className="file-pill">
          <div className="fic">
            <FileText size={16} />
          </div>
          <div className="grow">
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{file.name}</div>
            <div className="card-sub">{(file.size / 1024).toFixed(0)} KB</div>
          </div>
          <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          <button
            className="icon-btn"
            onClick={() => {
              setFile(null)
              onFile?.(null)
            }}
            aria-label="Quitar"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
