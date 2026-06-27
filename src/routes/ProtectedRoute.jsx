import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Middleware RBAC: valida sesión y rol permitido por ruta.
export default function ProtectedRoute({ allow, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="error-page">
        <div className="col center gap-2">
          <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 18 }} />
          <span className="muted">Cargando…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return children
}
