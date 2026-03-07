'use client'

import { useAuth } from '@/src/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin w-10 h-10 border-[3px] border-drc-blue/20 border-t-drc-blue rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated || (requireAdmin && !coach?.is_admin)) {
    return null
  }

  return <>{children}</>
}
