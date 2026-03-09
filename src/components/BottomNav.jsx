'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Calendar, Users, Clock, BarChart3, User, Crown, GraduationCap, Ban, RefreshCw } from 'lucide-react'

const COACH_ROUTES = [
  { href: '/schedule', icon: Calendar, label: 'לוח' },
  { href: '/sailors', icon: Users, label: 'חניכים' },
  { href: '/hours', icon: Clock, label: 'שעות' },
  { href: '/history', icon: BarChart3, label: 'היסטוריה' },
  { href: '/profile', icon: User, label: 'פרופיל' },
]

const ADMIN_ROUTES = [
  { href: '/admin/dashboard', icon: Crown, label: 'ניהול' },
  { href: '/admin/board', icon: Calendar, label: 'לוח' },
  { href: '/admin/coaches', icon: GraduationCap, label: 'מדריכים' },
  { href: '/admin/groups', icon: Users, label: 'קבוצות' },
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
            <route.icon size={20} />
            {route.label}
          </Link>
        )
      })}
    </div>
  )
}
