'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { canManageWorkspace, canViewBilling } from '@/lib/permissions'
import { buildTenantPath, stripTenantPrefix } from '@/lib/tenant-routing'
import { NAV_ROUTES, NAV_SECTIONS } from '@/lib/nav-config'

const icon = (children: React.ReactNode) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const ICONS: Record<string, React.ReactNode> = {
  '/dashboard': icon(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
  '/apis': icon(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>),
  '/analytics': icon(<><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-7" /></>),
  '/monitoring': icon(<><circle cx="12" cy="12" r="10" /><path d="M12 8v4l2 2" /></>),
  '/portal': icon(<><path d="M4 5h16v14H4z" rx="1" /><path d="M8 9h8" /><path d="M8 13h5" /></>),
  '/consumers': icon(<><circle cx="8" cy="8" r="3" /><path d="M3 21c0-2.8 2.2-5 5-5s5 2.2 5 5" /><path d="M16 8h5" /><path d="M16 12h5" /><path d="M16 16h5" /></>),
  '/governance': icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>),
  '/settings': icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
}

export default function Sidebar() {
  const pathname = usePathname()
  const { currentTenant, currentUser } = useStore()
  const normalizedPath = stripTenantPrefix(pathname)

  return (
    <aside
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: 260,
        borderRight: '1px solid rgba(255,255,255,0.10)',
        background: 'linear-gradient(180deg, #0F2640 0%, #1A3D6B 100%)',
        color: '#f0f2f8',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 24px rgba(0,0,0,0.20)',
        userSelect: 'none',
      }}
    >
      {/* Logo area */}
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 13,
            boxShadow: '0 2px 8px rgba(26,95,180,0.20)',
            fontFamily: 'var(--f-display)',
          }}>
            M
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--f-display)' }}>MindAPI</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.40)', marginTop: 1 }}>
              {currentTenant.slug}.mindapi.io
            </div>
          </div>
        </div>

        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontWeight: 500 }}>
          {currentUser.role}
        </span>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px 12px' }}>
        {NAV_SECTIONS.map((section) => {
          const items = NAV_ROUTES.filter((route) => {
            if (route.section !== section) return false
            if (route.requiresManageWorkspace) return canManageWorkspace(currentUser.role)
            if (route.requiresBilling) return canViewBilling(currentUser.role)
            return true
          })
          if (!items.length) return null
          return (
            <div key={section} style={{ marginBottom: 14 }}>
              <div style={{
                padding: '6px 8px 6px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.35)',
              }}>
                {section}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {items.map((route) => {
                  const match = route.sidebarMatch ?? [route.href]
                  const active = match.some((p) => normalizedPath === p || normalizedPath.startsWith(p + '/'))
                  return (
                    <Link
                      key={route.href}
                      href={buildTenantPath(currentTenant.slug, route.href)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: active ? 'rgba(221, 238, 255, 0.12)' : 'transparent',
                        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                        transition: 'all var(--t-fast)',
                        textDecoration: 'none',
                        fontWeight: active ? 600 : 500,
                        fontSize: 14.5,
                        letterSpacing: '-0.01em',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                    >
                      <span style={{
                        flexShrink: 0,
                        color: active ? '#DDEEFF' : 'rgba(255,255,255,0.40)',
                        transition: 'color var(--t-fast)',
                        display: 'flex',
                      }}>
                        {ICONS[route.href]}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div>{route.label}</div>
                        <div style={{
                          fontSize: 12,
                          color: active ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.30)',
                          marginTop: 1,
                          fontWeight: 400,
                        }}>
                          {route.caption}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
          MindAPI Platform
        </div>
      </div>
    </aside>
  )
}
