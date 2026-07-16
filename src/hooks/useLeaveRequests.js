import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { USE_SUPABASE } from '../services/api.js'
import { supabase, STORAGE_BUCKETS } from '../services/supabaseClient.js'

const fromRow = (r) => ({
  id: r.id,
  profileId: r.profile_id,
  employeeId: r.employee_id,
  type: r.type,
  otherDesc: r.other_desc,
  observations: r.observations,
  files: r.files || [],
  status: r.status,
  adminComment: r.admin_comment,
  reviewedBy: r.reviewed_by,
  reviewedAt: r.reviewed_at,
  createdAt: r.created_at,
})

export const LEAVE_TYPES = [
  { value: 'incapacidad',        label: 'Incapacidad' },
  { value: 'medio_dia_votacion', label: 'Medio día de votación' },
  { value: 'jurado',             label: 'Día por ser jurado' },
  { value: 'cita_medica',        label: 'Permiso cita médica' },
  { value: 'calamidad',          label: 'Calamidad doméstica' },
  { value: 'otro',               label: 'Otro' },
]

export const LEAVE_STATUS_VARIANT = {
  pendiente: 'warning',
  aprobado:  'success',
  devuelto:  'danger',
}

// Sube varios archivos al bucket 'media' bajo permisos/{profileId}/
async function uploadLeaveFiles(profileId, files) {
  const paths = []
  for (const file of files) {
    const ext = file.name.split('.').pop()
    const path = `permisos/${profileId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.media)
      .upload(path, file, { upsert: false, contentType: file.type })
    if (error) throw error
    paths.push({ path, name: file.name, type: file.type })
  }
  return paths
}

export async function getSignedLeaveUrl(path, expiresIn = 300) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.media)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export function useLeaveRequests({ adminMode = false } = {}) {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(USE_SUPABASE)

  const reload = useCallback(async () => {
    if (!USE_SUPABASE || !user) return
    setLoading(true)
    try {
      let q = supabase.from('leave_requests').select('*').order('created_at', { ascending: false })
      if (!adminMode) q = q.eq('profile_id', user.id)
      const { data, error } = await q
      if (error) throw error
      setRequests(data.map(fromRow))
    } finally {
      setLoading(false)
    }
  }, [user, adminMode])

  useEffect(() => { reload() }, [reload])

  const submitRequest = async ({ type, otherDesc, observations, files, employeeId }) => {
    if (!USE_SUPABASE) {
      // modo mock: guardar localmente
      const item = { id: `lr-${Date.now()}`, profileId: user.id, employeeId, type, otherDesc, observations, files: files.map(f => ({ name: f.name })), status: 'pendiente', createdAt: new Date().toISOString() }
      setRequests((l) => [item, ...l])
      return item
    }
    const uploadedFiles = files.length > 0 ? await uploadLeaveFiles(user.id, files) : []
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({ profile_id: user.id, employee_id: employeeId || null, type, other_desc: otherDesc || null, observations: observations || null, files: uploadedFiles })
      .select()
      .single()
    if (error) throw error
    const item = fromRow(data)
    setRequests((l) => [item, ...l])
    // Notificar al admin
    await supabase.from('notifications').insert({
      target_role: 'admin',
      title: 'Nueva solicitud de permiso',
      body: `${user.name} solicitó: ${LEAVE_TYPES.find(t => t.value === type)?.label || type}.`,
      link: '/admin/permisos',
      color: '#F5A623',
    })
    return item
  }

  const reviewRequest = async (id, { status, adminComment }) => {
    if (!USE_SUPABASE) {
      setRequests((l) => l.map((r) => r.id === id ? { ...r, status, adminComment } : r))
      return
    }
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status, admin_comment: adminComment || null, reviewed_by: user.name, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setRequests((l) => l.map((r) => r.id === id ? fromRow(data) : r))
    // Notificar al empleado
    const req = requests.find(r => r.id === id)
    if (req?.profileId) {
      await supabase.from('notifications').insert({
        profile_id: req.profileId,
        title: status === 'aprobado' ? 'Permiso aprobado' : 'Permiso devuelto',
        body: adminComment || (status === 'aprobado' ? 'Tu solicitud de permiso fue aprobada.' : 'Tu solicitud fue devuelta con observaciones.'),
        link: '/personal/permisos',
        color: status === 'aprobado' ? '#2ECC71' : '#FF4D4D',
      })
    }
  }

  return { requests, loading, submitRequest, reviewRequest, reload }
}
