// Facturación electrónica (mock). IVA fijo del 19% sobre el subtotal.
export const TAX_RATE = 0.19

const calc = (items) => {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  return { subtotal, tax, total: subtotal + tax }
}

const rows = [
  { id: 'inv-001', number: 'FE-2026-0001', clientId: 'cli-001', issueDate: '2026-05-04', dueDate: '2026-06-03', items: [{ description: 'Servicio de consultoría operativa', qty: 1, unitPrice: 8500000 }], status: 'pagada', notes: '' },
  { id: 'inv-002', number: 'FE-2026-0002', clientId: 'cli-002', issueDate: '2026-05-12', dueDate: '2026-06-11', items: [{ description: 'Gestión logística mensual', qty: 1, unitPrice: 5200000 }], status: 'pagada', notes: '' },
  { id: 'inv-003', number: 'FE-2026-0003', clientId: 'cli-003', issueDate: '2026-06-02', dueDate: '2026-07-02', items: [{ description: 'Soporte técnico', qty: 20, unitPrice: 180000 }], status: 'emitida', notes: '' },
  { id: 'inv-004', number: 'FE-2026-0004', clientId: 'cli-005', issueDate: '2026-06-10', dueDate: '2026-07-10', items: [{ description: 'Licencia plataforma (mensual)', qty: 1, unitPrice: 3100000 }], status: 'emitida', notes: '' },
  { id: 'inv-005', number: 'FE-2026-0005', clientId: 'cli-004', issueDate: '2026-04-15', dueDate: '2026-05-15', items: [{ description: 'Auditoría documental', qty: 1, unitPrice: 4200000 }], status: 'vencida', notes: 'Pendiente por confirmar pago.' },
  { id: 'inv-006', number: 'FE-2026-0006', clientId: 'cli-001', issueDate: '2026-06-25', dueDate: '2026-07-25', items: [{ description: 'Capacitación equipo comercial', qty: 2, unitPrice: 1500000 }], status: 'borrador', notes: '' },
  { id: 'inv-007', number: 'FE-2026-0007', clientId: 'cli-002', issueDate: '2026-07-01', dueDate: '2026-07-31', items: [{ description: 'Transporte de carga', qty: 4, unitPrice: 950000 }], status: 'emitida', notes: '' },
]

export const INVOICES = rows.map((r) => ({ ...r, ...calc(r.items) }))

export const INVOICE_STATUS_VARIANT = {
  borrador: 'neutral',
  emitida: 'info',
  pagada: 'success',
  vencida: 'danger',
  anulada: 'neutral',
}
