import { useState, useEffect, useRef, useMemo } from 'react'
import {
  MessageSquare, X, Send, ChevronLeft, Users, Hash, Search
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useUsers } from '../../hooks/useUsers.js'
import { useInternalChat, dmChannelId } from '../../hooks/useInternalChat.js'

const ROLE_COLORS = {
  admin:       '#19E3D9',
  reclutador:  '#9B5DE5',
  juridico:    '#FFC857',
  finanzas:    '#2EE6A6',
  empleado:    '#FF5D73',
  aspirante:   '#aaa',
}
const ROLE_LABELS = {
  admin:      'Admin',
  reclutador: 'Reclutador',
  juridico:   'Jurídica',
  finanzas:   'Finanzas',
  empleado:   'Personal',
  aspirante:  'Aspirante',
}

function Avatar({ name, role, size = 28 }) {
  const initials = name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  const color = ROLE_COLORS[role] || '#aaa'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color + '22', border: `1.5px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color,
    }}>
      {initials}
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  const diff = Math.floor((today - d) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

// ── Panel de mensajes de un canal ────────────────────────────────────────────
function ChatPane({ channelId, title, subtitle, onBack, currentUser }) {
  const { messages, loading, send } = useInternalChat(channelId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setText('')
    try {
      await send({ fromId: currentUser.id, fromName: currentUser.name, fromRole: currentUser.role, content })
    } finally { setSending(false) }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Agrupar mensajes por día
  const grouped = useMemo(() => {
    const groups = []
    let lastDay = null
    messages.forEach((m) => {
      const day = m.createdAt?.slice(0, 10)
      if (day !== lastDay) { groups.push({ type: 'day', day }); lastDay = day }
      groups.push({ type: 'msg', msg: m })
    })
    return groups
  }, [messages])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header del canal */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderBottom: '1px solid var(--glass-border)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', padding: 2 }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{subtitle}</div>}
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading && <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', padding: 16 }}>Cargando…</div>}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', padding: 24 }}>
            Aún no hay mensajes. ¡Escribe el primero!
          </div>
        )}
        {grouped.map((item, i) => {
          if (item.type === 'day') return (
            <div key={`day-${item.day}-${i}`} style={{ textAlign: 'center', margin: '8px 0 4px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              {formatDay(item.day + 'T00:00:00')}
            </div>
          )
          const m = item.msg
          const isMe = m.fromId === currentUser.id
          const prev = grouped[i - 1]
          const sameAuthor = prev?.type === 'msg' && prev.msg.fromId === m.fromId
          return (
            <div key={m.id} style={{
              display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
              alignItems: 'flex-end', gap: 7,
              marginTop: sameAuthor ? 2 : 10,
            }}>
              {!isMe && !sameAuthor && <Avatar name={m.fromName} role={m.fromRole} size={26} />}
              {!isMe && sameAuthor  && <div style={{ width: 26, flexShrink: 0 }} />}
              <div style={{ maxWidth: '78%' }}>
                {!isMe && !sameAuthor && (
                  <div style={{ fontSize: '0.7rem', color: ROLE_COLORS[m.fromRole] || 'var(--text-dim)', fontWeight: 700, marginBottom: 2, paddingLeft: 4 }}>
                    {m.fromName} · {ROLE_LABELS[m.fromRole] || m.fromRole}
                  </div>
                )}
                <div style={{
                  padding: '8px 11px', borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: isMe ? 'var(--primary)' : 'var(--surface)',
                  color: isMe ? '#fff' : 'var(--text)',
                  fontSize: '0.84rem', lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}>
                  {m.content}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: isMe ? 'right' : 'left', marginTop: 2, paddingLeft: 4, paddingRight: 4 }}>
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: '10px 12px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe un mensaje… (Enter para enviar)"
          style={{
            flex: 1, resize: 'none', background: 'var(--surface)',
            border: '1px solid var(--glass-border)', borderRadius: 10,
            padding: '8px 12px', fontSize: '0.84rem', color: 'var(--text)',
            outline: 'none', lineHeight: 1.4, fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: text.trim() ? 'var(--primary)' : 'var(--surface)',
            color: text.trim() ? '#fff' : 'var(--text-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, alignSelf: 'flex-end', transition: 'background .15s',
          }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}

// ── Lista de canales / contactos ─────────────────────────────────────────────
function ChatHome({ currentUser, users, onSelectChannel, onSelectDM }) {
  const [search, setSearch] = useState('')

  const peers = useMemo(() =>
    users.filter((u) => u.id !== currentUser.id)
         .filter((u) => !search || u.name?.toLowerCase().includes(search.toLowerCase()))
  , [users, currentUser.id, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Canal general */}
      <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <button
          onClick={() => onSelectChannel('general', '# General', 'Canal del equipo')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, border: '1px solid var(--glass-border)',
            background: 'var(--surface)', cursor: 'pointer', textAlign: 'left',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
        >
          <Hash size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>General</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Canal del equipo · todos los usuarios</div>
          </div>
        </button>
      </div>

      {/* Búsqueda + lista de DMs */}
      <div style={{ padding: '10px 14px 6px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario…"
            style={{
              width: '100%', paddingLeft: 28, paddingRight: 10, padding: '7px 10px 7px 28px',
              background: 'var(--surface)', border: '1px solid var(--glass-border)',
              borderRadius: 8, fontSize: '0.8rem', color: 'var(--text)', outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)', margin: '8px 0 6px' }}>
          <Users size={11} style={{ marginRight: 4 }} />Mensajes directos
        </div>
        {peers.length === 0 && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '12px 4px' }}>Sin usuarios encontrados.</div>
        )}
        {peers.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelectDM(u)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10, border: 'none',
              background: 'transparent', cursor: 'pointer', textAlign: 'left',
              transition: 'background .15s', marginBottom: 2,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar name={u.name} role={u.role} size={30} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {u.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: ROLE_COLORS[u.role] || 'var(--text-dim)' }}>
                {ROLE_LABELS[u.role] || u.role}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Widget flotante principal ─────────────────────────────────────────────────
export default function ChatWidget() {
  const { user } = useAuth()
  const { users } = useUsers()
  const [open, setOpen] = useState(false)
  const [channel, setChannel] = useState(null) // { id, title, subtitle }

  if (!user) return null

  const openChannel = (id, title, subtitle) => setChannel({ id, title, subtitle })
  const openDM = (peer) => {
    const id = dmChannelId(user.id, peer.id)
    setChannel({ id, title: peer.name, subtitle: ROLE_LABELS[peer.role] || peer.role })
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 1200,
          width: 340, height: 480,
          background: 'var(--bg, #0C1322)',
          border: '1px solid var(--glass-border)',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideUp .2s ease',
        }}>
          {/* Header del panel */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid var(--glass-border)',
            background: 'var(--surface)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Chat interno</span>
            </div>
            <button
              onClick={() => { setOpen(false); setChannel(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Contenido */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {channel ? (
              <ChatPane
                channelId={channel.id}
                title={channel.title}
                subtitle={channel.subtitle}
                onBack={() => setChannel(null)}
                currentUser={user}
              />
            ) : (
              <ChatHome
                currentUser={user}
                users={users}
                onSelectChannel={openChannel}
                onSelectDM={openDM}
              />
            )}
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => { setOpen((o) => !o); if (open) setChannel(null) }}
        aria-label="Chat interno"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1200,
          width: 48, height: 48, borderRadius: '50%', border: 'none',
          background: 'var(--primary, #19E3D9)',
          color: '#0C1322',
          boxShadow: '0 4px 20px rgba(25,227,217,0.4)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform .15s, box-shadow .15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(25,227,217,0.55)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 4px 20px rgba(25,227,217,0.4)'  }}
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}
