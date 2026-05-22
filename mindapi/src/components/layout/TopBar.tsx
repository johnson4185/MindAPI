'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { buildTenantPath, stripTenantPrefix } from '@/lib/tenant-routing'

const ENVIRONMENTS = [
  { label: 'Production', color: '#0aaa6b', bg: 'rgba(10,170,107,0.1)', border: 'rgba(10,170,107,0.25)' },
  { label: 'Staging', color: '#c97c0a', bg: 'rgba(201,124,10,0.1)', border: 'rgba(201,124,10,0.25)' },
  { label: 'Development', color: '#3b6ef8', bg: 'rgba(59,110,248,0.1)', border: 'rgba(59,110,248,0.25)' },
]

const ROLES = ['Owner', 'Admin', 'Developer', 'Viewer', 'Billing'] as const

export default function TopBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [envIndex, setEnvIndex] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const {
    notifications,
    openCommandPalette,
    markNotificationRead,
    currentUser,
    currentTenant,
    tenants,
    setCurrentRole,
    setCurrentTenant,
  } = useStore()
  const unread = useMemo(() => notifications.filter((n) => !n.read), [notifications])
  const env = ENVIRONMENTS[envIndex]
  const initials = currentUser.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const relativePath = stripTenantPrefix(pathname)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 60,
        background: 'rgba(244,245,248,0.92)',
        borderBottom: '1px solid var(--c-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 12,
      }}
    >
      {/* Search bar */}
      <button
        type="button"
        onClick={openCommandPalette}
        style={{
          flex: '1 1 0',
          maxWidth: 480,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 36,
          padding: '0 12px',
          background: 'var(--c-panel)',
          border: '1.5px solid var(--c-border)',
          borderRadius: 10,
          textAlign: 'left',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(12,14,20,0.04)',
          transition: 'all var(--t-fast)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = 'var(--c-border-strong)'
          el.style.boxShadow = '0 2px 8px rgba(12,14,20,0.06)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = 'var(--c-border)'
          el.style.boxShadow = '0 1px 2px rgba(12,14,20,0.04)'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.5-4.5" />
        </svg>
        <span style={{ flex: 1, fontSize: 13.5, color: 'var(--c-ink-5)', letterSpacing: '-0.01em' }}>
          Search APIs, routes, logs…
        </span>
        <kbd style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--c-ink-5)',
          background: 'var(--c-panel-soft)', border: '1px solid var(--c-border)',
          padding: '1px 5px', borderRadius: 4,
        }}>
          ⌘K
        </kbd>
      </button>

      <div style={{ flex: 1 }} />

      {/* Environment switcher */}
      <button
        type="button"
        onClick={() => setEnvIndex((i) => (i + 1) % ENVIRONMENTS.length)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          height: 34, padding: '0 13px',
          background: env.bg,
          border: `1.5px solid ${env.border}`,
          borderRadius: 20,
          cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
          color: env.color,
          transition: 'opacity var(--t-fast)',
          whiteSpace: 'nowrap',
        }}
        title="Click to switch environment"
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: env.color, flexShrink: 0 }} />
        {env.label}
      </button>

      {/* Workspace selector */}
      <div style={{ position: 'relative' }}>
        <select
          value={currentTenant.id}
          onChange={(e) => {
            const next = tenants.find((t) => t.id === e.target.value)
            setCurrentTenant(e.target.value)
            if (next) router.push(buildTenantPath(next.slug, relativePath))
          }}
          aria-label="Select workspace"
          style={{
            height: 34, padding: '0 32px 0 12px',
            background: 'var(--c-panel)',
            border: '1.5px solid var(--c-border)',
            borderRadius: 8, fontSize: 13.5, fontWeight: 500,
            color: 'var(--c-ink)', cursor: 'pointer',
            appearance: 'none', width: 'auto',
            boxShadow: '0 1px 2px rgba(12,14,20,0.04)',
          }}
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.plan})</option>
          ))}
        </select>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="2.5" strokeLinecap="round"
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Role switcher */}
      <div style={{ position: 'relative' }}>
        <select
          value={currentUser.role}
          onChange={(e) => setCurrentRole(e.target.value as typeof currentUser.role)}
          aria-label="Select role"
          style={{
            height: 34, padding: '0 28px 0 10px',
            background: 'var(--c-panel)',
            border: '1.5px solid var(--c-border)',
            borderRadius: 8, fontSize: 13, fontWeight: 500,
            color: 'var(--c-ink-3)', cursor: 'pointer',
            appearance: 'none', width: 'auto',
            boxShadow: '0 1px 2px rgba(12,14,20,0.04)',
          }}
        >
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="2.5" strokeLinecap="round"
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Notification bell */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowNotifs((v) => !v)}
          style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36,
            background: showNotifs ? 'var(--c-panel-soft)' : 'var(--c-panel)',
            border: '1.5px solid var(--c-border)',
            borderRadius: 9, cursor: 'pointer',
            color: 'var(--c-ink-3)',
            boxShadow: '0 1px 2px rgba(12,14,20,0.04)',
          }}
          title="Notifications"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unread.length > 0 && (
            <span style={{
              position: 'absolute', top: -3, right: -3,
              minWidth: 16, height: 16, borderRadius: 8,
              background: 'var(--accent)', color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px', border: '2px solid var(--c-bg)',
            }}>
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>

        {showNotifs && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 320, background: 'var(--c-panel)',
            border: '1.5px solid var(--c-border)', borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 50, overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--c-ink)' }}>Notifications</div>
              <div style={{ fontSize: 12, color: 'var(--c-ink-4)' }}>{unread.length} unread</div>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--c-ink-4)', fontSize: 13.5 }}>
                  All caught up
                </div>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id)
                      setShowNotifs(false)
                      if (n.href) router.push(buildTenantPath(currentTenant.slug, n.href))
                    }}
                    style={{
                      width: '100%', textAlign: 'left', display: 'block',
                      padding: '12px 18px',
                      background: n.read ? 'transparent' : 'rgba(59,110,248,0.04)',
                      borderBottom: '1px solid var(--c-border)',
                      cursor: 'pointer', border: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 5 }} />}
                      <div style={{ paddingLeft: n.read ? 14 : 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--c-ink)', marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--c-ink-3)', lineHeight: 1.5 }}>{n.message}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div
        title={`${currentUser.name} — ${currentUser.role}`}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36,
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)',
          color: '#fff', fontSize: 12.5, fontWeight: 800,
          borderRadius: 9,
          boxShadow: '0 2px 6px var(--accent-glow)',
          letterSpacing: '0.04em',
          cursor: 'default',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    </header>
  )
}
