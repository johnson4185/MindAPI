'use client'

import { ChangeEvent, CSSProperties, ReactNode, Suspense, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { ImportedApiCandidate, ImportedApiOperation, parseApiCollection } from '@/lib/api-import'
import { useStore } from '@/lib/store'
import { API, Environment, HttpMethod } from '@/lib/types'

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
  { key: 'source', label: 'Source', subtitle: 'Choose manual creation or import a contract' },
  { key: 'info', label: 'Basic Info', subtitle: 'Define identity, ownership, and documentation' },
  { key: 'backend', label: 'Backend', subtitle: 'Connect the gateway service to the upstream target' },
  { key: 'routes', label: 'Routes', subtitle: 'Review the public paths and route matching rules' },
  { key: 'security', label: 'Security', subtitle: 'Apply authentication and access policy' },
  { key: 'traffic', label: 'Traffic', subtitle: 'Control traffic, analytics, and runtime safeguards' },
  { key: 'review', label: 'Review', subtitle: 'Inspect the generated plan before publishing' },
] as const

const OWNERS = ['Platform Team', 'Backend Team', 'Data Team', 'Integration Team']
const ENVIRONMENTS: Environment[] = ['Production', 'Staging', 'Development']

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  background: 'var(--c-surface)',
  border: '1px solid var(--c-border)',
  fontSize: 15,
  color: 'var(--c-ink)',
  fontFamily: 'var(--f-body)',
  boxShadow: 'var(--sh-xs)',
}

const panelStyle: CSSProperties = {
  border: '1px solid var(--c-border)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,249,251,0.98) 100%)',
  boxShadow: 'var(--sh-sm)',
  padding: 28,
}

const asideStyle: CSSProperties = {
  ...panelStyle,
  padding: 0,
  overflow: 'hidden',
}

const labelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.7,
  color: 'var(--c-ink4)',
  marginBottom: 8,
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--c-ink)',
  marginBottom: 12,
}

const chipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  border: '1px solid var(--c-border)',
  background: '#fff',
  fontSize: 12,
  color: 'var(--c-ink3)',
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

function RouteMethodPill({ method }: { method: HttpMethod }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        minWidth: 52,
        justifyContent: 'center',
        padding: '6px 10px',
        border: '1px solid var(--accent-bd)',
        background: 'var(--accent-bg)',
        color: 'var(--accent)',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'var(--f-mono)',
      }}
    >
      {method}
    </span>
  )
}

