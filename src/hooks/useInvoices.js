import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { INVOICES, TAX_RATE } from '../data/mockInvoices.js'
import {
  USE_SUPABASE,
  listInvoices,
  createInvoice,
  updateInvoiceStatus as apiUpdateInvoiceStatus,
} from '../services/api.js'

const calc = (items) => {
  const subtotal = items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.unitPrice || 0), 0)
  const tax = Math.round(subtotal * TAX_RATE)
  return { subtotal, tax, total: subtotal + tax }
}

export function useInvoices() {
  const [mockInvoices, setMockInvoices] = useLocalStorage('cx360.invoices', INVOICES)
  const [remoteInvoices, setRemoteInvoices] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(() => {
    if (!USE_SUPABASE) return
    setLoading(true)
    listInvoices().then(setRemoteInvoices).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const invoices = USE_SUPABASE ? remoteInvoices : mockInvoices

  const nextNumber = () => {
    const year = new Date().getFullYear()
    const n = invoices.length + 1
    return `FE-${year}-${String(n).padStart(4, '0')}`
  }

  const addInvoice = async (invoice) => {
    if (USE_SUPABASE) {
      const number = invoice.number || nextNumber()
      const id = await createInvoice({ ...invoice, number })
      await reload()
      return { ...invoice, ...calc(invoice.items), id, number }
    }
    const item = { ...invoice, ...calc(invoice.items), id: `inv-${Date.now()}`, number: nextNumber() }
    setMockInvoices((list) => [item, ...list])
    return item
  }

  const updateInvoiceStatus = async (id, status) => {
    if (USE_SUPABASE) {
      await apiUpdateInvoiceStatus(id, status)
      setRemoteInvoices((list) => list.map((i) => (i.id === id ? { ...i, status } : i)))
      return
    }
    setMockInvoices((list) => list.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  return { invoices, loading, addInvoice, updateInvoiceStatus, calc }
}
