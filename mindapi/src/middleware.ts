import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/t/')) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 't') return NextResponse.next()

  const tenantSlug = segments[1]
  if (!tenantSlug) return NextResponse.next()

  const rest = segments.slice(2)
  const nextPath = rest.length === 0 ? '/dashboard' : `/${rest.join('/')}`

  const url = new URL(request.url)
  url.pathname = nextPath
  if (!url.searchParams.has('tenantSlug')) {
    url.searchParams.set('tenantSlug', tenantSlug)
  }
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/t/:path*'],
}
