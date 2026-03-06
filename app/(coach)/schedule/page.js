'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'

export default function SchedulePage() {
  const authResult = useAuth()
  const coach = authResult?.coach
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  // Return loading state while coach data is being loaded
  if (!coach) {
    return <div style={{ padding: '20px', color: 'var(--muted)', textAlign: 'center' }}>טוען...</div>
  }

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/sessions?include_details=true')
        const data = await res.json()
        setSessions(data)
      } catch (error) {
        console.error('Error loading sessions:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSessions()
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
          📅 לוח שנתי
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          ברוכים הבאים, {coach?.name}!
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          טוען...
        </div>
      )}

      {!loading && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
            📋 אירועים
          </h2>
          {sessions.length === 0 ? (
            <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
              אין אירועים בתאריך זה
            </div>
          ) : (
            <div>
              {sessions.map(session => (
                <div
                  key={session.id}
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
                      width: '4px',
                      height: '60px',
                      borderRadius: '2px',
                      background: session.groups?.color || '#3b82f6',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                      {session.groups?.name || 'קבוצה'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                      {session.date} • {session.start_time || 'אין שעה'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      מדריך: {session.coaches?.name || 'לא מוגדר'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
