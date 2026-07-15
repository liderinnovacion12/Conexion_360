// ============================================================
// Capa de datos. Cada función habla con Supabase (tablas creadas en
// supabase/migrations/). Los hooks (src/hooks/*.js) deciden si llaman a
// estas funciones (DATA_MODE=supabase) o si siguen operando sobre
// localStorage con los datos mock (DATA_MODE=mock, comportamiento
// original sin backend) — mismo patrón dual usado en AuthContext.jsx.
//
// Los mappers rowToX/xToRow traducen entre snake_case (columnas de la
// base de datos) y camelCase (forma que ya esperan los componentes,
// igual a los objetos de src/data/mock*.js) para no tener que tocar la
// UI al conectar el backend real.
// ============================================================
import { supabase, DATA_MODE, isSupabaseConfigured } from './supabaseClient.js'
import { PERSONNEL } from '../data/mockPersonnel.js'
import { CANDIDATES } from '../data/mockCandidates.js'
import { DOCUMENTS } from '../data/mockDocuments.js'
import { COURSES, COURSE_PROGRESS } from '../data/mockCourses.js'

export const USE_SUPABASE = DATA_MODE === 'supabase' && isSupabaseConfigured()

function must() {
  if (!supabase) throw new Error('Supabase no está configurado (revisa VITE_SUPABASE_URL/ANON_KEY).')
}
function check(error) {
  if (error) throw new Error(error.message || 'Error de base de datos.')
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

// ---- Compatibilidad con el uso previo (Candidate/Recruitment dashboards
// que ya llamaban a `api.getX()`); ahora dual-mode. ----
export const api = {
  mode: DATA_MODE,
  async getPersonnel() {
    if (USE_SUPABASE) return listPersonnel()
    await delay()
    return PERSONNEL
  },
  async getCandidates() {
    if (USE_SUPABASE) return listCandidates()
    await delay()
    return CANDIDATES
  },
  async getCandidate(id) {
    if (USE_SUPABASE) return getCandidate(id)
    await delay()
    return CANDIDATES.find((c) => c.id === id) || null
  },
  async getDocuments(candidateId) {
    if (USE_SUPABASE) return listDocuments(candidateId)
    await delay()
    return candidateId ? DOCUMENTS.filter((d) => d.candidateId === candidateId) : DOCUMENTS
  },
  async getCourses() {
    if (USE_SUPABASE) return listCourses()
    await delay()
    return COURSES
  },
  async getCourseProgress(candidateId) {
    if (USE_SUPABASE) return listCourseProgress(candidateId)
    await delay()
    return candidateId ? COURSE_PROGRESS.filter((p) => p.candidateId === candidateId) : COURSE_PROGRESS
  },
}

// ---- Integración futura: asistente IA (Anthropic) ----
export async function askAssistant(/* prompt */) {
  return { message: 'Integración del asistente IA pendiente de configurar en el backend.' }
}

// ============================================================
// CANDIDATOS (aspirantes)
// ============================================================
const candidateFromRow = (r) => ({
  id: r.id, name: r.name, doc: r.doc, email: r.email, phone: r.phone, position: r.position,
  stage: r.stage, status: r.status, progress: r.progress, city: r.city, track: r.track,
  createdAt: r.created_at,
  docType: r.doc_type, birth: r.birth_date, gender: r.gender, civil: r.marital_status,
  address: r.address, dept: r.department, education: r.education_level,
})

export async function listCandidates() {
  must()
  const { data, error } = await supabase.from('candidates').select('*').order('created_at', { ascending: false })
  check(error)
  return data.map(candidateFromRow)
}

export async function getCandidate(id) {
  must()
  const { data, error } = await supabase.from('candidates').select('*').eq('id', id).maybeSingle()
  check(error)
  return data ? candidateFromRow(data) : null
}

export async function createCandidate({ name, doc, email, phone, position, city, track = 'funcionario' }) {
  must()
  const { data, error } = await supabase
    .from('candidates')
    .insert({ name, doc, email, phone, position, city, track, stage: 'registro', status: 'pendiente', progress: 0 })
    .select()
    .single()
  check(error)
  return candidateFromRow(data)
}

export async function updateCandidate(id, patch) {
  must()
  const row = {}
  if ('name' in patch) row.name = patch.name
  if ('doc' in patch) row.doc = patch.doc
  if ('email' in patch) row.email = patch.email
  if ('phone' in patch) row.phone = patch.phone
  if ('position' in patch) row.position = patch.position
  if ('city' in patch) row.city = patch.city
  if ('track' in patch) row.track = patch.track
  if ('stage' in patch) row.stage = patch.stage
  if ('status' in patch) row.status = patch.status
  if ('progress' in patch) row.progress = patch.progress
  if ('docType' in patch) row.doc_type = patch.docType
  if ('birth' in patch) row.birth_date = patch.birth
  if ('gender' in patch) row.gender = patch.gender
  if ('civil' in patch) row.marital_status = patch.civil
  if ('address' in patch) row.address = patch.address
  if ('dept' in patch) row.department = patch.dept
  if ('education' in patch) row.education_level = patch.education
  const { data, error } = await supabase.from('candidates').update(row).eq('id', id).select().single()
  check(error)
  return candidateFromRow(data)
}

// ============================================================
// PERSONAL / NÓMINA
// ============================================================
const personnelFromRow = (r) => ({
  id: r.id, doc: r.doc, name: r.name, position: r.position, contract: r.contract,
  salary: r.salary, state: r.state, start: r.start_date, end: r.end_date, area: r.area,
})

export async function listPersonnel() {
  must()
  const { data, error } = await supabase.from('personnel').select('*').order('name')
  check(error)
  return data.map(personnelFromRow)
}

export async function createPersonnel({ doc, name, position, contract, salary, state = 'Activo', start, end, area }) {
  must()
  const { data, error } = await supabase
    .from('personnel')
    .insert({ doc, name, position, contract, salary, state, start_date: start || null, end_date: end || null, area })
    .select()
    .single()
  check(error)
  return personnelFromRow(data)
}

export async function updatePersonnel(id, patch) {
  must()
  const row = {}
  if ('doc' in patch) row.doc = patch.doc
  if ('name' in patch) row.name = patch.name
  if ('position' in patch) row.position = patch.position
  if ('contract' in patch) row.contract = patch.contract
  if ('salary' in patch) row.salary = patch.salary
  if ('state' in patch) row.state = patch.state
  if ('start' in patch) row.start_date = patch.start
  if ('end' in patch) row.end_date = patch.end
  if ('area' in patch) row.area = patch.area
  const { data, error } = await supabase.from('personnel').update(row).eq('id', id).select().single()
  check(error)
  return personnelFromRow(data)
}

// ============================================================
// DOCUMENTOS
// ============================================================
const documentFromRow = (r) => ({
  id: r.id, candidateId: r.candidate_id, type: r.type, status: r.status, required: r.required,
  visibility: r.visibility, uploadedBy: r.uploaded_by_name, uploadedAt: r.uploaded_at,
  reviewedBy: r.reviewed_by_name, reviewedAt: r.reviewed_at, comment: r.comment,
  version: r.version, expires: r.expires, file: r.file_path,
})

export async function listDocuments(candidateId) {
  must()
  let q = supabase.from('documents').select('*').order('uploaded_at', { ascending: false })
  if (candidateId) q = q.eq('candidate_id', candidateId)
  const { data, error } = await q
  check(error)
  return data.map(documentFromRow)
}

export async function createDocument({ candidateId, type, required, visibility = 'interno', uploadedByName, filePath, expires }) {
  must()
  const { data, error } = await supabase
    .from('documents')
    .insert({
      candidate_id: candidateId, type, required, visibility,
      uploaded_by_name: uploadedByName, file_path: filePath, expires: expires || null, status: 'pendiente',
    })
    .select()
    .single()
  check(error)
  return documentFromRow(data)
}

export async function reviewDocument(id, { status, comment = '', reviewedByName }) {
  must()
  const { data: prev } = await supabase.from('documents').select('version').eq('id', id).single()
  const { data, error } = await supabase
    .from('documents')
    .update({ status, comment, reviewed_by_name: reviewedByName, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  check(error)
  if (status === 'devuelto' || status === 'rechazado') {
    await supabase.from('document_versions').insert({
      document_id: id,
      version: prev?.version || 1,
      action: status === 'devuelto' ? 'Devuelto para corrección' : 'Rechazado',
      by_name: reviewedByName,
    })
  }
  return documentFromRow(data)
}

export async function listDocumentVersions(documentId) {
  must()
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version')
  check(error)
  return data.map((v) => ({ version: v.version, uploadedAt: v.uploaded_at, action: v.action, by: v.by_name }))
}

// ============================================================
// CURSOS / PROGRESO / EVALUACIONES
// ============================================================
const courseFromRow = (r) => ({
  id: r.id, title: r.title, type: r.type, duration: r.duration, description: r.description, passScore: r.pass_score,
})

export async function listCourses() {
  must()
  const { data, error } = await supabase.from('courses').select('*').order('created_at')
  check(error)
  const courses = data.map(courseFromRow)
  const { data: assignments, error: aErr } = await supabase.from('course_assignments').select('course_id, candidate_id')
  check(aErr)
  return courses.map((c) => ({ ...c, assigned: assignments.filter((a) => a.course_id === c.id).map((a) => a.candidate_id) }))
}

export async function createCourse({ title, type, duration, description, passScore = 70 }) {
  must()
  const { data, error } = await supabase
    .from('courses')
    .insert({ title, type, duration, description, pass_score: passScore })
    .select()
    .single()
  check(error)
  return { ...courseFromRow(data), assigned: [] }
}

export async function assignCourseToCandidates(courseId, candidateIds) {
  must()
  await supabase.from('course_assignments').delete().eq('course_id', courseId)
  if (candidateIds.length === 0) return
  const rows = candidateIds.map((candidateId) => ({ course_id: courseId, candidate_id: candidateId }))
  const { error } = await supabase.from('course_assignments').insert(rows)
  check(error)
}

export async function listCourseProgress(candidateId) {
  must()
  let q = supabase.from('course_progress').select('*')
  if (candidateId) q = q.eq('candidate_id', candidateId)
  const { data, error } = await q
  check(error)
  return data.map((p) => ({ candidateId: p.candidate_id, courseId: p.course_id, progress: p.progress, score: p.score, status: p.status }))
}

export async function recordProgress(candidateId, courseId, patch) {
  must()
  const row = { candidate_id: candidateId, course_id: courseId }
  if ('progress' in patch) row.progress = patch.progress
  if ('score' in patch) row.score = patch.score
  if ('status' in patch) row.status = patch.status
  const { error } = await supabase.from('course_progress').upsert(row, { onConflict: 'course_id,candidate_id' })
  check(error)
}

export async function getQuiz(courseId) {
  must()
  const { data, error } = await supabase.from('quiz_questions').select('*').eq('course_id', courseId)
  check(error)
  return data.map((q) => ({ id: q.id, type: q.type, question: q.question, options: q.options, answer: q.answer }))
}

export async function saveQuiz(courseId, questions) {
  must()
  await supabase.from('quiz_questions').delete().eq('course_id', courseId)
  if (questions.length === 0) return
  const rows = questions.map((q) => ({
    id: q.id?.startsWith('q') ? q.id : undefined,
    course_id: courseId, type: q.type, question: q.question, options: q.options ?? null, answer: q.answer ?? null,
  }))
  const { error } = await supabase.from('quiz_questions').insert(rows)
  check(error)
}

// ============================================================
// GRUPOS DE ASPIRANTES
// ============================================================
export async function listGroups() {
  must()
  const { data, error } = await supabase.from('candidate_groups').select('*').order('created_at')
  check(error)
  return data.map((g) => ({ id: g.id, name: g.name, color: g.color, createdAt: g.created_at }))
}

export async function createGroup(name, color = '#19E3D9') {
  must()
  const { data, error } = await supabase.from('candidate_groups').insert({ name, color }).select().single()
  check(error)
  return { id: data.id, name: data.name, color: data.color, createdAt: data.created_at }
}

export async function removeGroup(groupId) {
  must()
  await supabase.from('candidate_group_members').delete().eq('group_id', groupId)
  const { error } = await supabase.from('candidate_groups').delete().eq('id', groupId)
  check(error)
}

export async function listGroupMembership() {
  must()
  const { data, error } = await supabase.from('candidate_group_members').select('*')
  check(error)
  return data.map((m) => ({ candidateId: m.candidate_id, groupId: m.group_id }))
}

export async function toggleGroupMembership(candidateId, groupId, isMember) {
  must()
  if (isMember) {
    const { error } = await supabase
      .from('candidate_group_members')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('group_id', groupId)
    check(error)
  } else {
    const { error } = await supabase.from('candidate_group_members').insert({ candidate_id: candidateId, group_id: groupId })
    check(error)
  }
}

// ============================================================
// PLANTILLAS DE FORMULARIO
// ============================================================
const formTemplateFromRow = (r) => ({ id: r.id, name: r.name, track: r.track, groupId: r.group_id, fields: r.fields })

export async function listFormTemplates() {
  must()
  const { data, error } = await supabase.from('form_templates').select('*').order('created_at')
  check(error)
  return data.map(formTemplateFromRow)
}

export async function createFormTemplate({ name, track, groupId, fields }) {
  must()
  const { data, error } = await supabase
    .from('form_templates')
    .insert({ name, track: track || null, group_id: groupId || null, fields })
    .select()
    .single()
  check(error)
  return formTemplateFromRow(data)
}

export async function updateFormTemplate(id, patch) {
  must()
  const row = {}
  if ('name' in patch) row.name = patch.name
  if ('track' in patch) row.track = patch.track || null
  if ('groupId' in patch) row.group_id = patch.groupId || null
  if ('fields' in patch) row.fields = patch.fields
  const { data, error } = await supabase.from('form_templates').update(row).eq('id', id).select().single()
  check(error)
  return formTemplateFromRow(data)
}

export async function removeFormTemplate(id) {
  must()
  const { error } = await supabase.from('form_templates').delete().eq('id', id)
  check(error)
}

// ============================================================
// PLANTILLAS LEGALES (contratos)
// ============================================================
const legalTemplateFromRow = (r) => ({
  id: r.id, key: r.key, category: r.category, name: r.name, placeholders: r.placeholders, body: r.body,
})

export async function listLegalTemplates() {
  must()
  const { data, error } = await supabase.from('legal_templates').select('*').order('created_at')
  check(error)
  return data.map(legalTemplateFromRow)
}

export async function createLegalTemplate({ key, category, name, placeholders, body }) {
  must()
  const { data, error } = await supabase
    .from('legal_templates')
    .insert({ key, category, name, placeholders, body })
    .select()
    .single()
  check(error)
  return legalTemplateFromRow(data)
}

export async function updateLegalTemplate(id, patch) {
  must()
  const row = {}
  if ('category' in patch) row.category = patch.category
  if ('name' in patch) row.name = patch.name
  if ('placeholders' in patch) row.placeholders = patch.placeholders
  if ('body' in patch) row.body = patch.body
  const { data, error } = await supabase.from('legal_templates').update(row).eq('id', id).select().single()
  check(error)
  return legalTemplateFromRow(data)
}

export async function removeLegalTemplate(id) {
  must()
  const { error } = await supabase.from('legal_templates').delete().eq('id', id)
  check(error)
}

// ============================================================
// CONTRATOS
// ============================================================
const contractFromRow = (r) => ({
  id: r.id, templateId: r.template_id, templateName: r.template_name, personId: r.person_id,
  personName: r.person_name, personDoc: r.person_doc, personArea: r.person_area, city: r.city,
  content: r.content, status: r.status, createdBy: r.created_by_name, createdByRole: r.created_by_role,
  createdAt: r.created_at, consecutive: r.consecutive, verificationCode: r.verification_code,
  creatorSignature: r.creator_signature, approvalRequestId: r.approval_request_id,
})

export async function listContracts() {
  must()
  const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false })
  check(error)
  return data.map(contractFromRow)
}

export async function createContract(c) {
  must()
  const { data, error } = await supabase
    .from('contracts')
    .insert({
      template_id: c.templateId, template_name: c.templateName, person_id: c.personId, person_name: c.personName,
      person_doc: c.personDoc, person_area: c.personArea, city: c.city, content: c.content,
      status: c.status || 'pendiente', created_by_name: c.createdBy, created_by_role: c.createdByRole,
      consecutive: c.consecutive, verification_code: c.verificationCode, creator_signature: c.creatorSignature,
      approval_request_id: c.approvalRequestId,
    })
    .select()
    .single()
  check(error)
  return contractFromRow(data)
}

export async function updateContractStatus(id, status) {
  must()
  const { error } = await supabase.from('contracts').update({ status }).eq('id', id)
  check(error)
}

// ============================================================
// DOCUMENTOS GENERADOS (editor de documentos)
// ============================================================
const generatedDocFromRow = (r) => ({
  id: r.id, title: r.title, city: r.city, content: r.content, status: r.status,
  createdBy: r.created_by_name, createdByRole: r.created_by_role, createdAt: r.created_at,
  consecutive: r.consecutive, verificationCode: r.verification_code, creatorSignature: r.creator_signature,
  approvalRequestId: r.approval_request_id,
})

export async function listGeneratedDocuments() {
  must()
  const { data, error } = await supabase.from('generated_documents').select('*').order('created_at', { ascending: false })
  check(error)
  return data.map(generatedDocFromRow)
}

export async function createGeneratedDocument(d) {
  must()
  const { data, error } = await supabase
    .from('generated_documents')
    .insert({
      title: d.title, city: d.city, content: d.content, status: d.status || 'pendiente',
      created_by_name: d.createdBy, created_by_role: d.createdByRole, consecutive: d.consecutive,
      verification_code: d.verificationCode, creator_signature: d.creatorSignature, approval_request_id: d.approvalRequestId,
    })
    .select()
    .single()
  check(error)
  return generatedDocFromRow(data)
}

export async function updateGeneratedDocumentStatus(id, status) {
  must()
  const { error } = await supabase.from('generated_documents').update({ status }).eq('id', id)
  check(error)
}

// ============================================================
// APROBACIONES (cadena de firmas)
// ============================================================
export async function listApprovals() {
  must()
  const { data: approvals, error } = await supabase.from('approvals').select('*').order('requested_at', { ascending: false })
  check(error)
  const { data: steps, error: sErr } = await supabase.from('approval_chain_steps').select('*').order('step_order')
  check(sErr)
  return approvals.map((a) => ({
    id: a.id, domain: a.domain, refId: a.ref_id, title: a.title, area: a.area,
    requestedById: a.requested_by, requestedBy: a.requested_by_name, requestedByRole: a.requested_by_role,
    requestedAt: a.requested_at, creatorSeal: a.creator_seal, status: a.status,
    chain: steps
      .filter((s) => s.approval_id === a.id)
      .map((s) => ({
        assignedToId: s.assigned_to, assignedToName: s.assigned_to_name, assignedToRole: s.assigned_to_role,
        area: s.area, status: s.status, seal: s.seal, decidedAt: s.decided_at, comment: s.comment,
      })),
  }))
}

export async function submitForApproval({ domain, refId, title, area, requestedById, requestedBy, requestedByRole, creatorSeal, chain }) {
  must()
  const { data: approval, error } = await supabase
    .from('approvals')
    .insert({
      domain, ref_id: refId, title, area, requested_by: requestedById, requested_by_name: requestedBy,
      requested_by_role: requestedByRole, creator_seal: creatorSeal, status: 'pendiente',
    })
    .select()
    .single()
  check(error)
  const steps = chain.map((p, i) => ({
    approval_id: approval.id, step_order: i, assigned_to: p.id, assigned_to_name: p.name,
    assigned_to_role: p.role, area: p.area, status: 'pendiente',
  }))
  const { error: sErr } = await supabase.from('approval_chain_steps').insert(steps)
  check(sErr)
  return approval.id
}

export async function decideApprovalStep(approvalId, { decision, seal, comment = '' }) {
  must()
  const { data: steps, error } = await supabase
    .from('approval_chain_steps')
    .select('*')
    .eq('approval_id', approvalId)
    .order('step_order')
  check(error)
  const idx = steps.findIndex((s) => s.status === 'pendiente')
  if (idx === -1) return
  const step = steps[idx]
  await supabase
    .from('approval_chain_steps')
    .update({ status: decision, seal: seal || null, decided_at: new Date().toISOString(), comment })
    .eq('id', step.id)

  if (decision === 'rechazado') {
    await supabase.from('approvals').update({ status: 'rechazado' }).eq('id', approvalId)
  } else if (idx === steps.length - 1) {
    await supabase.from('approvals').update({ status: 'aprobado' }).eq('id', approvalId)
  }
}

// ============================================================
// CLIENTES (facturación)
// ============================================================
export async function listClients() {
  must()
  const { data, error } = await supabase.from('clients').select('*').order('name')
  check(error)
  return data.map((c) => ({
    id: c.id, name: c.name, nit: c.nit, contactName: c.contact_name, email: c.email,
    phone: c.phone, address: c.address, city: c.city, status: c.status,
  }))
}

export async function createClient(c) {
  must()
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: c.name, nit: c.nit, contact_name: c.contactName, email: c.email,
      phone: c.phone, address: c.address, city: c.city, status: c.status || 'Activo',
    })
    .select()
    .single()
  check(error)
  return { id: data.id, name: data.name, nit: data.nit, contactName: data.contact_name, email: data.email, phone: data.phone, address: data.address, city: data.city, status: data.status }
}

