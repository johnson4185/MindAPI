'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Metric } from '@/components/ui/Metric'
import { Tabs } from '@/components/ui/Tabs'
import Toggle from '@/components/ui/Toggle'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceHealth, MonitoringSnapshot, AlertRule } from '@/lib/types'
import { useStore } from '@/lib/store'
import { useApiData } from '@/hooks/useApiData'
import { PageLayout } from '@/components/shared/PageLayout'

/* ─── Service Health ─── */

const HEALTH_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  Healthy: 'success',
  Degraded: 'warning',
  Down: 'error',
  Maintenance: 'neutral',
}

const SERVICE_COLUMNS: Column<ServiceHealth>[] = [
  {
    key: 'name',
    label: 'Service',
    render: (_, s) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: s.status === 'Healthy' ? 'var(--success)' : s.status === 'Degraded' ? 'var(--warn)' : s.status === 'Down' ? 'var(--danger)' : 'var(--c-ink-4)',
            boxShadow: s.status === 'Healthy' ? '0 0 0 3px rgba(10,170,107,0.2)' : 'none',
          }}
        />
        <span style={{ fontWeight: 700 }}>{s.name}</span>
      </div>
    ),
  },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={HEALTH_VARIANT[v as string] || 'neutral'}>{v as string}</StatusBadge> },
  { key: 'uptime', label: 'Uptime', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{v as string}</span> },
  { key: 'latency', label: 'Latency (avg)', render: (v) => <span style={{ fontFamily: 'var(--f-mono)' }}>{v as string}</span> },
  { key: 'region', label: 'Region', render: (v) => <span style={{ color: 'var(--c-ink-4)' }}>{v as string}</span> },
  {
    key: 'lastIncident', label: 'Last incident',
    render: (v) => {
      const text = v as string
      return <span style={{ color: text === 'Ongoing' ? 'var(--warn)' : 'var(--c-ink-4)' }}>{text}</span>
    },
  },
]

/* ─── Alert Rules ─── */

const METRIC_LABELS: Record<string, string> = {
  error_rate: 'Error Rate',
  p95_latency: 'P95 Latency',
  request_rate: 'Request Rate',
  usage_percent: 'Usage %',
}

const SEVERITY_VARIANT: Record<string, 'error' | 'warning' | 'info'> = {
  Critical: 'error',
  Warning: 'warning',
  Info: 'info',
}

const CONDITION_LABELS: Record<string, string> = {
  '>': 'greater than',
  '<': 'less than',
  '+/-': 'outside range',
  '=': 'equals',
}

/* ─── Component ─── */

