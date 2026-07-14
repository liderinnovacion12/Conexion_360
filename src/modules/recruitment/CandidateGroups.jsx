import { useState } from 'react'
import { Plus, Trash2, Users, UsersRound } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import { Field, Input } from '../../components/ui/Form.jsx'
import { EmptyState } from '../../components/ui/Feedback.jsx'
import { useCandidateGroups } from '../../hooks/useCandidateGroups.js'
import { CANDIDATES } from '../../data/mockCandidates.js'

const COLORS = ['#19E3D9', '#9B5DE5', '#FFC857', '#2EE6A6', '#FF8FB1', '#7BD0FF']

export default function CandidateGroups() {
  const { groups, addGroup, removeGroup, candidatesInGroup, isMember, toggleMembership } = useCandidateGroups()
  const [name, setName] = useState('')
  const [assignFor, setAssignFor] = useState(null)

  const create = () => {
    if (!name.trim()) return
    addGroup(name.trim(), COLORS[groups.length % COLORS.length])
    setName('')
  }

  return (
    <div className="page">
      <PageHeader
        title="Grupos de aspirantes"
        subtitle="Crea grupos libres (ej. Abogados, Ingenieros) y asigna candidatos cuando quieras."
      />

      <Card title="Nuevo grupo" className="anim-up" style={{ marginBottom: 18 }}>
        <div className="row gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del grupo, ej: Abogados" onKeyDown={(e) => e.key === 'Enter' && create()} />
          <Button variant="primary" icon={Plus} onClick={create}>Crear grupo</Button>
        </div>
      </Card>

      {groups.length === 0 ? (
        <Card><EmptyState icon={UsersRound} title="Aún no hay grupos">Crea el primero arriba.</EmptyState></Card>
      ) : (
        <div className="grid grid-3 stagger">
          {groups.map((g) => {
            const members = candidatesInGroup(g.id)
            return (
              <Card key={g.id}>
                <div className="row between" style={{ marginBottom: 10 }}>
                  <span className="row gap-2" style={{ fontWeight: 600 }}>
                    <span className="dot" style={{ background: g.color, color: g.color, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
                    {g.name}
                  </span>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeGroup(g.id)} />
                </div>
                <div className="row gap-2" style={{ marginBottom: 12 }}>
                  <Users size={15} className="dim" />
                  <span className="card-sub">{members.length} aspirante(s)</span>
                </div>
                <Button size="sm" variant="ghost" className="full" onClick={() => setAssignFor(g)}>Gestionar aspirantes</Button>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={!!assignFor}
        onClose={() => setAssignFor(null)}
        title={`Aspirantes en: ${assignFor?.name || ''}`}
        footer={<Button variant="primary" onClick={() => setAssignFor(null)}>Listo</Button>}
      >
        <div className="col gap-2">
          <p className="card-sub">Marca los aspirantes que pertenecen a este grupo.</p>
          {CANDIDATES.map((c) => (
            <label key={c.id} className="stat-row" style={{ cursor: 'pointer' }}>
              <span className="row gap-2">
                <div className="avatar avatar--sm">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                {c.name}
              </span>
              <input
                type="checkbox"
                checked={assignFor ? isMember(c.id, assignFor.id) : false}
                onChange={() => toggleMembership(c.id, assignFor.id)}
              />
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}
