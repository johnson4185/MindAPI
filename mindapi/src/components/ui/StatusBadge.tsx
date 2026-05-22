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

const COLORS: Record<StatusVariant, { bg: string; color: string }> = {
  success: { bg: 'var(--success-soft)', color: 'var(--success)' },
  warning: { bg: 'var(--warn-soft)', color: 'var(--warn)' },
  error: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  info: { bg: 'var(--blue-soft)', color: 'var(--blue-ink)' },
  neutral: { bg: 'var(--c-panel-soft)', color: 'var(--c-ink-3)' },
  purple: { bg: 'var(--purple-soft)', color: 'var(--purple)' },
}

const SIZE_MAP = {
  sm: { padding: '2px 8px', fontSize: 12, gap: 4, dotSize: 4 },
  md: { padding: '3px 9px', fontSize: 13, gap: 5, dotSize: 5 },
}

export function StatusBadge({ variant, children, dot = false, size = 'md', pulse = false }: StatusBadgeProps) {
  const colors = COLORS[variant]
  const dims = SIZE_MAP[size]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dims.gap,
        padding: dims.padding,
        borderRadius: 'var(--r-sm)',
        background: colors.bg,
        color: colors.color,
        fontSize: dims.fontSize,
        fontWeight: 600,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: dims.dotSize,
            height: dims.dotSize,
            borderRadius: '50%',
            background: colors.color,
            flexShrink: 0,
            ...(pulse
              ? {
                  boxShadow: `0 0 0 0 ${colors.color}`,
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
