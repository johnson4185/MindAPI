'use client'

import { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Consumer } from '@/lib/types'
import { fetchJson } from '@/lib/api-client'

export default function PortalIntegrationsPage() {
  const [consumers, setConsumers] = useState<Consumer[]>([])

  useEffect(() => {
    void fetchJson<Consumer[]>('/api/mock/consumers').then(setConsumers)
  }, [])

  const active = useMemo(() => consumers.filter((consumer) => consumer.status === 'Active'), [consumers])

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Portal"
        title="Integration Registry"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Registered apps" value={String(consumers.length)} />
        <Metric label="Active apps" value={String(active.length)} />
        <Metric label="Issued keys" value={String(consumers.reduce((sum, consumer) => sum + consumer.apiKeys, 0))} />
      </div>

      <Card title="Consumer applications">
        <table>
          <thead>
            <tr>
              <th>Application</th>
              <th>Owner</th>
              <th>Keys</th>
              <th>Subscriptions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {consumers.map((consumer) => (
              <tr key={consumer.id}>
                <td>{consumer.name}</td>
                <td>{consumer.email}</td>
                <td>{consumer.apiKeys}</td>
                <td>{consumer.subscribed}</td>
                <td><Badge variant={consumer.status === 'Active' ? 'green' : 'red'}>{consumer.status}</Badge></td>
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
