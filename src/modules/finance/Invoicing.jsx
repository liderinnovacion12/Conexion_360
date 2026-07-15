import { useMemo, useState } from 'react'
import { Plus, Trash2, Download, Receipt } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/Form.jsx'
import { useInvoices } from '../../hooks/useInvoices.js'
import { useClients } from '../../hooks/useClients.js'
import { INVOICE_STATUS_VARIANT } from '../../data/mockInvoices.js'
import { formatCOP, formatDate } from '../../utils/format.js'
import { generateInvoicePdf, exportToCSV } from '../../utils/pdf.js'

const emptyItem = () => ({ description: '', qty: 1, unitPrice: 0 })
const emptyForm = () => ({ clientId: '', issueDate: new Date().toISOString().slice(0, 10), dueDate: '', items: [emptyItem()], status: 'borrador', notes: '' })

export default function Invoicing() {
  const { invoices, addInvoice, calc } = useInvoices()
  const { clients } = useClients()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())

  const clientName = (id) => clients.find((c) => c.id === id)?.name || '—'

  const totals = useMemo(() => calc(form.items), [form.items, calc])

  const openCreate = () => { setForm(emptyForm()); setOpen(true) }

  const updateItem = (idx, patch) => {
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }))
  }
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }))
  const removeItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))

  const save = async () => {
    if (!form.clientId || form.items.some((i) => !i.description.trim())) return
    await addInvoice(form)
    setOpen(false)
  }

  const download = (invoice) => {
    const client = clients.find((c) => c.id === invoice.clientId)
    generateInvoicePdf(invoice, client)
  }

  const columns = [
    { key: 'number', header: 'N.°', strong: true },
    { key: 'clientId', header: 'Cliente', render: (i) => clientName(i.clientId) },
    { key: 'issueDate', header: 'Emisión', render: (i) => formatDate(i.issueDate), sortValue: (i) => new Date(i.issueDate).getTime() },
    { key: 'dueDate', header: 'Vence', render: (i) => formatDate(i.dueDate) },
    { key: 'total', header: 'Total', render: (i) => formatCOP(i.total), sortValue: (i) => i.total },
    { key: 'status', header: 'Estado', render: (i) => <Badge variant={INVOICE_STATUS_VARIANT[i.status]} dot>{i.status}</Badge> },
    { key: 'actions', header: '', sortable: false, render: (i) => <Button size="sm" variant="ghost" icon={Download} onClick={() => download(i)} /> },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Facturación electrónica"
        subtitle="Emisión de facturas con IVA calculado automáticamente."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>Nueva factura</Button>}
      />

      <Card className="anim-up">
        <DataTable
          columns={columns}
          data={invoices}
          searchKeys={['number']}
          pageSize={8}
          onExport={() =>
            exportToCSV('facturas_conexion360.csv', invoices, [
              { key: 'number', label: 'N.°' },
              { key: 'clientId', label: 'Cliente', value: (i) => clientName(i.clientId) },
              { key: 'issueDate', label: 'Emisión' },
              { key: 'total', label: 'Total' },
              { key: 'status', label: 'Estado' },
            ])
          }
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva factura"
        width={720}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button variant="primary" icon={Receipt} onClick={save}>Emitir factura</Button></>}
      >
        <div className="col gap-3">
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <Field label="Cliente" required>
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} placeholder="Selecciona un cliente" options={clients.map((c) => ({ value: c.id, label: c.name }))} />
            </Field>
            <Field label="Fecha de emisión"><Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></Field>
            <Field label="Fecha de vencimiento"><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
          </div>

          <div className="divider" />
          <b style={{ fontSize: '0.85rem' }}>Ítems</b>
          {form.items.map((item, idx) => (
            <div key={idx} className="grid" style={{ gridTemplateColumns: '2fr 80px 1fr 32px', gap: 10, alignItems: 'end' }}>
              <Field label={idx === 0 ? 'Descripción' : undefined}>
                <Input value={item.description} onChange={(e) => updateItem(idx, { description: e.target.value })} placeholder="Descripción del servicio" />
              </Field>
              <Field label={idx === 0 ? 'Cant.' : undefined}>
                <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })} />
              </Field>
              <Field label={idx === 0 ? 'Valor unitario' : undefined}>
                <Input type="number" min="0" value={item.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} />
              </Field>
              <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeItem(idx)} disabled={form.items.length === 1} />
            </div>
          ))}
          <Button variant="ghost" icon={Plus} onClick={addItem}>Agregar ítem</Button>

          <div className="divider" />
          <div className="col" style={{ alignSelf: 'flex-end', minWidth: 220, marginLeft: 'auto' }}>
            <div className="stat-row"><span className="muted">Subtotal</span><b>{formatCOP(totals.subtotal)}</b></div>
            <div className="stat-row"><span className="muted">IVA (19%)</span><b>{formatCOP(totals.tax)}</b></div>
            <div className="stat-row"><span className="muted">Total</span><b style={{ fontSize: '1.05rem' }}>{formatCOP(totals.total)}</b></div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
