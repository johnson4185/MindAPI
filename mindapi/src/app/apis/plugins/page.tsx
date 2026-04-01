'use client'

import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useStore } from '@/lib/store'

export default function PluginsPage() {
  const { pluginTemplates, apis } = useStore()

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Policies"
        title="Policy Library"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Templates" value={String(pluginTemplates.length)} />
        <Metric label="Managed APIs" value={String(apis.length)} />
        <Metric label="Enabled by default" value={String(pluginTemplates.filter((plugin) => plugin.enabled).length)} />
      </div>

      <Card title="Policy templates">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Scope</th>
              <th>Source</th>
              <th>Default state</th>
            </tr>
          </thead>
          <tbody>
            {pluginTemplates.map((plugin) => (
              <tr key={plugin.name}>
                <td>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{plugin.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{plugin.desc}</div>
                </td>
                <td><Badge variant={plugin.category === 'Authentication' ? 'blue' : plugin.category === 'Traffic Control' ? 'amber' : 'gray'}>{plugin.category || 'Custom'}</Badge></td>
                <td>{plugin.scope || 'service'}</td>
                <td>{plugin.source || 'bundled'}</td>
                <td><Badge variant={plugin.enabled ? 'green' : 'gray'}>{plugin.enabled ? 'Enabled' : 'Disabled'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card" style={{ padding: 18 }}>
      <div className="eyebrow" style={{ color: 'var(--c-ink-4)', marginBottom: 10 }}>{label}</div>
      <div className="metric-value" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
