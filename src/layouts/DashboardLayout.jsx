import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import { NAV_CONFIG } from '../routes/navConfig.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Resuelve el título de la página actual a partir de la navegación del rol.
function useCurrentTitle() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const items = (NAV_CONFIG[user?.role] || []).flatMap((s) => s.items)
  const match = items
    .filter((i) => pathname === i.to || pathname.startsWith(i.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0]
  return match?.label || 'Panel'
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = useCurrentTitle()

  return (
    <div className="shell">
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
