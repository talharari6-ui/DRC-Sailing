'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import ViewModeToggle from '@/src/components/ViewModeToggle'
import FilterToggle from '@/src/components/FilterToggle'
import { Calendar } from '@/src/components/Calendar'
import SessionDetailModal from '@/src/components/SessionDetailModal'
import SailorManagementModal from '@/src/components/SailorManagementModal'
import SubstituteCoachModal from '@/src/components/SubstituteCoachModal'

export default function SchedulePage() {
  const authResult = useAuth()
  const coach = authResult?.coach
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('month')
  const [filterMode, setFilterMode] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [sailorModalOpen, setSailorModalOpen] = useState(false)
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false)

  if (!coach) {
    return <div style={{ padding: '20px', color: 'var(--muted)', textAlign: 'center' }}>טוען...</div>
  }

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/sessions?include_details=true')
        const data = await res.json()

        if (!res.ok) {
          console.error('API error:', res.status, data)
          setSessions([])
        } else if (Array.isArray(data)) {
          setSessions(data)
        } else if (data?.error) {
          console.error('API returned error:', data.error)
          setSessions([])
        } else {
          console.warn('Unexpected API response format:', data)
          setSessions([])
        }
      } catch (error) {
        console.error('Error loading sessions:', error)
        setSessions([])
      } finally {
        setLoading(false)
      }
    }
    loadSessions()
  }, [])

  const getFilteredSessions = () => {
    return sessions.filter(s => {
      if (filterMode === 'my') {
        return s.coach_id === coach?.id || s.substitute_coach_id === coach?.id
      }
      return true
    })
  }

  const getSessionsForDate = (dateStr) => {
    return getFilteredSessions().filter(s => s.date === dateStr)
  }

  const getDayContent = (dateStr, day) => {
    const daySessions = getSessionsForDate(dateStr)
    if (daySessions.length === 0) return null

    return (
      <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {daySessions.slice(0, 2).map(s => (
          <div
            key={s.id}
            onClick={() => {
              setSelectedSession(s)
              setDetailModalOpen(true)
            }}
            style={{
              background: s.groups?.color || '#3b82f6',
              color: '#fff',
              padding: '2px 3px',
              borderRadius: '2px',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {s.groups?.name?.substring(0, 5)}
          </div>
        ))}
        {daySessions.length > 2 && (
          <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
            +{daySessions.length - 2}
          </div>
        )}
      </div>
    )
  }

  const handleDateClick = (dateStr) => {
    const daySession = getSessionsForDate(dateStr)
    if (daySession.length === 1) {
      setSelectedSession(daySession[0])
      setDetailModalOpen(true)
    } else if (daySession.length > 1) {
      // Show list of sessions for this day
      setSelectedSession(null)
    }
  }

  const handleAttendanceUpdate = async (sessionId, sailorId, present, reason) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sailor_id: sailorId, present, reason })
      })
      if (!res.ok) throw new Error('Failed to update attendance')
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }

  const handleSubstituteRequest = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId)
    setSelectedSession(session)
    setDetailModalOpen(false)
    setSubstituteModalOpen(true)
  }

  const handleEditSailors = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId)
    setSelectedSession(session)
    setDetailModalOpen(false)
    setSailorModalOpen(true)
  }

  const handleDecline = async (sessionId) => {
    console.log('Session declined:', sessionId)
    setDetailModalOpen(false)
  }

  const getWeekDays = () => {
    const today = currentDate
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)) // Start from Sunday

    const weekDays = []
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      weekDays.push({
        date: dateStr,
        dayName: dayNames[date.getDay()],
        dayNum: date.getDate(),
        dateObj: date
      })
    }
    return weekDays
  }

  const filteredSessions = getFilteredSessions()

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

      <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
      <FilterToggle currentFilter={filterMode} onFilterChange={setFilterMode} />

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          טוען...
        </div>
      )}

      {!loading && viewMode === 'month' && (
        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          onDateClick={handleDateClick}
          getDayContent={getDayContent}
        />
      )}

      {!loading && viewMode === 'week' && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
            📅 השבוע
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {getWeekDays().map((day) => {
              const daySessions = getSessionsForDate(day.date)
              return (
                <div
                  key={day.date}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: daySessions.length > 0 ? '12px' : '0'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                        {day.dayName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {day.dayNum}.{String(day.dateObj.getMonth() + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Handle add group action
                        console.log('Add group for', day.date)
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--blue)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      ➕ הוסף קבוצה
                    </button>
                  </div>

                  {daySessions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {daySessions.map(session => (
                        <div
                          key={session.id}
                          onClick={() => {
                            setSelectedSession(session)
                            setDetailModalOpen(true)
                          }}
                          style={{
                            background: 'var(--bg2)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                          <div
                            style={{
                              width: '3px',
                              height: '40px',
                              borderRadius: '2px',
                              background: session.groups?.color || '#3b82f6',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>
                              {session.groups?.name || 'קבוצה'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              {session.start_time || 'אין שעה'} • {session.coaches?.name || 'לא מוגדר'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--muted)', fontSize: '12px', padding: '8px 0' }}>
                      אין פעילויות
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && viewMode === 'day' && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
            📋 אירועים
          </h2>
          {filteredSessions.length === 0 ? (
            <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
              אין אירועים
            </div>
          ) : (
            <div>
              {filteredSessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session)
                    setDetailModalOpen(true)
                  }}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
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

      <SessionDetailModal
        session={selectedSession}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        coachId={coach?.id}
        onAttendanceUpdate={handleAttendanceUpdate}
        onSubstituteRequest={handleSubstituteRequest}
        onDecline={handleDecline}
        onEditSailors={handleEditSailors}
      />

      <SailorManagementModal
        session={selectedSession}
        isOpen={sailorModalOpen}
        onClose={() => setSailorModalOpen(false)}
      />

      <SubstituteCoachModal
        session={selectedSession}
        isOpen={substituteModalOpen}
        onClose={() => setSubstituteModalOpen(false)}
      />
    </div>
  )
}
