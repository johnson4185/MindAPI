'use client'

import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/lib/store'
import { PageLayout } from '@/components/shared/PageLayout'

type QuotaRow = {
  id: string
  name: string
  plan: string
  minuteLimit: string
  hourlyLimit: string
  status: string
}

const COLUMNS: Column<QuotaRow>[] = [
  { key: 'name', label: 'API' },
  { key: 'plan', label: 'Plan' },
  { key: 'minuteLimit', label: 'Minute limit' },
  { key: 'hourlyLimit', label: 'Hourly limit' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'Enforced' ? 'success' : 'warning'}>{v as string}</StatusBadge> },
]

export default function RateLimitsPage() {
  const { apis } = useStore()
  const rows: QuotaRow[] = apis.map((api) => {
    const prod = api.environment === 'Production'
    return {
      id: api.id,
      name: api.name,
      plan: prod ? 'Pro / Enterprise' : 'Sandbox',
      minuteLimit: prod ? '1,000' : '100',
      hourlyLimit: prod ? '50,000' : '2,000',
      status: api.status === 'Active' ? 'Enforced' : 'Draft',
    }
  })

  return (
    <PageLayout>
      <PageHeader
        prefix="Traffic"
        title="Quota Controls"
      />

      <Card title="Quota configuration">
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
    </PageLayout>
  )
}
