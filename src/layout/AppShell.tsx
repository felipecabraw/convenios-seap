import type { ReactNode } from 'react'
import { ContextBar } from './ContextBar'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-[var(--sigic-bg)]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <ContextBar />
        <main className="mx-auto max-w-[1480px] px-5 py-5">{children}</main>
      </div>
    </div>
  )
}
