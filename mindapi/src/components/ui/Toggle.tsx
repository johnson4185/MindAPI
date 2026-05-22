'use client'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}

export default function Toggle({ checked, onChange, disabled = false, label, description }: ToggleProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: 'relative',
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? 'var(--accent)' : 'var(--c-border)',
          transition: 'background var(--t-fast)',
          flexShrink: 0,
          boxShadow: checked ? '0 0 0 3px var(--accent-glow)' : 'none',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left var(--t-fast)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'inherit',
            width: '100%',
            height: '100%',
            margin: 0,
          }}
        />
      </span>
      {(label || description) && (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {label && <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-ink)' }}>{label}</span>}
          {description && <span style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{description}</span>}
        </span>
      )}
    </label>
  )
}
