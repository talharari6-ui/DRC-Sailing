'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Calendar } from '@/src/components/Calendar'
import { DAY_NAMES } from '@/src/lib/constants'

export default function SchedulePage() {
  const { coach } = useAuth()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [sessions, setSessions] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCoachSchedule()
  }, [coach, year, month])

  const loadCoachSchedule = async () => {
    if (!coach) return
    setLoading(true)
    try {
      const monthStr = String(month + 1).padStart(2, '0')
      const yearStr = String(year)

      // Load groups
      const groupRes = await fetch(`/api/groups?coach_id=${coach.id}`)
      const groupData = await groupRes.json()
      setGroups(groupData)

      // Load sessions for month
      const sessRes = await fetch(
        `/api/sessions?coach_id=${coach.id}&date_from=${yearStr}-${monthStr}-01&date_to=${yearStr}-${monthStr}-31`
      )
      const sessData = await sessRes.json()
      setSessions(sessData)
    } catch (error) {
      console.error('Error loading schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDayContent = (dateStr) => {
    const dayGroups = groups.filter((g) => {
      const dow = new Date(dateStr + 'T00:00:00').getDay()
      return (g.days_of_week || []).includes(dow)
    })

    const daySessions = sessions.filter((s) => s.date === dateStr)

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', flex: 1 }}>
        {dayGroups.map((group) => (
          <div
            key={group.id}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: group.color || '#3b82f6',
              flexShrink: 0,
            }}
            title={group.name}
          />
        ))}
      </div>
    )
  }

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
        <>
          <Calendar
            year={year}
            month={month}
            onPrevMonth={() => {
              if (month === 0) {
                setMonth(11)
                setYear(year - 1)
              } else {
                setMonth(month - 1)
              }
            }}
            onNextMonth={() => {
              if (month === 11) {
                setMonth(0)
                setYear(year + 1)
              } else {
                setMonth(month + 1)
              }
            }}
            getDayContent={getDayContent}
          />

          <div style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
              📋 קבוצות שלי
            </h2>
            {groups.length === 0 ? (
              <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                אין קבוצות מוגדרות
              </div>
            ) : (
              <div>
                {groups.map((group) => (
                  <div
                    key={group.id}
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
                        height: '40px',
                        borderRadius: '2px',
                        background: group.color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                        {group.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {group.days_of_week && group.days_of_week.length > 0
                          ? group.days_of_week.map((d) => DAY_NAMES[d]).join(', ')
                          : 'ללא ימים'}
                      </div>
                    </div>
                    {group.start_time && (
                      <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'left' }}>
                        {group.start_time}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
