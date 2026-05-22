'use client'
import { ReactNode, useEffect } from 'react'
interface ModalProps { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; maxWidth?: number }
export default function Modal({ open, onClose, title, children, footer, maxWidth = 500 }: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null
  return (
    <div aria-hidden={!open} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div role="dialog" aria-modal="true" aria-label={title} className="modal-animate" onClick={e => e.stopPropagation()} style={{ background: "var(--c-surface)", borderRadius: "var(--r-xl)",        boxShadow: "var(--shadow-lg)", width: "100%", maxWidth, border: "1.5px solid var(--c-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--c-border)" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--c-ink)" }}>{title}</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-bg)", border: "1.5px solid var(--c-border)",        color: "var(--c-ink-3)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
        {footer && <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 22px", borderTop: "1px solid var(--c-border)" }}>{footer}</div>}
      </div>
    </div>
  )
}
