'use client'

import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useStore } from '@/lib/store'

export default function InfrastructurePage() {
  const { apis } = useStore()

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Gateway"
        title="Gateway Topology"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Services" value={String(apis.length)} />
        <Metric label="Production routes" value={String(apis.filter((api) => api.environment === 'Production').length)} />
        <Metric label="Draft routes" value={String(apis.filter((api) => api.status === 'Draft').length)} />
      </div>

      <Card title="Service routing">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>Public path</th>
              <th>Backend target</th>
              <th>Environment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apis.map((api) => (
              <tr key={api.id}>
                <td>{api.name}</td>
                <td style={{ fontFamily: 'var(--f-mono)' }}>{api.basePath}</td>
                <td style={{ fontFamily: 'var(--f-mono)', fontSize: 12.5 }}>{api.backendUrl}</td>
                <td>{api.environment}</td>
                <td><Badge variant={api.status === 'Active' ? 'green' : api.status === 'Draft' ? 'blue' : 'amber'}>{api.status}</Badge></td>
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
