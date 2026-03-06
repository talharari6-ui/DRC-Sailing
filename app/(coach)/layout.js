import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { Header } from '@/src/components/Header'
import { BottomNav } from '@/src/components/BottomNav'

export default function CoachLayout({ children }) {
  return (
    <ProtectedRoute>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header title="חוג שייט" subtitle="מרכז דניאל" />
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
  )
}
