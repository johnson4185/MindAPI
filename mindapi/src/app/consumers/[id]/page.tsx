'use client'

import { use, useEffect, useState } from 'react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Consumer, ConsumerKey, ConsumerSubscription } from '@/lib/types'
import { fetchJson } from '@/lib/api-client'
import { useStore } from '@/lib/store'
import { buildTenantPath } from '@/lib/tenant-routing'
import { Metric } from '@/components/ui/Metric'
import { PageLayout } from '@/components/shared/PageLayout'

const KEY_COLUMNS: Column<ConsumerKey>[] = [
  { key: 'name', label: 'Name' },
  { key: 'value', label: 'Value', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13 }}>{v as string}</span> },
  { key: 'lastUsed', label: 'Last used' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'Active' ? 'success' : 'neutral'}>{v as string}</StatusBadge> },
]

const SUB_COLUMNS: Column<ConsumerSubscription>[] = [
  { key: 'apiName', label: 'API' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'Active' ? 'success' : v === 'Pending' ? 'warning' : 'error'}>{v as string}</StatusBadge> },
  { key: 'id', label: 'Usage', render: (_, s) => <span style={{ fontFamily: 'var(--f-mono)' }}>{s.used} / {s.quota}</span> },
]

function generateKeyValue() {
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  return `ak_live_${Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')}`
}

export default function ConsumerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { currentTenant } = useStore()
  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const [keys, setKeys] = useState<ConsumerKey[]>([])
  const [subscriptions, setSubscriptions] = useState<ConsumerSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [consumerData, keyData, subscriptionData] = await Promise.all([
          fetchJson<Consumer>(`/api/mock/consumers/${id}`),
          fetchJson<ConsumerKey[]>(`/api/mock/consumers/${id}/keys`),
          fetchJson<ConsumerSubscription[]>(`/api/mock/consumers/${id}/subscriptions`),
        ])
        setConsumer(consumerData)
        setKeys(keyData)
        setSubscriptions(subscriptionData)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unable to load consumer details from mock API.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  async function createKey() {
    if (!consumer) return
    const created = await fetchJson<ConsumerKey>(`/api/mock/consumers/${consumer.id}/keys`, {
      method: 'POST',
      body: JSON.stringify({
        id: `key-${Date.now()}`,
        consumerId: consumer.id,
        name: `Generated Key ${keys.length + 1}`,
        value: generateKeyValue(),
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUsed: 'Never',
        status: 'Active',
      }),
    })
    setKeys((current) => [created, ...current])
    setConsumer((current) => current ? { ...current, apiKeys: current.apiKeys + 1 } : current)
  }

  if (loading) return <PageLayout><div className="surface-card" style={{ padding: 48, textAlign: 'center' }}><div className="skeleton-block" style={{ width: 140, height: 14, margin: '0 auto 16px' }} /><div className="skeleton-block" style={{ width: 200, height: 28, margin: '0 auto' }} /></div></PageLayout>
  if (!consumer) return <PageLayout><div className="surface-card" style={{ padding: 24 }}>{error || 'Consumer not found.'}</div></PageLayout>

  return (
    <PageLayout>
      <Breadcrumb items={[{ label: 'Consumers', href: buildTenantPath(currentTenant.slug, '/consumers') }, { label: consumer.name }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h1 style={{ marginBottom: 10 }}>{consumer.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge variant={consumer.status === 'Active' ? 'success' : 'error'}>{consumer.status}</StatusBadge>
            <span style={{ color: 'var(--c-ink-3)' }}>{consumer.email}</span>
          </div>
        </div>
        <Button variant="primary" size="lg" onClick={() => void createKey()}>Generate Key</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Subscriptions" value={String(consumer.subscribed)} />
        <Metric label="Active keys" value={String(keys.filter((key) => key.status === 'Active').length)} />
        <Metric label="Requests / 7d" value={consumer.requests7d} />
      </div>

      <Card title="API Keys" style={{ marginBottom: 18 }}>
        <DataTable columns={KEY_COLUMNS} data={keys} />
      </Card>

      <Card title="Subscriptions">
        <DataTable columns={SUB_COLUMNS} data={subscriptions} />
      </Card>
    </PageLayout>
  )
}
