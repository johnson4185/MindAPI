'use client'

import { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  body?: string
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ icon, title, body, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className="empty-state"
      style={{
        padding: compact ? '48px 24px' : undefined,
      }}
    >
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="empty-state-title">{title}</div>
      {body && <div className="empty-state-body">{body}</div>}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  )
}

export function EmptyStateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

export function EmptyStateTable() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  )
}

export function EmptyStateSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.5-4.5" />
    </svg>
  )
}
