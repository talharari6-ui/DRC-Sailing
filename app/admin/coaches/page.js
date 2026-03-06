'use client'

import { useEffect, useState } from 'react'

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCoaches()
  }, [])

  const loadCoaches = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/coaches')
      const data = await res.json()
      setCoaches(data)
    } catch (error) {
      console.error('Error loading coaches:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>👨‍🏫 ניהול מדריכים</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {coaches.length} מדריכים
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          טוען...
        </div>
      ) : coaches.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '32px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍🏫</div>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>אין מדריכים</p>
        </div>
      ) : (
        <div>
          {coaches.map((coach) => (
            <div
              key={coach.id}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb30, #1e40af40)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                }}
              >
                👨‍🏫
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                  {coach.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {coach.email || 'אין דוא"ל'}
                </div>
              </div>
              {coach.is_admin && (
                <div
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: 'white',
                    fontWeight: '700',
                  }}
                >
                  מנהל
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
