type M = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

const S: Record<M, React.CSSProperties> = {
  GET:    { color: '#166534' },
  POST:   { color: '#1E40AF' },
  PUT:    { color: '#92400E' },
  DELETE: { color: '#991B1B' },
  PATCH:  { color: '#5B21B6' },
}

export default function MethodBadge({ method }: { method: M }) {
  return (
    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '0.3px', ...S[method] }}>
      {method}
    </span>
  )
}
