import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeft, LogOut } from 'lucide-react'
import { LogoMark } from '../../assets/Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { usePermissions } from '../../context/PermissionsContext.jsx'
import { NAV_CONFIG } from '../../routes/navConfig.jsx'
import { ROLE_META } from '../../utils/roles.js'

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const { isNavItemEnabled } = usePermissions()
  const meta = ROLE_META[user?.role]

  // Filtra los ítems deshabilitados por el Admin en Permisos, y oculta
  // secciones que se queden sin ítems visibles.
  const sections = (NAV_CONFIG[user?.role] || [])
    .map((sec) => ({ ...sec, items: sec.items.filter((item) => isNavItemEnabled(user?.id, item.to)) }))
    .filter((sec) => sec.items.length > 0)

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <LogoMark size={34} />
        <div className="brand-text">
          <b>Conexión 360</b>
          <span>Todo Ágil CTA</span>
        </div>
        <button className="collapse-btn" onClick={onToggle} aria-label="Contraer menú">
          {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      <nav className="col" style={{ overflowY: 'auto', flex: 1 }}>
        {sections.map((sec) => (
          <div key={sec.section}>
            <div className="nav-section-label">{sec.section}</div>
            {sec.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user">
          <div className="avatar">{user?.avatar}</div>
          <div className="info">
            <b>{user?.name}</b>
            <span>{meta?.short}</span>
          </div>
        </div>
        <button className="nav-link" onClick={logout} style={{ width: '100%', marginTop: 4 }}>
          <LogOut />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
