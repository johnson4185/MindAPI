'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  caption: string
  match: string[]
  icon: React.ReactNode
}

const icon = (children: React.ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operate',
    items: [
      {
        href: '/dashboard',
        label: 'Overview',
        caption: 'Platform health and lifecycle',
        match: ['/dashboard'],
        icon: icon(<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>),
      },
      {
        href: '/apis',
        label: 'API Catalog',
        caption: 'Publish, version, configure',
        match: ['/apis'],
        icon: icon(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>),
      },
      {
        href: '/analytics',
        label: 'Analytics',
        caption: 'Traffic, errors, latency',
        match: ['/analytics', '/logs'],
        icon: icon(<><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-7" /></>),
      },
    ],
  },
  {
    title: 'Engage',
    items: [
      {
        href: '/portal',
        label: 'Developer Portal',
        caption: 'Docs, keys, plans, apps',
        match: ['/portal'],
        icon: icon(<><path d="M4 5h16v14H4z" /><path d="M8 9h8" /><path d="M8 13h5" /></>),
      },
      {
        href: '/consumers',
        label: 'Consumers',
        caption: 'Applications and access',
        match: ['/consumers'],
        icon: icon(<><circle cx="8" cy="8" r="3" /><path d="M3 21c0-2.8 2.2-5 5-5s5 2.2 5 5" /><path d="M16 8h5" /><path d="M16 12h5" /><path d="M16 16h5" /></>),
      },
    ],
  },
  {
    title: 'Control',
    items: [
      {
        href: '/governance',
        label: 'Governance',
        caption: 'Policies, compliance, controls',
        match: ['/governance'],
        icon: icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>),
      },
      {
        href: '/settings',
        label: 'Workspace',
        caption: 'Roles, environments, billing',
        match: ['/settings'],
        icon: icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        borderRight: '1px solid var(--c-border)',
        background: '#171513',
        color: '#f6f1eb',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
            X
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>XPAT</div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.48)' }}>
              Enterprise Platform
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px 14px' }}>
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 12 }}>
            <div style={{ padding: '6px 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
              {section.title}
            </div>
            <div style={{ display: 'grid', gap: 4 }}>
              {section.items.map((item) => {
                const active = item.match.some((path) => pathname === path || pathname.startsWith(path + '/'))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '18px minmax(0, 1fr)',
                      gap: 10,
                      alignItems: 'start',
                      padding: '9px 8px',
                      background: active ? 'rgba(210, 71, 31, 0.16)' : 'transparent',
                      borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    <span style={{ marginTop: 1, color: active ? '#fff' : 'rgba(255,255,255,0.55)' }}>{item.icon}</span>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: 11.5, color: active ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.42)', marginTop: 2 }}>
                        {item.caption}
                      </div>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: 'var(--accent)',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
            textShadow: '0 0 18px rgba(210, 71, 31, 0.18)',
          }}
        >
          Xpat
        </div>
      </div>
    </aside>
  )
}
