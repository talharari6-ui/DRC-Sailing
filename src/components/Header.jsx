'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Header({ title, subtitle = '' }) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="bg-black/50 backdrop-blur-drc border-b border-border px-4 sm:px-6 py-3 pt-[max(12px,env(safe-area-inset-top))] flex items-center gap-3 shrink-0">
      <div className="flex-1">
        <div className="text-base font-extrabold text-drc-blue-light">
          {title}
        </div>
        {subtitle ? (
          <div className="text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </div>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-muted-foreground text-xs"
      >
        התנתקות
      </Button>
    </div>
  )
}
