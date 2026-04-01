'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useStore } from '@/lib/store'
import { Consumer } from '@/lib/types'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--c-panel)',
  border: '1px solid var(--c-border)',
  fontSize: 14,
  color: 'var(--c-ink)',
  outline: 'none',
}

export default function ConsumersPage() {
  const router = useRouter()
  const { consumers, addConsumer, updateConsumer, showToast, loadingConsumers } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All')
  const [showCreate, setShowCreate] = useState(false)
  const [showSuspend, setShowSuspend] = useState<string | null>(null)
  const [newConsumer, setNewConsumer] = useState({ name: '', email: '' })
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({})
  const debouncedSearch = useDebounce(search, 180)

  const filtered = useMemo(
    () =>
      consumers.filter((consumer) => {
        const matchesSearch =
          consumer.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          consumer.email.toLowerCase().includes(debouncedSearch.toLowerCase())
        const matchesStatus = statusFilter === 'All' || consumer.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [consumers, debouncedSearch, statusFilter],
  )

  async function handleCreate() {
    const errors: { name?: string; email?: string } = {}
    if (!newConsumer.name.trim()) errors.name = 'Organization name is required'
    if (!newConsumer.email.trim()) errors.email = 'Contact email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newConsumer.email)) errors.email = 'Enter a valid email address'

    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    const consumer: Consumer = {
      id: newConsumer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: newConsumer.name,
      email: newConsumer.email,
      apiKeys: 0,
      subscribed: 0,
      requests7d: '0',
      status: 'Active',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }

    await addConsumer(consumer)
    showToast(`Consumer "${consumer.name}" created`, 'success')
    setShowCreate(false)
    setNewConsumer({ name: '', email: '' })
    setFormErrors({})
  }

  async function handleStatusToggle(id: string) {
    const consumer = consumers.find((item) => item.id === id)
    if (!consumer) return
    await updateConsumer(id, { status: consumer.status === 'Active' ? 'Suspended' : 'Active' })
    setShowSuspend(null)
    showToast(
      consumer.status === 'Active' ? `${consumer.name} suspended` : `${consumer.name} reactivated`,
      'success',
    )
  }

  const activeCount = consumers.filter((consumer) => consumer.status === 'Active').length
  const totalKeys = consumers.reduce((sum, consumer) => sum + consumer.apiKeys, 0)
  const totalSubscriptions = consumers.reduce((sum, consumer) => sum + consumer.subscribed, 0)

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Consumers"
        title="Application Access"
        actions={<Button variant="primary" size="lg" onClick={() => setShowCreate(true)}>Add Consumer</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Organizations" value={String(consumers.length)} />
        <Metric label="Active" value={String(activeCount)} />
        <Metric label="API Keys" value={String(totalKeys)} />
        <Metric label="Subscriptions" value={String(totalSubscriptions)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 180px auto', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by organization or contact email" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | 'Active' | 'Suspended')}>
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
        <span style={{ justifySelf: 'end', fontSize: 13, color: 'var(--c-ink-4)' }}>
          {loadingConsumers ? 'Loading…' : `${filtered.length} consumers`}
        </span>
      </div>

      <div className="surface-card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Consumer</th>
              <th>Email</th>
              <th>Keys</th>
              <th>Subscriptions</th>
              <th>Requests / 7d</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((consumer) => (
              <tr key={consumer.id}>
                <td>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{consumer.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)', fontFamily: 'var(--f-mono)' }}>{consumer.id}</div>
                </td>
                <td>{consumer.email}</td>
                <td>{consumer.apiKeys}</td>
                <td>{consumer.subscribed}</td>
                <td style={{ fontFamily: 'var(--f-mono)' }}>{consumer.requests7d}</td>
                <td><Badge variant={consumer.status === 'Active' ? 'green' : 'red'}>{consumer.status}</Badge></td>
                <td>{consumer.createdAt}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/consumers/${consumer.id}`)}>View</Button>
                    <Button variant={consumer.status === 'Active' ? 'danger' : 'success'} size="sm" onClick={() => setShowSuspend(consumer.id)}>
                      {consumer.status === 'Active' ? 'Suspend' : 'Reactivate'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create consumer"
        footer={<><Button variant="default" onClick={() => setShowCreate(false)}>Cancel</Button><Button variant="primary" onClick={() => void handleCreate()}>Create</Button></>}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>Organization name</label>
            <input value={newConsumer.name} onChange={(event) => setNewConsumer((current) => ({ ...current, name: event.target.value }))} style={INPUT_STYLE} />
            {formErrors.name && <div className="field-error">{formErrors.name}</div>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>Contact email</label>
            <input value={newConsumer.email} onChange={(event) => setNewConsumer((current) => ({ ...current, email: event.target.value }))} style={INPUT_STYLE} />
            {formErrors.email && <div className="field-error">{formErrors.email}</div>}
          </div>
        </div>
      </Modal>

      <Modal
        open={showSuspend !== null}
        onClose={() => setShowSuspend(null)}
        title="Update consumer status"
        footer={<><Button variant="default" onClick={() => setShowSuspend(null)}>Cancel</Button><Button variant="primary" onClick={() => showSuspend && void handleStatusToggle(showSuspend)}>Confirm</Button></>}
      >
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>This updates the consumer access state in the shared mock API so the rest of the app stays in sync.</p>
      </Modal>
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
