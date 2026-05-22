'use client'

import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DashboardSnapshot, API } from '@/lib/types'
import { useStore } from '@/lib/store'
import { buildTenantPath } from '@/lib/tenant-routing'
import { PageLayout } from '@/components/shared/PageLayout'
import { Metric } from '@/components/ui/Metric'
import { useApiData } from '@/hooks/useApiData'

const FALLBACK: DashboardSnapshot = {
  totals: { apis: 0, published: 0, drafts: 0, consumers: 0, requests24h: '0' },
  recentApis: [],
  alerts: [],
}

const API_COLUMNS: Column<API>[] = [
  { key: 'name', label: 'API' },
  { key: 'version', label: 'Version' },
  { key: 'environment', label: 'Environment' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'Active' ? 'success' : v === 'Draft' ? 'info' : 'warning'}>{v as string}</StatusBadge> },
]

export default function DashboardPage() {
  const router = useRouter()
  const { currentTenant } = useStore()
  const { data: snapshot, loading, error } = useApiData<DashboardSnapshot>(
    '/api/mock/dashboard',
    {
      onError: (err) => console.error('Failed to load dashboard:', err),
    }
  )

  const displayData = snapshot || FALLBACK

  return (
    <PageLayout>
      {!!error && (
        <div className="surface-card" style={{ padding: 14, marginBottom: 16, borderColor: 'var(--danger-bd)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error.message}
        </div>
      )}
      <PageHeader
        eyebrow="Platform Overview"
        title="Platform Command Center"
        actions={
          <>
            <Button variant="default" size="lg" onClick={() => router.push(buildTenantPath(currentTenant.slug, '/analytics'))}>Open analytics</Button>
            <Button variant="primary" size="lg" onClick={() => router.push(buildTenantPath(currentTenant.slug, '/apis/publish'))}>Publish API</Button>
          </>
        }
      />

      {loading ? (
        <div className="surface-card" style={{ padding: 48, textAlign: 'center', marginBottom: 18 }}>
          <div className="skeleton-block" style={{ width: 160, height: 14, margin: '0 auto 16px' }} />
          <div className="skeleton-block" style={{ width: 300, height: 28, margin: '0 auto 24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-block" style={{ height: 80 }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
            <Metric label="APIs" value={String(displayData.totals.apis)} />
            <Metric label="Published" value={String(displayData.totals.published)} />
            <Metric label="Drafts" value={String(displayData.totals.drafts)} />
            <Metric label="Consumers" value={String(displayData.totals.consumers)} />
            <Metric label="Requests / 24h" value={displayData.totals.requests24h} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 18 }}>
            <Card title="Recent APIs" subtitle="Latest catalog changes">
              <DataTable columns={API_COLUMNS} data={displayData.recentApis} />
            </Card>

            <Card title="Alerts" subtitle="What needs attention">
              <div style={{ display: 'grid', gap: 0 }}>
                {displayData.alerts.map((alert, index) => (
                  <div key={alert.id} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                    <div style={{ marginBottom: 8 }}>
                      <StatusBadge variant={alert.severity === 'Critical' ? 'error' : alert.severity === 'Warning' ? 'warning' : 'info'}>{alert.severity}</StatusBadge>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{alert.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>{alert.message}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
            {[
              { title: 'API Catalog', body: 'Browse publishing status, versions, and gateway posture.', action: 'Open catalog', href: '/apis' },
              { title: 'Developer Portal', body: 'Manage plans, onboarding, and app access.', action: 'Open portal', href: '/portal' },
              { title: 'Consumer Registry', body: 'Review keys, subscriptions, and account health.', action: 'Open consumers', href: '/consumers' },
            ].map((item) => (
              <Card key={item.title} title={item.title}>
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.7, marginBottom: 14 }}>{item.body}</div>
                  <Button variant="default" size="sm" onClick={() => router.push(buildTenantPath(currentTenant.slug, item.href))}>{item.action}</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </PageLayout>
  )
}
