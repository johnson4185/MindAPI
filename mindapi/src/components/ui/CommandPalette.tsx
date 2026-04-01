'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

type ItemType = 'page' | 'action' | 'api' | 'consumer'

interface PaletteItem {
  id: string
  type: ItemType
  label: string
  description: string
  href: string
  keywords?: string
}

const NAV_ITEMS: PaletteItem[] = [
  { id: 'nav-dashboard', type: 'page', label: 'Dashboard', description: 'Platform overview and KPIs', href: '/dashboard', keywords: 'overview metrics' },
  { id: 'nav-apis', type: 'page', label: 'API Catalog', description: 'Browse and manage APIs', href: '/apis', keywords: 'catalog publish gateway' },
  { id: 'nav-consumers', type: 'page', label: 'Consumers', description: 'Applications, keys, and subscriptions', href: '/consumers', keywords: 'apps subscriptions keys' },
  { id: 'nav-analytics', type: 'page', label: 'Analytics', description: 'Traffic and performance metrics', href: '/analytics', keywords: 'charts latency errors' },
  { id: 'nav-logs', type: 'page', label: 'Logs', description: 'Live request and error logs', href: '/logs', keywords: 'debug requests stream' },
  { id: 'nav-portal', type: 'page', label: 'Developer Portal', description: 'Docs, plans, and onboarding', href: '/portal', keywords: 'docs plans portal' },
  { id: 'nav-settings', type: 'page', label: 'Workspace', description: 'Roles, environments, billing', href: '/settings', keywords: 'settings rbac environments' },
]

const ACTION_ITEMS: PaletteItem[] = [
  { id: 'act-publish', type: 'action', label: 'Publish New API', description: 'Start the API publish wizard', href: '/apis/publish', keywords: 'create new api wizard' },
  { id: 'act-import', type: 'action', label: 'Import API from Spec', description: 'Import from OpenAPI, Swagger, or Postman', href: '/apis/publish?source=import', keywords: 'import openapi swagger postman' },
  { id: 'act-logs', type: 'action', label: 'View Live Logs', description: 'Open the request log stream', href: '/logs', keywords: 'stream debug tail' },
]

function typeColor(type: ItemType) {
  if (type === 'api') return 'var(--accent)'
  if (type === 'consumer') return 'var(--blue-ink)'
  if (type === 'action') return 'var(--success)'
  return 'var(--c-ink-3)'
}

export default function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, openCommandPalette, apis, consumers } = useStore()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        openCommandPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openCommandPalette])

  useEffect(() => {
    if (!commandPaletteOpen) return
    setQuery('')
    setActiveIdx(0)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [commandPaletteOpen])

  const allItems = useMemo<PaletteItem[]>(() => [
    ...NAV_ITEMS,
    ...ACTION_ITEMS,
    ...apis.map((api) => ({
      id: `api-${api.id}`,
      type: 'api' as const,
      label: api.name,
      description: `${api.environment} · ${api.version} · ${api.status}`,
      href: `/apis/${api.id}`,
      keywords: `${api.owner} ${api.tags.join(' ')} ${api.description}`,
    })),
    ...consumers.map((consumer) => ({
      id: `consumer-${consumer.id}`,
      type: 'consumer' as const,
      label: consumer.name,
      description: `${consumer.email} · ${consumer.status}`,
      href: `/consumers/${consumer.id}`,
      keywords: consumer.email,
    })),
  ], [apis, consumers])

  const results = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 10)
    const q = query.toLowerCase()
    return allItems.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.keywords || '').toLowerCase().includes(q),
    ).slice(0, 12)
  }, [allItems, query])

  function navigate(href: string) {
    router.push(href)
    closeCommandPalette()
  }

  if (!commandPaletteOpen) return null

  return (
    <div onClick={closeCommandPalette} style={{ position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.35)', zIndex: 1000, display: 'flex', justifyContent: 'center', padding: '72px 20px 20px' }}>
      <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: 640, background: 'var(--c-panel)', border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--c-border)' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIdx(0) }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeCommandPalette()
              if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIdx((index) => Math.min(results.length - 1, index + 1)) }
              if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIdx((index) => Math.max(0, index - 1)) }
              if (event.key === 'Enter' && results[activeIdx]) navigate(results[activeIdx].href)
            }}
            placeholder="Search pages, APIs, and consumers"
            style={{ flex: 1, border: 'none', padding: 0, background: 'transparent' }}
          />
          <span style={{ fontSize: 11, color: 'var(--c-ink-4)' }}>Esc</span>
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {results.map((item, index) => (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              onMouseEnter={() => setActiveIdx(index)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: 'none',
                borderBottom: '1px solid var(--c-border)',
                background: index === activeIdx ? 'var(--c-panel-soft)' : 'transparent',
                padding: '12px 18px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-ink)' }}>{item.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)', marginTop: 4 }}>{item.description}</div>
              </span>
              <span style={{ fontSize: 11, color: typeColor(item.type), textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
