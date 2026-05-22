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
    border: '1.5px solid var(--accent-strong)',
    boxShadow: '0 2px 8px var(--accent-glow), 0 1px 2px rgba(0,0,0,0.1)',
  },
  default: {
    background: 'var(--c-panel)',
    color: 'var(--c-ink-2)',
    border: '1.5px solid var(--c-border)',
    boxShadow: '0 1px 2px rgba(12,14,20,0.04)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--c-ink-3)',
    border: '1.5px solid transparent',
    boxShadow: 'none',
  },
  danger: {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
    border: '1.5px solid var(--danger-bd)',
    boxShadow: 'none',
  },
  success: {
    background: 'var(--success-soft)',
    color: 'var(--success)',
    border: '1.5px solid var(--success-bd)',
    boxShadow: 'none',
  },
  amber: {
    background: 'var(--warn-soft)',
    color: 'var(--warn)',
    border: '1.5px solid var(--warn-bd)',
    boxShadow: 'none',
  },
  'outline-accent': {
    background: 'transparent',
    color: 'var(--accent)',
    border: '1.5px solid var(--accent-line)',
    boxShadow: 'none',
  },
}

const SIZES: Record<Size, React.CSSProperties> = {
  lg: { padding: '13px 22px', fontSize: 15, fontWeight: 700, gap: 8, borderRadius: 9 },
  md: { padding: '10px 18px', fontSize: 14, fontWeight: 600, gap: 7, borderRadius: 8 },
  sm: { padding: '8px 14px', fontSize: 13.5, fontWeight: 600, gap: 6, borderRadius: 7 },
  xs: { padding: '5px 10px', fontSize: 12.5, fontWeight: 600, gap: 5, borderRadius: 6 },
}

export default function Button({ variant = 'default', size = 'md', children, style, disabled, ...props }: ButtonProps) {
  return (
    <button
      data-btn={variant}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1.25,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--t-fast), border-color var(--t-fast), color var(--t-fast), box-shadow var(--t-fast), opacity var(--t-fast)',
        whiteSpace: 'nowrap',
        letterSpacing: '-0.01em',
        ...VARIANTS[variant],
        ...SIZES[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