export async function updateClient(id, patch) {
  must()
  const row = {}
  if ('name' in patch) row.name = patch.name
  if ('nit' in patch) row.nit = patch.nit
  if ('contactName' in patch) row.contact_name = patch.contactName
  if ('email' in patch) row.email = patch.email
  if ('phone' in patch) row.phone = patch.phone
  if ('address' in patch) row.address = patch.address
  if ('city' in patch) row.city = patch.city
  if ('status' in patch) row.status = patch.status
  const { error } = await supabase.from('clients').update(row).eq('id', id)
  check(error)
}

// ============================================================
// FACTURACIÓN
// ============================================================
export async function listInvoices() {
  must()
  const { data, error } = await supabase.from('invoices_with_totals').select('*').order('issue_date', { ascending: false })
  check(error)
  const { data: items, error: iErr } = await supabase.from('invoice_items').select('*')
  check(iErr)
  return data.map((i) => ({
    id: i.id, number: i.number, clientId: i.client_id, issueDate: i.issue_date, dueDate: i.due_date,
    status: i.status, notes: i.notes, subtotal: i.subtotal, tax: i.tax, total: i.total,
    items: items
      .filter((it) => it.invoice_id === i.id)
      .map((it) => ({ description: it.description, qty: it.qty, unitPrice: it.unit_price })),
  }))
}

