import { useState, useRef, useEffect } from 'react'
import { Bell, Menu, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLE_META } from '../../utils/roles.js'
import { NOTIFICATIONS } from '../../data/mockNotifications.js'

export default function Topbar({ title, subtitle, onMenu }) {
  const { user } = useAuth()
  const meta = ROLE_META[user?.role]
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const notifs = NOTIFICATIONS[user?.role] || NOTIFICATIONS.default

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
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

        <div className="avatar" title={user?.name}>{user?.avatar}</div>
      </div>
    </header>
  )
}
