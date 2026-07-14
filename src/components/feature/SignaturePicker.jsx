import { useState } from 'react'
import { Plus, Trash2, Check, ShieldCheck } from 'lucide-react'
import Button from '../ui/Button.jsx'
import { Field, Input } from '../ui/Form.jsx'
import { AlertBanner } from '../ui/Feedback.jsx'
import Modal from '../ui/Modal.jsx'
import SignaturePad from './SignaturePad.jsx'

// Miniatura de una firma guardada.
export function SigThumb({ sig, size = 'md' }) {
  const h = size === 'sm' ? 34 : 46
  return (
    <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 6, padding: 4, overflow: 'hidden' }}>
      {sig.type === 'typed' ? (
        <span style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive", fontSize: size === 'sm' ? 18 : 24, color: '#0a0e1a' }}>{sig.data}</span>
      ) : (
        <img src={sig.data} alt={sig.label} style={{ maxHeight: h - 8, maxWidth: '100%', objectFit: 'contain' }} />
      )}
    </div>
  )
}

// Biblioteca de firmas: elegir una guardada o añadir/cargar una nueva.
export default function SignaturePicker({ library, setLibrary, active, onSelect }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(null)
  const [label, setLabel] = useState('')

  const saveToLibrary = () => {
    if (!draft) return
    const item = { id: `sig-${Date.now()}`, label: label.trim() || `Firma ${library.length + 1}`, ...draft }
    setLibrary([...library, item])
    onSelect(item)
    setOpen(false)
    setDraft(null)
    setLabel('')
  }
  const useWithoutSaving = () => {
    if (!draft) return
    onSelect({ id: 'temp', label: 'Firma temporal', ...draft })
    setOpen(false)
    setDraft(null)
  }
  const remove = (id) => {
    setLibrary(library.filter((s) => s.id !== id))
    if (active?.id === id) onSelect(null)
  }

  return (
    <div>
      <div className="row between" style={{ marginBottom: 10 }}>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>Firma a aplicar</label>
        <Button size="sm" variant="ghost" icon={Plus} onClick={() => setOpen(true)}>Añadir / cargar firma</Button>
      </div>

      {library.length === 0 ? (
        <div className="glass-soft" style={{ padding: 14, textAlign: 'center' }}>
          <span className="card-sub">No tienes firmas guardadas. Añade o carga una para reutilizarla en tus documentos.</span>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {library.map((sig) => {
            const selected = active?.id === sig.id
            return (
              <div
                key={sig.id}
                onClick={() => onSelect(sig)}
                style={{
                  cursor: 'pointer', borderRadius: 12, padding: 8,
                  border: `1px solid ${selected ? 'var(--teal)' : 'var(--glass-border)'}`,
                  boxShadow: selected ? 'var(--glow-teal)' : 'none',
                  background: 'var(--surface)',
                }}
              >
                <SigThumb sig={sig} />
                <div className="row between" style={{ marginTop: 6 }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sig.label}</span>
                  {selected ? <Check size={14} style={{ color: 'var(--teal)' }} /> : (
                    <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={(e) => { e.stopPropagation(); remove(sig.id) }} aria-label="Eliminar">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => { setOpen(false); setDraft(null) }}
        title="Añadir firma a la biblioteca"
        width={600}
        footer={
          <>
            <Button variant="ghost" onClick={useWithoutSaving} disabled={!draft}>Usar sin guardar</Button>
            <Button variant="primary" icon={ShieldCheck} onClick={saveToLibrary} disabled={!draft}>Guardar firma</Button>
          </>
        }
      >
        <div className="col gap-3">
          <AlertBanner variant="info">
            Escribe tu nombre, dibuja la firma o <b>carga una imagen</b>. Podrás reutilizarla en cualquier documento.
          </AlertBanner>
          <Field label="Nombre de la firma">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej: Firma gerencia, Firma escaneada…" />
          </Field>
          <SignaturePad onChange={setDraft} />
        </div>
      </Modal>
    </div>
  )
}
