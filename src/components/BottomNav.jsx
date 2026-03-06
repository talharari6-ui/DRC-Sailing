'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'

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
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(5, 10, 25, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: 'var(--safe)',
        zIndex: 100,
      }}
    >
      {routes.map((route) => {
        const isActive = pathname.startsWith(route.href.split('/').slice(0, -1).join('/'))
        return (
          <Link
            key={route.href}
            href={route.href}
            style={{
              flex: 1,
              padding: '8px 2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: isActive ? 'var(--blue-light)' : 'var(--muted)',
              fontSize: '9px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: '1' }}>
              {route.icon}
            </span>
            {route.label}
          </Link>
        )
      })}
    </div>
  )
}
