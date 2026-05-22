'use client'

import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GovernancePolicy } from '@/lib/types'
import { PageLayout } from '@/components/shared/PageLayout'
import { Metric } from '@/components/ui/Metric'
import { useApiData } from '@/hooks/useApiData'

const COLUMNS: Column<GovernancePolicy>[] = [
  { key: 'name', label: 'Policy', render: (_, p) => <><div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div><div style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{p.description}</div></> },
  { key: 'severity', label: 'Severity', render: (v) => <StatusBadge variant={v === 'Critical' ? 'error' : v === 'Warning' ? 'warning' : 'success'}>{v as string}</StatusBadge> },
  { key: 'compliance', label: 'Compliance', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{v}%</span> },
  { key: 'violations', label: 'Violations' },
]

export default function GovernancePage() {
  const { data: policies, loading, error } = useApiData<GovernancePolicy[]>(
    '/api/mock/governance',
    {
      onError: (err) => console.error('Failed to load governance policies:', err),
    }
  )

  const policyList = policies || []
  const critical = policyList.filter((policy) => policy.severity === 'Critical').length
  const warning = policyList.filter((policy) => policy.severity === 'Warning').length
  const passing = policyList.filter((policy) => policy.severity === 'Passing').length

  return (
    <PageLayout>
      {!!error && (
        <div className="surface-card" style={{ padding: 14, marginBottom: 16, borderColor: 'var(--danger-bd)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error.message}
        </div>
      )}
      <PageHeader
        eyebrow="Governance"
        title="Governance Center"
        actions={<><Button variant="default" size="lg">Export audit</Button><Button variant="primary" size="lg">Run scan</Button></>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Critical" value={String(critical)} variant="error" />
        <Metric label="Warning" value={String(warning)} variant="warning" />
        <Metric label="Passing" value={String(passing)} variant="success" />
      </div>

      {loading && policyList.length === 0 ? (
        <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
          <div className="skeleton-block" style={{ width: 120, height: 14, margin: '0 auto 16px' }} />
          <div className="skeleton-block" style={{ width: 200, height: 28, margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
          <Card title="Policy coverage">
            <DataTable columns={COLUMNS} data={policyList} />
          </Card>

          <Card title="Affected APIs">
            <div style={{ display: 'grid', gap: 0 }}>
              {policyList.filter((p) => p.failedApis?.length).map((policy, index) => (
                <div key={policy.id} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                  <div style={{ marginBottom: 8 }}>
                    <StatusBadge variant={policy.severity === 'Critical' ? 'error' : 'warning'}>{policy.name}</StatusBadge>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {policy.failedApis?.map((api) => <Badge key={api} variant="gray">{api}</Badge>)}
                  </div>
                </div>
              ))}
              {!policyList.filter((p) => p.failedApis?.length).length && (
                <div className="empty-state" style={{ padding: 48 }}>
                  <div className="empty-state-title">All policies passing</div>
                  <div className="empty-state-body">No APIs currently failing governance checks.</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </PageLayout>
  )
}
