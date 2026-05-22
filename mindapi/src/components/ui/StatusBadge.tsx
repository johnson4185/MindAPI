'use client'

import { ReactNode } from 'react'

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple'

interface StatusBadgeProps {
  variant: StatusVariant
  children: ReactNode
  dot?: boolean
  size?: 'sm' | 'md'
  pulse?: boolean
}

const COLORS: Record<StatusVariant, { bg: string; color: string; dot: string }> = {
  success: { bg: 'var(--success-soft)', color: 'var(--success)', dot: 'var(--success)' },
  warning: { bg: 'var(--warn-soft)', color: 'var(--warn)', dot: 'var(--warn)' },
  error: { bg: 'var(--danger-soft)', color: 'var(--danger)', dot: 'var(--danger)' },
  info: { bg: 'var(--blue-soft)', color: 'var(--blue-ink)', dot: 'var(--blue)' },
  neutral: { bg: 'var(--c-panel-soft)', color: 'var(--c-ink-3)', dot: 'var(--c-ink-4)' },
  purple: { bg: 'var(--purple-soft)', color: 'var(--purple)', dot: 'var(--purple)' },
}

const SIZE_MAP = {
  sm: { padding: '3px 8px', fontSize: 11.5, gap: 5, dotSize: 5 },
  md: { padding: '5px 10px', fontSize: 12.5, gap: 6, dotSize: 6 },
}

export function StatusBadge({ variant, children, dot = true, size = 'md', pulse = false }: StatusBadgeProps) {
  const colors = COLORS[variant]
  const dims = SIZE_MAP[size]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dims.gap,
        padding: dims.padding,
        borderRadius: 20,
        background: colors.bg,
        color: colors.color,
        fontSize: dims.fontSize,
        fontWeight: 600,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        border: `1px solid ${colors.color}20`,
      }}
    >
      {dot && (
        <span
          style={{
            width: dims.dotSize,
            height: dims.dotSize,
            borderRadius: '50%',
            background: colors.dot,
            flexShrink: 0,
            ...(pulse
              ? {
                  boxShadow: `0 0 0 0 ${colors.dot}`,
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }
              : {}),
          }}
        />
      )}
      {children}
    </span>
  )
}