export async function createInvoice({ clientId, issueDate, dueDate, status = 'borrador', notes = '', items, number }) {
  must()
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({ client_id: clientId, issue_date: issueDate, due_date: dueDate, status, notes, number })
    .select()
    .single()
  check(error)
  const rows = items.map((it) => ({ invoice_id: invoice.id, description: it.description, qty: it.qty, unit_price: it.unitPrice }))
  const { error: iErr } = await supabase.from('invoice_items').insert(rows)
  check(iErr)
  return invoice.id
}

export async function updateInvoiceStatus(id, status) {
  must()
  const { error } = await supabase.from('invoices').update({ status }).eq('id', id)
  check(error)
}

// ============================================================
// VITRINA DE SERVICIOS / SOLICITUDES DE CLIENTES
// ============================================================
export async function listServices() {
  must()
  const { data, error } = await supabase.from('services').select('*').order('category')
  check(error)
  return data.map((s) => ({
    id: s.id, icon: s.icon, category: s.category, name: s.name, tagline: s.tagline,
    description: s.description, highlight: s.highlight,
  }))
}

export async function listServiceRequests() {
  must()
  const { data, error } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false })
  check(error)
  return data.map((r) => ({
    id: r.id, serviceId: r.service_id, serviceName: r.service_name, requestedById: r.requested_by,
    requestedBy: r.requested_by_name, company: r.company, message: r.message, createdAt: r.created_at, status: r.status,
  }))
}

