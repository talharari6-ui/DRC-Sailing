'use client'

import { useAuth } from '@/src/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const router = useRouter()
  const { isAuthenticated, coach, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/')
      } else if (requireAdmin && !coach?.is_admin) {
        router.push('/schedule')
      }
    }
  }, [isAuthenticated, coach, isLoading, requireAdmin, router])

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
          ></div>
        </div>
        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  if (!isAuthenticated || (requireAdmin && !coach?.is_admin)) {
    return null
  }

  return <>{children}</>
}
