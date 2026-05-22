'use client'

import { useMemo } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Metric } from '@/components/ui/Metric'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { WorkspaceSnapshot } from '@/lib/types'
import { useStore } from '@/lib/store'
import { PageLayout } from '@/components/shared/PageLayout'
import { useApiData } from '@/hooks/useApiData'
import { PRICING } from '@/lib/mock-data'

type RoleRow = { role: string; access: string; seats: number }

const ROLE_COLUMNS: Column<RoleRow>[] = [
  { key: 'role', label: 'Role', render: (v) => <StatusBadge variant={v === 'Admin' ? 'error' : v === 'Developer' ? 'info' : 'neutral'}>{v as string}</StatusBadge> },
  { key: 'access', label: 'Capabilities' },
  { key: 'seats', label: 'Seats' },
]

export default function SettingsPage() {
  const { currentTenant, showToast } = useStore()
  const { data: snapshot, loading, error } = useApiData<WorkspaceSnapshot>(
    '/api/mock/workspace',
    { onError: (err) => console.error('Failed to load workspace settings:', err) },
  )

  const data = snapshot

  const plan = data?.currentPlan || currentTenant.plan
  const current = useMemo(() => PRICING.find((item) => item.name === plan) || PRICING[0], [plan])
  const usage = data?.usage

  const planRows = PRICING.map((row) => ({
    ...row,
    id: row.name,
    action: row.name === current.name ? 'Current' : 'Upgrade',
    isCurrent: row.name === current.name,
  }))

  const PLANS_COLUMNS: Column<typeof planRows[0]>[] = [
    { key: 'name', label: 'Plan', render: (v, row) => <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{v as string}{row.isCurrent && <StatusBadge variant="success" size="sm">Current</StatusBadge>}</div> },
    { key: 'monthly', label: 'Price', render: (v) => `$${v}/mo` },
    { key: 'apiLimit', label: 'API limit' },
    { key: 'requests', label: 'Requests' },
    { key: 'seats', label: 'Seats' },
    { key: 'action', label: 'Action', render: (_, row) => <Button size="sm" variant="default" disabled={row.isCurrent} onClick={() => showToast(`Mock upgrade started: ${row.name}`, 'success')}>{row.action}</Button> },
  ] as Column<typeof planRows[0]>[]

  const INVOICE_COLUMNS: Column<NonNullable<WorkspaceSnapshot['invoices']>[0]>[] = [
    { key: 'id', label: 'Invoice' },
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'Paid' ? 'success' : v === 'Open' ? 'warning' : 'error'}>{v as string}</StatusBadge> },
  ]

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Workspace"
        title={`${currentTenant.name} Administration`}
        actions={<Button variant="primary" size="lg" onClick={() => showToast('Mock billing portal opened', 'info')}>Open Billing Portal</Button>}
      />

      {!!error && (
        <div className="surface-card" style={{ padding: 20, marginBottom: 18, borderColor: 'var(--danger-bd)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error.message}
        </div>
      )}

      {loading ? (
        <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
          <div className="skeleton-block" style={{ width: 120, height: 14, margin: '0 auto 16px' }} />
          <div className="skeleton-block" style={{ width: 200, height: 28, margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {/* ─── Role-based Access + Environments ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            <Card title="Role-based access">
              <DataTable columns={ROLE_COLUMNS} data={data?.roles ?? []} />
            </Card>

            <Card title="Environments">
              <div style={{ display: 'grid', gap: 0 }}>
                {!data?.environments.length ? (
                  <div style={{ padding: '16px 18px', color: 'var(--c-ink-4)' }}>No environments configured yet.</div>
                ) : data.environments.map((env, index) => (
                  <div key={env.name} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                      <div style={{ fontWeight: 700 }}>{env.name}</div>
                      <StatusBadge variant={env.status === 'Protected' ? 'error' : env.status === 'Controlled' ? 'warning' : 'info'}>{env.status}</StatusBadge>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--c-ink-3)' }}>{env.description}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ─── Billing Section ─── */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-ink-4)', marginBottom: 12 }}>
              Subscription &amp; Billing
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 16 }}>
              <Metric label="Current plan" value={current.name} subtext={usage ? `$${current.monthly}/mo` : ''} />
              <Metric label="Monthly spend" value={data?.monthlySpend || `$${current.monthly}.00`} subtext={`${plan === 'Enterprise' ? 'Annual' : 'Monthly'} billing`} />
              <Metric label="Projected overage" value={data?.projectedOverage || '$0.00'} subtext="Estimated end-of-month" />
            </div>

            {usage && (
              <Card title="Usage this period" style={{ marginBottom: 16 }}>
                <div style={{ display: 'grid', gap: 16, padding: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div>
                      <Metric label="APIs" value={`${usage.apis.used} / ${usage.apis.limit ?? '∞'}`} />
                      {usage.apis.limit != null && <ProgressBar value={usage.apis.used} max={usage.apis.limit} size="sm" style={{ marginTop: 8 }} />}
                    </div>
                    <div>
                      <Metric label="Requests" value={`${(usage.requests.used / 1000000).toFixed(1)}M / ${((usage.requests.limit ?? 0) / 1000000).toFixed(1)}M`} />
                      {usage.requests.limit != null && <ProgressBar value={usage.requests.used} max={usage.requests.limit} size="sm" style={{ marginTop: 8 }} />}
                    </div>
                    <div>
                      <Metric label="Seats" value={`${usage.seats.used} / ${usage.seats.limit ?? '∞'}`} />
                      {usage.seats.limit != null && <ProgressBar value={usage.seats.used} max={usage.seats.limit} size="sm" style={{ marginTop: 8 }} />}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {data?.invoices && data.invoices.length > 0 && (
              <Card title="Recent invoices" style={{ marginBottom: 16 }}>
                <DataTable columns={INVOICE_COLUMNS} data={data.invoices} />
              </Card>
            )}

            <Card title="Available plans">
              <DataTable columns={PLANS_COLUMNS} data={planRows} />
            </Card>
          </div>

          {/* ─── Workspace billing info ─── */}
          <Card title="Workspace billing">
            <div style={{ display: 'grid', gap: 0 }}>
              {!data?.billing.length ? (
                <div style={{ padding: '16px 18px', color: 'var(--c-ink-4)' }}>No billing records.</div>
              ) : data.billing.map((item, index) => (
                <div key={item.item} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 16, padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                  <div style={{ fontWeight: 700 }}>{item.item}</div>
                  <div style={{ color: 'var(--c-ink-4)' }}>{item.note}</div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--f-mono)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  )
}
