'use client'

import { ChangeEvent, CSSProperties, ReactNode, Suspense, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { ImportedApiCandidate, ImportedApiOperation, parseApiCollection } from '@/lib/api-import'
import { useStore } from '@/lib/store'
import { API, Environment, HttpMethod } from '@/lib/types'
import { buildTenantPath } from '@/lib/tenant-routing'
import { canManageApis } from '@/lib/permissions'

type AuthType = 'api-key' | 'oauth2' | 'jwt' | 'basic' | 'none'
type RouteMode = 'proxy' | 'operations'
type DraftOperation = ImportedApiOperation & { enabled: boolean }

type PublishForm = {
  name: string
  version: string
  environment: Environment
  owner: string
  description: string
  tags: string
  docsSource: string
  backendUrl: string
  basePath: string
  servicePath: string
  timeout: string
  retries: string
  stripPath: boolean
  httpsOnly: boolean
  preserveHost: boolean
  routeHost: string
  routePriority: string
  authType: AuthType
  apiKeyHeader: string
  oauthUrl: string
  jwtSecret: string
  rateEnabled: boolean
  ratePerMinute: string
  ratePerHour: string
  analytics: boolean
  cors: boolean
  circuitBreaker: boolean
  requestBuffering: boolean
}

const STEPS = [
  { key: 'source', label: 'Source', subtitle: 'Choose manual creation or import a contract', icon: '01' },
  { key: 'info', label: 'Basic Info', subtitle: 'Define identity, ownership, and documentation', icon: '02' },
  { key: 'backend', label: 'Backend', subtitle: 'Connect the gateway service to the upstream target', icon: '03' },
  { key: 'routes', label: 'Routes', subtitle: 'Review the public paths and route matching rules', icon: '04' },
  { key: 'security', label: 'Security', subtitle: 'Apply authentication and access policy', icon: '05' },
  { key: 'traffic', label: 'Traffic', subtitle: 'Control traffic, analytics, and runtime safeguards', icon: '06' },
  { key: 'review', label: 'Review', subtitle: 'Inspect the generated plan before publishing', icon: '07' },
] as const

const OWNERS = ['Platform Team', 'Backend Team', 'Data Team', 'Integration Team']
const ENVIRONMENTS: Environment[] = ['Production', 'Staging', 'Development']

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'var(--c-panel)',
  border: '1.5px solid var(--c-border)',
  borderRadius: 8,
  fontSize: 14.5,
  color: 'var(--c-ink)',
  boxShadow: '0 1px 2px rgba(12,14,20,0.04)',
}

const DEFAULT_FORM: PublishForm = {
  name: '',
  version: 'v1.0.0',
  environment: 'Production',
  owner: 'Platform Team',
  description: '',
  tags: '',
  docsSource: 'Manual entry',
  backendUrl: '',
  basePath: '',
  servicePath: '/',
  timeout: '60000',
  retries: '3',
  stripPath: true,
  httpsOnly: true,
  preserveHost: false,
  routeHost: '',
  routePriority: '100',
  authType: 'api-key',
  apiKeyHeader: 'X-API-Key',
  oauthUrl: '',
  jwtSecret: '',
  rateEnabled: true,
  ratePerMinute: '1000',
  ratePerHour: '50000',
  analytics: true,
  cors: false,
  circuitBreaker: true,
  requestBuffering: false,
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const METHOD_COLORS: Record<HttpMethod, { bg: string; color: string; border: string }> = {
  GET: { bg: 'rgba(26,95,180,0.1)', color: '#1A5FB4', border: 'rgba(26,95,180,0.25)' },
  POST: { bg: 'rgba(10,170,107,0.1)', color: '#0aaa6b', border: 'rgba(10,170,107,0.25)' },
  PUT: { bg: 'rgba(201,124,10,0.1)', color: '#c97c0a', border: 'rgba(201,124,10,0.25)' },
  PATCH: { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: 'rgba(124,58,237,0.25)' },
  DELETE: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', border: 'rgba(220,38,38,0.25)' },
  OPTIONS: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)' },
  HEAD: { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.25)' },
}

function RouteMethodPill({ method }: { method: HttpMethod }) {
  const c = METHOD_COLORS[method] || METHOD_COLORS.GET
  return (
    <span style={{
      display: 'inline-flex', minWidth: 58, justifyContent: 'center',
      padding: '4px 10px', borderRadius: 6,
      border: `1.5px solid ${c.border}`, background: c.bg,
      color: c.color, fontSize: 11.5, fontWeight: 800,
      fontFamily: 'var(--f-mono)', letterSpacing: '0.04em',
    }}>
      {method}
    </span>
  )
}

