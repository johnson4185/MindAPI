'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

const ENVIRONMENTS = [
  { label: 'Production', color: 'var(--success)' },
  { label: 'Staging', color: 'var(--warn)' },
  { label: 'Development', color: 'var(--blue-ink)' },
]

export default function TopBar() {
  const router = useRouter()
  const [envIndex, setEnvIndex] = useState(0)
  const { notifications, openCommandPalette, markNotificationRead } = useStore()
  const unread = useMemo(() => notifications.filter((item) => !item.read), [notifications])
  const env = ENVIRONMENTS[envIndex]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(245, 244, 242, 0.95)',
        borderBottom: '1px solid var(--c-border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: 16,
          padding: '16px 24px',
        }}
      >
        <button
          type="button"
          onClick={openCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 520,
            padding: '11px 14px',
            background: 'var(--c-panel)',
            border: '1px solid var(--c-border)',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.5-4.5" />
          </svg>
          <span style={{ flex: 1, fontSize: 13.5, color: 'var(--c-ink-4)' }}>Search APIs, routes, plans, portal assets, logs</span>
          <kbd style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--c-ink-4)', border: '1px solid var(--c-border)', padding: '3px 6px' }}>
            Ctrl K
          </kbd>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setEnvIndex((index) => (index + 1) % ENVIRONMENTS.length)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              background: 'var(--c-panel)',
              border: '1px solid var(--c-border)',
              color: 'var(--c-ink-2)',
              cursor: 'pointer',
              fontSize: 'var(--ui-small-size)',
              fontWeight: 'var(--ui-small-weight)',
            }}
          >
            <span style={{ width: 8, height: 8, background: env.color }} />
            {env.label}
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--c-panel)', border: '1px solid var(--c-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--c-ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unread</div>
            <div style={{ fontSize: 'var(--ui-small-size)', fontWeight: 'var(--ui-small-weight)' }}>{unread.length}</div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = unread[0]
              if (!next) return
              markNotificationRead(next.id)
              if (next.href) router.push(next.href)
            }}
            style={{
              padding: '10px 12px',
              background: 'var(--c-panel)',
              border: '1px solid var(--c-border)',
              color: 'var(--c-ink-3)',
              cursor: unread.length ? 'pointer' : 'default',
              fontSize: 'var(--ui-small-size)',
              fontWeight: 'var(--ui-small-weight)',
            }}
          >
            Review queue
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
            AK
          </div>
        </div>
      </div>
    </header>
  )
}
