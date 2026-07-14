import { useLocalStorage } from './useLocalStorage.js'
import { INVOICES, TAX_RATE } from '../data/mockInvoices.js'

const calc = (items) => {
  const subtotal = items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.unitPrice || 0), 0)
  const tax = Math.round(subtotal * TAX_RATE)
  return { subtotal, tax, total: subtotal + tax }
}

export function useInvoices() {
  const [invoices, setInvoices] = useLocalStorage('cx360.invoices', INVOICES)

  const nextNumber = () => {
    const year = new Date().getFullYear()
    const n = invoices.length + 1
    return `FE-${year}-${String(n).padStart(4, '0')}`
  }

  const addInvoice = (invoice) => {
    const item = { ...invoice, ...calc(invoice.items), id: `inv-${Date.now()}`, number: nextNumber() }
    setInvoices((list) => [item, ...list])
    return item
  }

  const updateInvoiceStatus = (id, status) => {
    setInvoices((list) => list.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  return { invoices, addInvoice, updateInvoiceStatus, calc }
}