export async function createServiceRequest({ serviceId, serviceName, requestedById, requestedBy, company, message }) {
  must()
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      service_id: serviceId, service_name: serviceName, requested_by: requestedById,
      requested_by_name: requestedBy, company, message, status: 'pendiente',
    })
    .select()
    .single()
  check(error)
  return { id: data.id }
}

export async function updateServiceRequestStatus(id, status) {
  must()
  const { error } = await supabase.from('service_requests').update({ status }).eq('id', id)
  check(error)
}

// ============================================================
// APROBADORES POR ÁREA (enrutamiento de aprobaciones)
// ============================================================
export async function getAreaApprovers() {
  must()
  const { data, error } = await supabase.from('area_approvers').select('*')
  check(error)
  const map = {}
  data.forEach((r) => { map[r.area] = r.approver_profile_id })
  return map
}

// ============================================================
// AUDITORÍA
// ============================================================
export async function listAuditLogs() {
  must()
  const { data, error } = await supabase.from('audit_logs').select('*').order('ts', { ascending: false })
  check(error)
  return data.map((a) => ({ id: a.id, actor: a.actor_name, role: a.role, action: a.action, target: a.target, ts: a.ts, ip: a.ip }))
}

export async function logActivity({ actorId, actorName, role, action, target, ip }) {
  must()
  const { error } = await supabase
    .from('audit_logs')
    .insert({ actor: actorId || null, actor_name: actorName, role, action, target, ip: ip || null })
  check(error)
}

