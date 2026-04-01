'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { DashboardSnapshot } from '@/lib/types'
import { fetchJson } from '@/lib/api-client'

const FALLBACK: DashboardSnapshot = {
  totals: { apis: 0, published: 0, drafts: 0, consumers: 0, requests24h: '0' },
  recentApis: [],
  alerts: [],
}

export default function DashboardPage() {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(FALLBACK)

  useEffect(() => {
    void fetchJson<DashboardSnapshot>('/api/mock/dashboard').then(setSnapshot)
  }, [])

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Platform Overview"
        title="Platform Command Center"
        actions={
          <>
            <Button variant="default" size="lg" onClick={() => router.push('/analytics')}>Open analytics</Button>
            <Button variant="primary" size="lg" onClick={() => router.push('/apis/publish')}>Publish API</Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="APIs" value={String(snapshot.totals.apis)} />
        <Metric label="Published" value={String(snapshot.totals.published)} />
        <Metric label="Drafts" value={String(snapshot.totals.drafts)} />
        <Metric label="Consumers" value={String(snapshot.totals.consumers)} />
        <Metric label="Requests / 24h" value={snapshot.totals.requests24h} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card title="Recent APIs" subtitle="Latest catalog changes">
          <table>
            <thead>
              <tr>
                <th>API</th>
                <th>Version</th>
                <th>Environment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.recentApis.map((api) => (
                <tr key={api.id}>
                  <td>{api.name}</td>
                  <td>{api.version}</td>
                  <td>{api.environment}</td>
                  <td><Badge variant={api.status === 'Active' ? 'green' : api.status === 'Draft' ? 'blue' : 'amber'}>{api.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Alerts" subtitle="What needs attention">
          <div style={{ display: 'grid', gap: 0 }}>
            {snapshot.alerts.map((alert, index) => (
              <div key={alert.id} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                <div style={{ marginBottom: 8 }}>
                  <Badge variant={alert.severity === 'Critical' ? 'red' : alert.severity === 'Warning' ? 'amber' : 'blue'}>{alert.severity}</Badge>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{alert.title}</div>
                <div style={{ fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>{alert.message}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        <ActionCard title="API Catalog" body="Browse publishing status, versions, and gateway posture." action="Open catalog" onClick={() => router.push('/apis')} />
        <ActionCard title="Developer Portal" body="Manage plans, onboarding, and app access." action="Open portal" onClick={() => router.push('/portal')} />
        <ActionCard title="Consumer Registry" body="Review keys, subscriptions, and account health." action="Open consumers" onClick={() => router.push('/consumers')} />
      </div>
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

function ActionCard({ title, body, action, onClick }: { title: string; body: string; action: string; onClick: () => void }) {
  return (
    <Card title={title}>
      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.7, marginBottom: 14 }}>{body}</div>
        <Button variant="default" size="sm" onClick={onClick}>{action}</Button>
      </div>
    </Card>
  )
}
