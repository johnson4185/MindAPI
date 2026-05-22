import { ReactNode } from 'react'

interface PageHeaderProps {
  prefix?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function PageHeader({ prefix, title, subtitle, actions }: PageHeaderProps) {
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
        {prefix && <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 8, fontSize: 12, fontWeight: 700 }}>{prefix}</div>}
        <h1 data-testid="page-title" style={{ margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ marginTop: 10, fontSize: 'var(--fs-body-md)', lineHeight: 1.6 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}