// ============================================================
// USUARIOS / PERFILES (Admin > Permisos)
// ============================================================
// Nota: crear una cuenta de acceso real (auth.users) requiere la
// service-role key y por eso NO se puede hacer desde el navegador — eso
// exige un endpoint server-side (p.ej. una función de Vercel) que aún no
// existe. Estas funciones administran el PERFIL (rol, datos) de cuentas
// que ya se registraron o que fueron creadas por el script de semilla.
const profileFromRow = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  area: r.area || null,
  candidateId: r.candidate_id || null,
  employeeId: r.employee_id || null,
  clientCompany: r.client_company || null,
})

export async function listUsers() {
  must()
  const { data, error } = await supabase.from('profiles').select('*').order('name')
  check(error)
  return data.map(profileFromRow)
}

export async function updateUserProfile(id, patch) {
  must()
  const row = {}
  if ('name' in patch) row.name = patch.name
  if ('role' in patch) row.role = patch.role
  if ('area' in patch) row.area = patch.area
  if ('candidateId' in patch) row.candidate_id = patch.candidateId
  if ('employeeId' in patch) row.employee_id = patch.employeeId
  if ('clientCompany' in patch) row.client_company = patch.clientCompany
  const { data, error } = await supabase.from('profiles').update(row).eq('id', id).select().single()
  check(error)
  return profileFromRow(data)
}

