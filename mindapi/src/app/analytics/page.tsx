'use client'

import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { AnalyticsSnapshot } from '@/lib/types'
import { PageLayout } from '@/components/shared/PageLayout'
import { AnalyticsPageSkeleton } from '@/components/ui/Skeleton'
import { Metric } from '@/components/ui/Metric'
import { useApiData } from '@/hooks/useApiData'

const EMPTY: AnalyticsSnapshot = {
  totals: { requests: '0', errorRate: '0%', avgLatency: '0ms', activeConsumers: 0 },
  apiPerformance: [],
  consumerSegments: [],
  hourlyTraffic: [],
}

export default function AnalyticsPage() {
  const { data: snapshot, loading, error } = useApiData<AnalyticsSnapshot>(
    '/api/mock/analytics',
    {
      onError: (err) => console.error('Failed to load analytics:', err),
    }
  )

  const displayData = snapshot || EMPTY

  if (loading) {
    return (
      <PageLayout>
        <AnalyticsPageSkeleton />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Analytics"
        title="Traffic Intelligence"
        actions={<><Button variant="default" size="lg">Export report</Button><Button variant="primary" size="lg">Create alert</Button></>}
      />
      {!!error && <div className="surface-card" style={{ padding: 16, marginBottom: 14, borderColor: 'var(--danger-bd)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>{error.message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Requests / day" value={displayData.totals.requests} />
        <Metric label="Error rate" value={displayData.totals.errorRate} />
        <Metric label="Average latency" value={displayData.totals.avgLatency} />
        <Metric label="Active consumers" value={String(displayData.totals.activeConsumers)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card title="Per API performance">
          <table>
            <thead>
              <tr>
                <th>API</th>
                <th>Requests</th>
                <th>Errors</th>
                <th>Latency</th>
                <th>Consumers</th>
              </tr>
            </thead>
            <tbody>
              {!displayData.apiPerformance.length ? (
                <tr><td colSpan={5} style={{ color: 'var(--c-ink-4)' }}>No performance rows available.</td></tr>
              ) : displayData.apiPerformance.map((row) => (
                <tr key={row.api}>
                  <td>{row.api}</td>
                  <td>{row.requests}</td>
                  <td><Badge variant={parseFloat(row.errors) > 2 ? 'amber' : 'green'}>{row.errors}</Badge></td>
                  <td>{row.latency}</td>
                  <td>{row.consumers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Consumer segments">
          <div style={{ display: 'grid', gap: 0 }}>
            {displayData.consumerSegments.map((segment, index) => (
              <div key={segment.segment} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{segment.segment}</div>
                  <Badge variant={segment.segment === 'Enterprise' ? 'green' : segment.segment === 'Pro' ? 'blue' : 'amber'}>{segment.share}</Badge>
                </div>
                <div style={{ fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>{segment.note}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Hourly traffic">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 10, padding: 18 }}>
          {displayData.hourlyTraffic.map((point) => (
            <div key={point.hour} style={{ border: '1px solid var(--c-border)', background: 'var(--c-panel-soft)', padding: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--c-ink-4)', marginBottom: 8 }}>{point.hour}</div>
              <div className="metric-value" style={{ fontSize: 18, fontWeight: 700 }}>{point.requests}</div>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  )
}
