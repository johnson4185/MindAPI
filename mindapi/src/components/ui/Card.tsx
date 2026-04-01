import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  headerRight?: ReactNode
  style?: React.CSSProperties
}

export default function Card({ children, title, subtitle, headerRight, style }: CardProps) {
  return (
    <section className="surface-card" style={{ overflow: 'hidden', ...style }}>
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 18px',
            borderBottom: '1px solid var(--c-border)',
            background: 'var(--c-panel-soft)',
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)', marginTop: 4 }}>{subtitle}</div>}
          </div>
          {headerRight}
        </div>
      )}
      {children}
    </section>
  )
}
