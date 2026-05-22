'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { StoreProvider } from '@/lib/store'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import Toast from '@/components/ui/Toast'
import CommandPalette from '@/components/ui/CommandPalette'
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal'
import { useStore } from '@/lib/store'
import { canManageWorkspace } from '@/lib/permissions'
import { extractTenantSlug, stripTenantPrefix } from '@/lib/tenant-routing'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ShellContent>{children}</ShellContent>
      <Toast />
      <CommandPalette />
      <KeyboardShortcutsModal />
    </StoreProvider>
  )
}

function ShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { currentUser, setCurrentTenantBySlug } = useStore()
  const normalizedPath = stripTenantPrefix(pathname)
  const blockedSettings = normalizedPath.startsWith('/settings') && !canManageWorkspace(currentUser.role)

  useEffect(() => {
    const slug = extractTenantSlug(pathname)
    if (!slug) return
    setCurrentTenantBySlug(slug)
  }, [pathname, setCurrentTenantBySlug])

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px minmax(0, 1fr)',
          minHeight: '100vh',
          background: 'var(--c-bg)',
        }}
      >
        <Sidebar />
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          <main style={{ flex: 1, minWidth: 0 }}>
            {blockedSettings ? (
              <div className="page-enter" style={{ padding: 24 }}>
                <div className="surface-card" style={{ padding: 24 }}>
                  <div className="eyebrow" style={{ color: 'var(--danger)', marginBottom: 8 }}>Access denied</div>
                  <h3 style={{ marginBottom: 10 }}>Workspace admin permissions required</h3>
                  <p>
                    This section is available to Admin and Owner roles. Use the role switcher in the top bar to simulate admin access while backend auth is still in progress.
                  </p>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </>
  )
}
