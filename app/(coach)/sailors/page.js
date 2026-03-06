'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'

export default function SailorsPage() {
  const { coach } = useAuth()
  const [sailors, setSailors] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [coach])

  const loadData = async () => {
    if (!coach) return
    setLoading(true)
    try {
      const sailorRes = await fetch('/api/sailors')
      const sailorData = await sailorRes.json()
      setSailors(sailorData)

      const groupRes = await fetch(`/api/groups?coach_id=${coach.id}`)
      const groupData = await groupRes.json()
      setGroups(groupData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>👥 חניכים</h1>
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
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>אין חניכים מוגדרים</p>
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
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>
                  {sailor.first_name} {sailor.last_name}
                </div>
                {sailor.parent_name && (
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    הורה: {sailor.parent_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
