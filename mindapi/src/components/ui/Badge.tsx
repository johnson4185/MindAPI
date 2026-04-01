import { ReactNode } from 'react'

type Variant = 'green' | 'red' | 'amber' | 'purple' | 'gray' | 'blue'

const COLORS: Record<Variant, string> = {
  green: 'var(--success)',
  red: 'var(--danger)',
  amber: 'var(--warn)',
  purple: '#6b3fa0',
  gray: 'var(--c-ink-3)',
  blue: 'var(--blue-ink)',
}

interface BadgeProps {
  variant: Variant
  children: ReactNode
  dot?: boolean
}

export default function Badge({ variant, children, dot = false }: BadgeProps) {
  const color = COLORS[variant]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color,
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, background: color, flexShrink: 0 }} />}
      {children}
    </span>
  )
}
