'use client'

import { useMemo, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Tabs, useTabs } from '@/components/ui/Tabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Metric } from '@/components/ui/Metric'
import { EmptyState } from '@/components/ui/EmptyState'
import { Consumer, PortalSnapshot, WebhookEndpoint, WebhookDelivery } from '@/lib/types'
import { useStore } from '@/lib/store'
import { PageLayout } from '@/components/shared/PageLayout'
import { useApiData } from '@/hooks/useApiData'

/* ─── Portal Snapshot ─── */

const EMPTY: PortalSnapshot = {
  plans: [],
  publishedApis: [],
  recentApps: [],
}

const PORTAL_API_COLUMNS: Column<PortalSnapshot['publishedApis'][0]>[] = [
  { key: 'name', label: 'API' },
  { key: 'version', label: 'Version' },
  { key: 'environment', label: 'Environment' },
  { key: 'security', label: 'Auth', render: (v) => (v as string[]).join(', ') || 'Public' },
]

const DOCS_API_COLUMNS: Column<PortalSnapshot['publishedApis'][0]>[] = [
  { key: 'name', label: 'API', render: (_, api) => <><div style={{ fontWeight: 700, marginBottom: 4 }}>{api.name}</div><div style={{ color: 'var(--c-ink-4)' }}>{api.description}</div></> },
  { key: 'version', label: 'Version' },
  { key: 'status', label: 'Visibility', render: () => <StatusBadge variant="success">Published</StatusBadge> },
  { key: 'security', label: 'Authentication', render: (v) => (v as string[]).join(', ') || 'Public' },
  { key: 'id', label: 'Try API', render: () => <StatusBadge variant="info">Enabled</StatusBadge> },
]

/* ─── Webhook Columns ─── */

const DELIVERY_COLUMNS: Column<WebhookDelivery>[] = [
  { key: 'timestamp', label: 'Time', render: (v) => <span style={{ fontFamily: 'var(--f-mono)' }}>{v as string}</span> },
  { key: 'event', label: 'Event', render: (v) => <span style={{ fontFamily: 'var(--f-mono)' }}>{v as string}</span> },
  { key: 'url', label: 'Target', render: (v) => <span style={{ color: 'var(--c-ink-4)' }}>{v as string}</span> },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={(v as number) >= 200 && (v as number) < 300 ? 'success' : 'error'} size="sm">{v as number}</StatusBadge> },
  { key: 'responseTime', label: 'Duration', render: (v) => <span style={{ fontFamily: 'var(--f-mono)' }}>{v as string}</span> },
  { key: 'success', label: 'Outcome', render: (v) => <StatusBadge variant={v ? 'success' : 'error'} size="sm">{v ? 'Delivered' : 'Failed'}</StatusBadge> },
]

/* ─── Component ─── */