export default function MonitoringPage() {
  const { showToast } = useStore()
  const [tab, setTab] = useState('health')
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])

  const { data: snapshot, loading: loadingServices, error: servicesError } = useApiData<MonitoringSnapshot>(
    '/api/mock/monitoring',
    { onError: (err) => console.error('Failed to load monitoring data:', err) },
  )

  const { loading: loadingAlerts, error: alertsError } = useApiData<AlertRule[]>('/api/mock/alerts', {
    onSuccess: (data) => setAlertRules(data),
    onError: (err) => console.error('Failed to load alert rules:', err),
  })

  const services = snapshot?.services || []
  const summary = snapshot?.summary || { total: 0, healthy: 0, degraded: 0, down: 0 }
  const enabledRules = useMemo(() => alertRules.filter((r) => r.enabled).length, [alertRules])
  const criticalRules = useMemo(() => alertRules.filter((r) => r.severity === 'Critical' && r.enabled).length, [alertRules])

  const channels = useMemo(() => {
    const set = new Set<string>()
    alertRules.forEach((r) => r.channels.forEach((ch) => set.add(ch)))
    return Array.from(set)
  }, [alertRules])

  const HEALTH_ACTIONS = (
    <>
      <Button variant="default" size="lg" onClick={() => showToast('Refreshing service health...', 'info')}>Refresh</Button>
      <Button variant="primary" size="lg" onClick={() => showToast('Incident page opened', 'info')}>View Incidents</Button>
    </>
  )

  const ALERTS_ACTIONS = (
    <>
      <Button variant="default" size="lg" onClick={() => showToast('Exporting alert configuration...', 'info')}>Export</Button>
      <Button variant="primary" size="lg" onClick={() => showToast('Alert rule creation wizard opened', 'info')}>Create Rule</Button>
    </>
  )

  const RULE_COLUMNS: Column<AlertRule>[] = [
    {
      key: 'name',
      label: 'Alert Rule',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>{r.name}</div>                    <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--c-ink-4)' }}>
            {METRIC_LABELS[r.metric] || r.metric} {CONDITION_LABELS[r.condition] || r.condition} {r.threshold}
            {r.metric === 'p95_latency' ? 'ms' : r.metric === 'error_rate' ? '%' : ''} over {r.duration}
          </div>
        </div>
      ),
    },
    { key: 'severity', label: 'Severity', render: (v) => <StatusBadge variant={SEVERITY_VARIANT[v as string] || 'info'}>{v as string}</StatusBadge> },
    {
      key: 'channels', label: 'Channels',
      render: (v) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(v as string[]).map((ch) => (
            <StatusBadge key={ch} variant="neutral" size="sm">
              {ch === 'pagerduty' ? 'PD' : ch === 'slack' ? 'SL' : ch === 'email' ? 'EM' : ch.toUpperCase().slice(0, 2)}
            </StatusBadge>
          ))}
        </div>
      ),
    },
    {
      key: 'lastTriggered', label: 'Last triggered',
      render: (v) => <span style={{ color: v ? 'var(--c-ink-3)' : 'var(--c-ink-5)' }}>{v || 'Never'}</span>,
    },
    {
      key: 'enabled', label: 'Enabled',
      render: (v, r) => (
        <Toggle
          checked={v as boolean}
          onChange={() => {
            setAlertRules((prev) => prev.map((rule) => (rule.id === r.id ? { ...rule, enabled: !rule.enabled } : rule)))
            showToast(r.enabled ? `Rule "${r.name}" disabled` : `Rule "${r.name}" enabled`, 'success')
          }}
        />
      ),
    },
    {
      key: 'id', label: '',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); showToast(`Editing rule: ${r.name}`, 'info') }}>Edit</Button>
          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); showToast(`Rule "${r.name}" duplicated`, 'success') }}>Clone</Button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout>
      {tab === 'health' ? (
        <PageHeader prefix="Monitoring" title="Service Health" actions={HEALTH_ACTIONS} />
      ) : (
        <PageHeader prefix="Monitoring" title="Alert Configuration" actions={ALERTS_ACTIONS} />
      )}

      <Tabs
        tabs={[
          { id: 'health', label: 'Service Health' },
          { id: 'alerts', label: 'Alert Rules', badge: alertRules.length > 0 ? <span style={{ fontSize: 12, color: 'var(--c-ink-4)', marginLeft: 4 }}>({alertRules.length})</span> : undefined },
        ]}
        activeTab={tab}
        onChange={setTab}
        variant="underline"
      />

      {/* ─────────────── HEALTH TAB ─────────────── */}
      {tab === 'health' && (
        <>
          {!!servicesError && (
            <div className="surface-card" style={{ padding: 14, marginBottom: 16, borderColor: 'var(--danger-bd)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>{servicesError.message}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
            <Metric label="Total services" value={String(summary.total)} subtext="Across all regions" />
            <Metric label="Healthy" value={String(summary.healthy)} subtext={`${summary.total > 0 ? Math.round((summary.healthy / summary.total) * 100) : 0}% of services`} variant="success" />
            <Metric label="Degraded" value={String(summary.degraded)} subtext="Performance issues" variant="warning" />
            <Metric label="Down" value={String(summary.down)} subtext="Requires immediate action" variant="error" />
          </div>

          {loadingServices && services.length === 0 ? (
            <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
              <div className="skeleton-block" style={{ width: 140, height: 14, margin: '0 auto 16px' }} />
              <div className="skeleton-block" style={{ width: 260, height: 28, margin: '0 auto' }} />
            </div>
          ) : (
            <>
              <div className="surface-card" style={{ marginBottom: 18, overflow: 'hidden' }}>
                <div style={{ display: 'flex', height: 8 }}>
                  {summary.total > 0 && (
                    <>
                      <div style={{ flex: summary.healthy, background: 'var(--success)', height: '100%', transition: 'flex var(--t-slow)' }} />
                      <div style={{ flex: summary.degraded, background: 'var(--warn)', height: '100%', transition: 'flex var(--t-slow)' }} />
                      <div style={{ flex: summary.down, background: 'var(--danger)', height: '100%', transition: 'flex var(--t-slow)' }} />
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 24, padding: '14px 18px', color: 'var(--c-ink-4)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--success)' }} /> Healthy ({summary.healthy})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--warn)' }} /> Degraded ({summary.degraded})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--danger)' }} /> Down ({summary.down})
                  </span>
                </div>
              </div>

              <Card title="Service status" style={{ marginBottom: 18 }}>
                <DataTable columns={SERVICE_COLUMNS} data={services} />
              </Card>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                <Card title="Health checks">
                  <div style={{ padding: 18 }}>
                    <div style={{ color: 'var(--c-ink-3)', lineHeight: 1.7, marginBottom: 14 }}>
                      Automated health checks run every 30 seconds across all service endpoints.
                    </div>
                    <Button variant="default" size="sm" onClick={() => showToast('Health check settings opened', 'info')}>Configure Checks</Button>
                  </div>
                </Card>
                <Card title="Incident history">
                  <div style={{ padding: 18 }}>
                    <div style={{ color: 'var(--c-ink-3)', lineHeight: 1.7, marginBottom: 14 }}>
                      Review past incidents with post-mortem analysis and resolution timelines.
                    </div>
                    <Button variant="default" size="sm" onClick={() => showToast('Incident history opened', 'info')}>View History</Button>
                  </div>
                </Card>
                <Card title="SLA report">
                  <div style={{ padding: 18 }}>
                    <div style={{ color: 'var(--c-ink-3)', lineHeight: 1.7, marginBottom: 14 }}>
                      Generate monthly SLA compliance reports for your services.
                    </div>
                    <Button variant="default" size="sm" onClick={() => showToast('SLA report generated', 'success')}>Generate Report</Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {/* ─────────────── ALERTS TAB ─────────────── */}
      {tab === 'alerts' && (
        <>
          {!!alertsError && (
            <div className="surface-card" style={{ padding: 14, marginBottom: 16, borderColor: 'var(--danger-bd)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>{alertsError.message}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
            <Metric label="Total rules" value={String(alertRules.length)} subtext="Configured alert definitions" />
            <Metric label="Enabled" value={String(enabledRules)} subtext={`${alertRules.length > 0 ? Math.round((enabledRules / alertRules.length) * 100) : 0}% active`} variant="success" />
            <Metric label="Critical" value={String(criticalRules)} subtext="Requires immediate response" variant="error" />
          </div>

          {loadingAlerts && alertRules.length === 0 ? (
            <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
              <div className="skeleton-block" style={{ width: 120, height: 14, margin: '0 auto 16px' }} />
              <div className="skeleton-block" style={{ width: 240, height: 28, margin: '0 auto' }} />
            </div>
          ) : alertRules.length === 0 ? (
            <Card title="Alert rules">
              <EmptyState
                title="No alert rules configured"
                body="Create alert rules to get notified when your APIs exceed thresholds for error rate, latency, or traffic."
                action={<Button variant="primary" onClick={() => showToast('Alert rule creation wizard opened', 'info')}>Create Rule</Button>}
              />
            </Card>
          ) : (
            <>
              <Card title="Alert rules" style={{ marginBottom: 18 }}>
                <DataTable columns={RULE_COLUMNS} data={alertRules} />
              </Card>

              <div>
                <Card title="Notification channels">
                  <div style={{ padding: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                      {channels.map((ch) => {
                        const configs: Record<string, { icon: string; desc: string; configured: boolean }> = {
                          email: { icon: '✉', desc: 'Send alerts to up to 5 email recipients', configured: true },
                          slack: { icon: '💬', desc: 'Post to a Slack channel via webhook', configured: true },
                          pagerduty: { icon: '🔔', desc: 'Route critical alerts to PagerDuty', configured: false },
                        }
                        const cfg = configs[ch] || { icon: '📡', desc: 'Custom notification channel', configured: false }
                        return (
                          <div key={ch} className="surface-muted" style={{ padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, textTransform: 'capitalize', marginBottom: 4 }}>{ch}</div>
                              <div style={{ color: 'var(--c-ink-4)', lineHeight: 1.5, marginBottom: 8 }}>{cfg.desc}</div>
                              <StatusBadge variant={cfg.configured ? 'success' : 'warning'} size="sm">
                                {cfg.configured ? 'Connected' : 'Not configured'}
                              </StatusBadge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </PageLayout>
  )
}
