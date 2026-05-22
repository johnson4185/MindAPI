'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useDebounce } from '@/lib/hooks/useDebounce'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import MethodBadge from '@/components/ui/MethodBadge'
import StatusCode from '@/components/ui/StatusCode'
import Modal from '@/components/ui/Modal'
import { DataTable, Column } from '@/components/ui/DataTable'
import { LogEntry, HttpMethod } from '@/lib/types'
import { PageLayout } from '@/components/shared/PageLayout'
import { useApiData } from '@/hooks/useApiData'

const COLUMNS: Column<LogEntry>[] = [
  { key: 'timestamp', label: 'Timestamp', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13 }}>{v as string}</span> },
  { key: 'api', label: 'API' },
  { key: 'method', label: 'Method', render: (v) => <MethodBadge method={v as HttpMethod} /> },
  { key: 'path', label: 'Path', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13 }}>{v as string}</span> },
  { key: 'status', label: 'Status', render: (v) => <StatusCode code={v as number} /> },
  { key: 'latency', label: 'Latency' },
  { key: 'consumer', label: 'Consumer' },
  { key: 'ip', label: 'IP', render: (v) => <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13 }}>{v as string}</span> },
]

export default function LogsPage() {
  const { showToast } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [apiFilter, setApiFilter] = useState('All')
  const [live, setLive] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const { loading, error } = useApiData<LogEntry[]>(
    '/api/mock/logs',
    {
      onSuccess: (data) => setLogs(data),
      onError: (err) => console.error('Failed to load logs:', err),
    }
  )

  useEffect(() => {
    if (!live || logs.length === 0) return
    const timer = setInterval(() => {
      if (document.hidden) return
      const now = new Date()
      const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`
      setLogs((current) => [
        {
          id: String(Date.now()),
          timestamp: ts,
          api: current[0]?.api || 'payments-api',
          method: 'GET' as HttpMethod,
          path: current[0]?.path || '/payments/v2/health',
          status: 200,
          latency: `${Math.floor(Math.random() * 120) + 20}ms`,
          consumer: current[0]?.consumer || 'Acme Corp',
          ip: '10.0.12.45',
        },
        ...current,
      ].slice(0, 200))
    }, 3000)
    return () => clearInterval(timer)
  }, [live, logs.length])

  const debouncedSearch = useDebounce(search, 180)

  const filtered = logs.filter((log) => {
    const matchSearch = log.api.toLowerCase().includes(debouncedSearch.toLowerCase()) || log.path.toLowerCase().includes(debouncedSearch.toLowerCase()) || log.consumer.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchStatus = statusFilter === 'All' || (statusFilter === '2xx' && log.status < 300) || (statusFilter === '4xx' && log.status >= 400 && log.status < 500) || (statusFilter === '5xx' && log.status >= 500)
    const matchMethod = methodFilter === 'All' || log.method === methodFilter
    const matchApi = apiFilter === 'All' || log.api === apiFilter
    return matchSearch && matchStatus && matchMethod && matchApi
  })

  const uniqueApis = Array.from(new Set(logs.map((log) => log.api)))

  return (
    <PageLayout>
      <PageHeader
        prefix="Logs"
        title="Runtime Activity"
        actions={<><Button variant="default" size="sm" onClick={() => setLive((value) => !value)}>{live ? 'Pause stream' : 'Resume stream'}</Button><Button variant="primary" size="sm" onClick={() => showToast('Log export queued', 'info')}>Export</Button></>}
      />
      {!!error && <div className="surface-card" style={{ padding: 14, marginBottom: 16, borderColor: 'var(--danger-bd)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>{error.message}</div>}

      {loading && logs.length === 0 ? (
        <div className="surface-card" style={{ padding: 48, textAlign: 'center' }}>
          <div className="skeleton-block" style={{ width: 100, height: 14, margin: '0 auto 16px' }} />
          <div className="skeleton-block" style={{ width: 260, height: 28, margin: '0 auto' }} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 180 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-4)" strokeWidth="2.2" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" />
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter logs..." style={{ paddingLeft: 34 }} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: 90 }}>
              <option>All</option><option>2xx</option><option>4xx</option><option>5xx</option>
            </select>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} style={{ width: 'auto', minWidth: 120 }}>
              <option value="All">All Methods</option>
              {(['GET','POST','PUT','DELETE','PATCH'] as HttpMethod[]).map((method) => <option key={method}>{method}</option>)}
            </select>
            <select value={apiFilter} onChange={(e) => setApiFilter(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
              <option value="All">All APIs</option>
              {uniqueApis.map((api) => <option key={api}>{api}</option>)}
            </select>
            <span style={{ fontSize: 13, color: 'var(--c-ink-4)', marginLeft: 'auto' }}>{filtered.length} results</span>
          </div>

          <DataTable columns={COLUMNS} data={filtered} onRowClick={(log) => setSelectedLog(log)} />
        </>
      )}

      <Modal open={selectedLog !== null} onClose={() => setSelectedLog(null)} title="Request detail" footer={<Button variant="default" onClick={() => setSelectedLog(null)}>Close</Button>}>
        {selectedLog && (
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['Timestamp', selectedLog.timestamp],
              ['API', selectedLog.api],
              ['Method', selectedLog.method],
              ['Path', selectedLog.path],
              ['Status', String(selectedLog.status)],
              ['Latency', selectedLog.latency],
              ['Consumer', selectedLog.consumer],
              ['IP', selectedLog.ip],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12, padding: '8px 10px', background: 'var(--c-panel-soft)', border: '1px solid var(--c-border)' }}>
                <div style={{ fontSize: 13, color: 'var(--c-ink-4)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 13.5 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
