'use client'

import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useStore } from '@/lib/store'

export default function RateLimitsPage() {
  const { apis } = useStore()

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Traffic Control"
        title="Quota Controls"
      />

      <Card title="Quota configuration">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>Plan</th>
              <th>Minute limit</th>
              <th>Hourly limit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apis.map((api) => {
              const production = api.environment === 'Production'
              return (
                <tr key={api.id}>
                  <td>{api.name}</td>
                  <td>{production ? 'Pro / Enterprise' : 'Sandbox'}</td>
                  <td>{production ? '1,000' : '100'}</td>
                  <td>{production ? '50,000' : '2,000'}</td>
                  <td><Badge variant={api.status === 'Active' ? 'green' : 'amber'}>{api.status === 'Active' ? 'Enforced' : 'Draft'}</Badge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
