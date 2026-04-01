'use client'

import { use, useEffect, useState } from 'react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Consumer, ConsumerKey, ConsumerSubscription } from '@/lib/types'
import { fetchJson } from '@/lib/api-client'

function generateKeyValue() {
  return `ak_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}

export default function ConsumerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const [keys, setKeys] = useState<ConsumerKey[]>([])
  const [subscriptions, setSubscriptions] = useState<ConsumerSubscription[]>([])

  useEffect(() => {
    async function load() {
      const [consumerData, keyData, subscriptionData] = await Promise.all([
        fetchJson<Consumer>(`/api/mock/consumers/${id}`),
        fetchJson<ConsumerKey[]>(`/api/mock/consumers/${id}/keys`),
        fetchJson<ConsumerSubscription[]>(`/api/mock/consumers/${id}/subscriptions`),
      ])
      setConsumer(consumerData)
      setKeys(keyData)
      setSubscriptions(subscriptionData)
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

  if (!consumer) return null

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <Breadcrumb items={[{ label: 'Consumers', href: '/consumers' }, { label: consumer.name }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ marginBottom: 10 }}>{consumer.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge variant={consumer.status === 'Active' ? 'green' : 'red'}>{consumer.status}</Badge>
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
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Last used</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td style={{ fontFamily: 'var(--f-mono)', fontSize: 12.5 }}>{key.value}</td>
                <td>{key.lastUsed}</td>
                <td><Badge variant={key.status === 'Active' ? 'green' : 'gray'}>{key.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Subscriptions">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.apiName}</td>
                <td>{subscription.plan}</td>
                <td><Badge variant={subscription.status === 'Active' ? 'green' : subscription.status === 'Pending' ? 'amber' : 'red'}>{subscription.status}</Badge></td>
                <td>{subscription.used} / {subscription.quota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card" style={{ padding: 18 }}>
      <div className="eyebrow" style={{ color: 'var(--c-ink-4)', marginBottom: 10 }}>{label}</div>
      <div className="metric-value" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
