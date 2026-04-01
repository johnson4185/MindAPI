'use client'
interface ToggleProps { checked: boolean; onChange: (v: boolean) => void }
export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label style={{ position: 'relative', width: 38, height: 20, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <span style={{ position: 'absolute', inset: 0, background: checked ? 'var(--accent)' : 'var(--c-border2)', borderRadius: 0, transition: 'background 0.2s' }}>
        <span style={{ position: 'absolute', width: 14, height: 14, left: 3, top: 3, background: '#fff', borderRadius: 0, transform: checked ? 'translateX(18px)' : 'translateX(0)', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </span>
    </label>
  )
}
