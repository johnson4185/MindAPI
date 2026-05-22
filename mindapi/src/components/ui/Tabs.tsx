'use client'

import { ReactNode, useState } from 'react'

type Tab = {
  id: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab?: string
  onChange: (tabId: string) => void
  variant?: 'underline' | 'pills' | 'buttons'
  children?: ReactNode
}

export function Tabs({ tabs, activeTab, onChange, variant = 'underline' }: TabsProps) {
  const current = activeTab || tabs[0]?.id

  if (variant === 'pills') {
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = tab.id === current
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--c-border)'}`,
                background: isActive ? 'rgba(232,72,28,0.08)' : 'var(--c-panel)',
                color: isActive ? 'var(--accent)' : 'var(--c-ink-3)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13.5,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all var(--t-fast)',
                boxShadow: isActive ? '0 0 0 3px var(--accent-glow)' : 'none',
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--c-border)', marginBottom: 24 }}>
      {tabs.map((tab) => {
        const isActive = tab.id === current
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              padding: '11px 20px',
              fontWeight: 600,
              fontSize: 14,
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              color: isActive ? 'var(--accent)' : 'var(--c-ink-3)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              marginBottom: -1,
              transition: 'color var(--t-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge}
          </button>
        )
      })}
    </div>
  )
}

export function useTabs(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return { activeTab, setActiveTab }
}
