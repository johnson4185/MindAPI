import { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ maxWidth: 760 }}>
        {eyebrow && <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 8, fontSize: 'var(--ui-small-size)', fontWeight: 'var(--ui-small-weight)' }}>{eyebrow}</div>}
        <h1 data-testid="page-title" style={{ margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}
