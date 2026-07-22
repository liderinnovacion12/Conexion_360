import { Routes, Route } from 'react-router-dom'
import { ROLES } from '../utils/roles.js'
import ProtectedRoute from './ProtectedRoute.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import ResetPassword from '../pages/ResetPassword.jsx'
import LandingPage from '../pages/LandingPage.jsx'
import { Forbidden, NotFound } from '../pages/ErrorPages.jsx'
import ApplyJob from '../pages/ApplyJob.jsx'
import JobsPage from '../pages/JobsPage.jsx'

// Admin
import AdminDashboard from '../modules/admin/AdminDashboard.jsx'
import UserManagement from '../modules/admin/UserManagement.jsx'
import DocumentEditor from '../modules/admin/DocumentEditor.jsx'
import AuditLogs from '../modules/admin/AuditLogs.jsx'
import Settings from '../modules/admin/Settings.jsx'
import Permissions from '../modules/admin/Permissions.jsx'
import DocumentApprovals from '../modules/admin/DocumentApprovals.jsx'
import Activities from '../modules/admin/Activities.jsx'
import SystemActivities from '../modules/admin/SystemActivities.jsx'
import ClientRequests from '../modules/admin/ClientRequests.jsx'
import CandidateApprovals from '../modules/admin/CandidateApprovals.jsx'
// Finance
import FinanceDashboard from '../modules/finance/FinanceDashboard.jsx'
import PersonnelRegistry from '../modules/finance/PersonnelRegistry.jsx'
import PayrollAnalytics from '../modules/finance/PayrollAnalytics.jsx'
import Certificates from '../modules/finance/Certificates.jsx'
import Clients from '../modules/finance/Clients.jsx'
import Invoicing from '../modules/finance/Invoicing.jsx'
// Permisos laborales
import EmployeePermissions from '../modules/personnel/EmployeePermissions.jsx'
import LeaveRequestsAdmin from '../modules/admin/LeaveRequestsAdmin.jsx'
// Recruitment
import RecruitmentDashboard from '../modules/recruitment/RecruitmentDashboard.jsx'
import Pipeline from '../modules/recruitment/Pipeline.jsx'
import CandidatesAdmin from '../modules/recruitment/CandidatesAdmin.jsx'
import DocumentReview from '../modules/recruitment/DocumentReview.jsx'
import CourseAssignment from '../modules/recruitment/CourseAssignment.jsx'
import CandidateGroups from '../modules/recruitment/CandidateGroups.jsx'
import FormBuilder from '../modules/recruitment/FormBuilder.jsx'
import JobPostings from '../modules/recruitment/JobPostings.jsx'
import JobApplications from '../modules/recruitment/JobApplications.jsx'
import AllDocuments from '../modules/shared/AllDocuments.jsx'
import RetiredPersonnel from '../modules/shared/RetiredPersonnel.jsx'
import RecruitmentApprovals from '../modules/recruitment/RecruitmentApprovals.jsx'
// Legal
import LegalDashboard from '../modules/legal/LegalDashboard.jsx'
import ContractTemplates from '../modules/legal/ContractTemplates.jsx'
import ContractIssuance from '../modules/legal/ContractIssuance.jsx'
import LegalApprovals from '../modules/legal/LegalApprovals.jsx'
// Candidate
import CandidateDashboard from '../modules/candidate/CandidateDashboard.jsx'
import CandidateProfile from '../modules/candidate/CandidateProfile.jsx'
import CandidateDocuments from '../modules/candidate/CandidateDocuments.jsx'
import DataAuthorization from '../modules/candidate/DataAuthorization.jsx'
import CandidateCourses from '../modules/candidate/CandidateCourses.jsx'
// Personnel
import EmployeeDashboard from '../modules/personnel/EmployeeDashboard.jsx'
import EmployeeProfile from '../modules/personnel/EmployeeProfile.jsx'
import EmployeeDocuments from '../modules/personnel/EmployeeDocuments.jsx'
import EmployeeCertificates from '../modules/personnel/EmployeeCertificates.jsx'
import MyContract from '../modules/personnel/MyContract.jsx'
import ContractToSign from '../modules/personnel/ContractToSign.jsx'
// Cliente
import ServicesShowcase from '../modules/client/ServicesShowcase.jsx'
import MyRequests from '../modules/client/MyRequests.jsx'
// Auditoría Admin
import AdminAudit from '../modules/admin/AdminAudit.jsx'