// Eliminar el perfil no elimina la cuenta de auth.users (eso también
// requiere service-role); solo se retira de las listas de la app.
export async function removeUserProfile(id) {
  must()
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  check(error)
}

// ============================================================
// NOTIFICACIONES
// ============================================================
const notificationFromRow = (r) => ({
  id: r.id,
  title: r.title,
  body: r.body,
  link: r.link,
  color: r.color,
  read: r.read,
  createdAt: r.created_at,
})

// RLS ya filtra a lo que me corresponde ver: lo mío (profile_id),
// lo global (profile_id null) o lo de mi rol (target_role).
export async function listNotifications() {
  must()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
  check(error)
  return data.map(notificationFromRow)
}

export async function markNotificationRead(id) {
  must()
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
  check(error)
}

// Notificación dirigida a todo un rol (ej. avisarle a Reclutamiento que
// Admin devolvió un aspirante). Solo Admin puede insertar directo (RLS:
// notifications_admin_insert), igual que las que ya crea la app por
// trigger para "nuevo aspirante"/"documento subido".
export async function notifyRole(targetRole, { title, body, link, color = '#FF8FB1' }) {
  must()
  const { error } = await supabase
    .from('notifications')
    .insert({ target_role: targetRole, title, body, link, color })
  check(error)
}

