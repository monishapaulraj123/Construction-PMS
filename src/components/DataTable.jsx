import { useState } from 'react'
import { Pencil, Trash2, Eye } from 'lucide-react'
import EmptyState from './EmptyState'

const PAGE_SIZE = 6

export default function DataTable({ columns, rows, onEdit, onDelete, onView, keyField = 'id', emptyMessage = 'No records found' }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageRows = rows.slice(start, start + PAGE_SIZE)

  if (rows.length === 0) {
    return (
      <div className="table-wrap">
        <EmptyState title="Nothing here yet" description={emptyMessage} />
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {(onEdit || onDelete || onView) && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td>
                  <div className="row-actions">
                    {onView && (
                      <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => onView(row)} aria-label="View Details">
                        <Eye size={14} />
                      </button>
                    )}
                    {onEdit && (
                      <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => onEdit(row)} aria-label="Edit">
                        <Pencil size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => onDelete(row)} aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        <span>
          Showing {start + 1}-{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}
        </span>
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`page-btn ${n === page ? 'active' : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
