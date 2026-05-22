'use client'
import { useStore } from '@/lib/store'
export default function Toast() {
  const { toast } = useStore()
  const bg = toast.type === 'success' ? '#18181B' : toast.type === 'error' ? 'var(--danger)' : '#18181B'
  const icon = toast.type === 'error'
    ? <path d="M12 9v4m0 4h.01M10.3 3.9l-8 14A1 1 0 0 0 3.2 19h17.6a1 1 0 0 0 .9-1.5l-8-14a1 1 0 0 0-1.8 0z" />
    : toast.type === 'info'
      ? <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></>
      : <path d="M20 6L9 17l-5-5" />
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: bg, color: '#fff', padding: '12px 18px', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-lg)', zIndex: 1000, maxWidth: 380, transform: toast.visible ? 'translateY(0)' : 'translateY(90px)', opacity: toast.visible ? 1 : 0, transition: 'all var(--t-med)', border: '1px solid rgba(255,255,255,0.14)' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      {toast.message}
    </div>
  )
}
