'use client'

import { use, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Metric } from '@/components/ui/Metric'
import { PageLayout } from '@/components/shared/PageLayout'
import { useStore } from '@/lib/store'
import { HttpMethod } from '@/lib/types'
import { buildTenantPath } from '@/lib/tenant-routing'

const TEST_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export default function APIDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { apis, currentTenant } = useStore()
  const api = apis.find((item) => item.id === id) ?? apis[0]
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [path, setPath] = useState('')
  const [body, setBody] = useState('{\n  "sample": true\n}')
  const [response, setResponse] = useState<string>('')

  const endpointRows = useMemo(() => {
    if (!api) return []
    return [
      { name: 'List resources', method: 'GET', route: `${api.basePath}` },
      { name: 'Create resource', method: 'POST', route: `${api.basePath}` },
      { name: 'Get by id', method: 'GET', route: `${api.basePath}/{id}` },
      { name: 'Update by id', method: 'PUT', route: `${api.basePath}/{id}` },
      { name: 'Delete by id', method: 'DELETE', route: `${api.basePath}/{id}` },
    ]
  }, [api])

  if (!api) return null

  function runMockRequest() {
    const target = path || api.basePath
    const status = method === 'POST' ? 201 : method === 'DELETE' ? 204 : 200
    setResponse(
      JSON.stringify(
        {
          request: { method, path: target },
          status,
          latency_ms: 84,
          product_plan: api.environment === 'Production' ? 'Enterprise' : 'Sandbox',
          response:
            status === 204
              ? null
              : { api: api.name, environment: api.environment, sample: true, timestamp: new Date().toISOString() },
        },
        null,
        2,
      ),
    )
  }

  return (
    <PageLayout>
      <Breadcrumb items={[{ label: 'API Catalog', href: buildTenantPath(currentTenant.slug, '/apis') }, { label: api.name }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ maxWidth: 860 }}>
          <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 8 }}>Detail</div>
          <h1 style={{ marginBottom: 10 }}>{api.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge variant={api.status === 'Active' ? 'green' : api.status === 'Draft' ? 'amber' : 'red'} dot>{api.status}</Badge>
            <Badge variant="gray">{api.version}</Badge>
            <Badge variant="blue">{api.environment}</Badge>
            <Badge variant={api.security.length ? 'blue' : 'amber'}>{api.security.join(' / ') || 'Auth required'}</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="default" size="lg" onClick={() => router.push(buildTenantPath(currentTenant.slug, '/apis'))}>Back to catalog</Button>
          <Button variant="primary" size="lg" onClick={() => router.push(buildTenantPath(currentTenant.slug, '/analytics'))}>View runtime analytics</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <Metric label="Requests / 24h" value={api.requests24h} hint="Runtime demand" />
        <Metric label="Endpoints" value={String(endpointRows.length)} hint="Configured operations" />
        <Metric label="Portal status" value={api.status === 'Active' ? 'Live docs' : 'Draft docs'} hint="Developer-facing visibility" />
        <Metric label="Plan mapping" value={api.environment === 'Production' ? '2 plans' : 'Sandbox'} hint="Monetization readiness" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18, marginBottom: 18 }}>
        <Card title="API configuration">
          <div style={{ display: 'grid', gap: 0 }}>
            <Row label="Base path" value={api.basePath} mono />
            <Row label="Backend service" value={api.backendUrl} mono />
            <Row label="Owner" value={api.owner} />
            <Row label="Versioning" value={`${api.version} with release governance`} />
            <Row label="Portal exposure" value={api.status === 'Active' ? 'Public/private docs enabled with Try API' : 'Hidden until publish'} />
            <Row label="Product plan" value={api.environment === 'Production' ? 'Pro and Enterprise plans attached' : 'Sandbox only'} />
          </div>
        </Card>

        <Card title="Runtime summary">
          <div style={{ padding: 18, display: 'grid', gap: 12 }}>
            <div style={{ fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.7 }}>Track routing, security, plans, and request behavior for this API.</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge variant="green">Try API enabled</Badge>
              <Badge variant="blue">Monitoring active</Badge>
              <Badge variant="amber">Quota managed</Badge>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card title="Endpoint configuration" subtitle="What gets published and tested">
          <table>
            <thead>
              <tr>
                <th>Operation</th>
                <th>Method</th>
                <th>Route</th>
              </tr>
            </thead>
            <tbody>
              {endpointRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td><Badge variant="blue">{row.method}</Badge></td>
                  <td style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-ink-3)' }}>{row.route}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Gateway and portal controls" subtitle="Core features expected in Postman, Kong, and Apigee-style platforms">
          <div style={{ display: 'grid', gap: 0 }}>
            <Row label="Routing" value="Service target, route path, environment promotion" />
            <Row label="Authentication" value={api.security.join(', ') || 'API key, JWT, OAuth options needed'} />
            <Row label="Traffic control" value="Rate limiting, spike arrest, quotas by plan" />
            <Row label="Observability" value="Request logs, latency, errors, adoption analytics" />
            <Row label="Portal tooling" value="Documentation, app onboarding, key generation, Try API" />
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card title="API testing console" subtitle="Built-in request execution and mockable response inspection">
          <div style={{ padding: 18, display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px minmax(0, 1fr)', gap: 8 }}>
              <select value={method} onChange={(event) => setMethod(event.target.value as HttpMethod)}>
                {TEST_METHODS.map((item) => <option key={item}>{item}</option>)}
              </select>
              <input value={path} onChange={(event) => setPath(event.target.value)} placeholder={api.basePath} />
            </div>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} style={{ minHeight: 140, fontFamily: 'var(--f-mono)' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={runMockRequest}>Send request</Button>
              <Button variant="default" onClick={() => setResponse('')}>Reset</Button>
            </div>
          </div>
        </Card>

        <Card title="Response inspector" subtitle="Body, status, and product context">
          <div style={{ padding: 18 }}>
            {response ? (
              <pre style={{ margin: 0, padding: 16, border: '1px solid var(--c-border)', background: 'var(--c-panel-soft)', fontSize: 13, lineHeight: 1.7, overflow: 'auto', fontFamily: 'var(--f-mono)' }}>
                {response}
              </pre>
            ) : (
              <div style={{ padding: 24, border: '1px solid var(--c-border)', background: 'var(--c-panel-soft)', fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.7 }}>
                Run a request to preview the built-in console. In production, this should connect to sandbox, staging, or live environments with credential controls and saved collections.
              </div>
            )}
          </div>
        </Card>
      </div>

    </PageLayout>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, padding: '14px 18px', borderTop: '1px solid var(--c-border)' }}>
      <div style={{ fontSize: 13, color: 'var(--c-ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--c-ink-2)', lineHeight: 1.7, fontFamily: mono ? 'var(--f-mono)' : 'inherit' }}>{value}</div>
    </div>
  )
}
