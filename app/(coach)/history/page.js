'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { DAY_NAMES } from '@/src/lib/constants'

export default function HistoryPage() {
  const { coach } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [coach])

  const loadHistory = async () => {
    if (!coach) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions?coach_id=${coach.id}`)
      const data = await res.json()
      setSessions(data.slice(0, 50))
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>📊 היסטוריה</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {sessions.length} פעילויות
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          טוען...
        </div>
      ) : sessions.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '32px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>אין היסטוריה פעילויות</p>
        </div>
      ) : (
        <div>
          {sessions.map((session) => {
            const date = new Date(session.date + 'T12:00:00')
            const dow = date.getDay()
            return (
              <div
                key={session.id}
                style={{
                  background: session.cancelled ? 'rgba(239, 68, 68, 0.1)' : 'var(--card)',
                  border: `1px solid ${session.cancelled ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  opacity: session.cancelled ? 0.7 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        marginBottom: '2px',
                        textDecoration: session.cancelled ? 'line-through' : 'none',
                      }}
                    >
                      {session.cancelled && '❌ '}יום {DAY_NAMES[dow]}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {date.toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: session.cancelled
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(52, 211, 153, 0.2)',
                      color: session.cancelled ? '#f87171' : '#34d399',
                    }}
                  >
                    {session.cancelled ? 'בוטל' : 'בוצע'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