// Helper para envolver un grupo de rutas con layout + RBAC.
const Protected = ({ allow }) => (
  <ProtectedRoute allow={allow}>
    <DashboardLayout />
  </ProtectedRoute>
)

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/aplicar" element={<ApplyJob />} />
      <Route path="/empleos" element={<JobsPage />} />

      {/* ---------- Administrador General ---------- */}
      <Route path="/admin" element={<Protected allow={[ROLES.ADMIN]} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<UserManagement />} />
        <Route path="reclutamiento" element={<Pipeline />} />
        <Route path="vacantes" element={<JobPostings />} />
        <Route path="aplicaciones" element={<JobApplications />} />
        <Route path="todos-documentos" element={<AllDocuments />} />
        <Route path="aprobaciones-aspirantes" element={<CandidateApprovals />} />
        <Route path="permisos" element={<LeaveRequestsAdmin />} />
        <Route path="nomina" element={<PersonnelRegistry />} />
        <Route path="personal-retirado" element={<RetiredPersonnel />} />
        <Route path="documentos" element={<DocumentReview />} />
        <Route path="editor-documentos" element={<DocumentEditor />} />
        <Route path="documentos-por-firmar" element={<DocumentApprovals />} />
        <Route path="actividades" element={<Activities />} />
        <Route path="actividades-sistema" element={<SystemActivities />} />
        <Route path="cursos" element={<CourseAssignment />} />
        <Route path="solicitudes-clientes" element={<ClientRequests />} />
        <Route path="auditoria" element={<AuditLogs />} />
        <Route path="auditar" element={<AdminAudit />} />
        <Route path="permisos" element={<Permissions />} />
        <Route path="configuracion" element={<Settings />} />
      </Route>

      {/* ---------- Área Financiera ---------- */}
      <Route path="/finanzas" element={<Protected allow={[ROLES.FINANCE, ROLES.ADMIN]} />}>
        <Route index element={<FinanceDashboard />} />
        <Route path="personal" element={<PersonnelRegistry />} />
        <Route path="nomina" element={<PayrollAnalytics />} />
        <Route path="certificados" element={<Certificates />} />
        <Route path="clientes" element={<Clients />} />
        <Route path="facturacion" element={<Invoicing />} />
        <Route path="editor-documentos" element={<DocumentEditor />} />
        <Route path="documentos-por-firmar" element={<DocumentApprovals />} />
        <Route path="actividades" element={<Activities />} />
      </Route>

      {/* ---------- Área de Reclutamiento ---------- */}
      <Route path="/reclutamiento" element={<Protected allow={[ROLES.RECRUITMENT, ROLES.ADMIN]} />}>
        <Route index element={<RecruitmentDashboard />} />
        <Route path="vacantes" element={<JobPostings />} />
        <Route path="aplicaciones" element={<JobApplications />} />
        <Route path="todos-documentos" element={<AllDocuments />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="aspirantes" element={<CandidatesAdmin />} />
        <Route path="grupos" element={<CandidateGroups />} />
        <Route path="formularios" element={<FormBuilder />} />
        <Route path="documentos" element={<DocumentReview />} />
        <Route path="editor-documentos" element={<DocumentEditor />} />
        <Route path="personal-retirado" element={<RetiredPersonnel />} />
        <Route path="aprobaciones" element={<RecruitmentApprovals />} />
        <Route path="documentos-por-firmar" element={<DocumentApprovals />} />
        <Route path="actividades" element={<Activities />} />
        <Route path="cursos" element={<CourseAssignment />} />
      </Route>

      {/* ---------- Área Jurídica ---------- */}
      <Route path="/juridica" element={<Protected allow={[ROLES.LEGAL, ROLES.ADMIN]} />}>
        <Route index element={<LegalDashboard />} />
        <Route path="plantillas" element={<ContractTemplates />} />
        <Route path="contratos" element={<ContractIssuance />} />
        <Route path="editor-documentos" element={<DocumentEditor />} />
        <Route path="aprobaciones" element={<LegalApprovals />} />
        <Route path="aprobaciones-aspirantes" element={<CandidateApprovals />} />
        <Route path="todos-documentos" element={<AllDocuments />} />
        <Route path="documentos-por-firmar" element={<DocumentApprovals />} />
        <Route path="actividades" element={<Activities />} />
        <Route path="aspirantes" element={<CandidatesAdmin />} />
      </Route>

      {/* ---------- Portal de Aspirantes ---------- */}
      <Route path="/aspirante" element={<Protected allow={[ROLES.CANDIDATE]} />}>
        <Route index element={<CandidateDashboard />} />
        <Route path="perfil" element={<CandidateProfile />} />
        <Route path="documentos" element={<CandidateDocuments />} />
        <Route path="autorizacion" element={<DataAuthorization />} />
        <Route path="cursos" element={<CandidateCourses />} />
        <Route path="contrato-por-firmar" element={<ContractToSign />} />
      </Route>

      {/* ---------- Personal Activo (incluye prestación de servicios) ---------- */}
      <Route path="/personal" element={<Protected allow={[ROLES.EMPLOYEE]} />}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="perfil" element={<EmployeeProfile />} />
        <Route path="contrato" element={<MyContract />} />
        <Route path="documentos" element={<EmployeeDocuments />} />
        <Route path="certificados" element={<EmployeeCertificates />} />
        <Route path="permisos" element={<EmployeePermissions />} />
        <Route path="contrato-por-firmar" element={<ContractToSign />} />
      </Route>

      {/* ---------- Cliente (vitrina de servicios) ---------- */}
      <Route path="/cliente" element={<Protected allow={[ROLES.CLIENT]} />}>
        <Route index element={<ServicesShowcase />} />
        <Route path="solicitudes" element={<MyRequests />} />
      </Route>

      {/* ---------- Errores ---------- */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
