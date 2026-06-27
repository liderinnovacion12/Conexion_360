import { useState } from 'react'
import { Upload, FileText } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import FileDropzone from '../../components/feature/FileDropzone.jsx'
import { docStatusVariant, formatDate } from '../../utils/format.js'

const BASE_DOCS = [
  { id: 1, type: 'Contrato laboral firmado', status: 'aprobado', date: '2022-03-01' },
  { id: 2, type: 'Documento de identidad', status: 'aprobado', date: '2022-03-01' },
  { id: 3, type: 'Afiliación EPS', status: 'aprobado', date: '2022-03-05' },
  { id: 4, type: 'Afiliación pensión', status: 'aprobado', date: '2022-03-05' },
  { id: 5, type: 'Certificación bancaria', status: 'pendiente', date: '2025-06-20' },
  { id: 6, type: 'Examen médico ocupacional', status: 'vencido', date: '2024-03-01' },
]

export default function EmployeeDocuments({ title = 'Mis documentos' }) {
  const [docs] = useState(BASE_DOCS)
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)

  return (
    <div className="page">
      <PageHeader
        title={title}
        subtitle="Consulta y actualiza tus documentos."
        actions={<Button variant="primary" icon={Upload} onClick={() => { setOpen(true); setFile(null) }}>Cargar documento</Button>}
      />
      <div className="grid grid-2 stagger">
        {docs.map((d) => (
          <Card key={d.id}>
            <div className="row between">
              <div className="row gap-2">
                <div className="fic" style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(255,93,115,0.14)', color: 'var(--danger)' }}>
                  <FileText size={17} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.type}</div>
                  <div className="card-sub">Actualizado: {formatDate(d.date)}</div>
                </div>
              </div>
              <Badge variant={docStatusVariant[d.status]} dot>{d.status}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Cargar documento" footer={<Button variant="primary" disabled={!file} onClick={() => setOpen(false)}>Enviar</Button>}>
        <FileDropzone onFile={setFile} />
      </Modal>
    </div>
  )
}
