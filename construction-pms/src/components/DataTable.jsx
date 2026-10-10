import { useState } from 'react'
import { Pencil, Trash2, Eye } from 'lucide-react'
import EmptyState from './EmptyState'
import { useTranslation } from '../context/LanguageContext'

const PAGE_SIZE = 6

export default function DataTable({
  columns = [],
  rows,
  data,
  onEdit,
  onDelete,
  onView,
  keyField = 'id',
  emptyMessage,
}) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const tableRows = data || rows || []
  const totalPages = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageRows = tableRows.slice(start, start + PAGE_SIZE)

  const resolvedEmptyMsg = emptyMessage || t('no_records', 'No records found')

  if (tableRows.length === 0) {
    return (
      <div className="table-wrap">
        <EmptyState title={t('nothing_here', 'Nothing here yet')} description={resolvedEmptyMsg} />
      </div>
    )
  }

  const renderCell = (col, row) => {
    if (typeof col.accessor === 'function') {
      return col.accessor(row)
    }
    if (typeof col.accessor === 'string' && row[col.accessor] !== undefined) {
      return row[col.accessor]
    }
    if (typeof col.render === 'function') {
      return col.render(row)
    }
    if (col.key && row[col.key] !== undefined) {
      return row[col.key]
    }
    return ''
  }

  const translateHeader = (col) => {
    const rawHeader = col.header || col.label || ''
    if (col.key) {
      return t(col.key, rawHeader)
    }
    const key = String(rawHeader).toLowerCase().replace(/\s+/g, '_')
    return t(key, rawHeader)
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || col.header || idx}>{translateHeader(col)}</th>
            ))}
            {(onEdit || onDelete || onView) && <th style={{ textAlign: 'right' }}>{t('actions', 'Actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, rowIdx) => {
            const keyVal =
              row[keyField] ||
              row.property_id ||
              row.request_id ||
              row.sell_request_id ||
              row.negotiation_id ||
              row.transaction_id ||
              row.service_id ||
              rowIdx
            return (
              <tr key={keyVal}>
                {columns.map((col, colIdx) => (
                  <td key={col.key || col.header || colIdx}>{renderCell(col, row)}</td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td>
                    <div className="row-actions">
                      {onView && (
                        <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => onView(row)} aria-label={t('details', 'View Details')}>
                          <Eye size={14} />
                        </button>
                      )}
                      {onEdit && (
                        <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => onEdit(row)} aria-label={t('edit', 'Edit')}>
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => onDelete(row)} aria-label={t('delete', 'Delete')}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {tableRows.length > PAGE_SIZE && (
        <div className="table-footer">
          <span>
            {t('showing', 'Showing')} {start + 1}-{Math.min(start + PAGE_SIZE, tableRows.length)} {t('of', 'of')} {tableRows.length}
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
      )}
    </div>
  )
}