export async function notifyUser(profileId, { title, body, link, color = '#19C7A0' }) {
  must()
  const { error } = await supabase
    .from('notifications')
    .insert({ profile_id: profileId, title, body, link, color })
  check(error)
}

// Cambiar el correo o la contraseña de OTRA cuenta requiere la API de
// administración de Supabase Auth (service role key), que nunca debe
// vivir en el navegador. Por eso esto llama a un endpoint propio
// (api/admin-update-user.js, función serverless de Vercel) que guarda
// esa clave solo del lado del servidor. Aquí solo se reenvía el token
// de la sesión actual, para que el servidor confirme que quien llama
// es realmente un Administrador.
export async function adminUpdateAuthUser({ userId, email, password }) {
  must()
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
  check(sessionErr)
  const token = sessionData?.session?.access_token
  if (!token) throw new Error('No hay una sesión activa.')

  const res = await fetch('/api/admin-update-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, email, password }),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'No se pudo completar la operación.')
  return body
}

// Envía el correo de "proceso aprobado" al aspirante. El envío real (vía
// Resend) solo puede ocurrir en el servidor (la API key de Resend nunca
// debe estar en el navegador), por eso esto llama a un endpoint propio
// (api/send-approval-email.js) que valida que quien llama es Administrador
// antes de enviar nada.
export async function sendApprovalEmail({ email, name }) {
  must()
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
  check(sessionErr)
  const token = sessionData?.session?.access_token
  if (!token) throw new Error('No hay una sesión activa.')

  const res = await fetch('/api/send-approval-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, name }),
  })

  const raw = await res.text()
  let body = {}
  try { body = raw ? JSON.parse(raw) : {} } catch { /* respuesta no era JSON */ }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('El endpoint /api/send-approval-email no existe en este entorno. Las funciones serverless solo corren cuando la app está desplegada en Vercel (no en "npm run dev" local).')
    }
    throw new Error(body.error || raw?.slice(0, 200) || `No se pudo enviar el correo (HTTP ${res.status}).`)
  }
  return body
}
