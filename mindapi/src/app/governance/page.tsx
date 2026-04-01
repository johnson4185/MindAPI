'use client'

import { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { GovernancePolicy } from '@/lib/types'
import { fetchJson } from '@/lib/api-client'

export default function GovernancePage() {
  const [policies, setPolicies] = useState<GovernancePolicy[]>([])

  useEffect(() => {
    void fetchJson<GovernancePolicy[]>('/api/mock/governance').then(setPolicies)
  }, [])

  const totals = useMemo(() => ({
    critical: policies.filter((policy) => policy.severity === 'Critical').length,
    warning: policies.filter((policy) => policy.severity === 'Warning').length,
    passing: policies.filter((policy) => policy.severity === 'Passing').length,
  }), [policies])

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Governance"
        title="Governance Center"
        actions={<><Button variant="default" size="lg">Export audit</Button><Button variant="primary" size="lg">Run scan</Button></>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Critical" value={String(totals.critical)} variant="red" />
        <Metric label="Warning" value={String(totals.warning)} variant="amber" />
        <Metric label="Passing" value={String(totals.passing)} variant="green" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
        <Card title="Policy coverage">
          <table>
            <thead>
              <tr>
                <th>Policy</th>
                <th>Severity</th>
                <th>Compliance</th>
                <th>Violations</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{policy.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{policy.description}</div>
                  </td>
                  <td><Badge variant={policy.severity === 'Critical' ? 'red' : policy.severity === 'Warning' ? 'amber' : 'green'}>{policy.severity}</Badge></td>
                  <td>{policy.compliance}%</td>
                  <td>{policy.violations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Affected APIs">
          <div style={{ display: 'grid', gap: 0 }}>
            {policies.filter((policy) => policy.failedApis?.length).map((policy, index) => (
              <div key={policy.id} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                <div style={{ marginBottom: 8 }}>
                  <Badge variant={policy.severity === 'Critical' ? 'red' : 'amber'}>{policy.name}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {policy.failedApis?.map((api) => <Badge key={api} variant="gray">{api}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, value, variant }: { label: string; value: string; variant: 'red' | 'amber' | 'green' }) {
  return (
    <div className="surface-card" style={{ padding: 18 }}>
      <div className="eyebrow" style={{ color: 'var(--c-ink-4)', marginBottom: 10 }}>{label}</div>
      <div style={{ marginBottom: 8 }}><Badge variant={variant}>{label}</Badge></div>
      <div className="metric-value" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
