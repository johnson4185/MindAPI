'use client'

import React, { useMemo } from 'react'
import { Skeleton } from './Skeleton'

export interface Column<T> {
  key: keyof T
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, item: T) => React.ReactNode
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[]
  data: T[]
  keyField?: keyof T
  loading?: boolean
  empty?: React.ReactNode
  onRowClick?: (item: T) => void
  className?: string
  striped?: boolean
  hoverable?: boolean
  selectable?: boolean
  selectedRows?: string[]
  onSelectRow?: (rowKey: string, selected: boolean) => void
  stickyHeader?: boolean
}

/**
 * Unified DataTable component using the project's design system (CSS variables).
 * Replaces 8+ different table implementations across all list pages.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id' as keyof T,
  loading = false,
  empty,
  onRowClick,
  className = '',
  striped = true,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  stickyHeader = false,
}: DataTableProps<T>) {
  const allSelected = useMemo(
    () => data.length > 0 && selectedRows.length === data.length,
    [data.length, selectedRows.length],
  )

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectRow) return
    for (const item of data) {
      const key = String(item[keyField])
      if (checked && !selectedRows.includes(key)) {
        onSelectRow(key, true)
      } else if (!checked && selectedRows.includes(key)) {
        onSelectRow(key, false)
      }
    }
  }

  if (loading) {
    return (
      <div className="surface-card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              {selectable && <th style={{ width: 48 }} />}
              {columns.map((col) => (
                <th key={String(col.key)} style={col.width ? { width: col.width } : undefined}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i}>
                {selectable && <td />}
                {columns.map((col, ci) => (
                  <td key={String(col.key)}>
                    <Skeleton height={14} width={ci === 0 ? '78%' : '50%'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="surface-card" style={{ overflow: 'hidden' }}>
        {empty || (
          <div className="empty-state">
            <div className="empty-state-title">Nothing here yet</div>
            <div className="empty-state-body">No results match your criteria.</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`surface-card ${className}`.trim()}
      style={{ overflow: 'auto', borderRadius: 'var(--r-md)' }}
    >
      <table style={{ minWidth: columns.length * 120 }}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: 48, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{
                  textAlign: col.align || 'left',
                  ...(col.width ? { width: col.width } : {}),
                  ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 2 } : {}),
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const rawKey = item[keyField]
            const rowKey = rawKey != null ? String(rawKey) : `row-${index}`
            const isSelected = selectedRows.includes(rowKey)

            return (
              <tr
                key={rowKey}
                onClick={() => !selectable && onRowClick?.(item)}
                style={{
                  background: isSelected
                    ? 'rgba(26, 95, 180, 0.04)'
                    : striped && index % 2 === 1
                      ? 'var(--c-panel-soft)'
                      : undefined,
                  cursor: !selectable && onRowClick ? 'pointer' : undefined,
                  transition: 'background var(--t-fast)',
                }}
              >
                {selectable && (
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        onSelectRow?.(rowKey, e.target.checked)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    style={{
                      textAlign: col.align || 'left',
                    }}
                    onClick={() => {
                      if (selectable && onRowClick) onRowClick(item)
                    }}
                  >
                    {col.render
                      ? col.render(item[col.key], item)
                      : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
