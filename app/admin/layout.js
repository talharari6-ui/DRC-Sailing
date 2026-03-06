'use client'

import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { Header } from '@/src/components/Header'
import { BottomNav } from '@/src/components/BottomNav'
import { ErrorBoundary } from '@/src/components/ErrorBoundary'

export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary>
      <ProtectedRoute requireAdmin={true}>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header title="👑 מסוף מנהל" subtitle="מרכז דניאל" />
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '16px',
              paddingBottom: 'calc(150px + var(--safe))',
              background: 'linear-gradient(160deg, var(--bg) 0%, var(--bg2) 50%, var(--bg3) 100%)',
            }}
          >
            {children}
          </div>
          <BottomNav />
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  )
}
