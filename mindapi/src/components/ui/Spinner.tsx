'use client'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  inline?: boolean
}

const SIZES = {
  sm: { width: 16, height: 16, border: 2 },
  md: { width: 24, height: 24, border: 2.5 },
  lg: { width: 36, height: 36, border: 3 },
}

export function Spinner({ size = 'md', label, inline = false }: SpinnerProps) {
  const dims = SIZES[size]

  const spinner = (
    <span
      style={{
        display: 'inline-block',
        width: dims.width,
        height: dims.height,
        borderRadius: '50%',
        border: `${dims.border}px solid var(--c-border)`,
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.6s linear infinite',
        flexShrink: 0,
      }}
    />
  )

  if (inline) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, verticalAlign: 'middle' }}>
        {spinner}
        {label && <span style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>{label}</span>}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
      {spinner}
      {label && <span style={{ fontSize: 14, color: 'var(--c-ink-3)' }}>{label}</span>}
    </div>
  )
}
