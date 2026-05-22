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
import { canManageApis } from '@/lib/permissions'
import { buildTenantPath } from '@/lib/tenant-routing'
import { PageLayout } from '@/components/shared/PageLayout'
import { apiStatusVariant } from '@/lib/utils'
import { API } from '@/lib/types'

type APIRow = API & {
  endpoints: number
  plan: string
  portal: string
}

function endpointCount(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff
  return (hash % 12) + 4
}

export default function APIsPage() {
  const router = useRouter()
  const { apis, removeApi, showToast, loadingApis, currentUser, currentTenant } = useStore()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [envFilter, setEnvFilter] = useState('All environments')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const debouncedSearch = useDebounce(search, 150)

  const filtered = useMemo(() => {
    return apis.filter((api) => {
      const matchSearch = [api.name, api.basePath, api.owner, api.environment, api.status].some((v) =>
        v.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
      const matchEnv = envFilter === 'All environments' || api.environment === envFilter
      const matchStatus = statusFilter === 'All statuses' || api.status === statusFilter
      return matchSearch && matchEnv && matchStatus
    })
  }, [apis, debouncedSearch, envFilter, statusFilter])

  const published = apis.filter((api) => api.status === 'Active').length
  const drafts = apis.filter((api) => api.status === 'Draft').length

  const rows: APIRow[] = filtered.map((api) => ({
    ...api,
    endpoints: endpointCount(api.id),
    plan: api.environment === 'Production' ? 'Pro / Enterprise' : api.status === 'Draft' ? 'Unassigned' : 'Sandbox',
    portal: api.status === 'Active' ? 'Published docs' : 'Internal draft',
  }))

  const COLUMNS: Column<APIRow>[] = [
    { key: 'name', label: 'API', render: (_, api) => (
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 4 }}>{api.name}</div>
        <div style={{ fontSize: 13, color: 'var(--c-ink-4)', fontFamily: 'var(--f-mono)' }}>{api.basePath}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          <StatusBadge variant={apiStatusVariant(api.status)} size="sm">{api.status}</StatusBadge>
          <StatusBadge variant={api.security.length ? 'info' : 'warning'} size="sm">{api.security.join(' / ') || 'Auth missing'}</StatusBadge>
        </div>
      </div>
    ) },
    { key: 'version', label: 'Version', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-ink-3)' }}>{v as string}</span> },
    { key: 'endpoints', label: 'Endpoints', render: (v) => <><div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>Endpoint configs</div></> },
    { key: 'environment', label: 'Gateway', render: (v) => <><div style={{ fontSize: 13.5, fontWeight: 600 }}>{v as string}</div><div style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>Route, auth, quotas</div></> },
    { key: 'portal', label: 'Portal', render: (v) => <><div style={{ fontSize: 13.5, fontWeight: 600 }}>{v as string}</div><div style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>Try API enabled</div></> },
    { key: 'plan', label: 'Plans', render: (v) => <><div style={{ fontSize: 13.5, fontWeight: 600 }}>{v as string}</div><div style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>Usage quotas mapped</div></> },
    { key: 'owner', label: 'Owner', render: (v) => <><div style={{ fontSize: 13.5, fontWeight: 600 }}>{v as string}</div><div style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>Workspace role owner</div></> },
    { key: 'updatedAt', label: 'Updated' },
    { key: 'id', label: 'Actions', render: (_, api) => (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Button variant="ghost" size="sm" onClick={() => router.push(buildTenantPath(currentTenant.slug, `/apis/${api.id}`))}>Open</Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(api.id)} disabled={!canManageApis(currentUser.role)}>Delete</Button>
      </div>
    )},
  ]

  async function handleDelete() {
    if (!deleteTarget || !canManageApis(currentUser.role)) return
    await removeApi(deleteTarget)
    setDeleteTarget(null)
    showToast('API removed from the catalog', 'success')
  }

  if (loadingApis && apis.length === 0) {
    return (
      <PageLayout>
        <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
          <div className="skeleton-block" style={{ width: 120, height: 14, margin: '0 auto 16px' }} />
          <div className="skeleton-block" style={{ width: 280, height: 28, margin: '0 auto 24px' }} />
          <div className="skeleton-block" style={{ width: '100%', height: 12, margin: '0 auto 8px' }} />
          <div className="skeleton-block" style={{ width: '85%', height: 12, margin: '0 auto' }} />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        prefix="APIs"
        title="API Portfolio"
        actions={
          <>
            <Button variant="default" size="lg" onClick={() => router.push(buildTenantPath(currentTenant.slug, '/apis/publish?source=import'))}>Import OpenAPI</Button>
            <Button variant="primary" size="lg" onClick={() => router.push(buildTenantPath(currentTenant.slug, '/apis/publish'))} disabled={!canManageApis(currentUser.role)}>Create API</Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Published" value={String(published)} subtext="Production-ready APIs" />
        <Metric label="Drafts" value={String(drafts)} subtext="Need docs, tests, or routing" />
        <Metric label="Products" value="5" subtext="Plans attached to this catalog" />
        <Metric label="Total APIs" value={String(apis.length)} subtext="Across all environments" />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="2.2" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search APIs..." style={{ paddingLeft: 34 }} />
        </div>
        <select value={envFilter} onChange={(e) => setEnvFilter(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
          <option>All environments</option>
          <option>Production</option><option>Staging</option><option>Development</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option>All statuses</option>
          <option>Active</option><option>Draft</option><option>Deprecated</option>
        </select>
        <span style={{ fontSize: 13, color: 'var(--c-ink-4)', marginLeft: 'auto' }}>
          {loadingApis ? 'Loading…' : `${filtered.length} APIs in catalog`}
        </span>
      </div>

      <DataTable
        columns={COLUMNS}
        data={rows}
        onRowClick={(api) => router.push(buildTenantPath(currentTenant.slug, `/apis/${api.id}`))}
      />

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete API"
        footer={
          <>
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => void handleDelete()} disabled={!canManageApis(currentUser.role)}>Delete API</Button>
          </>
        }
      >
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>
          Deleting this API removes it from the catalog, developer portal, and gateway routing surfaces.
        </p>
      </Modal>
    </PageLayout>
  )
}