function PublishPage() {
  const router = useRouter()
  const params = useSearchParams()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const { addApi, pluginTemplates, pushNotification, showToast, currentTenant, currentUser } = useStore()

  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'import' | 'manual'>(params.get('source') === 'import' ? 'import' : 'manual')
  const [source, setSource] = useState('')
  const [fileName, setFileName] = useState('')
  const [candidates, setCandidates] = useState<ImportedApiCandidate[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [routeMode, setRouteMode] = useState<RouteMode>('proxy')
  const [server, setServer] = useState('')
  const [operations, setOperations] = useState<DraftOperation[]>([])
  const [form, setForm] = useState<PublishForm>(DEFAULT_FORM)

  const selected = useMemo(() => candidates.find((c) => c.id === selectedId) || null, [candidates, selectedId])
  const enabledOps = useMemo(() => operations.filter((op) => op.enabled), [operations])

  const summaryRows = useMemo(() => [
    ['API Name', form.name || 'Not set'],
    ['Version', form.version],
    ['Environment', form.environment],
    ['Owner', form.owner],
    ['Source', mode === 'import' ? selected?.sourceLabel || 'Imported definition' : 'Manual setup'],
    ['Backend', server || form.backendUrl || 'Not set'],
    ['Route Model', routeMode === 'operations' ? 'Selected operations' : 'Proxy all paths'],
    ['Exposure', routeMode === 'operations' ? `${enabledOps.length} operation${enabledOps.length === 1 ? '' : 's'}` : `${form.basePath || 'Path pending'}`],
    ['Security', form.authType === 'none' ? 'Public' : authLabel(form.authType)],
    ['Traffic', form.rateEnabled ? `${form.ratePerMinute}/min · ${form.ratePerHour}/hr` : 'No rate limit'],
  ], [enabledOps.length, form, mode, routeMode, selected?.sourceLabel, server])

  const previewYaml = useMemo(() => buildGatewayPreview(form, routeMode, enabledOps), [enabledOps, form, routeMode])

  function setField<K extends keyof PublishForm>(key: K, value: PublishForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function applyCandidate(candidate: ImportedApiCandidate) {
    setSelectedId(candidate.id)
    setMode('import')
    setServer(candidate.servers[0] || candidate.backendUrl)
    setRouteMode(candidate.operations.length ? 'operations' : 'proxy')
    setOperations(candidate.operations.map((op) => ({ ...op, enabled: true })))
    setForm((prev) => ({
      ...prev,
      name: candidate.displayName,
      version: candidate.version,
      environment: candidate.environment,
      owner: candidate.owner || 'Platform Team',
      description: candidate.description,
      tags: candidate.tags.join(', '),
      docsSource: `${candidate.sourceLabel} import`,
      backendUrl: candidate.servers[0] || candidate.backendUrl,
      basePath: candidate.basePath,
      servicePath: candidate.basePath || '/',
      authType: candidate.security.includes('OAuth 2.0') ? 'oauth2' : candidate.security.includes('JWT') ? 'jwt' : candidate.security.includes('Basic Auth') ? 'basic' : candidate.security.length ? 'api-key' : 'none',
    }))
  }

  function parseDefinition(raw: string) {
    const parsed = parseApiCollection(raw)
    setCandidates(parsed)
    if (parsed[0]) applyCandidate(parsed[0])
    return parsed
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (load) => {
      const text = String(load.target?.result || '')
      setSource(text)
      try {
        const parsed = parseDefinition(text)
        showToast(`Loaded ${parsed.length} API definition${parsed.length > 1 ? 's' : ''}`, 'success')
      } catch {
        showToast('Could not parse the selected file', 'error')
      }
    }
    reader.readAsText(file)
  }

  function startManualMode() {
    setMode('manual')
    setCandidates([])
    setSelectedId('')
    setSource('')
    setFileName('')
    setServer('')
    setRouteMode('proxy')
    setOperations([])
    setForm((prev) => ({ ...DEFAULT_FORM, owner: prev.owner, environment: prev.environment }))
  }

  function updateOperation(id: string, patch: Partial<DraftOperation>) {
    setOperations((prev) => prev.map((op) => (op.id === id ? { ...op, ...patch } : op)))
  }

  function toggleAllOperations(enabled: boolean) {
    setOperations((prev) => prev.map((op) => ({ ...op, enabled })))
  }

  function validateStep() {
    if (step === 0 && mode === 'import' && !selected) return 'Select an imported API definition first'
    if (step === 1 && !form.name.trim()) return 'API name is required'
    if (step === 1 && !form.owner.trim()) return 'Owner is required'
    if (step === 2 && !form.backendUrl.trim()) return 'Backend URL is required'
    if (step === 2 && !form.basePath.trim()) return 'Public base path is required'
    if (step === 3 && routeMode === 'operations' && enabledOps.length === 0) return 'Enable at least one operation'
    if (step === 4 && form.authType === 'oauth2' && !form.oauthUrl.trim()) return 'OAuth introspection URL is required'
    if (step === 4 && form.authType === 'jwt' && !form.jwtSecret.trim()) return 'JWT key or secret is required'
    return null
  }

  async function publish(asDraft = false) {
    if (!canManageApis(currentUser.role)) {
      showToast('Your role cannot publish APIs', 'error')
      return
    }
    const activePlugins = pluginTemplates.filter((plugin) => {
      if (plugin.category === 'Authentication') return form.authType !== 'none'
      if (plugin.category === 'Traffic Control') return form.rateEnabled
      if (plugin.category === 'Analytics & Monitoring') return form.analytics
      if (plugin.name === 'CORS Headers') return form.cors
      return false
    })

    const id = slugify(form.name) || `api-${Date.now()}`
    const api: API = {
      id, name: form.name, version: form.version, environment: form.environment, owner: form.owner,
      status: asDraft ? 'Draft' : 'Active', requests24h: '0',
      security: form.authType === 'none' ? [] : [authLabel(form.authType)],
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: form.description, basePath: form.basePath, backendUrl: server || form.backendUrl,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    await addApi(api, activePlugins.length ? activePlugins : undefined)
    pushNotification({
      title: asDraft ? 'API Saved as Draft' : 'API Published',
      message: `${api.name} ${asDraft ? 'saved as draft' : 'published'} with ${routeMode === 'operations' ? enabledOps.length : 1} route definition${(routeMode === 'operations' ? enabledOps.length : 1) === 1 ? '' : 's'}.`,
      href: `/apis/${api.id}`,
    })
    showToast(asDraft ? `${api.name} saved as draft` : `${api.name} published successfully`, 'success')
    router.push(buildTenantPath(currentTenant.slug, `/apis/${api.id}`))
  }

  function continueStep() {
    const error = validateStep()
    if (error) { showToast(error, 'error'); return }
    setStep((s) => s + 1)
  }

  const completion = Math.round(((step + 1) / STEPS.length) * 100)
  const activeStep = STEPS[step]

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader        prefix="APIs"
            title="Publish New API"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="default" size="md" onClick={() => void publish(true)}>Save Draft</Button>
            <Button variant="ghost" size="md" onClick={() => router.push(buildTenantPath(currentTenant.slug, '/apis'))}>Cancel</Button>
          </div>
        }
      />

      {/* Step progress */}
      <div style={{
        background: 'var(--c-panel)', border: '1.5px solid var(--c-border)',            borderRadius: 'var(--r-xl)', padding: '24px 28px', marginBottom: 24,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STEPS.map((entry, index) => {
            const state = index < step ? 'done' : index === step ? 'active' : 'pending'
            const isLast = index === STEPS.length - 1
            return (
              <div key={entry.key} style={{ display: 'flex', alignItems: 'center', flex: isLast ? '0 0 auto' : 1 }}>
                <button
                  type="button"
                  onClick={() => { if (index <= step) setStep(index) }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '0 4px', background: 'none', border: 'none',
                    cursor: index <= step ? 'pointer' : 'default',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--accent)' : 'var(--c-panel-soft)',
                    border: `2px solid ${state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--accent)' : 'var(--c-border)'}`,
                    color: state === 'pending' ? 'var(--c-ink-4)' : '#fff',
                    fontSize: 13, fontWeight: 800,
                    transition: 'all var(--t-med)',
                    boxShadow: state === 'active' ? '0 0 0 4px var(--accent-glow)' : 'none',
                  }}>
                    {state === 'done' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 800 }}>{index + 1}</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: state === 'active' ? 700 : 600,
                      color: state === 'active' ? 'var(--c-ink)' : state === 'done' ? 'var(--success)' : 'var(--c-ink-4)',
                      whiteSpace: 'nowrap',
                    }}>
                      {entry.label}
                    </div>
                  </div>
                </button>

                {!isLast && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 6px', marginBottom: 26,
                    background: index < step ? 'var(--success)' : 'var(--c-border)',
                    borderRadius: 1, transition: 'background var(--t-med)',
                    minWidth: 20,
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20 }}>
        {/* Main form panel */}
        <div style={{
          background: 'var(--c-panel)', border: '1.5px solid var(--c-border)',
          borderRadius: 'var(--r-xl)', padding: '32px 36px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Step header */}
          <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--c-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-lg)', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 16, fontWeight: 800,
                boxShadow: '0 4px 12px var(--accent-glow)',
              }}>
                {step + 1}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '-0.02em', fontFamily: 'var(--f-display)' }}>
                  {activeStep.label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--c-ink-3)', marginTop: 2 }}>{activeStep.subtitle}</div>
              </div>
            </div>
          </div>

          {/* Step 0: Source */}
          {step === 0 && (
            <div style={{ display: 'grid', gap: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <button type="button" onClick={() => setMode('import')} style={sourceCardStyle(mode === 'import')}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--r-md)', marginBottom: 14,
                    background: mode === 'import' ? 'var(--accent)' : 'var(--c-panel-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${mode === 'import' ? 'var(--accent-strong)' : 'var(--c-border)'}`,
                    transition: 'all var(--t-fast)',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mode === 'import' ? '#fff' : 'var(--c-ink-4)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>Import definition</div>
                  <div style={{ fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.65 }}>
                    Upload or paste an OpenAPI, Swagger, or Postman collection. Operations, servers, and security are auto-detected.
                  </div>
                  {mode === 'import' && (
                    <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                      Selected
                    </div>
                  )}
                </button>

                <button type="button" onClick={startManualMode} style={sourceCardStyle(mode === 'manual')}>
                  <div style={{                      width: 44, height: 44, borderRadius: 'var(--r-md)', marginBottom: 14,
                    background: mode === 'manual' ? 'var(--accent)' : 'var(--c-panel-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${mode === 'manual' ? 'var(--accent-strong)' : 'var(--c-border)'}`,
                    transition: 'all var(--t-fast)',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mode === 'manual' ? '#fff' : 'var(--c-ink-4)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>Create manually</div>
                  <div style={{ fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.65 }}>
                    Start from scratch when no contract file is available. Publish a managed proxy from backend URL and base path.
                  </div>
                  {mode === 'manual' && (
                    <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                      Selected
                    </div>
                  )}
                </button>
              </div>

              {mode === 'import' ? (
                <>
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: '2px dashed var(--c-border)', background: 'var(--c-panel-soft)',
                      borderRadius: 'var(--r-md)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer',
                      transition: 'border-color var(--t-fast)',
                    }}
                  >
                    <div style={{                    width: 48, height: 48, borderRadius: 'var(--r-lg)', background: 'var(--c-panel)', border: '1.5px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 6 }}>
                      {fileName ? fileName : 'Drop your API definition here'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>
                      OpenAPI 3.x, Swagger 2.0, Postman collections · JSON or YAML
                    </div>
                    {!fileName && (
                      <div style={{ marginTop: 14, display: 'inline-flex', padding: '7px 16px', background: 'var(--c-panel)', border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, color: 'var(--c-ink-2)' }}>
                        Browse files
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept=".json,.yaml,.yml" style={{ display: 'none' }} onChange={handleFileUpload} />

                  <div>
                    <FieldLabel label="Or paste definition" />
                    <textarea
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Paste OpenAPI, Swagger, or Postman collection content here…"
                      style={{ ...inputStyle, minHeight: 160, resize: 'vertical', fontFamily: 'var(--f-mono)', fontSize: 12.5, lineHeight: 1.6 }}
                    />
                  </div>

                  <div>
                    <Button variant="primary" size="md" onClick={() => {
                      try {
                        const parsed = parseDefinition(source)
                        showToast(`Found ${parsed.length} API definition${parsed.length === 1 ? '' : 's'}`, 'success')
                      } catch {
                        showToast('Could not parse the document', 'error')
                      }
                    }}>
                      Parse & Detect APIs
                    </Button>
                  </div>

                  {candidates.length > 0 && (
                    <div style={{ display: 'grid', gap: 10 }}>
                      <FieldLabel label={`Detected APIs (${candidates.length})`} />
                      {candidates.map((candidate) => (
                        <button
                          key={candidate.id} type="button"
                          onClick={() => applyCandidate(candidate)}
                          style={{
                            textAlign: 'left', padding: '18px 20px',
                            border: `1.5px solid ${selectedId === candidate.id ? 'var(--accent)' : 'var(--c-border)'}`,
                            borderRadius: 'var(--r-md)',
                            background: selectedId === candidate.id ? 'rgba(26,95,180,0.04)' : 'var(--c-panel)',
                            cursor: 'pointer',
                            boxShadow: selectedId === candidate.id ? '0 0 0 3px var(--accent-glow)' : 'var(--shadow-sm)',
                            transition: 'all var(--t-fast)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 4 }}>{candidate.displayName}</div>
                              <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)' }}>{candidate.sourceLabel}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <Chip>{candidate.operations.length} operations</Chip>
                              <Chip>{candidate.servers.length || 1} server targets</Chip>
                            </div>
                          </div>
                          {candidate.description && (
                            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>{candidate.description}</div>
                          )}
                          <div style={{ marginTop: 8, fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--c-ink-4)' }}>{candidate.servers[0] || candidate.backendUrl}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selected && operations.length > 0 && (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <FieldLabel label={`Operation preview (${operations.length})`} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="default" size="sm" onClick={() => toggleAllOperations(true)}>Select all</Button>
                          <Button variant="default" size="sm" onClick={() => toggleAllOperations(false)}>Clear all</Button>
                        </div>
                      </div>
                      <div style={{ border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                        {Object.entries(groupOperationsBySegment(operations)).map(([segment, groupedOps], gi) => (
                          <div key={segment}>
                            <div style={{ padding: '8px 16px', background: 'var(--c-panel-soft)', borderBottom: '1px solid var(--c-border)', borderTop: gi > 0 ? '1px solid var(--c-border)' : 'none', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-ink-4)' }}>
                              {segment}
                            </div>
                            {groupedOps.map((op, i) => (
                              <label key={op.id} style={{
                                display: 'grid', gridTemplateColumns: 'auto auto 1fr',
                                gap: 12, alignItems: 'center', padding: '12px 16px',
                                borderBottom: i < groupedOps.length - 1 ? '1px solid var(--c-border)' : 'none',
                                background: op.enabled ? '#fff' : 'var(--c-panel-soft)',
                                cursor: 'pointer',
                              }}>
                                <input type="checkbox" checked={op.enabled} onChange={(e) => updateOperation(op.id, { enabled: e.target.checked })} style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
                                <RouteMethodPill method={op.method} />
                                <div>
                                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--c-ink-2)' }}>{op.path}</div>
                                  <div style={{ fontSize: 12, color: 'var(--c-ink-4)', marginTop: 2 }}>{op.summary}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '20px 22px', border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)', background: 'var(--c-panel-soft)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--blue-soft)', border: '1.5px solid var(--blue-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue-ink)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 4 }}>Manual proxy mode</div>
                      <div style={{ fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.7 }}>
                        The gateway will publish a managed proxy using the base path and backend target you specify in the next steps. Operations can be refined later once a formal contract exists.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div style={{ display: 'grid', gap: 20 }}>
              {selected && (                  <div style={{ padding: '14px 18px', background: 'rgba(26,95,180,0.06)', border: '1.5px solid rgba(26,95,180,0.2)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>
                  Imported from <strong>{selected.sourceLabel}</strong>. Identity fields are still editable — detected operations and server details carry forward.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr', gap: 16 }}>
                <Field label="API Name" required>
                  <input style={inputStyle} value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="orders-service" />
                </Field>
                <Field label="Version" required>
                  <input style={inputStyle} value={form.version} onChange={(e) => setField('version', e.target.value)} placeholder="v1.0.0" />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Describe the API purpose, audience, and major capabilities"
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Field label="Owner Team" required>
                  <select style={inputStyle} value={form.owner} onChange={(e) => setField('owner', e.target.value)}>
                    {OWNERS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Environment" required>
                  <select style={inputStyle} value={form.environment} onChange={(e) => setField('environment', e.target.value as Environment)}>
                    {ENVIRONMENTS.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </Field>
                <Field label="Documentation Source">
                  <input style={inputStyle} value={form.docsSource} onChange={(e) => setField('docsSource', e.target.value)} placeholder="OpenAPI contract" />
                </Field>
              </div>

              <Field label="Tags">
                <input style={inputStyle} value={form.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="payments, external, high-volume" />
                <div style={{ fontSize: 12.5, color: 'var(--c-ink-4)', marginTop: 6 }}>Comma-separated tags for discovery and governance</div>
              </Field>
            </div>
          )}

          {/* Step 2: Backend */}
          {step === 2 && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: selected?.servers.length ? '1fr 1fr' : '1fr', gap: 16 }}>
                {selected && selected.servers.length > 0 && (
                  <Field label="Detected Server">
                    <select style={inputStyle} value={server || selected.servers[0]} onChange={(e) => { setServer(e.target.value); setField('backendUrl', e.target.value) }}>
                      {selected.servers.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                )}
                <Field label="Backend URL" required>
                  <input
                    style={{ ...inputStyle, fontFamily: 'var(--f-mono)', fontSize: 13.5 }}
                    value={form.backendUrl}
                    onChange={(e) => { setField('backendUrl', e.target.value); setServer(e.target.value) }}
                    placeholder="https://orders.internal.svc.cluster.local"
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Public Base Path" required>
                  <input style={{ ...inputStyle, fontFamily: 'var(--f-mono)', fontSize: 13.5 }} value={form.basePath} onChange={(e) => setField('basePath', e.target.value)} placeholder="/api/v1/orders" />
                </Field>
                <Field label="Service Path">
                  <input style={{ ...inputStyle, fontFamily: 'var(--f-mono)', fontSize: 13.5 }} value={form.servicePath} onChange={(e) => setField('servicePath', e.target.value)} placeholder="/" />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Field label="Request Timeout (ms)">
                  <input style={inputStyle} value={form.timeout} onChange={(e) => setField('timeout', e.target.value)} placeholder="60000" />
                </Field>
                <Field label="Retries">
                  <input style={inputStyle} value={form.retries} onChange={(e) => setField('retries', e.target.value)} placeholder="3" />
                </Field>
                <Field label="Route Host">
                  <input style={inputStyle} value={form.routeHost} onChange={(e) => setField('routeHost', e.target.value)} placeholder="api.example.com" />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <ToggleRow title="Strip Path" description="Remove the public prefix before forwarding upstream." checked={form.stripPath} onChange={(v) => setField('stripPath', v)} />
                <ToggleRow title="HTTPS Only" description="Reject plain HTTP at the gateway edge." checked={form.httpsOnly} onChange={(v) => setField('httpsOnly', v)} />
                <ToggleRow title="Preserve Host" description="Forward the original host header to the backend." checked={form.preserveHost} onChange={(v) => setField('preserveHost', v)} />
              </div>
            </div>
          )}

          {/* Step 3: Routes */}
          {step === 3 && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setRouteMode('proxy')} style={modeSwitchStyle(routeMode === 'proxy')}>
                  Proxy all paths
                </button>
                <button type="button" onClick={() => setRouteMode('operations')} style={modeSwitchStyle(routeMode === 'operations')} disabled={!selected || operations.length === 0}>
                  Selected operations
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr', gap: 16 }}>
                <Field label="Public Route Path">
                  <input style={{ ...inputStyle, fontFamily: 'var(--f-mono)', fontSize: 13.5 }} value={form.basePath} onChange={(e) => setField('basePath', e.target.value)} placeholder="/api/v1/orders" />
                </Field>
                <Field label="Priority">
                  <input style={inputStyle} value={form.routePriority} onChange={(e) => setField('routePriority', e.target.value)} placeholder="100" />
                </Field>
              </div>

              {routeMode === 'proxy' ? (
                <div style={{ padding: '18px 20px', border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)', background: 'var(--c-panel-soft)', fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.7 }}>
                  Proxy mode publishes the API using the base path and backend target. Route matching can be refined after publishing once a formal contract is available.
                </div>
              ) : (
                <div style={{ border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                  {operations.length === 0 ? (
                    <div style={{ padding: '20px', fontSize: 13.5, color: 'var(--c-ink-3)' }}>No operations defined yet.</div>
                  ) : (
                    operations.map((op, i) => (
                      <div key={op.id} style={{
                        display: 'grid', gridTemplateColumns: 'auto auto 1.2fr 1.4fr', gap: 10,
                        alignItems: 'center', padding: '12px 16px',
                        borderBottom: i < operations.length - 1 ? '1px solid var(--c-border)' : 'none',
                        background: op.enabled ? 'var(--c-panel)' : 'var(--c-panel-soft)',
                      }}>
                        <input type="checkbox" checked={op.enabled} onChange={(e) => updateOperation(op.id, { enabled: e.target.checked })} style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
                        <RouteMethodPill method={op.method} />
                        <input style={{ ...inputStyle, padding: '8px 10px', fontFamily: 'var(--f-mono)', fontSize: 12.5 }} value={op.path} onChange={(e) => updateOperation(op.id, { path: e.target.value })} />
                        <input style={{ ...inputStyle, padding: '8px 10px', fontSize: 13 }} value={op.summary} onChange={(e) => updateOperation(op.id, { summary: e.target.value })} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Security */}
          {step === 4 && (
            <div style={{ display: 'grid', gap: 14 }}>
              {(
                [
                  ['api-key', 'API Key', 'Validate requests with an API key header. Simple and widely supported.', 'key'],
                  ['oauth2', 'OAuth 2.0', 'Use an authorization server or introspection endpoint for token validation.', 'oauth'],
                  ['jwt', 'JWT Validation', 'Verify cryptographically signed JWTs at the gateway edge. No upstream calls required.', 'jwt'],
                  ['basic', 'Basic Auth', 'HTTP Basic credentials validated per-consumer. Best for internal or controlled integrations.', 'basic'],
                  ['none', 'No Authentication', 'Expose a public or internally trusted API route. Use with extreme caution in production.', 'none'],
                ] as const
              ).map(([value, label, description, emoji]) => (
                <label key={value} style={{
                  display: 'grid', gridTemplateColumns: '22px 40px minmax(0, 1fr)',
                  gap: 16, alignItems: 'center', padding: '20px 22px',
                  border: `1.5px solid ${form.authType === value ? 'var(--accent)' : 'var(--c-border)'}`,
                  borderRadius: 'var(--r-md)',
                  background: form.authType === value ? 'rgba(26,95,180,0.05)' : 'var(--c-panel)',
                  cursor: 'pointer',
                  boxShadow: form.authType === value ? '0 0 0 3px var(--accent-glow)' : 'var(--shadow-sm)',
                  transition: 'all var(--t-fast)',
                }}>
                  <input type="radio" name="authType" checked={form.authType === value} onChange={() => setField('authType', value)} style={{ width: 16, height: 16, accentColor: 'var(--accent)', margin: 0 }} />
                  <AuthIcon type={emoji} />
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 4, letterSpacing: '-0.01em' }}>{label}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--c-ink-3)', lineHeight: 1.6 }}>{description}</div>
                  </div>
                </label>
              ))}

              {form.authType === 'api-key' && (
                <div style={{ marginTop: 4 }}>
                  <Field label="API Key Header">
                    <input style={inputStyle} value={form.apiKeyHeader} onChange={(e) => setField('apiKeyHeader', e.target.value)} placeholder="X-API-Key" />
                  </Field>
                </div>
              )}
              {form.authType === 'oauth2' && (
                <div style={{ marginTop: 4 }}>
                  <Field label="OAuth Introspection URL" required>
                    <input style={inputStyle} value={form.oauthUrl} onChange={(e) => setField('oauthUrl', e.target.value)} placeholder="https://auth.example.com/oauth/introspect" />
                  </Field>
                </div>
              )}
              {form.authType === 'jwt' && (
                <div style={{ marginTop: 4 }}>
                  <Field label="JWT Secret or Public Key" required>
                    <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontFamily: 'var(--f-mono)', fontSize: 12.5 }} value={form.jwtSecret} onChange={(e) => setField('jwtSecret', e.target.value)} placeholder="Paste the shared secret or PEM public key" />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Traffic */}
          {step === 5 && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Rate limit (req / min)">
                  <input style={inputStyle} value={form.ratePerMinute} onChange={(e) => setField('ratePerMinute', e.target.value)} placeholder="1000" />
                </Field>
                <Field label="Rate limit (req / hr)">
                  <input style={inputStyle} value={form.ratePerHour} onChange={(e) => setField('ratePerHour', e.target.value)} placeholder="50000" />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <ToggleRow title="Enable Rate Limiting" description="Apply consumer or route rate controls at publish time." checked={form.rateEnabled} onChange={(v) => setField('rateEnabled', v)} />
                <ToggleRow title="Analytics & Metrics" description="Emit request metrics and platform visibility data to Prometheus." checked={form.analytics} onChange={(v) => setField('analytics', v)} />
                <ToggleRow title="CORS Headers" description="Add browser-friendly cross-origin response headers." checked={form.cors} onChange={(v) => setField('cors', v)} />
                <ToggleRow title="Circuit Breaker" description="Open the route automatically after repeated upstream failures." checked={form.circuitBreaker} onChange={(v) => setField('circuitBreaker', v)} />
                <ToggleRow title="Request Buffering" description="Buffer slow upstream responses when traffic spikes occur." checked={form.requestBuffering} onChange={(v) => setField('requestBuffering', v)} />
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <FieldLabel label="Configuration summary" />
                  <div style={{ border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                    {summaryRows.map(([label, value], index) => (
                      <div key={label} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: index < summaryRows.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                        <div style={{ padding: '11px 14px', background: 'var(--c-panel-soft)', fontSize: 12, fontWeight: 700, color: 'var(--c-ink-3)', borderRight: '1px solid var(--c-border)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {label}
                        </div>
                        <div style={{ padding: '11px 14px', fontSize: 13.5, color: 'var(--c-ink)', fontFamily: label === 'Backend' ? 'var(--f-mono)' : undefined }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel label="Gateway preview (Kong YAML)" />
                  <pre style={{
                    margin: 0, padding: '16px 18px', minHeight: 260,
                    border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)',
                    background: '#0d0f14', color: '#c9d1e8',
                    fontSize: 11.5, lineHeight: 1.7,
                    fontFamily: 'var(--f-mono)', whiteSpace: 'pre-wrap',
                  }}>
                    {previewYaml}
                  </pre>
                </div>
              </div>

              {routeMode === 'operations' && enabledOps.length > 0 && (
                <div>
                  <FieldLabel label={`Operations to publish (${enabledOps.length})`} />
                  <div style={{ border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                    {enabledOps.map((op, i) => (
                      <div key={op.id} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 16px',
                        borderBottom: i < enabledOps.length - 1 ? '1px solid var(--c-border)' : 'none',
                        background: 'var(--c-panel)',
                      }}>
                        <RouteMethodPill method={op.method} />
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--c-ink-2)', flex: 1 }}>{op.path}</span>
                        <span style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>{op.summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress card */}
          <div style={{
            background: 'linear-gradient(135deg, #111318 0%, #0d0f14 100%)',
            border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--r-xl)', overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                Publishing
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: 'var(--f-display)' }}>
                {form.name || 'New API'}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                Step {step + 1} of {STEPS.length} · {completion}% complete
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${completion}%`, height: '100%',                    background: 'linear-gradient(90deg, var(--accent), var(--accent-strong))', borderRadius: 3, transition: 'width var(--t-med)' }} />
              </div>
            </div>

            <div style={{ padding: '6px 0' }}>
              {summaryRows.map(([label, value]) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10, padding: '9px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.3)' }}>{label}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 22px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
                Current step
              </div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{activeStep.subtitle}</div>
            </div>
          </div>

          {/* Tips card */}
          <div style={{ background: 'var(--c-panel)', border: '1.5px solid var(--c-border)',            borderRadius: 'var(--r-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-ink-4)', marginBottom: 12 }}>
              Gateway tips
            </div>
            {step === 0 && (
              <Tip>Import OpenAPI 3.x for the best auto-detection. Operations, servers, and security schemes are pre-filled from the spec.</Tip>
            )}
            {step === 1 && (
              <Tip>Use slug-style names (e.g. orders-v2) — they become Kong service identifiers and must be stable across environments.</Tip>
            )}
            {step === 2 && (
              <Tip>Set the backend URL to the internal Kubernetes service address. Strip Path removes the public prefix before forwarding.</Tip>
            )}
            {step === 3 && (
              <Tip>Higher priority routes match first. Use distinct base paths to avoid conflicts between APIs on the same gateway.</Tip>
            )}
            {step === 4 && (
              <Tip>API Key auth is the simplest and most widely supported. Switch to OAuth 2.0 or JWT for consumer-level token introspection.</Tip>
            )}
            {step === 5 && (
              <Tip>Rate limits are applied per consumer key. Enable Circuit Breaker in production to protect upstream services from cascading failures.</Tip>
            )}
            {step === 6 && (
              <Tip>Review the YAML preview carefully — this is the exact configuration pushed to Kong. Use Save Draft to review before committing.</Tip>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 20, marginTop: 4,
        borderTop: '1.5px solid var(--c-border)',
      }}>
        <Button
          variant="default" size="md"
          onClick={step === 0 ? () => router.push(buildTenantPath(currentTenant.slug, '/apis')) : () => setStep((s) => s - 1)}
        >
          {step === 0 ? 'Cancel' : '← Back'}
        </Button>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--c-ink-4)' }}>
            Step {step + 1} / {STEPS.length}
          </span>
          {step === STEPS.length - 1 ? (
            <>
              <Button variant="default" size="md" onClick={() => void publish(true)}>Save as Draft</Button>
              <Button variant="primary" size="lg" onClick={() => void publish(false)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Publish API
              </Button>
            </>
          ) : (
            <Button variant="primary" size="lg" onClick={continueStep}>
              Continue →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--c-ink-4)', marginBottom: 8 }}>
        {label}{required ? <span style={{ color: 'var(--accent)', marginLeft: 3 }}>*</span> : ''}
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--c-ink-4)', marginBottom: 10 }}>
      {label}
    </div>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
      border: '1px solid var(--c-border)', borderRadius: 6,
      background: 'var(--c-panel-soft)', fontSize: 12, color: 'var(--c-ink-3)',
    }}>
      {children}
    </span>
  )
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--blue-soft)', border: '1px solid var(--blue-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--blue-ink)" strokeWidth="3" strokeLinecap="round">
          <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div style={{ fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{
      display: 'flex', justifyContent: 'space-between', gap: 14,
      padding: '16px 18px', border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-md)',
      background: checked ? 'rgba(26,95,180,0.04)' : 'var(--c-panel)',
      cursor: 'pointer', alignItems: 'center',
      borderColor: checked ? 'rgba(26,95,180,0.2)' : 'var(--c-border)',
      transition: 'all var(--t-fast)',
    }}>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--c-ink-3)', lineHeight: 1.5 }}>{description}</div>
      </div>
      <div style={{
        width: 40, height: 22, borderRadius: 11, flexShrink: 0,
        background: checked ? 'var(--accent)' : 'var(--c-border)',
        position: 'relative', transition: 'background var(--t-fast)',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left var(--t-fast)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
      </div>
    </label>
  )
}

function sourceCardStyle(active: boolean): CSSProperties {
  return {
    textAlign: 'left', padding: '22px 22px',
    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--c-border)'}`,
    borderRadius: 'var(--r-lg)',
    background: active ? 'rgba(26,95,180,0.04)' : 'var(--c-panel)',
    cursor: 'pointer',
    boxShadow: active ? '0 0 0 3px var(--accent-glow), var(--shadow-sm)' : 'var(--shadow-sm)',
    transition: 'all var(--t-fast)',
  }
}

function modeSwitchStyle(active: boolean): CSSProperties {
  return {
    padding: '10px 20px',
    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--c-border)'}`,
    borderRadius: 8,
    background: active ? 'rgba(26,95,180,0.08)' : 'var(--c-panel)',
    color: active ? 'var(--accent)' : 'var(--c-ink-3)',
    fontWeight: 700, fontSize: 14, cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--t-fast)',
  }
}

function groupOperationsBySegment(operations: DraftOperation[]) {
  return operations.reduce<Record<string, DraftOperation[]>>((groups, op) => {
    const segment = op.path.split('/').filter(Boolean)[0] || 'root'
    const key = segment.replace(/-/g, ' ')
    groups[key] = [...(groups[key] || []), op]
    return groups
  }, {})
}

function authLabel(authType: AuthType) {
  switch (authType) {
    case 'api-key': return 'API Key'
    case 'oauth2': return 'OAuth 2.0'
    case 'jwt': return 'JWT'
    case 'basic': return 'Basic Auth'
    default: return 'Public'
  }
}

function AuthIcon({ type }: { type: string }) {
  const svg = (children: ReactNode) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
  switch (type) {
    case 'key':
      return svg(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>)
    case 'oauth':
      return svg(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>)
    case 'jwt':
      return svg(<><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" /></>)
    case 'basic':
      return svg(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><circle cx="12" cy="16.5" r="1.5" /></>)
    default:
      return svg(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>)
  }
}

function buildGatewayPreview(form: PublishForm, routeMode: RouteMode, operations: DraftOperation[]) {
  const routeLines = routeMode === 'operations'
    ? operations.map((op) =>
        `    - name: ${slugify(op.summary) || slugify(op.path) || op.id}\n      paths: ["${op.path}"]\n      methods: [${op.method}]\n      strip_path: ${form.stripPath}\n      https_redirect_status_code: ${form.httpsOnly ? '426' : '0'}`
      ).join('\n')
    : `    - name: ${slugify(form.name || 'proxy-route')}\n      paths: ["${form.basePath || '/api'}"]\n      strip_path: ${form.stripPath}\n      https_redirect_status_code: ${form.httpsOnly ? '426' : '0'}`

  const pluginLines = [
    form.authType !== 'none' ? `  - name: ${form.authType === 'api-key' ? 'key-auth' : form.authType === 'oauth2' ? 'oauth2-introspection' : form.authType === 'jwt' ? 'jwt' : 'basic-auth'}` : null,
    form.rateEnabled ? `  - name: rate-limiting\n    config:\n      minute: ${form.ratePerMinute}\n      hour: ${form.ratePerHour}` : null,
    form.cors ? '  - name: cors' : null,
    form.analytics ? '  - name: prometheus' : null,
  ].filter(Boolean).join('\n')

  return `services:\n  - name: ${slugify(form.name || 'new-api')}\n    url: ${form.backendUrl || 'https://backend.internal'}\n    path: ${form.servicePath || '/'}\n    retries: ${form.retries}\n    connect_timeout: ${form.timeout}\n    read_timeout: ${form.timeout}\n    write_timeout: ${form.timeout}\nroutes:\n${routeLines}\nplugins:\n${pluginLines || '  []'}\nmetadata:\n  docs_source: ${form.docsSource || 'Manual entry'}\n  owner: ${form.owner || 'Platform Team'}\n  environment: ${form.environment}\n  circuit_breaker: ${form.circuitBreaker}\n  request_buffering: ${form.requestBuffering}\n  preserve_host: ${form.preserveHost}`
}

export default function PublishAPIPage() {
  return (
    <Suspense>
      <PublishPage />
    </Suspense>
  )
}
