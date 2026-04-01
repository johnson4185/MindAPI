'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useDebounce } from '@/lib/hooks/useDebounce'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import MethodBadge from '@/components/ui/MethodBadge'
import StatusCode from '@/components/ui/StatusCode'
import Modal from '@/components/ui/Modal'
import { LogEntry, HttpMethod } from '@/lib/types'
import { fetchJson } from '@/lib/api-client'

export default function LogsPage() {
  const { showToast } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [apiFilter, setApiFilter] = useState('All')
  const [live, setLive] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  useEffect(() => {
    void fetchJson<LogEntry[]>('/api/mock/logs').then(setLogs)
  }, [])

  useEffect(() => {
    if (!live || logs.length === 0) return
    const timer = setInterval(() => {
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
      ].slice(0, 50))
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
    <div className="page-enter" style={{ padding: 24 }}>
      <PageHeader
        eyebrow="Observability"
        title="Runtime Activity"
        actions={<><Button variant="default" size="sm" onClick={() => setLive((value) => !value)}>{live ? 'Pause stream' : 'Resume stream'}</Button><Button variant="primary" size="sm" onClick={() => showToast('Log export queued', 'info')}>Export</Button></>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) auto auto auto', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter by API, path, or consumer" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option>All</option><option>2xx</option><option>4xx</option><option>5xx</option>
        </select>
        <select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
          <option value="All">All Methods</option>
          {(['GET','POST','PUT','DELETE','PATCH'] as HttpMethod[]).map((method) => <option key={method}>{method}</option>)}
        </select>
        <select value={apiFilter} onChange={(event) => setApiFilter(event.target.value)}>
          <option value="All">All APIs</option>
          {uniqueApis.map((api) => <option key={api}>{api}</option>)}
        </select>
      </div>

      <div className="surface-card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              {['Timestamp', 'API', 'Method', 'Path', 'Status', 'Latency', 'Consumer', 'IP'].map((heading) => <th key={heading}>{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} onClick={() => setSelectedLog(log)} style={{ cursor: 'pointer' }}>
                <td style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>{log.timestamp}</td>
                <td>{log.api}</td>
                <td><MethodBadge method={log.method} /></td>
                <td style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>{log.path}</td>
                <td><StatusCode code={log.status} /></td>
                <td>{log.latency}</td>
                <td>{log.consumer}</td>
                <td style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <div style={{ fontSize: 12, color: 'var(--c-ink-4)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 13.5 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
