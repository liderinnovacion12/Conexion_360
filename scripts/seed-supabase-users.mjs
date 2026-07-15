// ============================================================
// Conexión 360 · Crea las 8 cuentas de demostración en Supabase Auth.
//
// Por qué un script aparte y no SQL: Supabase Auth necesita su API de
// administración para generar contraseñas de forma segura (hash, etc.);
// no se puede insertar directamente en auth.users por SQL de forma
// confiable. El trigger `handle_new_auth_user` (0002_functions_rls.sql)
// crea automáticamente la fila en `profiles` para cada usuario nuevo,
// leyendo el rol/nombre desde user_metadata.
//
// Uso:
//   1. npm install @supabase/supabase-js  (si no está ya instalado)
//   2. Exporta las variables de entorno (NUNCA las subas a git):
//        set SUPABASE_URL=https://tu-proyecto.supabase.co        (Windows cmd)
//        set SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
//      o en PowerShell:
//        $env:SUPABASE_URL="https://tu-proyecto.supabase.co"
//        $env:SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
//   3. node scripts/seed-supabase-users.mjs
//
// La "service role key" se obtiene en Supabase Dashboard → Project
// Settings → API. Tiene permisos totales: úsala solo aquí, en un
// script local, nunca en el frontend ni en el repositorio.
// ============================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Mismas cuentas que src/data/mockUsers.js. Cambia la contraseña de
// demostración antes de ir a producción real.
const DEMO_USERS = [
  { email: 'admin@conexion360.co', name: 'Laura Mendoza', role: 'admin', avatar: 'LM', area: 'Dirección General' },
  { email: 'finanzas@conexion360.co', name: 'Carlos Ríos', role: 'finance', avatar: 'CR', area: 'Financiera / Nómina' },
  { email: 'reclutamiento@conexion360.co', name: 'Daniela Ortiz', role: 'recruitment', avatar: 'DO', area: 'Talento Humano' },
  { email: 'aspirante@conexion360.co', name: 'Andrés Pérez', role: 'candidate', avatar: 'AP', area: 'Proceso de selección', candidateId: 'c-101' },
  { email: 'personal@conexion360.co', name: 'María Gómez', role: 'employee', avatar: 'MG', area: 'Operaciones', employeeId: 'p-001' },
  { email: 'auditor@conexion360.co', name: 'Patricia León', role: 'auditor', avatar: 'PL', area: 'Auditoría interna' },
  { email: 'juridica@conexion360.co', name: 'Ricardo Vanegas', role: 'legal', avatar: 'RV', area: 'Jurídica / Contratos' },
  { email: 'cliente@conexion360.co', name: 'Mariana Cárdenas', role: 'client', avatar: 'MC', area: 'Cliente externo', clientCompany: 'Distribuidora Andina S.A.S.' },
]

const DEMO_PASSWORD = 'Conexion360'

async function main() {
  const createdIds = {}

  for (const u of DEMO_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role, avatar: u.avatar, area: u.area },
    })

    if (error) {
      console.error(`✗ ${u.email}:`, error.message)
      continue
    }

    createdIds[u.email] = data.user.id
    console.log(`✓ ${u.email} creado (${data.user.id})`)

    // El trigger handle_new_auth_user SIEMPRE crea el perfil como
    // 'candidate' por seguridad (el registro público de aspirantes no
    // debe poder auto-asignarse otro rol). Aquí, con la service role key
    // (privilegio total, nunca disponible en el cliente), corregimos el
    // rol real de cada cuenta de demo y completamos candidate_id /
    // employee_id / client_company.
    const patch = { role: u.role }
    if (u.candidateId) patch.candidate_id = u.candidateId
    if (u.employeeId) patch.employee_id = u.employeeId
    if (u.clientCompany) patch.client_company = u.clientCompany

    const { error: updErr } = await supabase.from('profiles').update(patch).eq('id', data.user.id)
    if (updErr) console.error(`  ⚠ no se pudo actualizar el perfil de ${u.email}:`, updErr.message)
  }

  // Aprobador sugerido por área (ver AREA_APPROVERS en mockApprovals.js).
  const areaMap = {
    'Jurídica / Contratos': createdIds['juridica@conexion360.co'],
    'Financiera / Nómina': createdIds['finanzas@conexion360.co'],
    'Talento Humano': createdIds['reclutamiento@conexion360.co'],
    'Dirección General': createdIds['admin@conexion360.co'],
  }
  for (const [area, approverId] of Object.entries(areaMap)) {
    if (!approverId) continue
    const { error } = await supabase
      .from('area_approvers')
      .upsert({ area, approver_profile_id: approverId }, { onConflict: 'area' })
    if (error) console.error(`  ⚠ area_approvers "${area}":`, error.message)
  }

  console.log('\nListo. Contraseña para todas las cuentas:', DEMO_PASSWORD)
}

main()
