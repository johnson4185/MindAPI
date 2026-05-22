export function buildTenantPath(tenantSlug: string, path: string) {
  if (!path.startsWith('/')) return `/t/${tenantSlug}/${path}`
  if (path.startsWith('/t/')) return path
  return `/t/${tenantSlug}${path}`
}

export function stripTenantPrefix(pathname: string) {
  if (!pathname.startsWith('/t/')) return pathname
  const parts = pathname.split('/')
  if (parts.length <= 3) return '/dashboard'
  return `/${parts.slice(3).join('/')}`
}

export function extractTenantSlug(pathname: string) {
  if (!pathname.startsWith('/t/')) return null
  const parts = pathname.split('/')
  return parts[2] || null
}
