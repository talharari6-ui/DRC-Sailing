'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Calendar } from '@/src/components/Calendar'
import ViewModeToggle from '@/src/components/ViewModeToggle'
import FilterToggle from '@/src/components/FilterToggle'
import SessionDetailModal from '@/src/components/SessionDetailModal'
import SailorManagementModal from '@/src/components/SailorManagementModal'
import SubstituteCoachModal from '@/src/components/SubstituteCoachModal'
import { DAY_NAMES } from '@/src/lib/constants'

export default function SchedulePage() {
  const { coach } = useAuth()

  // Return loading state while coach data is being loaded
  if (!coach) {
    return <div style={{ padding: '20px', color: 'var(--muted)', textAlign: 'center' }}>טוען...</div>
  }

  // State
  const [viewMode, setViewMode] = useState('month') // month/week/day
  const [filterMode, setFilterMode] = useState('my') // my/all
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [sessions, setSessions] = useState([])
  const [coaches, setCoaches] = useState([])
  const [sailors, setSailors] = useState([])
  const [loading, setLoading] = useState(false)

  // Modal states
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showSailorModal, setShowSailorModal] = useState(false)
  const [showSubstituteModal, setShowSubstituteModal] = useState(false)

  // Load data when view/filter/date changes
  useEffect(() => {
    loadScheduleData()
  }, [coach, filterMode, viewMode, year, month, selectedDate])

  const loadScheduleData = async () => {
    if (!coach) return
    setLoading(true)
    try {
      // Load coaches for substitute modal
      const coachRes = await fetch('/api/coaches')
      const coachData = await coachRes.json()
      setCoaches(coachData.filter(c => c.id !== coach.id))

      // Determine date range based on view mode
      let dateFrom, dateTo
      const currentDate = new Date(year, month, selectedDate || 1)

      if (viewMode === 'day' && selectedDate) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
        dateFrom = dateStr
        dateTo = dateStr
      } else if (viewMode === 'week' && selectedDate) {
        const weekStart = new Date(currentDate)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        dateFrom = weekStart.toISOString().split('T')[0]
        dateTo = weekEnd.toISOString().split('T')[0]
      } else {
        // Month view
        dateFrom = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const lastDay = new Date(year, month + 1, 0).getDate()
        dateTo = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      }

      // Load sessions with details
      let sessUrl = `/api/sessions?include_details=true&date_from=${dateFrom}&date_to=${dateTo}`
      if (filterMode === 'my') {
        sessUrl += `&coach_id=${coach.id}`
      }

      const sessRes = await fetch(sessUrl)
      const sessData = await sessRes.json()
      setSessions(sessData)

      // Load sailors for current session if any
      if (selectedSession && selectedSession.id) {
        const sailorRes = await fetch(`/api/groups/${selectedSession.group_id}/sailors`)
        const sailorData = await sailorRes.json()
        setSailors(sailorData)
      }
    } catch (error) {
      console.error('Error loading schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (dateStr) => {
    const day = parseInt(dateStr.split('-')[2])
    setSelectedDate(day)
    if (viewMode === 'day') {
      // Show sessions for this day
    }
  }

  const handleSessionClick = async (session) => {
    setSelectedSession(session)
    // Load sailors for this session
    try {
      const sailorRes = await fetch(`/api/groups/${session.group_id}/sailors`)
      const sailorData = await sailorRes.json()
      setSailors(sailorData)
    } catch (error) {
      console.error('Error loading sailors:', error)
    }
    setShowSessionModal(true)
  }

  const handleAttendanceUpdate = async (sessionId, sailorId, present, reason) => {
    try {
      await fetch(`/api/sessions/${sessionId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sailor_id: sailorId, present, absence_reason: reason })
      })
      loadScheduleData()
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }

  const handleSubstituteRequest = async (sessionId) => {
    setShowSessionModal(false)
    setShowSubstituteModal(true)
  }

  const handleSubstituteSelect = async (sessionId, coachId) => {
    try {
      await fetch(`/api/sessions/${sessionId}/substitute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_id: coachId })
      })
      loadScheduleData()
    } catch (error) {
      console.error('Error requesting substitute:', error)
    }
  }

  const handleAddSailor = async (groupId, sailorId, newSailorData) => {
    try {
      await fetch(`/api/groups/${groupId}/sailors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sailor_id: sailorId,
          new_sailor: newSailorData
        })
      })
      loadScheduleData()
    } catch (error) {
      console.error('Error adding sailor:', error)
    }
  }

  const handleRemoveSailor = async (groupId, sailorId) => {
    try {
      await fetch(`/api/groups/${groupId}/sailors?sailor_id=${sailorId}`, {
        method: 'DELETE'
      })
      loadScheduleData()
    } catch (error) {
      console.error('Error removing sailor:', error)
    }
  }

  const handleDecline = async (sessionId) => {
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelled: true })
      })
      setShowSessionModal(false)
      loadScheduleData()
    } catch (error) {
      console.error('Error declining session:', error)
    }
  }

  const getDayContent = (dateStr) => {
    const daySessions = sessions.filter(s => s.date === dateStr)
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', flex: 1 }}>
        {daySessions.map(session => (
          <div
            key={session.id}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: session.groups?.color || '#3b82f6',
              flexShrink: 0,
            }}
            title={session.groups?.name}
          />
        ))}
      </div>
    )
  }

  const getDisplaySessions = () => {
    if (viewMode === 'day' && selectedDate) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
      return sessions.filter(s => s.date === dateStr)
    }
    return sessions
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

      {/* View & Filter Toggle */}
      <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
      <FilterToggle currentFilter={filterMode} onFilterChange={setFilterMode} />

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          טוען...
        </div>
      )}

      {!loading && (
        <>
          {/* Calendar View */}
          {viewMode === 'month' && (
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
              onDateClick={handleDateClick}
              getDayContent={getDayContent}
            />
          )}

          {/* Sessions List */}
          <div style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
              📋 אירועים
            </h2>
            {getDisplaySessions().length === 0 ? (
              <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                אין אירועים בתאריך זה
              </div>
            ) : (
              <div>
                {getDisplaySessions().map(session => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionClick(session)}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
                        {session.groups?.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                        {session.date} • {session.start_time || 'אין שעה'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        מדריך: {session.coaches?.name || 'לא מוגדר'}
                      </div>
                    </div>
                    {session.cancelled && (
                      <div style={{ fontSize: '12px', color: '#f44336', fontWeight: '600' }}>
                        בוטל
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        coachId={coach?.id}
        onAttendanceUpdate={handleAttendanceUpdate}
        onSubstituteRequest={handleSubstituteRequest}
        onDecline={handleDecline}
        onEditSailors={() => setShowSailorModal(true)}
      />

      <SailorManagementModal
        groupId={selectedSession?.group_id}
        isOpen={showSailorModal}
        onClose={() => setShowSailorModal(false)}
        sailors={sailors}
        onAddSailor={handleAddSailor}
        onRemoveSailor={handleRemoveSailor}
        availableSailors={[]}
      />

      <SubstituteCoachModal
        sessionId={selectedSession?.id}
        isOpen={showSubstituteModal}
        onClose={() => setShowSubstituteModal(false)}
        coaches={coaches}
        onSubstituteSelect={handleSubstituteSelect}
      />
    </div>
  )
}
