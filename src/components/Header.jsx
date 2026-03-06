'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'

export function Header({ title, subtitle = '' }) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '15px',
            fontWeight: '800',
            color: 'var(--blue-light)',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>
      <button
        onClick={handleLogout}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          fontSize: '12px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
        onMouseLeave={(e) => (e.target.style.background = 'none')}
      >
        התנתקות
      </button>
    </div>
  )
}
