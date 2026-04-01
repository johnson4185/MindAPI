'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useStore } from '@/lib/store'

const endpointCount = (basePath: string) => (basePath.length % 5) + 5

export default function APIsPage() {
  const router = useRouter()
  const { apis, removeApi, showToast, loadingApis } = useStore()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 150)

  const filtered = useMemo(() => {
    return apis.filter((api) =>
      [api.name, api.basePath, api.owner, api.environment, api.status].some((value) =>
        value.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    )
  }, [apis, debouncedSearch])

  const published = apis.filter((api) => api.status === 'Active').length
  const drafts = apis.filter((api) => api.status === 'Draft').length

  async function handleDelete() {
    if (!deleteTarget) return
    await removeApi(deleteTarget)
    setDeleteTarget(null)
    showToast('API removed from the catalog', 'success')
  }

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="API Publishing"
        title="API Portfolio"
        actions={
          <>
            <Button variant="default" size="lg" onClick={() => router.push('/apis/publish?source=import')}>Import OpenAPI</Button>
            <Button variant="primary" size="lg" onClick={() => router.push('/apis/publish')}>Create API</Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <section className="surface-card" style={{ padding: 18 }}>
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 10 }}>Catalog Structure</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Every API carries lifecycle, security, and portal metadata.</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            Review versions, endpoint coverage, monetization readiness, and developer-facing availability directly in the list view.
          </p>
        </section>
        <MetricCard label="Published" value={String(published)} hint="Production-ready APIs" />
        <MetricCard label="Drafts" value={String(drafts)} hint="Need docs, tests, or routing" />
        <MetricCard label="Products" value="5" hint="Plans attached to this catalog" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) auto auto auto', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by API, owner, environment, or status"
        />
        <select defaultValue="All environments">
          <option>All environments</option>
          <option>Production</option>
          <option>Staging</option>
          <option>Development</option>
        </select>
        <select defaultValue="All access models">
          <option>All access models</option>
          <option>Public docs</option>
          <option>Private product</option>
          <option>Internal only</option>
        </select>
        <select defaultValue="All statuses">
          <option>All statuses</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Deprecated</option>
        </select>
        <div style={{ gridColumn: '1 / -1', fontSize: 13, color: 'var(--c-ink-4)' }}>
          {loadingApis ? 'Loading APIs…' : `${filtered.length} APIs in catalog`}
        </div>
      </div>

      <div className="surface-card" style={{ overflow: 'hidden', marginBottom: 18 }}>
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>Version</th>
              <th>Endpoints</th>
              <th>Gateway</th>
              <th>Portal</th>
              <th>Plans</th>
              <th>Owner</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                    <div className="empty-state-title">No APIs matched this view</div>
                    <div className="empty-state-body">Try changing the filters, or create a new API product from an OpenAPI import.</div>
                  </div>
                </td>
              </tr>
            ) : filtered.map((api) => {
              const endpoints = endpointCount(api.basePath)
              const plan = api.environment === 'Production' ? 'Pro / Enterprise' : api.status === 'Draft' ? 'Unassigned' : 'Sandbox'
              const portal = api.status === 'Active' ? 'Published docs' : 'Internal draft'
              return (
                <tr key={api.id}>
                  <td onClick={() => router.push(`/apis/${api.id}`)} style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 4 }}>{api.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)', fontFamily: 'var(--f-mono)' }}>{api.basePath}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      <Badge variant={api.status === 'Active' ? 'green' : api.status === 'Draft' ? 'blue' : 'amber'}>{api.status}</Badge>
                      <Badge variant={api.security.length ? 'blue' : 'amber'}>{api.security.join(' / ') || 'Auth missing'}</Badge>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-ink-3)' }}>{api.version}</td>
                  <td>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{endpoints}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink-4)' }}>Endpoint configs</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{api.environment}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink-4)' }}>Route, auth, quotas</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{portal}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink-4)' }}>Try API enabled</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{plan}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink-4)' }}>Usage quotas mapped</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{api.owner}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-ink-4)' }}>Workspace role owner</div>
                  </td>
                  <td style={{ color: 'var(--c-ink-3)' }}>{api.updatedAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/apis/${api.id}`)}>Open</Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/apis/${api.id}`)}>Test</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(api.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete API"
        footer={
          <>
            <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => void handleDelete()}>Delete API</Button>
          </>
        }
      >
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>
          Deleting this API removes it from the catalog, developer portal, and gateway routing surfaces.
        </p>
      </Modal>
    </div>
  )
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface-card" style={{ padding: 18 }}>
      <div className="eyebrow" style={{ color: 'var(--c-ink-4)', marginBottom: 10 }}>{label}</div>
      <div className="metric-value" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: 'var(--c-ink-3)' }}>{hint}</div>
    </div>
  )
}
