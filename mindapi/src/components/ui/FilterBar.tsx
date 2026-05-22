'use client'

import { ReactNode } from 'react'

interface FilterOption {
  value: string
  label: string
}

interface FilterSelect {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  placeholder?: string
}

interface FilterBarProps {
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  selects?: FilterSelect[]
  rightContent?: ReactNode
  resultCount?: string | number
  loading?: boolean
}

export function FilterBar({ search, selects, rightContent, resultCount, loading }: FilterBarProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: search ? 'minmax(240px, 1fr)' + (selects?.length ? ` repeat(${selects.length}, auto)` : '') + (rightContent ? ' auto' : '') : '1fr',
        gap: 8,
        alignItems: 'center',
        marginBottom: 14,
      }}
    >
      {search && (
        <div style={{ position: 'relative' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--c-ink-4)"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.5-4.5" />
          </svg>
          <input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder || 'Search…'}
            style={{ paddingLeft: 34 }}
          />
        </div>
      )}

      {selects?.map((select, i) => (
        <select
          key={i}
          value={select.value}
          onChange={(e) => select.onChange(e.target.value)}
          style={{ minWidth: 140 }}
        >
          {select.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {rightContent && (
        <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 10 }}>
          {rightContent}
        </div>
      )}

      {resultCount !== undefined && !rightContent && (
        <span
          style={{
            justifySelf: 'end',
            fontSize: 13,
            color: 'var(--c-ink-4)',
          }}
        >
          {loading ? 'Loading…' : `${resultCount} results`}
        </span>
      )}
    </div>
  )
}