export default function PortalPage() {
  const { apis, loadingApis, showToast } = useStore()
  const { activeTab, setActiveTab } = useTabs('overview')
  const [approvals, setApprovals] = useState<Record<string, 'approved' | 'rejected'>>({})

  const { data: snapshot, loading: loadingPortal, error: portalError } = useApiData<PortalSnapshot>(
    '/api/mock/portal',
    { onError: (err) => console.error('Failed to load portal data:', err) },
  )
  const { data: consumersData = [], loading: loadingConsumers } = useApiData<Consumer[]>('/api/mock/consumers')

  const { data: webhooksData = [], loading: loadingWebhooks } = useApiData<WebhookEndpoint[]>('/api/mock/webhooks', {
    onError: (err) => console.error('Failed to load webhooks:', err),
  })

  const { data: deliveriesData = [] } = useApiData<WebhookDelivery[]>('/api/mock/webhooks/deliveries', {
    onError: (err) => console.error('Failed to load deliveries:', err),
  })

  const displayData = snapshot || EMPTY
  const publishedApis = useMemo(() => apis.filter((api) => api.status === 'Active'), [apis])

  const activeConsumers = useMemo(() => (consumersData ?? []).filter((c) => c.status === 'Active'), [consumersData])
  const activeWebhooks = useMemo(() => (webhooksData ?? []).filter((w) => w.status === 'Active'), [webhooksData])
  const failingWebhooks = useMemo(() => (webhooksData ?? []).filter((w) => w.status === 'Failing'), [webhooksData])
  const deliverySuccess = useMemo(() => (deliveriesData ?? []).filter((d) => d.success).length, [deliveriesData])
  const successRate = useMemo(() => {
    const safe = deliveriesData ?? []
    return safe.length > 0 ? Math.round((deliverySuccess / safe.length) * 100) : 100
  }, [deliveriesData, deliverySuccess])
  const filteredDeliveries = useMemo(() => {
    const safe = deliveriesData ?? []
    if (!safe.length) return []
    return [...safe].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  }, [deliveriesData])

  const ENDPOINT_COLUMNS: Column<WebhookEndpoint>[] = [
    {
      key: 'name', label: 'Endpoint',
      render: (_, w) => (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{w.name}</div>
          <div style={{ color: 'var(--c-ink-4)', fontFamily: 'var(--f-mono)' }}>{w.url}</div>
        </div>
      ),
    },
    { key: 'events', label: 'Events', render: (v) => <span style={{ color: 'var(--c-ink-3)' }}>{(v as string[]).length} subscribed</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'Active' ? 'success' : v === 'Failing' ? 'error' : 'neutral'}>{v as string}</StatusBadge> },
    {
      key: 'successRate', label: 'Success rate',
      render: (v) => (
        <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, color: (v as number) < 90 ? 'var(--danger)' : (v as number) < 98 ? 'var(--warn)' : 'var(--success)' }}>
          {v}%
        </span>
      ),
    },
    { key: 'lastDelivery', label: 'Last delivery', render: (v) => <span style={{ color: 'var(--c-ink-4)' }}>{(v as string) || 'Never'}</span> },
    { key: 'createdAt', label: 'Created' },
    {
      key: 'id', label: '',
      render: (_, w) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); showToast(`Test event sent to ${w.name}`, 'success') }}>Test</Button>
          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); showToast(`Editing ${w.name}`, 'info') }}>Edit</Button>
        </div>
      ),
    },
  ]

  const consumerColumns: Column<Consumer>[] = [
    { key: 'name', label: 'Application' },
    { key: 'email', label: 'Owner' },
    { key: 'apiKeys', label: 'Keys' },
    { key: 'subscribed', label: 'Subscriptions' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'Active' ? 'success' : 'error'}>{v as string}</StatusBadge> },
  ]

  return (
    <PageLayout>
      {!!portalError && (
        <div className="surface-card" style={{ padding: 14, marginBottom: 16, borderColor: 'var(--danger-bd)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>{portalError.message}</div>
      )}

      <PageHeader eyebrow="Developer Portal" title="Developer Experience" />

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'documentation', label: 'Documentation' },
          { id: 'applications', label: 'Applications' },
          { id: 'webhooks', label: 'Webhooks', badge: (webhooksData ?? []).length > 0 ? <span style={{ fontSize: 11, color: 'var(--c-ink-4)', marginLeft: 4 }}>({(webhooksData ?? []).length})</span> : undefined },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />

      {/* ─── OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <>
          {loadingPortal ? (
            <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
              <div className="skeleton-block" style={{ width: 120, height: 14, margin: '0 auto 16px' }} />
              <div className="skeleton-block" style={{ width: 240, height: 28, margin: '0 auto' }} />
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
                <Metric label="Published APIs" value={String(displayData.publishedApis.length)} />
                <Metric label="Plans" value={String(displayData.plans.length)} />
                <Metric label="Recent apps" value={String(displayData.recentApps.length)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <Card title="API products">
                  <div style={{ display: 'grid', gap: 0 }}>
                    {displayData.plans.map((plan, index) => (
                      <div key={plan.name} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                        <div style={{ fontWeight: 700 }}>{plan.name}</div>
                        <div>
                          <div style={{ marginBottom: 4 }}>{plan.audience}</div>
                          <div style={{ color: 'var(--c-ink-4)' }}>{plan.quota} · {plan.auth}</div>
                        </div>
                        <div style={{ fontWeight: 700 }}>{plan.price}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Recent applications">
                  <div style={{ display: 'grid', gap: 0 }}>
                    {displayData.recentApps.map((app, index) => (
                      <div key={app.name} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                          <div style={{ fontWeight: 700 }}>{app.name}</div>
                          <StatusBadge variant={approvals[app.name] === 'approved' || app.status === 'Active' ? 'success' : approvals[app.name] === 'rejected' ? 'error' : app.status === 'Sandbox' ? 'info' : 'warning'}>
                            {approvals[app.name] === 'approved' ? 'Approved' : approvals[app.name] === 'rejected' ? 'Rejected' : app.status}
                          </StatusBadge>
                        </div>
                        <div style={{ color: 'var(--c-ink-4)' }}>{app.owner}</div>
                        <div style={{ color: 'var(--c-ink-3)', marginTop: 6 }}>{app.plan} plan</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <Button variant="success" size="xs" onClick={() => { setApprovals((prev) => ({ ...prev, [app.name]: 'approved' })); showToast(`${app.name} approved`, 'success') }}>Approve</Button>
                          <Button variant="danger" size="xs" onClick={() => { setApprovals((prev) => ({ ...prev, [app.name]: 'rejected' })); showToast(`${app.name} rejected`, 'info') }}>Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card title="Published APIs in portal">
                <DataTable columns={PORTAL_API_COLUMNS} data={displayData.publishedApis} />
              </Card>
            </>
          )}
        </>
      )}

      {/* ─── DOCUMENTATION ─── */}
      {activeTab === 'documentation' && (
        <Card title="Published API docs">
          {loadingApis && publishedApis.length === 0 ? (
            <div className="empty-state">
              <div className="skeleton-block" style={{ width: 160, height: 14, margin: '0 auto 12px' }} />
              <div className="skeleton-block" style={{ width: 100, height: 14, margin: '0 auto' }} />
            </div>
          ) : (
            <DataTable columns={DOCS_API_COLUMNS} data={publishedApis} />
          )}
        </Card>
      )}

      {/* ─── APPLICATIONS ─── */}
      {activeTab === 'applications' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
            <Metric label="Registered apps" value={String((consumersData ?? []).length)} />
            <Metric label="Active apps" value={String(activeConsumers.length)} />
            <Metric label="Issued keys" value={String((consumersData ?? []).reduce((sum, c) => sum + c.apiKeys, 0))} />
          </div>

          <Card title="Consumer applications">
            {loadingConsumers ? (
              <div className="empty-state">
                <div className="skeleton-block" style={{ width: 140, height: 14, margin: '0 auto 12px' }} />
                <div className="skeleton-block" style={{ width: 100, height: 14, margin: '0 auto' }} />
              </div>
            ) : (
              <DataTable columns={consumerColumns} data={consumersData ?? []} />
            )}
          </Card>
        </>
      )}

      {/* ─── WEBHOOKS ─── */}
      {activeTab === 'webhooks' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
            <Metric label="Endpoints" value={String((webhooksData ?? []).length)} subtext="Registered webhooks" />
            <Metric label="Active" value={String(activeWebhooks.length)} subtext="Accepting deliveries" variant="success" />
            <Metric label="Failing" value={String(failingWebhooks.length)} subtext="Recent delivery failures" variant="error" />
            <Metric label="Delivery rate" value={`${successRate}%`} subtext={`${deliverySuccess} of ${(deliveriesData ?? []).length} attempts`} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <Card title="Webhook endpoints">
              {loadingWebhooks && (webhooksData ?? []).length === 0 ? (
                <div className="empty-state">
                  <div className="skeleton-block" style={{ width: 120, height: 14, margin: '0 auto 16px' }} />
                  <div className="skeleton-block" style={{ width: 200, height: 28, margin: '0 auto' }} />
                </div>
              ) : (webhooksData ?? []).length === 0 ? (
                <EmptyState
                  title="No webhooks configured"
                  body="Create webhook endpoints to receive real-time event notifications from your APIs."
                  action={<Button variant="primary" onClick={() => showToast('Webhook creation wizard opened', 'info')}>Create Webhook</Button>}
                />
              ) : (
                <DataTable columns={ENDPOINT_COLUMNS} data={webhooksData ?? []} />
              )}
            </Card>
          </div>

          <Card title="Delivery log">
            {filteredDeliveries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No delivery records</div>
                <div className="empty-state-body">Delivery logs will appear once webhooks are triggered by API events.</div>
              </div>
            ) : (
              <DataTable columns={DELIVERY_COLUMNS} data={filteredDeliveries} />
            )}
          </Card>
        </>
      )}
    </PageLayout>
  )
}
