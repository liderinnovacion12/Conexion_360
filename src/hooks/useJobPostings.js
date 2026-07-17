import { useState, useEffect, useCallback } from 'react'
import { USE_SUPABASE } from '../services/api.js'
import { supabase } from '../services/supabaseClient.js'

const STORAGE_KEY = 'cx360.jobPostings'

// ── Helpers de persistencia ──────────────────────────────────────────────────

function loadMock() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function saveMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// ── Supabase ─────────────────────────────────────────────────────────────────

const fromRow = (r) => ({
  id: r.id,
  title: r.title,
  area: r.area,
  location: r.location,
  contractType: r.contract_type,
  modality: r.modality,
  description: r.description,
  requirements: r.requirements,
  salary: r.salary,
  vacancies: r.vacancies,
  status: r.status,
  createdAt: r.created_at,
})

const toRow = (f) => ({
  title: f.title,
  area: f.area || null,
  location: f.location || null,
  contract_type: f.contractType || null,
  modality: f.modality || null,
  description: f.description || null,
  requirements: f.requirements || null,
  salary: f.salary || null,
  vacancies: f.vacancies || 1,
  status: f.status || 'activa',
})

async function sbList() {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(fromRow)
}

async function sbAdd(payload) {
  const { data, error } = await supabase
    .from('job_postings')
    .insert(toRow(payload))
    .select()
    .single()
  if (error) throw new Error(error.message)
  return fromRow(data)
}

async function sbUpdate(id, payload) {
  const { data, error } = await supabase
    .from('job_postings')
    .update(toRow(payload))
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return fromRow(data)
}

async function sbRemove(id) {
  const { error } = await supabase.from('job_postings').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useJobPostings() {
  const [postings, setPostings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (USE_SUPABASE) {
        setPostings(await sbList())
      } else {
        setPostings(loadMock())
      }
    } catch {
      setPostings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const add = async (payload) => {
    if (USE_SUPABASE) {
      const created = await sbAdd(payload)
      setPostings((prev) => [created, ...prev])
    } else {
      const item = { ...payload, id: Date.now().toString(), createdAt: new Date().toISOString() }
      setPostings((prev) => { const next = [item, ...prev]; saveMock(next); return next })
    }
  }

  const update = async (id, payload) => {
    if (USE_SUPABASE) {
      const updated = await sbUpdate(id, payload)
      setPostings((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } else {
      setPostings((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...payload } : p))
        saveMock(next)
        return next
      })
    }
  }

  const remove = async (id) => {
    if (USE_SUPABASE) {
      await sbRemove(id)
    }
    setPostings((prev) => { const next = prev.filter((p) => p.id !== id); if (!USE_SUPABASE) saveMock(next); return next })
  }

  return { postings, loading, reload: load, add, update, remove }
}
