import Link from 'next/link'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16, fontSize: 12.5 }}>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink5)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
          {item.href ? (
            <Link href={item.href} style={{ color: 'var(--c-ink4)', textDecoration: 'none', transition: 'color var(--t-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-ink2)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-ink4)')}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: 'var(--c-ink2)', fontWeight: 600 }}>{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
