'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'

export default function HoursPage() {
  const { coach } = useAuth()
  const [hours, setHours] = useState([])
  const [loading, setLoading] = useState(false)
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  useEffect(() => {
    loadHours()
  }, [coach])

  const loadHours = async () => {
    if (!coach) return
    setLoading(true)
    try {
      const res = await fetch(`/api/hours?coach_id=${coach.id}&date_from=${monthStart}&date_to=${monthEnd}`)
      const data = await res.json()
      setHours(data)
    } catch (error) {
      console.error('Error loading hours:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalHours = hours.reduce((sum, h) => {
    if (!h.start_time || !h.end_time) return sum
    const [sh, sm] = h.start_time.split(':').map(Number)
    const [eh, em] = h.end_time.split(':').map(Number)
    return sum + ((eh - sh) * 60 + (em - sm)) / 60
  }, 0)

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>⏰ שעות עבודה</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          חודש נוכחי: {totalHours.toFixed(1)} שעות
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          טוען...
        </div>
      ) : hours.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '32px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏰</div>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>אין שעות עבודה מתועדות</p>
        </div>
      ) : (
        <div>
          {hours.map((h) => (
            <div
              key={h.id}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                  {new Date(h.date).toLocaleDateString('he-IL')}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--green)' }}>
                  {h.start_time} - {h.end_time}
                </div>
              </div>
              {h.notes && (
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {h.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
