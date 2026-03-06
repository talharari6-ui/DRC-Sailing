'use client'

import { useEffect, useState } from 'react'

export default function AdminSailors() {
  const [sailors, setSailors] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSailors()
  }, [])

  const loadSailors = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sailors')
      const data = await res.json()
      setSailors(data)
    } catch (error) {
      console.error('Error loading sailors:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>👥 ניהול חניכים</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {sailors.length} חניכים בסה"כ
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          טוען...
        </div>
      ) : sailors.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '32px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>אין חניכים</p>
        </div>
      ) : (
        <div>
          {sailors.map((sailor) => (
            <div
              key={sailor.id}
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
                {sailor.gender === 'female' ? '👧' : '👦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                  {sailor.first_name} {sailor.last_name}
                </div>
                {sailor.parent_name && (
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    הורה: {sailor.parent_name}
                  </div>
                )}
              </div>
              {sailor.shirt_size && (
                <div
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--text)',
                  }}
                >
                  מידה {sailor.shirt_size}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
