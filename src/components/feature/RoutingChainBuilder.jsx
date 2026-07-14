import { useState } from 'react'
import { Plus, X, GripVertical, Send } from 'lucide-react'
import Button from '../ui/Button.jsx'
import { Field, Select } from '../ui/Form.jsx'
import { useUsers } from '../../hooks/useUsers.js'
import { ROLE_META } from '../../utils/roles.js'

// Constructor de ruta de aprobación: "enviar de área en área" a personas
// activas concretas, en el orden en que deben firmar. `chain` es el arreglo
// controlado de pasos [{ id, name, role, area }, ...].
export default function RoutingChainBuilder({ chain, setChain }) {
  const { users } = useUsers()
  const [roleFilter, setRoleFilter] = useState('')
  const [personId, setPersonId] = useState('')

  const peopleInRole = users.filter((u) => u.role === roleFilter)

  const addStep = () => {
    const person = users.find((u) => u.id === personId)
    if (!person || chain.some((s) => s.id === person.id)) return
    setChain([...chain, { id: person.id, name: person.name, role: ROLE_META[person.role]?.label || person.role, area: person.area }])
    setPersonId('')
  }

  const removeStep = (id) => setChain(chain.filter((s) => s.id !== id))

  return (
    <div className="col gap-3">
      <p className="card-sub">
        Agrega a <b>una o varias personas</b>, en el orden en que deben firmar. Puedes repetir esto tantas veces
        como necesites.
      </p>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
        <Field label="Área">
          <Select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPersonId('') }}
            placeholder="Selecciona un área"
            options={Object.keys(ROLE_META).map((r) => ({ value: r, label: ROLE_META[r].label }))}
          />
        </Field>
        <Field label="Persona">
          <Select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            placeholder={roleFilter ? 'Selecciona una persona' : 'Elige un área primero'}
            options={peopleInRole.map((u) => ({ value: u.id, label: u.name }))}
          />
        </Field>
        <Button variant="ghost" icon={Plus} onClick={addStep} disabled={!personId}>
          {chain.length === 0 ? 'Agregar' : 'Agregar otra persona'}
        </Button>
      </div>

      {chain.length === 0 ? (
        <div className="glass-soft" style={{ padding: 14, textAlign: 'center' }}>
          <span className="card-sub">Agrega al menos una persona para poder enviar el documento a firma.</span>
        </div>
      ) : (
        <div className="col gap-2">
          {chain.map((step, i) => (
            <div key={step.id} className="stat-row" style={{ background: 'var(--surface)', borderRadius: 10, padding: '8px 12px', border: 0 }}>
              <span className="row gap-2">
                <GripVertical size={14} className="dim" />
                <span className="badge badge--neutral">{i + 1}</span>
                <span>
                  <b style={{ fontSize: '0.86rem' }}>{step.name}</b>
                  <span className="card-sub" style={{ marginLeft: 6 }}>{step.role}</span>
                </span>
              </span>
              <Button size="sm" variant="ghost" icon={X} onClick={() => removeStep(step.id)} />
            </div>
          ))}
          <p className="card-sub row gap-1"><Send size={13} /> El documento pasa de una persona a la siguiente, en este orden. Cada quien confirma su usuario y clave antes de firmar.</p>
        </div>
      )}
    </div>
  )
}
