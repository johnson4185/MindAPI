'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'default' | 'ghost' | 'danger' | 'success' | 'amber' | 'outline-accent'
type Size = 'lg' | 'md' | 'sm' | 'xs'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const VARIANTS: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
    border: '1px solid var(--accent-strong)',
  },
  default: {
    background: 'var(--c-panel)',
    color: 'var(--c-ink-2)',
    border: '1px solid var(--c-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--c-ink-3)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
    border: '1px solid #e6b5ae',
  },
  success: {
    background: 'var(--success-soft)',
    color: 'var(--success)',
    border: '1px solid #b7d7c4',
  },
  amber: {
    background: 'var(--warn-soft)',
    color: 'var(--warn)',
    border: '1px solid #e2ca9d',
  },
  'outline-accent': {
    background: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent-line)',
  },
}

const SIZES: Record<Size, React.CSSProperties> = {
  lg: { padding: '13px 18px', fontSize: 15, gap: 8 },
  md: { padding: '11px 16px', fontSize: 14, gap: 8 },
  sm: { padding: '9px 12px', fontSize: 13.5, gap: 6 },
  xs: { padding: '5px 8px', fontSize: 12, gap: 5 },
}

export default function Button({ variant = 'default', size = 'md', children, style, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        lineHeight: 1.2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background var(--t-fast), border-color var(--t-fast), color var(--t-fast)',
        whiteSpace: 'nowrap',
        boxShadow: 'none',
        ...VARIANTS[variant],
        ...SIZES[size],
        ...style,
      }}
      onMouseEnter={(event) => {
        if (disabled) return
        const el = event.currentTarget
        if (variant === 'primary') {
          el.style.background = 'var(--accent-strong)'
          el.style.borderColor = 'var(--accent-strong)'
        } else if (variant === 'default') {
          el.style.background = 'var(--c-panel-soft)'
          el.style.borderColor = 'var(--c-border-strong)'
        } else if (variant === 'ghost') {
          el.style.background = 'var(--c-panel-soft)'
          el.style.borderColor = 'var(--c-border)'
          el.style.color = 'var(--c-ink)'
        } else if (variant === 'outline-accent') {
          el.style.background = 'var(--accent-soft)'
        }
      }}
      onMouseLeave={(event) => {
        const el = event.currentTarget
        el.style.background = (VARIANTS[variant].background as string) || ''
        el.style.borderColor = ((VARIANTS[variant].border as string) || '').split(' ').at(-1) || ''
        el.style.color = (VARIANTS[variant].color as string) || ''
      }}
      {...props}
    >
      {children}
    </button>
  )
}
