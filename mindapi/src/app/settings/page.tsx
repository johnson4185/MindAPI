'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { WorkspaceSnapshot } from '@/lib/types'
import { fetchJson } from '@/lib/api-client'

const EMPTY: WorkspaceSnapshot = {
  roles: [],
  environments: [],
  billing: [],
}

export default function SettingsPage() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(EMPTY)

  useEffect(() => {
    void fetchJson<WorkspaceSnapshot>('/api/mock/workspace').then(setSnapshot)
  }, [])

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Workspace"
        title="Workspace Administration"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card title="Role-based access">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Capabilities</th>
                <th>Seats</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.roles.map((role) => (
                <tr key={role.role}>
                  <td><Badge variant={role.role === 'Admin' ? 'red' : role.role === 'Developer' ? 'blue' : 'gray'}>{role.role}</Badge></td>
                  <td>{role.access}</td>
                  <td>{role.seats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Environments">
          <div style={{ display: 'grid', gap: 0 }}>
            {snapshot.environments.map((environment, index) => (
              <div key={environment.name} style={{ padding: '16px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--c-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{environment.name}</div>
                  <Badge variant={environment.status === 'Protected' ? 'red' : environment.status === 'Controlled' ? 'amber' : 'blue'}>{environment.status}</Badge>
                </div>
                <div style={{ fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>{environment.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Billing">
        <table>
          <thead>
            <tr>
              <th>Line item</th>
              <th>Notes</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.billing.map((item) => (
              <tr key={item.item}>
                <td>{item.item}</td>
                <td>{item.note}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
