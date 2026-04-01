'use client'

import { ReactNode } from 'react'
import { StoreProvider } from '@/lib/store'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import Toast from '@/components/ui/Toast'
import CommandPalette from '@/components/ui/CommandPalette'
import KeyboardShortcutsModal from '@/components/ui/KeyboardShortcutsModal'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
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
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
      </div>
      <Toast />
      <CommandPalette />
      <KeyboardShortcutsModal />
    </StoreProvider>
  )
}
