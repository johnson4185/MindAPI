'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { PortalSnapshot } from '@/lib/types'
import { fetchJson } from '@/lib/api-client'

const EMPTY: PortalSnapshot = {
  plans: [],
  publishedApis: [],
  recentApps: [],
}

export default function PortalPage() {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState<PortalSnapshot>(EMPTY)

  useEffect(() => {
    void fetchJson<PortalSnapshot>('/api/mock/portal').then(setSnapshot)
  }, [])

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Developer Portal"
        title="Developer Experience"
        actions={<><Button variant="default" size="lg" onClick={() => router.push('/portal/documentation')}>Documentation</Button><Button variant="primary" size="lg" onClick={() => router.push('/portal/integrations')}>Applications</Button></>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Published APIs" value={String(snapshot.publishedApis.length)} />
        <Metric label="Plans" value={String(snapshot.plans.length)} />
        <Metric label="Recent apps" value={String(snapshot.recentApps.length)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card title="API products">
          <div style={{ display: 'grid', gap: 0 }}>
            {snapshot.plans.map((plan, index) => (
              <div key={plan.name} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{plan.name}</div>
                <div>
                  <div style={{ fontSize: 13.5, marginBottom: 4 }}>{plan.audience}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{plan.quota} · {plan.auth}</div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{plan.price}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent applications">
          <div style={{ display: 'grid', gap: 0 }}>
            {snapshot.recentApps.map((app, index) => (
              <div key={app.name} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{app.name}</div>
                  <Badge variant={app.status === 'Active' ? 'green' : app.status === 'Sandbox' ? 'blue' : 'amber'}>{app.status}</Badge>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{app.owner}</div>
                <div style={{ fontSize: 13, color: 'var(--c-ink-3)', marginTop: 6 }}>{app.plan} plan</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Published APIs in portal">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>Version</th>
              <th>Environment</th>
              <th>Auth</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.publishedApis.map((api) => (
              <tr key={api.id}>
                <td>{api.name}</td>
                <td>{api.version}</td>
                <td>{api.environment}</td>
                <td>{api.security.join(', ') || 'Public'}</td>
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
