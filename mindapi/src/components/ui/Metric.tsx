'use client'

import { ReactNode } from 'react'

export interface MetricProps {
  label: string
  value: string | number
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  hint?: string
  icon?: ReactNode
  subtext?: string
  clickable?: boolean
  onClick?: () => void
}

const VARIANT_STYLES: Record<NonNullable<MetricProps['variant']>, { bg: string; border: string; value: string; label: string }> = {
  default: { bg: 'var(--c-panel)', border: 'var(--c-border)', value: 'var(--c-ink)', label: 'var(--c-ink-4)' },
  success: { bg: 'var(--success-soft)', border: 'var(--success-bd)', value: 'var(--success)', label: 'var(--success)' },
  warning: { bg: 'var(--warn-soft)', border: 'var(--warn-bd)', value: 'var(--warn)', label: 'var(--warn)' },
  error: { bg: 'var(--danger-soft)', border: 'var(--danger-bd)', value: 'var(--danger)', label: 'var(--danger)' },
  info: { bg: 'var(--blue-soft)', border: 'var(--blue-line)', value: 'var(--blue-ink)', label: 'var(--blue-ink)' },
}

export function Metric({ label, value, variant = 'default', hint, icon, subtext, clickable, onClick }: MetricProps) {
  const colors = VARIANT_STYLES[variant]
  return (
    <div
      className="surface-card"
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() } : undefined}
      style={{
        padding: 18,
        background: colors.bg,
        borderColor: colors.border,
        cursor: clickable ? 'pointer' : undefined,
      }}
    >
      {icon && <div style={{ marginBottom: 8, opacity: 0.75 }}>{icon}</div>}
      <div className="eyebrow" style={{ color: colors.label, marginBottom: 10 }}>{label}</div>
      <div className="metric-value" style={{ fontSize: 26, fontWeight: 700, color: colors.value }}>{value}</div>
      {subtext && <div style={{ fontSize: 13, color: 'var(--c-ink-4)', marginTop: 6 }}>{subtext}</div>}
      {hint && <div style={{ fontSize: 13, color: 'var(--c-ink-4)', marginTop: 6 }}>{hint}</div>}
    </div>
  )
}