function PublishPage() {
  const router = useRouter()
  const params = useSearchParams()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const { addApi, pluginTemplates, pushNotification, showToast } = useStore()

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

  const selected = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedId) || null,
    [candidates, selectedId],
  )
  const enabledOps = useMemo(
    () => operations.filter((operation) => operation.enabled),
    [operations],
  )

  const summaryRows = useMemo(
    () => [
      ['API Name', form.name || 'Not set'],
      ['Version', form.version],
      ['Environment', form.environment],
      ['Owner', form.owner],
      ['Source', mode === 'import' ? selected?.sourceLabel || 'Imported definition' : 'Manual setup'],
      ['Backend', server || form.backendUrl || 'Not set'],
      ['Route Model', routeMode === 'operations' ? 'Selected operations' : 'Proxy all paths'],
      [
        'Exposure',
        routeMode === 'operations'
          ? `${enabledOps.length} operation${enabledOps.length === 1 ? '' : 's'}`
          : `${form.basePath || 'Path pending'} forwards as a managed proxy`,
      ],
      ['Security', form.authType === 'none' ? 'Public' : authLabel(form.authType)],
      [
        'Traffic',
        form.rateEnabled ? `${form.ratePerMinute}/min / ${form.ratePerHour}/hr` : 'No rate limit',
      ],
    ],
    [enabledOps.length, form, mode, routeMode, selected?.sourceLabel, server],
  )

  const previewYaml = useMemo(() => buildGatewayPreview(form, routeMode, enabledOps), [
    enabledOps,
    form,
    routeMode,
  ])

  function setField<K extends keyof PublishForm>(key: K, value: PublishForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function applyCandidate(candidate: ImportedApiCandidate) {
    setSelectedId(candidate.id)
    setMode('import')
    setServer(candidate.servers[0] || candidate.backendUrl)
    setRouteMode(candidate.operations.length ? 'operations' : 'proxy')
    setOperations(candidate.operations.map((operation) => ({ ...operation, enabled: true })))
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
      authType: candidate.security.includes('OAuth 2.0')
        ? 'oauth2'
        : candidate.security.includes('JWT')
          ? 'jwt'
          : candidate.security.includes('Basic Auth')
            ? 'basic'
            : candidate.security.length
              ? 'api-key'
              : 'none',
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
    setForm((prev) => ({
      ...DEFAULT_FORM,
      owner: prev.owner,
      environment: prev.environment,
    }))
  }

  function updateOperation(id: string, patch: Partial<DraftOperation>) {
    setOperations((prev) => prev.map((operation) => (operation.id === id ? { ...operation, ...patch } : operation)))
  }

  function toggleAllOperations(enabled: boolean) {
    setOperations((prev) => prev.map((operation) => ({ ...operation, enabled })))
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
    const activePlugins = pluginTemplates.filter((plugin) => {
      if (plugin.category === 'Authentication') return form.authType !== 'none'
      if (plugin.category === 'Traffic Control') return form.rateEnabled
      if (plugin.category === 'Analytics & Monitoring') return form.analytics
      if (plugin.name === 'CORS Headers') return form.cors
      return false
    })

    const id = slugify(form.name) || `api-${Date.now()}`
    const api: API = {
      id,
      name: form.name,
      version: form.version,
      environment: form.environment,
      owner: form.owner,
      status: asDraft ? 'Draft' : 'Active',
      requests24h: '0',
      security: form.authType === 'none' ? [] : [authLabel(form.authType)],
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: form.description,
      basePath: form.basePath,
      backendUrl: server || form.backendUrl,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    await addApi(api, activePlugins.length ? activePlugins : undefined)
    pushNotification({
      title: asDraft ? 'API Saved as Draft' : 'API Published',
      message: `${api.name} ${asDraft ? 'saved as draft' : 'published'} with ${
        routeMode === 'operations' ? enabledOps.length : 1
      } route definition${(routeMode === 'operations' ? enabledOps.length : 1) === 1 ? '' : 's'}.`,
      href: `/apis/${api.id}`,
    })
    showToast(asDraft ? `${api.name} saved as draft` : `${api.name} published successfully`, 'success')
    router.push(`/apis/${api.id}`)
  }

  function continueStep() {
    const error = validateStep()
    if (error) {
      showToast(error, 'error')
      return
    }
    setStep((current) => current + 1)
  }

  const completion = Math.round(((step + 1) / STEPS.length) * 100)
  const activeStep = STEPS[step]

  return (
    <div className="page-enter" style={{ padding: 28, maxWidth: 1240, margin: '0 auto' }}>
      <style>{`
        @keyframes stepPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        .launch-step-active-pill {
          animation: stepPulse 1.6s ease-in-out infinite;
        }
      `}</style>
      <PageHeader
        eyebrow="APIs"
        title="Launch API"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="default" size="md" onClick={() => void publish(true)}>
              Save Draft
            </Button>
            <Button variant="default" size="md" onClick={() => router.push('/apis')}>
              Cancel
            </Button>
          </div>
        }
      />

      <div
        style={{
          ...panelStyle,
          padding: 20,
          marginBottom: 18,
          background: '#fff',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-ink4)' }}>
              Launch Progress
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accent)' }}>
              Step {step + 1} / {STEPS.length}
            </div>
          </div>
          <div style={{ height: 4, background: 'var(--c-border)', overflow: 'hidden' }}>
            <div style={{ width: `${completion}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), #f06a3f)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, minmax(118px, 1fr))`, gap: 8, overflowX: 'auto' }}>
          {STEPS.map((entry, index) => {
            const state = index < step ? 'done' : index === step ? 'active' : 'pending'
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => {
                  if (index <= step) setStep(index)
                }}
                style={{
                  position: 'relative',
                  display: 'grid',
                  gap: 6,
                  alignContent: 'start',
                  minWidth: 118,
                  padding: '8px 9px 9px',
                  border: '1px solid var(--c-border)',
                  background:
                    state === 'active'
                      ? 'linear-gradient(180deg, rgba(248,229,222,0.42) 0%, #fff 100%)'
                      : state === 'done'
                        ? 'linear-gradient(180deg, rgba(229,242,235,0.28) 0%, #fff 100%)'
                        : 'var(--c-panel-soft)',
                  cursor: index <= step ? 'pointer' : 'default',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: state === 'active' ? 30 : 24,
                    height: 16,
                    border: `1px solid ${state === 'active' ? 'var(--accent)' : state === 'done' ? 'var(--success-bd)' : 'var(--c-border)'}`,
                    background:
                      state === 'active'
                        ? 'rgba(210, 71, 31, 0.12)'
                        : state === 'done'
                          ? 'rgba(20, 108, 67, 0.08)'
                          : '#fff',
                    color:
                      state === 'active'
                        ? 'var(--accent)'
                        : state === 'done'
                          ? 'var(--success)'
                          : 'var(--c-ink4)',
                    fontSize: 10,
                    fontWeight: 800,
                    flexShrink: 0,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                  className={state === 'active' ? 'launch-step-active-pill' : undefined}
                >
                  {state === 'done' ? '✓' : `0${index + 1}`.slice(-2)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: state === 'active' ? 'var(--c-ink)' : 'var(--c-ink2)',
                      lineHeight: 1.15,
                      marginBottom: 2,
                    }}
                  >
                    {entry.label}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--c-ink4)', lineHeight: 1.3 }}>
                    {index + 1} / {STEPS.length}
                  </div>
                </div>
                <div style={{ height: 2, background: state === 'active' ? 'var(--accent)' : state === 'done' ? 'var(--success)' : 'transparent' }} />
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(300px, 0.9fr)', gap: 18 }}>
        <div style={panelStyle}>
          {step === 0 && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setMode('import')}
                  style={sourceCardStyle(mode === 'import')}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)' }}>Upload API definition</div>
                  <div style={{ fontSize: 13, color: 'var(--c-ink3)', lineHeight: 1.6 }}>
                    Start from an OpenAPI or Swagger contract. Postman collections can be imported too, but the main publish artifact should be an API definition file.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={startManualMode}
                  style={sourceCardStyle(mode === 'manual')}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)' }}>Create without file</div>
                  <div style={{ fontSize: 13, color: 'var(--c-ink3)', lineHeight: 1.6 }}>
                    Use this when the team has no contract file yet. Publish a managed proxy from backend URL and base path, then refine operations later when a spec becomes available.
                  </div>
                </button>
              </div>

              {mode === 'import' ? (
                <>
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: '2px dashed var(--c-border)',
                      background: 'var(--c-bg)',
                      padding: '28px 22px',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-ink2)' }}>
                      {fileName || 'Upload an OpenAPI, Swagger, Postman, or YAML file'}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--c-ink4)', marginTop: 6 }}>
                      Imported definitions pre-fill the API name, backend server, paths, and HTTP operations.
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,.yaml,.yml"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />

                  <div>
                    <div style={labelStyle}>Paste Definition</div>
                    <textarea
                      value={source}
                      onChange={(event) => setSource(event.target.value)}
                      placeholder="Paste OpenAPI, Swagger, or Postman collection content"
                      style={{
                        ...inputStyle,
                        minHeight: 180,
                        resize: 'vertical',
                        fontFamily: 'var(--f-mono)',
                        fontSize: 12.5,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        try {
                          const parsed = parseDefinition(source)
                          showToast(`Found ${parsed.length} API definition${parsed.length === 1 ? '' : 's'}`, 'success')
                        } catch {
                          showToast('Could not parse the document', 'error')
                        }
                      }}
                    >
                      Parse Definition
                    </Button>
                  </div>

                  {candidates.length > 0 && (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div style={sectionTitleStyle}>Detected APIs</div>
                      {candidates.map((candidate) => (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => applyCandidate(candidate)}
                          style={{
                            textAlign: 'left',
                            padding: '16px 18px',
                            border: `1px solid ${selectedId === candidate.id ? 'var(--accent)' : 'var(--c-border)'}`,
                            background: selectedId === candidate.id ? 'var(--accent-bg)' : '#fff',
                            cursor: 'pointer',
                            boxShadow: selectedId === candidate.id ? 'var(--sh-xs)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--c-ink)' }}>
                                {candidate.displayName}
                              </div>
                              <div style={{ fontSize: 12.5, color: 'var(--c-ink4)', marginTop: 4 }}>
                                {candidate.sourceLabel}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <span style={chipStyle}>{candidate.operations.length} operations</span>
                              <span style={chipStyle}>{candidate.servers.length || 1} server targets</span>
                            </div>
                          </div>
                          <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--c-ink3)', lineHeight: 1.6 }}>
                            {candidate.description}
                          </div>
                          <div style={{ marginTop: 10, fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--c-ink4)' }}>
                            {candidate.servers[0] || candidate.backendUrl}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selected && operations.length > 0 && (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={sectionTitleStyle}>Operation Preview</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="default" size="sm" onClick={() => toggleAllOperations(true)}>
                            Select All
                          </Button>
                          <Button variant="default" size="sm" onClick={() => toggleAllOperations(false)}>
                            Clear All
                          </Button>
                        </div>
                      </div>

                      <div
                        style={{
                          border: '1px solid var(--c-border)',
                          background: '#fff',
                          padding: '14px 16px',
                          display: 'grid',
                          gap: 12,
                        }}
                      >
                        {Object.entries(groupOperationsBySegment(operations)).map(([segment, groupedOps]) => (
                          <div key={segment} style={{ display: 'grid', gap: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink4)', textTransform: 'uppercase', letterSpacing: 0.7 }}>
                              {segment}
                            </div>
                            {groupedOps.map((operation) => (
                              <label
                                key={operation.id}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'auto auto 1fr',
                                  gap: 10,
                                  alignItems: 'center',
                                  padding: '8px 10px',
                                  border: '1px solid var(--c-border)',
                                  background: operation.enabled ? 'var(--c-surface)' : 'var(--c-bg)',
                                  cursor: 'pointer',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={operation.enabled}
                                  onChange={(event) => updateOperation(operation.id, { enabled: event.target.checked })}
                                />
                                <RouteMethodPill method={operation.method} />
                                <div>
                                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12.5, color: 'var(--c-ink2)' }}>{operation.path}</div>
                                  <div style={{ fontSize: 12, color: 'var(--c-ink4)', marginTop: 3 }}>{operation.summary}</div>
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
                <div
                  style={{
                    padding: '18px 20px',
                    border: '1px solid var(--c-border)',
                    background: 'var(--c-bg)',
                    fontSize: 13.5,
                    color: 'var(--c-ink3)',
                    lineHeight: 1.7,
                  }}
                >
                  This path is for teams that do not have a contract file yet. You still set the API name, backend, security, and traffic controls, but the gateway publishes a managed proxy route instead of importing operations from a file.
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'grid', gap: 18 }}>
              {selected && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'var(--accent-bg)',
                    border: '1px solid var(--accent-bd)',
                    fontSize: 12.5,
                    color: 'var(--c-ink3)',
                    lineHeight: 1.6,
                  }}
                >
                  Imported from {selected.sourceLabel}. API identity is still editable here, but detected operations and
                  server details will carry forward into the next steps.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr', gap: 16 }}>
                <Field label="API Name" required>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                    placeholder="orders-service"
                  />
                </Field>
                <Field label="Version" required>
                  <input
                    style={inputStyle}
                    value={form.version}
                    onChange={(event) => setField('version', event.target.value)}
                    placeholder="v1.0.0"
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  style={{ ...inputStyle, minHeight: 92, resize: 'vertical' }}
                  value={form.description}
                  onChange={(event) => setField('description', event.target.value)}
                  placeholder="Describe the API purpose, audience, and major capabilities"
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Field label="Owner Team" required>
                  <select
                    style={inputStyle}
                    value={form.owner}
                    onChange={(event) => setField('owner', event.target.value)}
                  >
                    {OWNERS.map((owner) => (
                      <option key={owner}>{owner}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Environment" required>
                  <select
                    style={inputStyle}
                    value={form.environment}
                    onChange={(event) => setField('environment', event.target.value as Environment)}
                  >
                    {ENVIRONMENTS.map((entry) => (
                      <option key={entry}>{entry}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Documentation Source">
                  <input
                    style={inputStyle}
                    value={form.docsSource}
                    onChange={(event) => setField('docsSource', event.target.value)}
                    placeholder="OpenAPI contract"
                  />
                </Field>
              </div>

              <Field label="Tags">
                <input
                  style={inputStyle}
                  value={form.tags}
                  onChange={(event) => setField('tags', event.target.value)}
                  placeholder="payments, external, high-volume"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: selected?.servers.length ? '1fr 1fr' : '1fr', gap: 16 }}>
                {selected && selected.servers.length > 0 && (
                  <Field label="Detected Server">
                    <select
                      style={inputStyle}
                      value={server || selected.servers[0]}
                      onChange={(event) => {
                        setServer(event.target.value)
                        setField('backendUrl', event.target.value)
                      }}
                    >
                      {selected.servers.map((entry) => (
                        <option key={entry}>{entry}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label="Backend URL" required>
                  <input
                    style={inputStyle}
                    value={form.backendUrl}
                    onChange={(event) => {
                      setField('backendUrl', event.target.value)
                      setServer(event.target.value)
                    }}
                    placeholder="https://orders.internal.svc.cluster.local"
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Public Base Path" required>
                  <input
                    style={{ ...inputStyle, fontFamily: 'var(--f-mono)' }}
                    value={form.basePath}
                    onChange={(event) => setField('basePath', event.target.value)}
                    placeholder="/api/v1/orders"
                  />
                </Field>
                <Field label="Service Path">
                  <input
                    style={{ ...inputStyle, fontFamily: 'var(--f-mono)' }}
                    value={form.servicePath}
                    onChange={(event) => setField('servicePath', event.target.value)}
                    placeholder="/"
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Field label="Request Timeout (ms)">
                  <input
                    style={inputStyle}
                    value={form.timeout}
                    onChange={(event) => setField('timeout', event.target.value)}
                    placeholder="60000"
                  />
                </Field>
                <Field label="Retries">
                  <input
                    style={inputStyle}
                    value={form.retries}
                    onChange={(event) => setField('retries', event.target.value)}
                    placeholder="3"
                  />
                </Field>
                <Field label="Route Host">
                  <input
                    style={inputStyle}
                    value={form.routeHost}
                    onChange={(event) => setField('routeHost', event.target.value)}
                    placeholder="api.example.com"
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <ToggleRow
                  title="Strip Path"
                  description="Remove the public prefix before forwarding upstream."
                  checked={form.stripPath}
                  onChange={(value) => setField('stripPath', value)}
                />
                <ToggleRow
                  title="HTTPS Only"
                  description="Reject plain HTTP at the gateway edge."
                  checked={form.httpsOnly}
                  onChange={(value) => setField('httpsOnly', value)}
                />
                <ToggleRow
                  title="Preserve Host"
                  description="Forward the original host header to the backend."
                  checked={form.preserveHost}
                  onChange={(value) => setField('preserveHost', value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setRouteMode('proxy')}
                  style={modeSwitchStyle(routeMode === 'proxy')}
                >
                  Proxy All Paths
                </button>
                <button
                  type="button"
                  onClick={() => setRouteMode('operations')}
                  style={modeSwitchStyle(routeMode === 'operations')}
                  disabled={!selected || operations.length === 0}
                >
                  Selected Operations
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: 16 }}>
                <Field label="Public Route Path">
                  <input
                    style={{ ...inputStyle, fontFamily: 'var(--f-mono)' }}
                    value={form.basePath}
                    onChange={(event) => setField('basePath', event.target.value)}
                    placeholder="/api/v1/orders"
                  />
                </Field>
                <Field label="Priority">
                  <input
                    style={inputStyle}
                    value={form.routePriority}
                    onChange={(event) => setField('routePriority', event.target.value)}
                    placeholder="100"
                  />
                </Field>
              </div>

              {routeMode === 'proxy' ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div
                    style={{
                      padding: '14px 16px',
                      border: '1px solid var(--c-border)',
                      background: 'var(--c-bg)',
                      fontSize: 13,
                      color: 'var(--c-ink3)',
                      lineHeight: 1.6,
                    }}
                  >
                    Proxy mode is the right fallback when there is no file to upload. The gateway publishes the API using the base path and backend target, and route matching can be refined later once a formal contract exists.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                      {operations.length === 0 ? (
                    <div
                      style={{
                        padding: '14px 16px',
                        border: '1px solid var(--c-border)',
                        background: 'var(--c-bg)',
                        fontSize: 13.5,
                        color: 'var(--c-ink3)',
                      }}
                    >
                      No operations defined yet.
                    </div>
                  ) : (
                    operations.map((operation) => (
                      <div
                        key={operation.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto auto 1.2fr 1.4fr',
                          gap: 10,
                          alignItems: 'center',
                          padding: '12px 14px',
                          border: '1px solid var(--c-border)',
                          background: operation.enabled ? '#fff' : 'var(--c-bg)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={operation.enabled}
                          onChange={(event) => updateOperation(operation.id, { enabled: event.target.checked })}
                          style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                        />
                        <RouteMethodPill method={operation.method} />
                        <input
                          style={{ ...inputStyle, padding: '8px 10px', fontFamily: 'var(--f-mono)' }}
                          value={operation.path}
                          onChange={(event) => updateOperation(operation.id, { path: event.target.value })}
                        />
                        <input
                          style={{ ...inputStyle, padding: '8px 10px' }}
                          value={operation.summary}
                          onChange={(event) => updateOperation(operation.id, { summary: event.target.value })}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                {(
                  [
                    ['api-key', 'API Key Authentication', 'Validate requests with an API key header.'],
                    ['oauth2', 'OAuth 2.0', 'Use an authorization server or introspection endpoint.'],
                    ['jwt', 'JWT Validation', 'Verify signed JWTs at the gateway edge.'],
                    ['basic', 'Basic Authentication', 'Protect internal or controlled integrations.'],
                    ['none', 'No Authentication', 'Expose a public or internally trusted API route.'],
                  ] as const
                ).map(([value, label, description]) => (
                  <label
                    key={value}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px minmax(0, 1fr)',
                      gap: 16,
                      alignItems: 'center',
                      padding: '18px 18px',
                      border: `1.5px solid ${form.authType === value ? 'var(--accent)' : 'var(--c-border)'}`,
                      background: form.authType === value ? 'linear-gradient(180deg, rgba(248,229,222,0.55) 0%, #fff 100%)' : 'var(--c-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="authType"
                      checked={form.authType === value}
                      onChange={() => setField('authType', value)}
                      style={{ width: 15, height: 15, accentColor: 'var(--accent)', margin: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 15, color: 'var(--c-ink3)', lineHeight: 1.65, maxWidth: 560 }}>{description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {form.authType === 'api-key' && (
                <Field label="API Key Header">
                  <input
                    style={inputStyle}
                    value={form.apiKeyHeader}
                    onChange={(event) => setField('apiKeyHeader', event.target.value)}
                    placeholder="X-API-Key"
                  />
                </Field>
              )}

              {form.authType === 'oauth2' && (
                <Field label="OAuth Introspection URL" required>
                  <input
                    style={inputStyle}
                    value={form.oauthUrl}
                    onChange={(event) => setField('oauthUrl', event.target.value)}
                    placeholder="https://auth.example.com/oauth/introspect"
                  />
                </Field>
              )}

              {form.authType === 'jwt' && (
                <Field label="JWT Secret or Public Key" required>
                  <textarea
                    style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontFamily: 'var(--f-mono)' }}
                    value={form.jwtSecret}
                    onChange={(event) => setField('jwtSecret', event.target.value)}
                    placeholder="Paste the shared secret or PEM public key"
                  />
                </Field>
              )}
            </div>
          )}

          {step === 5 && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Rate Limit (req/min)">
                  <input
                    style={inputStyle}
                    value={form.ratePerMinute}
                    onChange={(event) => setField('ratePerMinute', event.target.value)}
                    placeholder="1000"
                  />
                </Field>
                <Field label="Rate Limit (req/hr)">
                  <input
                    style={inputStyle}
                    value={form.ratePerHour}
                    onChange={(event) => setField('ratePerHour', event.target.value)}
                    placeholder="50000"
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <ToggleRow
                  title="Enable Rate Limiting"
                  description="Apply consumer or route rate controls at publish time."
                  checked={form.rateEnabled}
                  onChange={(value) => setField('rateEnabled', value)}
                />
                <ToggleRow
                  title="Analytics & Metrics"
                  description="Emit request metrics and platform visibility data."
                  checked={form.analytics}
                  onChange={(value) => setField('analytics', value)}
                />
                <ToggleRow
                  title="CORS Headers"
                  description="Add browser-friendly cross-origin headers when needed."
                  checked={form.cors}
                  onChange={(value) => setField('cors', value)}
                />
                <ToggleRow
                  title="Circuit Breaker"
                  description="Open the route after repeated upstream errors."
                  checked={form.circuitBreaker}
                  onChange={(value) => setField('circuitBreaker', value)}
                />
                <ToggleRow
                  title="Request Buffering"
                  description="Buffer slow upstream responses when traffic spikes."
                  checked={form.requestBuffering}
                  onChange={(value) => setField('requestBuffering', value)}
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
                  {summaryRows.map(([label, value], index) => (
                    <div
                      key={label}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '170px 1fr',
                        borderBottom: index < summaryRows.length - 1 ? '1px solid var(--c-border)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          padding: '11px 14px',
                          background: 'var(--c-bg)',
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: 'var(--c-ink3)',
                          borderRight: '1px solid var(--c-border)',
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          padding: '11px 14px',
                          fontSize: 13,
                          color: 'var(--c-ink)',
                          fontFamily: label === 'Backend' ? 'var(--f-mono)' : 'var(--f-body)',
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={labelStyle}>Gateway Preview</div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '16px 18px',
                      minHeight: 260,
                      border: '1px solid var(--c-border)',
                      background: 'var(--c-bg)',
                      color: 'var(--c-ink2)',
                      fontSize: 12,
                      lineHeight: 1.6,
                      fontFamily: 'var(--f-mono)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {previewYaml}
                  </pre>
                </div>
              </div>

              {routeMode === 'operations' && enabledOps.length > 0 && (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={labelStyle}>Operations To Publish</div>
                  {enabledOps.map((operation) => (
                    <div
                      key={operation.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        border: '1px solid var(--c-border)',
                        background: '#fff',
                      }}
                    >
                      <RouteMethodPill method={operation.method} />
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12.5, color: 'var(--c-ink2)' }}>
                        {operation.path}
                      </span>
                      <span style={{ fontSize: 12.5, color: 'var(--c-ink3)' }}>{operation.summary}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={asideStyle}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--c-border)', background: 'rgba(248,250,252,0.85)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--c-ink4)' }}>
              Publish Summary
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)', marginTop: 6 }}>
              {form.name || 'New API'}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--c-ink4)', marginTop: 4 }}>
              Step {step + 1} of {STEPS.length} completed to {completion}%
            </div>
            <div style={{ marginTop: 12, height: 6, background: 'var(--c-border)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${completion}%`, height: '100%', background: 'var(--accent)' }} />
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            {summaryRows.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '108px 1fr',
                  gap: 12,
                  padding: '11px 20px',
                  borderBottom: '1px solid rgba(226,232,240,0.65)',
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--c-ink4)' }}>
                  {label}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--c-ink2)', lineHeight: 1.5 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '18px 20px', borderTop: '1px solid var(--c-border)', background: 'rgba(248,250,252,0.7)' }}>
            <div style={labelStyle}>Current Focus</div>
            <div style={{ fontSize: 13.5, color: 'var(--c-ink2)', lineHeight: 1.7 }}>
              {activeStep.subtitle}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18 }}>
        <Button
          variant="default"
          size="md"
          onClick={step === 0 ? () => router.push('/apis') : () => setStep((current) => current - 1)}
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        <div style={{ display: 'flex', gap: 8 }}>
          {step === STEPS.length - 1 ? (
            <>
              <Button variant="default" size="md" onClick={() => void publish(true)}>
                Save as Draft
              </Button>
              <Button variant="primary" size="lg" onClick={() => void publish(false)}>
                Publish API
              </Button>
            </>
          ) : (
            <Button variant="primary" size="lg" onClick={continueStep}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <div style={labelStyle}>
        {label}
        {required ? ' *' : ''}
      </div>
      {children}
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 14,
        padding: '16px 18px',
        border: '1px solid var(--c-border)',
        background: 'var(--c-surface)',
        cursor: 'pointer',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--c-ink)' }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--c-ink3)', marginTop: 4, lineHeight: 1.55 }}>{description}</div>
      </div>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)', flexShrink: 0 }} />
    </label>
  )
}

function sourceCardStyle(active: boolean): CSSProperties {
  return {
    textAlign: 'left',
    padding: '18px 18px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--c-border)'}`,
    background: active ? 'var(--accent-bg)' : '#fff',
    cursor: 'pointer',
    boxShadow: active ? 'var(--sh-xs)' : 'none',
  }
}

function modeSwitchStyle(active: boolean): CSSProperties {
  return {
    padding: '10px 16px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--c-border)'}`,
    background: active ? 'var(--accent-bg)' : 'var(--c-surface)',
    color: active ? 'var(--accent)' : 'var(--c-ink3)',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  }
}

function groupOperationsBySegment(operations: DraftOperation[]) {
  return operations.reduce<Record<string, DraftOperation[]>>((groups, operation) => {
    const segment = operation.path.split('/').filter(Boolean)[0] || 'root'
    const key = segment.replace(/-/g, ' ')
    groups[key] = [...(groups[key] || []), operation]
    return groups
  }, {})
}

function authLabel(authType: AuthType) {
  switch (authType) {
    case 'api-key':
      return 'API Key'
    case 'oauth2':
      return 'OAuth 2.0'
    case 'jwt':
      return 'JWT'
    case 'basic':
      return 'Basic Auth'
    default:
      return 'Public'
  }
}

function buildGatewayPreview(
  form: PublishForm,
  routeMode: RouteMode,
  operations: DraftOperation[],
) {
  const routeLines =
    routeMode === 'operations'
      ? operations
          .map(
            (operation) =>
              `    - name: ${slugify(operation.summary) || slugify(operation.path) || operation.id}
      paths: ["${operation.path}"]
      methods: [${operation.method}]
      strip_path: ${form.stripPath}
      https_redirect_status_code: ${form.httpsOnly ? '426' : '0'}`,
          )
          .join('\n')
      : `    - name: ${slugify(form.name || 'proxy-route')}
      paths: ["${form.basePath || '/api'}"]
      strip_path: ${form.stripPath}
      https_redirect_status_code: ${form.httpsOnly ? '426' : '0'}`

  const pluginLines = [
    form.authType !== 'none'
      ? `  - name: ${form.authType === 'api-key' ? 'key-auth' : form.authType === 'oauth2' ? 'oauth2-introspection' : form.authType === 'jwt' ? 'jwt' : 'basic-auth'}`
      : null,
    form.rateEnabled
      ? `  - name: rate-limiting\n    config:\n      minute: ${form.ratePerMinute}\n      hour: ${form.ratePerHour}`
      : null,
    form.cors ? '  - name: cors' : null,
    form.analytics ? '  - name: prometheus' : null,
  ]
    .filter(Boolean)
    .join('\n')

  return `services:
  - name: ${slugify(form.name || 'new-api')}
    url: ${form.backendUrl || 'https://backend.internal'}
    path: ${form.servicePath || '/'}
    retries: ${form.retries}
    connect_timeout: ${form.timeout}
    read_timeout: ${form.timeout}
    write_timeout: ${form.timeout}
routes:
${routeLines}
plugins:
${pluginLines || '  []'}
metadata:
  docs_source: ${form.docsSource || 'Manual entry'}
  owner: ${form.owner || 'Platform Team'}
  environment: ${form.environment}
  circuit_breaker: ${form.circuitBreaker}
  request_buffering: ${form.requestBuffering}
  preserve_host: ${form.preserveHost}`
}

export default function PublishAPIPage() {
  return (
    <Suspense>
      <PublishPage />
    </Suspense>
  )
}
