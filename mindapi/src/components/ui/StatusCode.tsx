export default function StatusCode({ code }: { code: number }) {
  const s: React.CSSProperties = code < 300
    ? { color: '#166534' }
    : code < 500
    ? { color: '#92400E' }
    : { color: '#991B1B' }
  return <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, ...s }}>{code}</span>
}
