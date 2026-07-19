import { useState } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import NotificationToast from '../components/layout/NotificationToast.jsx'
import ChatWidget from '../components/feature/ChatWidget.jsx'
import { NAV_CONFIG } from '../routes/navConfig.jsx'
import { matchNavItem } from '../routes/navMatch.js'
import { useAuth } from '../context/AuthContext.jsx'
import { usePermissions } from '../context/PermissionsContext.jsx'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { isNavItemEnabled } = usePermissions()

  const match = matchNavItem(NAV_CONFIG, user?.role, pathname)
  const title = match?.label || 'Panel'

  // Si el Admin deshabilitó este panel para el rol del usuario, se bloquea
  // el acceso directo por URL (no solo se oculta del sidebar).
  if (match && !isNavItemEnabled(user?.id, match.to)) {
    return <Navigate to="/403" replace />
  }

  return (
    <div className="shell">
      <NotificationToast />
      <ChatWidget />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
      <div className="main">
        <Topbar title={title} subtitle="Conexión 360 · Todo Ágil CTA" onMenu={() => setMobileOpen(true)} />
        <main className="grow">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
