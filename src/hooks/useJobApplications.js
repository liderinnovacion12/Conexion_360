import { useState, useEffect, useCallback } from 'react'
import { USE_SUPABASE } from '../services/api.js'
import { supabase } from '../services/supabaseClient.js'

const STORAGE_KEY = 'cx360.jobApplications'

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ── Mock (localStorage) ───────────────────────────────────────────────────────
function loadMock() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function saveMock(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }

// ── Supabase ──────────────────────────────────────────────────────────────────
const fromRow = (r) => ({
  id: r.id,
  jobId: r.job_id,
  jobTitle: r.job_title,
  name: r.name,
  email: r.email,
  phone: r.phone,
  message: r.message,
  cvUrl: r.cv_url,
  status: r.status,
  registrationCode: r.registration_code,
  codeUsed: r.code_used,
  createdAt: r.created_at,
})

async function sbList() {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(fromRow)
}

async function sbSubmit(payload, cvFile) {
  let cvUrl = null
  if (cvFile) {
    const ext = cvFile.name.split('.').pop()
    const path = `aplicaciones/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('documentos').upload(path, cvFile)
    if (!upErr) {
      const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
      cvUrl = urlData?.publicUrl || null
    }
  }
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: payload.jobId || null,
      job_title: payload.jobTitle,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      message: payload.message || null,
      cv_url: cvUrl,
      status: 'pendiente',
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return fromRow(data)
}

async function sbApprove(id) {
  const code = genCode()
  const { data, error } = await supabase
    .from('job_applications')
    .update({ status: 'aprobado', registration_code: code })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return fromRow(data)
}

async function sbReject(id) {
  const { data, error } = await supabase
    .from('job_applications')
    .update({ status: 'rechazado' })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return fromRow(data)
}

export async function validateRegistrationCode(code) {
  const normalized = code.trim().toUpperCase()
  if (USE_SUPABASE) {
    const { data, error } = await supabase
      .from('job_applications')
      .select('id, name, job_title, status, code_used')
      .eq('registration_code', normalized)
      .eq('status', 'aprobado')
      .eq('code_used', false)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? { valid: true, application: fromRow({ ...data, registration_code: normalized, email: '', phone: '', cv_url: '', created_at: '' }) } : { valid: false }
  }
  // Mock
  const list = loadMock()
  const found = list.find((a) => a.registrationCode === normalized && a.status === 'aprobado' && !a.codeUsed)
  return found ? { valid: true, application: found } : { valid: false }
}

export async function markCodeUsed(code) {
  const normalized = code.trim().toUpperCase()
  if (USE_SUPABASE) {
    // RPC con SECURITY DEFINER — permite que el candidato recién registrado invalide su código
    await supabase.rpc('use_registration_code', { p_code: normalized })
  } else {
    const list = loadMock()
    saveMock(list.map((a) => a.registrationCode === normalized ? { ...a, codeUsed: true } : a))
  }
}

// ── Hook principal ────────────────────────────────────────────────────────────
export function useJobApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setApplications(USE_SUPABASE ? await sbList() : loadMock())
    } catch { setApplications([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const submit = async (payload, cvFile) => {
    if (USE_SUPABASE) {
      const created = await sbSubmit(payload, cvFile)
      return created
    }
    const item = {
      ...payload, id: Date.now().toString(),
      status: 'pendiente', registrationCode: null, codeUsed: false,
      createdAt: new Date().toISOString(),
    }
    const next = [item, ...loadMock()]
    saveMock(next)
    setApplications(next)
    return item
  }

  const approve = async (id) => {
    if (USE_SUPABASE) {
      const updated = await sbApprove(id)
      setApplications((prev) => prev.map((a) => a.id === id ? updated : a))
      return updated
    }
    const code = genCode()
    setApplications((prev) => {
      const next = prev.map((a) => a.id === id ? { ...a, status: 'aprobado', registrationCode: code } : a)
      saveMock(next)
      return next
    })
    return applications.find((a) => a.id === id) ? { ...applications.find((a) => a.id === id), status: 'aprobado', registrationCode: code } : null
  }

  const reject = async (id) => {
    if (USE_SUPABASE) {
      const updated = await sbReject(id)
      setApplications((prev) => prev.map((a) => a.id === id ? updated : a))
    } else {
      setApplications((prev) => {
        const next = prev.map((a) => a.id === id ? { ...a, status: 'rechazado' } : a)
        saveMock(next)
        return next
      })
    }
  }

  return { applications, loading, reload: load, submit, approve, reject }
}
