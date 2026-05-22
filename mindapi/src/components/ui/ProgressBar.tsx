'use client'

import { CSSProperties } from 'react'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showPercent?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  style?: CSSProperties
}

const HEIGHTS = { sm: 4, md: 6, lg: 10 }
const RADIUS = { sm: 2, md: 3, lg: 5 }

const VARIANTS = {
  default: { bg: 'var(--accent)', track: 'var(--c-border)' },
  success: { bg: 'var(--success)', track: 'var(--success-bg)' },
  warning: { bg: 'var(--warn)', track: 'var(--warn-bg)' },
  error: { bg: 'var(--danger)', track: 'var(--danger-bg)' },
}

export function ProgressBar({
  value,
  max,
  label,
  showPercent = false,
  size = 'md',
  variant = 'default',
  style,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  const colors = VARIANTS[variant]
  const height = HEIGHTS[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-ink-3)' }}>{label}</span>}
          {showPercent && (
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink-4)', fontFamily: 'var(--f-mono)' }}>
              {pct}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          borderRadius: RADIUS[size],
          background: colors.track,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: RADIUS[size],
            background: colors.bg,
            transition: 'width 0.4s cubic-bezier(0.2, 0, 0, 1)',
          }}
        />
      </div>
    </div>
  )
}

export function UsageBar({
  used,
  limit,
  label,
  format = 'numeric',
}: {
  used: number
  limit: number | null
  label: string
  format?: 'numeric' | 'percent'
}) {
  const pct = limit ? Math.min(Math.round((used / limit) * 100), 100) : 0
  const variant = pct >= 90 ? 'error' : pct >= 75 ? 'warning' : 'success'

  return (
    <ProgressBar
      value={used}
      max={limit ?? 1}
      label={label}
      showPercent={format === 'percent'}
      variant={variant}
      size="md"
    />
  )
}
