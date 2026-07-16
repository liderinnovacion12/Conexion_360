import { useMemo, useState } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import Button from './Button.jsx'

// Tabla con búsqueda, ordenamiento, paginación y exportación opcional.
export default function DataTable({
  columns,
  data,
  searchable = true,
  searchKeys,
  pageSize = 8,
  toolbar,
  onExport,
  emptyText = 'Sin registros para mostrar.',
  getRowStyle,
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [page, setPage] = useState(1)

  const keys = searchKeys || columns.map((c) => c.key)

  const filtered = useMemo(() => {
    let rows = data
    if (query.trim()) {
      const q = query.toLowerCase()
      rows = rows.filter((r) =>
        keys.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
      )
    }
    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key)
      rows = [...rows].sort((a, b) => {
        const av = col?.sortValue ? col.sortValue(a) : a[sort.key]
        const bv = col?.sortValue ? col.sortValue(b) : b[sort.key]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, query, sort, keys, columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, totalPages)
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize)

  const toggleSort = (key, sortable) => {
    if (sortable === false) return
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  return (
    <div>
      <div className="table-toolbar">
        <div className="row gap-2 wrap">
          {searchable && (
            <div className="search-box">
              <Search />
              <input
                className="input"
                placeholder="Buscar…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          )}
          {toolbar}
        </div>
        {onExport && (
          <div className="row gap-2">
            <Button size="sm" variant="ghost" onClick={() => onExport('excel')}>
              Exportar Excel
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onExport('pdf')}>
              Exportar PDF
            </Button>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={c.sortable === false ? 'no-sort' : ''}
                  onClick={() => toggleSort(c.key, c.sortable)}
                  style={c.width ? { width: c.width } : undefined}
                >
                  <span className="row gap-1" style={{ display: 'inline-flex' }}>
                    {c.header}
                    {sort.key === c.key &&
                      (sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td className="table-empty" colSpan={columns.length}>
                  <Inbox size={26} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <div>{emptyText}</div>
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr key={row.id ?? i} style={getRowStyle ? getRowStyle(row) : undefined}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.strong ? 'strong' : ''}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="pagination">
          <span className="card-sub">
            {filtered.length} registro(s) · página {current} de {totalPages}
          </span>
          <div className="pages">
            <Button size="sm" variant="ghost" icon={ChevronLeft} disabled={current === 1} onClick={() => setPage(current - 1)} />
            <Button size="sm" variant="ghost" icon={ChevronRight} disabled={current === totalPages} onClick={() => setPage(current + 1)} />
          </div>
        </div>
      )}
    </div>
  )
}
