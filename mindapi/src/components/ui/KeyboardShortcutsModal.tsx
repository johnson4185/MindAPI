'use client'
import { useEffect, useState } from 'react'

const SHORTCUTS = [
  { section: 'Navigation', items: [
    { keys: ['G', 'D'], label: 'Go to Dashboard' },
    { keys: ['G', 'A'], label: 'Go to APIs' },
    { keys: ['G', 'S'], label: 'Go to Services' },
    { keys: ['G', 'L'], label: 'Go to Logs' },
    { keys: ['G', 'C'], label: 'Go to Consumers' },
    { keys: ['G', 'P'], label: 'Go to Developer Portal' },
  ]},
  { section: 'Actions', items: [
    { keys: ['⌘', 'K'], label: 'Open command palette' },
    { keys: ['?'], label: 'Show keyboard shortcuts' },
    { keys: ['Esc'], label: 'Close modal / dismiss' },
  ]},
  { section: 'Pages', items: [
    { keys: ['N'], label: 'Create new resource' },
    { keys: ['E'], label: 'Edit selected item' },
    { keys: ['/'], label: 'Focus search' },
  ]},
]

function Kbd({ children }: { children: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 20, padding: '0 5px',
      background: 'var(--c-bg)', border: '1px solid var(--c-border)',
      borderBottom: '2px solid var(--c-border)',
      fontSize: 12, fontWeight: 700, fontFamily: 'var(--f-mono)',
      color: 'var(--c-ink-2)', lineHeight: 1,
    }}>
      {children}
    </span>
  )
}

export default function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) return null

  return (
    <div
      onClick={() => setOpen(false)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        className="modal-animate"
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--c-surface)', border: '1.5px solid var(--c-border)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 520 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--c-border)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)' }}>Keyboard Shortcuts</div>
            <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)', marginTop: 2 }}>Press <strong>?</strong> to toggle this panel</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--c-ink-4)', display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {SHORTCUTS.map(group => (
            <div key={group.section}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-ink-4)', marginBottom: 10 }}>{group.section}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--c-ink-2)' }}>{item.label}</span>
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {item.keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 20px 14px', borderTop: '1px solid var(--c-border)', fontSize: 12.5, color: 'var(--c-ink-4)' }}>
          Press <strong>Esc</strong> or click outside to close
        </div>
      </div>
    </div>
  )
}
