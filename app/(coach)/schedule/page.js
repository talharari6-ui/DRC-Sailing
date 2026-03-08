'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/src/hooks/useAuth'
import ViewModeToggle from '@/src/components/ViewModeToggle'
import FilterToggle from '@/src/components/FilterToggle'
import { Calendar } from '@/src/components/Calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Plus, ClipboardList } from 'lucide-react'

const SessionDetailModal = dynamic(() => import('@/src/components/SessionDetailModal'), { ssr: false })
const SailorManagementModal = dynamic(() => import('@/src/components/SailorManagementModal'), { ssr: false })
const SubstituteCoachModal = dynamic(() => import('@/src/components/SubstituteCoachModal'), { ssr: false })

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

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (filterMode === 'my') {
        return s.coach_id === coach?.id || s.substitute_coach_id === coach?.id
      }
      return true
    })
  }, [sessions, filterMode, coach?.id])

  const getSessionsForDate = useCallback((dateStr) => {
    return filteredSessions.filter(s => s.date === dateStr)
  }, [filteredSessions])

  const getDayContent = (dateStr) => {
    const daySessions = getSessionsForDate(dateStr)
    if (daySessions.length === 0) return null

    return (
      <div className="text-xs flex flex-col gap-0.5">
        {daySessions.slice(0, 2).map(s => (
          <div
            key={s.id}
            onClick={() => {
              setSelectedSession(s)
              setDetailModalOpen(true)
            }}
            className="text-white px-1 py-0.5 rounded-sm cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ background: s.groups?.color || '#3b82f6' }}
          >
            {s.groups?.name?.substring(0, 5)}
          </div>
        ))}
        {daySessions.length > 2 ? (
          <div className="text-xs text-muted-foreground">
            +{daySessions.length - 2}
          </div>
        ) : null}
      </div>
    )
  }

  const handleDateClick = (dateStr) => {
    const daySession = getSessionsForDate(dateStr)
    if (daySession.length === 1) {
      setSelectedSession(daySession[0])
      setDetailModalOpen(true)
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

  const weekDays = useMemo(() => {
    const today = currentDate
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek) // Go back to most recent Sunday

    const days = []
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      days.push({
        date: dateStr,
        dayName: dayNames[date.getDay()],
        dayNum: date.getDate(),
        dateObj: date
      })
    }
    return days
  }, [currentDate])

  if (!coach) {
    return <div className="p-5 text-muted-foreground text-center">טוען...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold mb-1 flex items-center gap-2"><CalendarIcon size={24} /> לוח שנתי</h1>
        <p className="text-muted-foreground text-sm">
          ברוכים הבאים, {coach?.name}!
        </p>
      </div>

      <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
      <FilterToggle currentFilter={filterMode} onFilterChange={setFilterMode} />

      {loading ? (
        <div className="text-center p-5 text-muted-foreground">טוען...</div>
      ) : null}

      {!loading && viewMode === 'month' ? (
        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          onDateClick={handleDateClick}
          getDayContent={getDayContent}
        />
      ) : null}

      {!loading && viewMode === 'week' ? (
        <div className="mt-6">
          <h2 className="text-base font-extrabold mb-3 flex items-center gap-2"><CalendarIcon size={20} /> השבוע</h2>
          <div className="flex flex-col gap-3">
            {weekDays.map((day) => {
              const daySessions = getSessionsForDate(day.date)
              return (
                <Card key={day.date}>
                  <CardContent className="p-4">
                    <div className={`flex justify-between items-center ${daySessions.length > 0 ? 'mb-3' : ''}`}>
                      <div>
                        <div className="text-sm font-bold">{day.dayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {day.dayNum}.{String(day.dateObj.getMonth() + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => console.log('Add group for', day.date)}>
                        <Plus size={16} className="inline" /> הוסף קבוצה
                      </Button>
                    </div>

                    {daySessions.length > 0 ? (
                      <div className="flex flex-col gap-2.5">
                        {daySessions.map(session => (
                          <div
                            key={session.id}
                            onClick={() => {
                              setSelectedSession(session)
                              setDetailModalOpen(true)
                            }}
                            className="bg-secondary border border-border rounded-lg p-3 cursor-pointer hover:opacity-80 transition-opacity flex gap-3 items-center"
                          >
                            <div
                              className="w-[3px] h-10 rounded-sm shrink-0"
                              style={{ background: session.groups?.color || '#3b82f6' }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-semibold mb-0.5">
                                {session.groups?.name || 'קבוצה'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {session.start_time || 'אין שעה'} • {session.coaches?.name || 'לא מוגדר'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-xs py-2">
                        אין פעילויות
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : null}

      {!loading && viewMode === 'day' ? (
        <div className="mt-6">
          <h2 className="text-base font-extrabold mb-3 flex items-center gap-2"><ClipboardList size={20} /> אירועים</h2>
          {filteredSessions.length === 0 ? (
            <div className="text-muted-foreground text-center p-5">אין אירועים</div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map(session => (
                <Card
                  key={session.id}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedSession(session)
                    setDetailModalOpen(true)
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className="w-1 h-14 rounded-sm shrink-0"
                      style={{ background: session.groups?.color || '#3b82f6' }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-bold mb-1">
                        {session.groups?.name || 'קבוצה'}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {session.date} • {session.start_time || 'אין שעה'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        מדריך: {session.coaches?.name || 'לא מוגדר'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : null}

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
