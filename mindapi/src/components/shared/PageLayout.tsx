import { ReactNode } from 'react'

/** Standard page padding and enter animation for all app routes. */
export function PageLayout({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`page-enter ${className || ''}`.trim()} style={{ padding: 24 }}>{children}</div>
}
