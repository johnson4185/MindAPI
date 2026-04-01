'use client'

import { useStore } from '@/lib/store'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default function PortalDocumentationPage() {
  const { apis } = useStore()
  const published = apis.filter((api) => api.status === 'Active')

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Portal"
        title="Documentation Hub"
      />

      <Card title="Published API docs">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>Version</th>
              <th>Visibility</th>
              <th>Authentication</th>
              <th>Try API</th>
            </tr>
          </thead>
          <tbody>
            {published.map((api) => (
              <tr key={api.id}>
                <td>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{api.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{api.description}</div>
                </td>
                <td>{api.version}</td>
                <td><Badge variant="green">Published</Badge></td>
                <td>{api.security.join(', ') || 'Public'}</td>
                <td><Badge variant="blue">Enabled</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
