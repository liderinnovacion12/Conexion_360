import { useState, useRef, useEffect } from 'react'
import { Bell, Menu, Sun, Moon, KeyRound, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { usePermissions } from '../../context/PermissionsContext.jsx'
import { ROLE_META } from '../../utils/roles.js'
import { NOTIFICATIONS } from '../../data/mockNotifications.js'
import ChangePasswordModal from '../feature/ChangePasswordModal.jsx'

export default function Topbar({ title, subtitle, onMenu }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { hasCapability } = usePermissions()
  const meta = ROLE_META[user?.role]
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const ref = useRef(null)
  const userRef = useRef(null)
  const notifs = NOTIFICATIONS[user?.role] || NOTIFICATIONS.default
  const canChangePassword = hasCapability(user?.id, 'canChangePassword')

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  const unread = notifs.filter((n) => !n.read).length

  return (
    <header className="topbar">
      <div className="row gap-2">
        <button className="icon-btn menu-toggle" onClick={onMenu} aria-label="Menú">
          <Menu size={20} />
        </button>
        <div className="topbar-title">
          <b>{title}</b>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>

      <div className="topbar-actions">
        <div className="search-box" style={{ display: 'none' }} />
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <span className="role-badge">
          <span className="dot" style={{ background: meta?.color, color: meta?.color }} />
          <span className="role-text">{meta?.label}</span>
        </span>

        <div className="notif-wrap" ref={ref}>
          <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Notificaciones">
            <Bell size={19} />
            {unread > 0 && <span className="notif-count">{unread}</span>}
          </button>
          {open && (
            <div className="notif-panel">
              <div className="row between" style={{ padding: '14px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                <b style={{ fontSize: '0.9rem' }}>Notificaciones</b>
                <span className="badge badge--info">{unread} nuevas</span>
              </div>
              {notifs.map((n) => (
                <div className="notif-item" key={n.id}>
                  <span className="notif-dot" style={{ background: n.color }} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                    <div className="card-sub">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="notif-wrap" ref={userRef}>
          <button className="avatar" style={{ border: 'none' }} onClick={() => setUserMenuOpen((o) => !o)} title={user?.name} aria-label="Mi cuenta">
            {user?.avatar}
          </button>
          {userMenuOpen && (
            <div className="notif-panel" style={{ width: 240 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                <b style={{ fontSize: '0.9rem', display: 'block' }}>{user?.name}</b>
                <span className="card-sub">{meta?.label}</span>
              </div>
              <button
                className="nav-link"
                style={{ width: '100%', borderRadius: 0, opacity: canChangePassword ? 1 : 0.5, cursor: canChangePassword ? 'pointer' : 'not-allowed' }}
                onClick={() => canChangePassword && (setPwOpen(true), setUserMenuOpen(false))}
                disabled={!canChangePassword}
                title={canChangePassword ? undefined : 'Tu rol no tiene permiso para cambiar la contraseña'}
              >
                <KeyRound /> <span>Cambiar contraseña</span>
              </button>
              <button className="nav-link" style={{ width: '100%', borderRadius: 0 }} onClick={logout}>
                <LogOut /> <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </header>
  )
}
