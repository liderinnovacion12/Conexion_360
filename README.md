# Conexión 360 · Todo Ágil CTA

Plataforma multiplataforma de **reclutamiento, gestión de personal, control de nómina, gestión documental y tableros administrativos**. Prototipo funcional construido en **React + Vite**, con control de acceso por roles (RBAC), diseño glassmorphism/neón y arquitectura lista para **Supabase** y despliegue en **Vercel**.

![estado](https://img.shields.io/badge/estado-prototipo%20funcional-7B2FBE) ![stack](https://img.shields.io/badge/stack-React%20%2B%20Vite-19E3D9)

---

## 🚀 Puesta en marcha

Requisitos: **Node.js 18+** y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno (opcional para el prototipo)
cp .env.example .env

# 3. Levantar el entorno de desarrollo
npm run dev
```

La aplicación abre en `http://localhost:5173`.

```bash
npm run build     # Compila a /dist (producción)
npm run preview   # Sirve el build localmente
```

---

## 🔐 Cuentas de demostración

El prototipo funciona con **datos de ejemplo** (sin backend). Contraseña para todas: **`demo`**.

| Rol | Correo | Panel |
|-----|--------|-------|
| Administrador General | `admin@conexion360.co` | `/admin` |
| Área Financiera | `finanzas@conexion360.co` | `/finanzas` |
| Área de Reclutamiento | `reclutamiento@conexion360.co` | `/reclutamiento` |
| Aspirante | `aspirante@conexion360.co` | `/aspirante` |
| Personal Activo | `personal@conexion360.co` | `/personal` |
| Contratista | `contratista@conexion360.co` | `/contratista` |
| Auditor / Consulta | `auditor@conexion360.co` | `/auditoria` |

En la pantalla de inicio de sesión puedes hacer clic en cualquier cuenta para auto-completar las credenciales.

---

## 🧩 Roles y control de acceso (RBAC)

Cada rol tiene **su propio panel, menú lateral, permisos y rutas protegidas**. Las rutas no autorizadas redirigen a la página **403**. La lógica vive en:

- `src/utils/roles.js` — definición de roles, etiquetas y rutas de inicio.
- `src/routes/navConfig.jsx` — navegación por rol.
- `src/routes/ProtectedRoute.jsx` — middleware RBAC.
- `src/routes/AppRoutes.jsx` — mapa de rutas con `allow` por rol.

---

## 🗂️ Estructura del proyecto

```
src/
├── components/      # Librería de UI + componentes de función
│   ├── ui/          # Button, Card, KpiCard, DataTable, Modal, Form, Badge…
│   ├── charts/      # Recharts (barras, líneas, dona) + embudo CSS
│   ├── feature/     # Dropzone, SignaturePad, WebcamCapture, Kanban
│   ├── layout/      # Sidebar, Topbar
│   └── common/      # PageHeader
├── pages/           # Login, 403, 404
├── layouts/         # DashboardLayout (app shell)
├── routes/          # AppRoutes, ProtectedRoute, navConfig
├── services/        # supabaseClient, api (capa de datos)
├── context/         # AuthContext (sesión + auto-logout)
├── hooks/
├── data/            # Datasets mock (personal, aspirantes, documentos, cursos…)
├── utils/           # roles, format, pdf (certificados + export CSV)
├── styles/          # Sistema de diseño (index, components, layout)
├── assets/          # Logo y logo animado
└── modules/
    ├── admin/       # Panel ejecutivo, usuarios, auditoría, configuración
    ├── finance/     # Nómina, registro de personal, certificados
    ├── recruitment/ # Pipeline, aspirantes, revisión documental, cursos
    ├── candidate/   # Portal de aspirantes (datos, documentos, firma, cursos)
    ├── personnel/   # Personal activo y contratista (autoservicio)
    ├── documents/
    ├── courses/
    └── dashboard/   # Auditor (solo lectura) + cumplimiento
```

---

## 🎨 Identidad visual

- Paleta extraída del logo: **Teal/Cyan** `#19E3D9`, **Navy** `#0A0E1A`, **Blanco** `#FFFFFF`, **Violeta** `#7B2FBE`.
- Glassmorphism, glow de neón suave, gradientes navy→teal / navy→violeta.
- Logo que se **ensambla con líneas de neón** en la pantalla de login.
- Tipografía **Inter**. Animaciones de entrada y micro-interacciones (ripple, hover).
- **Responsive mobile-first** con sidebar colapsable y menú hamburguesa.

---

## ✨ Funcionalidades por módulo

- **Administrador:** KPIs ejecutivos, alertas, embudo, distribución de personal, gestión de usuarios, auditoría, configuración.
- **Financiera:** registro de personal con validación, analítica de nómina (área/cargo/contrato/estado), **generador de certificados laborales en PDF**, exportación a CSV/Excel.
- **Reclutamiento:** pipeline **Kanban + embudo**, creación de aspirantes, **revisión documental** (aprobar/rechazar/devolver con comentarios e historial de versiones), cursos y constructor de evaluaciones.
- **Aspirante:** datos personales, carga de documentos PDF (drag & drop), **autorización de datos (Ley 1581/2012) con firma digital** (dibujar / subir / escribir), cursos con **captura por webcam** y evaluación con puntaje automático + certificado.
- **Personal / Contratista:** autoservicio, información contractual, documentos, certificados, vigencia de contrato.
- **Auditor:** tableros analíticos de **solo lectura** y cumplimiento documental.

---

## 🔌 Integraciones preparadas (no activas en el prototipo)

| Integración | Punto de entrada |
|-------------|------------------|
| **Supabase** (Auth, DB, Storage) | `src/services/supabaseClient.js`, `.env` |
| **API REST/GraphQL** | `src/services/api.js` (capa de datos intercambiable) |
| **Asistente IA (Anthropic)** | `askAssistant()` — la clave vive **solo en backend** |
| **Odoo ERP** | variables `VITE_ODOO_*` |
| **Nómina** | módulo financiero |

> El modo de datos se controla con `VITE_DATA_MODE` (`mock` | `supabase`).

---

## 🔒 Seguridad y privacidad

- Rutas protegidas y validación de rol (RBAC).
- Autorización de tratamiento de datos personales (**Ley 1581 de 2012**) obligatoria con firma digital.
- Cierre de sesión automático por inactividad (`VITE_SESSION_TIMEOUT_MIN`).
- Validación de formularios y de tipo/tamaño de archivos en cargas.
- Credenciales por variables de entorno (**nunca** en el código).
- Cabeceras de seguridad en `vercel.json` (X-Frame-Options, nosniff, Referrer-Policy).
- Estructura de rutas de Storage con URLs firmadas (preparada para Supabase).

---

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel (framework: **Vite**).
3. Define las variables de entorno del `.env.example`.
4. Deploy. La configuración de SPA está en `vercel.json`.

---

## 🛣️ Próximos pasos sugeridos

- Conectar Supabase Auth y reemplazar `MOCK_USERS`.
- Persistir documentos en Supabase Storage con URLs firmadas.
- Migrar la capa `api.js` a consultas reales.
- Activar el asistente IA vía edge function.
- Integrar nómina y Odoo ERP.

---

© Conexión 360 · Todo Ágil CTA — Prototipo funcional. Los documentos generados son de muestra y no tienen validez legal.
