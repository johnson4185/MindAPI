import { CSSProperties } from 'react'

type SkeletonProps = {
  width?: string | number
  height?: string | number
  className?: string
  style?: CSSProperties
  rounded?: 'none' | 'sm' | 'full'
  'aria-label'?: string
}

const roundedMap = { none: 0, sm: 4, full: 9999 } as const

/** Shimmer placeholder block. Use for loading states instead of blank screens. */
export function Skeleton({ width = '100%', height = 14, className, style, rounded = 'sm', 'aria-label': ariaLabel }: SkeletonProps) {
  return (
    <span
      className={`skeleton-block ${className || ''}`.trim()}
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: roundedMap[rounded],
        verticalAlign: 'middle',
        ...style,
      }}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'grid', gap: 8 }} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? '72%' : '100%'} />
      ))}
    </div>
  )
}

/** Row of metric card placeholders. */
export function MetricGridSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 14, marginBottom: 18 }}
      aria-busy="true"
      aria-label="Loading metrics"
    >
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="surface-card" style={{ padding: 18 }}>
          <Skeleton height={11} width="45%" style={{ marginBottom: 10 }} />
          <Skeleton height={28} width="55%" />
        </div>
      ))}
    </div>
  )
}

/** Table body placeholder rows. */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <table aria-busy="true" aria-label="Loading table">
      <thead>
        <tr>
          {Array.from({ length: cols }, (_, c) => (
            <th key={c} style={{ padding: '12px 16px' }}>
              <Skeleton height={12} width="70%" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }, (_, c) => (
              <td key={c} style={{ padding: '14px 16px' }}>
                <Skeleton height={14} width={c === 0 ? '85%' : '50%'} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Card with title bar + body lines. */
export function CardSkeleton({ titleWidth = '40%' }: { titleWidth?: string }) {
  return (
    <section className="surface-card" style={{ overflow: 'hidden' }} aria-busy="true" aria-label="Loading card">
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-panel-soft)' }}>
        <Skeleton height={16} width={titleWidth} />
      </div>
      <div style={{ padding: 18 }}>
        <SkeletonText lines={4} />
      </div>
    </section>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }} aria-busy="true" aria-label="Loading header">
      <div style={{ maxWidth: 520 }}>
        <Skeleton height={12} width={120} style={{ marginBottom: 8 }} />
        <Skeleton height={32} width="min(420px, 90vw)" style={{ maxWidth: 420 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton height={40} width={120} />
        <Skeleton height={40} width={140} />
      </div>
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <MetricGridSkeleton columns={5} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 18 }}>
        <CardSkeleton titleWidth="35%" />
        <CardSkeleton titleWidth="28%" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </>
  )
}

export function BillingPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <MetricGridSkeleton columns={3} />
      <div style={{ display: 'grid', gap: 18, marginBottom: 18 }}>
        <CardSkeleton titleWidth="42%" />
        <CardSkeleton titleWidth="38%" />
      </div>
    </>
  )
}

export function PortalPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <MetricGridSkeleton columns={3} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton titleWidth="36%" />
    </>
  )
}

export function AnalyticsPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <MetricGridSkeleton columns={4} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 18 }}>
        <CardSkeleton titleWidth="40%" />
        <CardSkeleton titleWidth="36%" />
      </div>
      <CardSkeleton titleWidth="28%" />
    </>
  )
}

export function LogsPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="surface-card" style={{ overflow: 'hidden' }}>
        <TableSkeleton rows={10} cols={8} />
      </div>
    </>
  )
}

export function SettingsPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton titleWidth="32%" />
    </>
  )
}

export function ConsumersPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <MetricGridSkeleton columns={4} />
      <div className="surface-card" style={{ overflow: 'hidden' }}>
        <TableSkeleton rows={6} cols={8} />
      </div>
    </>
  )
}
