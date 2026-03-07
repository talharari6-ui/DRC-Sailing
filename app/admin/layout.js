'use client'

import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { Header } from '@/src/components/Header'
import { BottomNav } from '@/src/components/BottomNav'
import { ErrorBoundary } from '@/src/components/ErrorBoundary'

export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute requireAdmin={true}>
        <div className="h-screen flex flex-col">
          <Header title="👑 מסוף מנהל" subtitle="מרכז דניאל" />
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden p-4 md:p-6 pb-[calc(80px+var(--safe))] bg-gradient-to-br from-drc-bg via-drc-bg2 to-drc-bg3">
            <div className="page-container">
              {children}
            </div>
          </div>
          <BottomNav />
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  )
}
