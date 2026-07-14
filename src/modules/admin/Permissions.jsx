import { useState } from 'react'
import { RotateCcw, Lock, Search, ChevronDown } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { Switch, Select } from '../../components/ui/Form.jsx'
import { AlertBanner } from '../../components/ui/Feedback.jsx'
import { usePermissions } from '../../context/PermissionsContext.jsx'
import { useUsers } from '../../hooks/useUsers.js'
import { NAV_CONFIG } from '../../routes/navConfig.jsx'
import { ROLE_META } from '../../utils/roles.js'
import { CAPABILITY_LABELS } from '../../data/mockPermissions.js'

export default function Permissions() {
  const { permissions, capabilityKeys, setNavEnabled, setCapability, resetUser } = usePermissions()
  const { users } = useUsers()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const filtered = users.filter((u) => {
    const matchesQuery = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
    const matchesRole = !roleFilter || u.role === roleFilter
    return matchesQuery && matchesRole
  })

  return (
    <div className="page">
      <PageHeader
        title="Permisos"
        subtitle="Control individual por persona. Despliega a alguien para ver y ajustar sus permisos de área."
      />

      <AlertBanner variant="info" title="Cómo funciona">
        Al asignarle un rol a una persona, hereda los permisos de esa área. Despliégala para ver o ajustar
        exactamente qué panel puede ver, quién firma y quién aprueba — los cambios se aplican de inmediato.
      </AlertBanner>

      <div className="row gap-2 wrap" style={{ margin: '16px 0' }}>
        <div className="search-box">
          <Search />
          <input className="input" placeholder="Buscar por nombre o correo…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          placeholder="Todos los roles"
          options={Object.keys(NAV_CONFIG).map((r) => ({ value: r, label: ROLE_META[r]?.label || r }))}
        />
      </div>

      <Card className="anim-up" style={{ padding: 0 }}>
        <div className="perm-list">
          {filtered.map((u) => {
            const meta = ROLE_META[u.role]
            const userPerms = permissions[u.id] || { nav: {}, caps: {} }
            const navSections = NAV_CONFIG[u.role] || []
            return (
              <details className="perm-row" key={u.id}>
                <summary className="perm-row-summary">
                  <span className="row gap-2" style={{ minWidth: 0 }}>
                    <div className="avatar avatar--sm">{u.avatar}</div>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                      <div className="card-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                    </span>
                  </span>
                  <span className="row gap-2" style={{ flexShrink: 0 }}>
                    <span className="row gap-2" style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>
                      <span className="dot" style={{ background: meta?.color, color: meta?.color, width: 7, height: 7, borderRadius: '50%', display: 'inline-block' }} />
                      {meta?.label}
                    </span>
                    <ChevronDown size={16} className="perm-row-chevron" />
                  </span>
                </summary>

                <div className="perm-row-body">
                  <div className="row between" style={{ marginBottom: 14 }}>
                    <span className="card-sub">Permisos de {meta?.label}, específicos para {u.name.split(' ')[0]}</span>
                    <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => resetUser(u.id)}>Restaurar</Button>
                  </div>

                  <div className="grid grid-2" style={{ gap: 24 }}>
                    <div className="col">
                      <div className="row gap-2" style={{ marginBottom: 8, color: 'var(--text-dim)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Paneles
                      </div>
                      {navSections.flatMap((section) =>
                        section.items.map((item) => (
                          <div className="stat-row" key={item.to}>
                            <span className="row gap-2" style={{ fontSize: '0.86rem' }}>
                              <item.icon size={15} className="dim" />
                              {item.label}
                            </span>
                            <Switch
                              checked={userPerms.nav[item.to] !== false}
                              onChange={(v) => setNavEnabled(u.id, item.to, v)}
                              label={`Panel ${item.label} para ${u.name}`}
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div className="col">
                      <div className="row gap-2" style={{ marginBottom: 8, color: 'var(--text-dim)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <Lock size={13} /> Capacidades
                      </div>
                      {capabilityKeys.map((cap) => (
                        <div className="stat-row" key={cap}>
                          <span style={{ fontSize: '0.86rem' }}>{CAPABILITY_LABELS[cap]}</span>
                          <Switch
                            checked={userPerms.caps[cap] !== false}
                            onChange={(v) => setCapability(u.id, cap, v)}
                            label={`${CAPABILITY_LABELS[cap]} para ${u.name}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
