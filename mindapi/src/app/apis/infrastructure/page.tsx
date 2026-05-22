'use client'

import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Metric } from '@/components/ui/Metric'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { apiStatusVariant } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { PageLayout } from '@/components/shared/PageLayout'
import { API } from '@/lib/types'

const COLUMNS: Column<API>[] = [
  { key: 'name', label: 'API', render: (_, api) => <strong>{api.name}</strong> },
  { key: 'basePath', label: 'Public path', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13 }}>{v as string}</span> },
  { key: 'backendUrl', label: 'Backend target', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13 }}>{v as string}</span> },
  { key: 'environment', label: 'Environment' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={apiStatusVariant(v as string)}>{v as string}</StatusBadge> },
]

export default function InfrastructurePage() {
  const { apis } = useStore()
  const production = apis.filter((api) => api.environment === 'Production').length
  const draft = apis.filter((api) => api.status === 'Draft').length

  return (
    <PageLayout>
      <PageHeader
        prefix="Gateway"
        title="Gateway Topology"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Services" value={String(apis.length)} />
        <Metric label="Production routes" value={String(production)} />
        <Metric label="Draft routes" value={String(draft)} />
      </div>

      <Card title="Service routing">
        <DataTable columns={COLUMNS} data={apis} />
      </Card>
    </PageLayout>
  )
}
