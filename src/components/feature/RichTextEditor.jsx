import { useRef, useEffect } from 'react'
import {
  Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, Type,
} from 'lucide-react'

// Editor WYSIWYG ligero basado en contentEditable. Sin dependencias externas.
export default function RichTextEditor({ value = '', onChange, disabled }) {
  const ref = useRef(null)

  // Carga inicial del contenido (no en cada render para no mover el cursor).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exec = (cmd, arg) => {
    if (disabled) return
    ref.current?.focus()
    document.execCommand(cmd, false, arg)
    onChange?.(ref.current.innerHTML)
  }

  const Btn = ({ cmd, arg, icon: Icon, label }) => (
    <button
      type="button"
      className="rte-btn"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); exec(cmd, arg) }}
    >
      <Icon size={16} />
    </button>
  )

  return (
    <div className={`rte ${disabled ? 'rte--disabled' : ''}`}>
      <div className="rte-toolbar">
        <Btn cmd="formatBlock" arg="H1" icon={Heading1} label="Título" />
        <Btn cmd="formatBlock" arg="H2" icon={Heading2} label="Subtítulo" />
        <Btn cmd="formatBlock" arg="P" icon={Type} label="Párrafo" />
        <span className="rte-sep" />
        <Btn cmd="bold" icon={Bold} label="Negrita" />
        <Btn cmd="italic" icon={Italic} label="Cursiva" />
        <Btn cmd="underline" icon={Underline} label="Subrayado" />
        <span className="rte-sep" />
        <Btn cmd="insertUnorderedList" icon={List} label="Lista" />
        <Btn cmd="insertOrderedList" icon={ListOrdered} label="Lista numerada" />
        <span className="rte-sep" />
        <Btn cmd="justifyLeft" icon={AlignLeft} label="Izquierda" />
        <Btn cmd="justifyCenter" icon={AlignCenter} label="Centrar" />
        <Btn cmd="justifyRight" icon={AlignRight} label="Derecha" />
        <span className="rte-sep" />
        <Btn cmd="undo" icon={Undo2} label="Deshacer" />
        <Btn cmd="redo" icon={Redo2} label="Rehacer" />
      </div>
      <div
        ref={ref}
        className="rte-area"
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={() => onChange?.(ref.current.innerHTML)}
      />
    </div>
  )
}
