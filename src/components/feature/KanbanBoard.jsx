import { useState } from 'react'

// Tablero Kanban con arrastrar y soltar (HTML5 DnD nativo).
export default function KanbanBoard({ columns, items, onMove, renderCard }) {
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  return (
    <div className="kanban">
      {columns.map((col) => {
        const colItems = items.filter((it) => it.stage === col.id)
        return (
          <div
            key={col.id}
            className={`kanban-col ${overCol === col.id ? 'drop-target' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setOverCol(col.id)
            }}
            onDragLeave={() => setOverCol(null)}
            onDrop={() => {
              if (dragId != null) onMove?.(dragId, col.id)
              setDragId(null)
              setOverCol(null)
            }}
          >
            <div className="kanban-col-head">
              <b>{col.label}</b>
              <span className="count">{colItems.length}</span>
            </div>
            <div className="kanban-cards">
              {colItems.map((it) => (
                <div
                  key={it.id}
                  className={`kanban-card ${dragId === it.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => setDragId(it.id)}
                  onDragEnd={() => setDragId(null)}
                >
                  {renderCard ? renderCard(it) : <b>{it.name}</b>}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
