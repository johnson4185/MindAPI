import { HttpMethod } from '@/lib/types'

const S: Record<HttpMethod, React.CSSProperties> = {
  GET:    { color: '#166534' },
  POST:   { color: '#1E40AF' },
  PUT:    { color: '#92400E' },
  DELETE: { color: '#991B1B' },
  PATCH:  { color: '#5B21B6' },
  OPTIONS: { color: '#8b5cf6' },
  HEAD:   { color: '#64748b' },
}

export default function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13.5, fontWeight: 700, letterSpacing: '0.3px', ...S[method] }}>
      {method}
    </span>
  )
}
