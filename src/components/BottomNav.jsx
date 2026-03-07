'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { cn } from '@/lib/utils'

const COACH_ROUTES = [
  { href: '/schedule', icon: '📅', label: 'לוח' },
  { href: '/sailors', icon: '👥', label: 'חניכים' },
  { href: '/hours', icon: '⏰', label: 'שעות' },
  { href: '/history', icon: '📊', label: 'היסטוריה' },
  { href: '/profile', icon: '👤', label: 'פרופיל' },
]

const ADMIN_ROUTES = [
  { href: '/admin/dashboard', icon: '👑', label: 'ניהול' },
  { href: '/admin/coaches', icon: '👨‍🏫', label: 'מדריכים' },
  { href: '/admin/sailors', icon: '👥', label: 'חניכים' },
  { href: '/admin/absences', icon: '🚫', label: 'חיסורים' },
  { href: '/admin/substitutions', icon: '🔄', label: 'החלפות' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { coach } = useAuth()

  const routes = coach?.is_admin ? ADMIN_ROUTES : COACH_ROUTES

  return (
    <div className="fixed bottom-0 inset-x-0 bg-[rgba(5,10,25,0.95)] backdrop-blur-drc border-t border-border flex pb-[var(--safe)] z-[100]">
      {routes.map((route) => {
        const isActive = pathname.startsWith(route.href)
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'flex-1 py-2.5 px-1 flex flex-col items-center gap-1 text-xs font-semibold no-underline transition-colors',
              isActive ? 'text-drc-blue-light' : 'text-muted-foreground'
            )}
          >
            <span className="text-xl leading-none">{route.icon}</span>
            {route.label}
          </Link>
        )
      })}
    </div>
  )
}
