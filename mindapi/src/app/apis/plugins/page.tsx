'use client'

import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Metric } from '@/components/ui/Metric'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/lib/store'
import { PageLayout } from '@/components/shared/PageLayout'

type PluginRow = {
  name: string
  desc: string
  category: string
  scope: string
  source: string
  enabled: boolean
}

const COLUMNS: Column<PluginRow>[] = [
  { key: 'name', label: 'Name', render: (_, p) => <><div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div><div style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{p.desc}</div></> },
  { key: 'category', label: 'Category', render: (v) => <StatusBadge variant={(v as string) === 'Authentication' ? 'info' : (v as string) === 'Traffic Control' ? 'warning' : 'neutral'}>{v as string}</StatusBadge> },
  { key: 'scope', label: 'Scope' },
  { key: 'source', label: 'Source' },
  { key: 'enabled', label: 'Default state', render: (v) => <StatusBadge variant={v ? 'success' : 'neutral'}>{v ? 'Enabled' : 'Disabled'}</StatusBadge> },
]

export default function PluginsPage() {
  const { pluginTemplates, apis } = useStore()
  const enabled = pluginTemplates.filter((p) => p.enabled).length
  const rows: PluginRow[] = pluginTemplates.map((p) => ({
    name: p.name,
    desc: p.desc,
    category: p.category || 'Custom',
    scope: p.scope || 'service',
    source: p.source || 'bundled',
    enabled: p.enabled,
  }))

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Policies"
        title="Policy Library"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Templates" value={String(pluginTemplates.length)} />
        <Metric label="Managed APIs" value={String(apis.length)} />
        <Metric label="Enabled by default" value={String(enabled)} />
      </div>

      <Card title="Policy templates">
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
    </PageLayout>
  )
}
