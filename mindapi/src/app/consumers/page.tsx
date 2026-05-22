'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Metric } from '@/components/ui/Metric'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useStore } from '@/lib/store'
import { Consumer } from '@/lib/types'
import { canManageConsumers } from '@/lib/permissions'
import { slugify } from '@/lib/utils'
import { buildTenantPath } from '@/lib/tenant-routing'
import { PageLayout } from '@/components/shared/PageLayout'

export default function ConsumersPage() {
  const router = useRouter()
  const { consumers, addConsumer, updateConsumer, showToast, loadingConsumers, currentUser, currentTenant } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All')
  const [showCreate, setShowCreate] = useState(false)
  const [showSuspend, setShowSuspend] = useState<string | null>(null)
  const [newConsumer, setNewConsumer] = useState({ name: '', email: '' })
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({})
  const debouncedSearch = useDebounce(search, 180)

  const COLUMNS: Column<Consumer>[] = [
    { key: 'name', label: 'Consumer', render: (_, c) => <><div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div><div style={{ fontSize: 13, color: 'var(--c-ink-4)', fontFamily: 'var(--f-mono)' }}>{c.id}</div></> },
    { key: 'email', label: 'Email' },
    { key: 'apiKeys', label: 'Keys' },
    { key: 'subscribed', label: 'Subscriptions' },
    { key: 'requests7d', label: 'Requests / 7d', render: (v) => <span style={{ fontFamily: 'var(--f-mono)' }}>{v as string}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'Active' ? 'success' : 'error'} size="sm">{v as string}</StatusBadge> },
    { key: 'createdAt', label: 'Created' },
    { key: 'id', label: 'Actions', render: (_, c) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button variant="ghost" size="sm" onClick={() => router.push(buildTenantPath(currentTenant.slug, `/consumers/${c.id}`))}>View</Button>
        <Button variant={c.status === 'Active' ? 'danger' : 'success'} size="sm" onClick={() => setShowSuspend(c.id)} disabled={!canManageConsumers(currentUser.role)}>
          {c.status === 'Active' ? 'Suspend' : 'Reactivate'}
        </Button>
      </div>
    )},
  ]

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
    if (!canManageConsumers(currentUser.role)) {
      showToast('Your role cannot create consumers', 'error')
      return
    }
    const errors: { name?: string; email?: string } = {}
    if (!newConsumer.name.trim()) errors.name = 'Organization name is required'
    if (!newConsumer.email.trim()) errors.email = 'Contact email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newConsumer.email)) errors.email = 'Enter a valid email address'

    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    const consumer: Consumer = {
      id: slugify(newConsumer.name),
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
    if (!canManageConsumers(currentUser.role)) {
      showToast('Your role cannot update consumers', 'error')
      return
    }
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

  if (loadingConsumers && consumers.length === 0) {
    return (
      <PageLayout>
        <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
          <div className="skeleton-block" style={{ width: 100, height: 14, margin: '0 auto 16px' }} />
          <div className="skeleton-block" style={{ width: 220, height: 28, margin: '0 auto' }} />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        prefix="Consumers"
        title="Application Access"
        actions={<Button variant="primary" size="lg" onClick={() => setShowCreate(true)} disabled={!canManageConsumers(currentUser.role)}>Add Consumer</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Organizations" value={String(consumers.length)} />
        <Metric label="Active" value={String(activeCount)} />
        <Metric label="API Keys" value={String(totalKeys)} />
        <Metric label="Subscriptions" value={String(totalSubscriptions)} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="2.2" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by organization or email..." style={{ paddingLeft: 34 }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Suspended')} style={{ width: 'auto', minWidth: 140 }}>
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
        <span style={{ fontSize: 13, color: 'var(--c-ink-4)', marginLeft: 'auto' }}>
          {loadingConsumers ? 'Loading…' : `${filtered.length} consumers`}
        </span>
      </div>

      <DataTable columns={COLUMNS} data={filtered} />

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create consumer"
        footer={<><Button variant="default" onClick={() => setShowCreate(false)}>Cancel</Button><Button variant="primary" onClick={() => void handleCreate()}>Create</Button></>}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>Organization name</label>
            <input value={newConsumer.name} onChange={(e) => setNewConsumer((prev) => ({ ...prev, name: e.target.value }))} />
            {formErrors.name && <div className="field-error">{formErrors.name}</div>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>Contact email</label>
            <input value={newConsumer.email} onChange={(e) => setNewConsumer((prev) => ({ ...prev, email: e.target.value }))} />
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
    </PageLayout>
  )
}
