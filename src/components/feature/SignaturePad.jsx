import { useRef, useState, useEffect } from 'react'
import { Pencil, Upload, Type, Eraser } from 'lucide-react'
import { Tabs } from '../ui/Feedback.jsx'
import { Input } from '../ui/Form.jsx'

// Firma digital con 3 modos: dibujar (canvas), subir imagen o escribir nombre.
export default function SignaturePad({ onChange }) {
  const [mode, setMode] = useState('draw')
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [typed, setTyped] = useState('')
  const [uploaded, setUploaded] = useState(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0a0e1a'
  }, [mode])

  const pos = (e) => {
    const c = canvasRef.current
    const rect = c.getBoundingClientRect()
    const t = e.touches?.[0]
    return {
      x: ((t ? t.clientX : e.clientX) - rect.left) * (c.width / rect.width),
      y: ((t ? t.clientY : e.clientY) - rect.top) * (c.height / rect.height),
    }
  }

  const start = (e) => {
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const move = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    onChange?.({ type: 'draw', data: canvasRef.current.toDataURL('image/png') })
  }
  const clear = () => {
    const c = canvasRef.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
    onChange?.(null)
  }

  return (
    <div className="col gap-3">
      <Tabs
        active={mode}
        onChange={(m) => {
          setMode(m)
          onChange?.(null)
        }}
        tabs={[
          { value: 'draw', label: 'Dibujar' },
          { value: 'upload', label: 'Subir imagen' },
          { value: 'type', label: 'Escribir' },
        ]}
      />

      {mode === 'draw' && (
        <div className="col gap-2">
          <canvas
            ref={canvasRef}
            width={520}
            height={170}
            className="sig-canvas"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
          <div className="row gap-2">
            <button className="btn btn--sm btn--ghost" onClick={clear} type="button">
              <Eraser size={14} /> Limpiar
            </button>
            <span className="card-sub row gap-1"><Pencil size={13} /> Dibuja tu firma con el mouse o el dedo.</span>
          </div>
        </div>
      )}

      {mode === 'upload' && (
        <div className="col gap-2">
          <label className="dropzone" style={{ padding: 20 }}>
            <div className="ic"><Upload size={20} /></div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Sube una imagen de tu firma (PNG/JPG)</div>
            <input
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const reader = new FileReader()
                reader.onload = () => {
                  setUploaded(reader.result)
                  onChange?.({ type: 'upload', data: reader.result })
                }
                reader.readAsDataURL(f)
              }}
            />
          </label>
          {uploaded && (
            <img src={uploaded} alt="Firma" style={{ maxHeight: 90, background: '#fff', borderRadius: 10, padding: 8 }} />
          )}
        </div>
      )}

      {mode === 'type' && (
        <div className="col gap-2">
          <div className="row gap-2">
            <Type size={16} className="dim" />
            <Input
              placeholder="Escribe tu nombre legal completo"
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value)
                onChange?.(e.target.value ? { type: 'typed', data: e.target.value } : null)
              }}
            />
          </div>
          {typed && (
            <div style={{ background: '#fff', borderRadius: 10, padding: '14px 18px' }}>
              <span className="sig-typed">{typed}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
