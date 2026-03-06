'use client'

import { useAuth } from '@/src/hooks/useAuth'

export default function ProfilePage() {
  const { coach } = useAuth()

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>👤 פרופיל</h1>
      </div>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb30, #1e40af40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            👨‍🏫
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>
              {coach?.name || 'משתמש'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {coach?.is_admin ? '🔐 מנהל' : 'מדריך'}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
            דוא"ל
          </div>
          <div style={{ fontSize: '14px', marginBottom: '16px' }}>
            {coach?.email || 'לא מוגדר'}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
            מזהה
          </div>
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'var(--blue-light)',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '8px',
              borderRadius: '6px',
            }}
          >
            {coach?.id}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '32px 16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏗️</div>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          עמוד הפרופיל בעדכון...
        </p>
      </div>
    </div>
  )
}
