'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/src/hooks/useAuth'
import ViewModeToggle from '@/src/components/ViewModeToggle'
import FilterToggle from '@/src/components/FilterToggle'
import { Calendar } from '@/src/components/Calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const SessionDetailModal = dynamic(() => import('@/src/components/SessionDetailModal'), { ssr: false })
const SailorManagementModal = dynamic(() => import('@/src/components/SailorManagementModal'), { ssr: false })
const SubstituteCoachModal = dynamic(() => import('@/src/components/SubstituteCoachModal'), { ssr: false })

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const DAY_TOGGLE_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const GROUP_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toHebrewDate(date) {
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

function getColorClass(color) {
  switch ((color || '').toLowerCase()) {
    case '#10b981':
      return 'bg-emerald-500'
    case '#f59e0b':
      return 'bg-amber-500'
    case '#ef4444':
      return 'bg-red-500'
    case '#8b5cf6':
      return 'bg-violet-500'
    case '#06b6d4':
      return 'bg-cyan-500'
    case '#ec4899':
      return 'bg-pink-500'
    case '#3b82f6':
    default:
      return 'bg-blue-500'
  }
}

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

  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [groupSaving, setGroupSaving] = useState(false)
  const [groupError, setGroupError] = useState('')
  const [groupSuccess, setGroupSuccess] = useState('')
  const [groupForm, setGroupForm] = useState({
    name: '',
    color: GROUP_COLORS[0],
    start_date: '',
    days_of_week: [],
    start_time: '',
    end_time: '',
  })

  const loadSessions = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterMode === 'my') {
        return s.coach_id === coach?.id || s.substitute_coach_id === coach?.id
      }
      return true
    })
  }, [sessions, filterMode, coach?.id])

  const getSessionsForDate = useCallback((dateStr) => {
    return filteredSessions
      .filter((s) => s.date === dateStr)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  }, [filteredSessions])

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate)
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = new Date(start)
      dateObj.setDate(start.getDate() + i)
      return {
        date: toDateKey(dateObj),
        dayName: DAY_NAMES[dateObj.getDay()],
        dayNum: dateObj.getDate(),
        dateObj,
      }
    })
  }, [currentDate])

  const currentDayKey = useMemo(() => toDateKey(currentDate), [currentDate])
  const currentDaySessions = useMemo(() => getSessionsForDate(currentDayKey), [getSessionsForDate, currentDayKey])

  const weekRangeLabel = useMemo(() => {
    const start = weekDays[0]?.dateObj
    const end = weekDays[6]?.dateObj
    if (!start || !end) return ''

    const startLabel = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(start)
    const endLabel = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(end)
    return `${startLabel} - ${endLabel}`
  }, [weekDays])

  const getDayContent = (dateStr) => {
    const daySessions = getSessionsForDate(dateStr)
    if (daySessions.length === 0) return null

    return (
      <div className="text-xs flex flex-col gap-0.5">
        {daySessions.slice(0, 2).map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setSelectedSession(s)
              setDetailModalOpen(true)
            }}
            className={cn(
              'text-white px-1 py-0.5 rounded-sm cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap',
              getColorClass(s.groups?.color)
            )}
          >
            {s.groups?.name?.substring(0, 8)}
          </div>
        ))}
        {daySessions.length > 2 ? (
          <div className="text-xs text-muted-foreground">+{daySessions.length - 2}</div>
        ) : null}
      </div>
    )
  }

  const handleDateClick = (dateStr) => {
    const daySession = getSessionsForDate(dateStr)
    if (daySession.length === 1) {
      setSelectedSession(daySession[0])
      setDetailModalOpen(true)
      return
    }

    if (daySession.length > 1) {
      setViewMode('day')
      setCurrentDate(new Date(`${dateStr}T12:00:00`))
    }
  }

  const handleAttendanceUpdate = async (sessionId, sailorId, present, reason) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sailor_id: sailorId, present, reason }),
      })
      if (!res.ok) throw new Error('Failed to update attendance')
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }

  const handleSubstituteRequest = (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId)
    setSelectedSession(session)
    setDetailModalOpen(false)
    setSubstituteModalOpen(true)
  }

  const handleEditSailors = (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId)
    setSelectedSession(session)
    setDetailModalOpen(false)
    setSailorModalOpen(true)
  }

  const handleDecline = async (sessionId) => {
    console.log('Session declined:', sessionId)
    setDetailModalOpen(false)
  }

  const openAddGroupModal = (dateObj) => {
    setGroupError('')
    setGroupSuccess('')
    setGroupForm({
      name: '',
      color: GROUP_COLORS[0],
      start_date: toDateKey(dateObj),
      days_of_week: [dateObj.getDay()],
      start_time: '',
      end_time: '',
    })
    setGroupModalOpen(true)
  }

  const toggleGroupDay = (dayIndex) => {
    setGroupForm((prev) => {
      const exists = prev.days_of_week.includes(dayIndex)
      const nextDays = exists
        ? prev.days_of_week.filter((d) => d !== dayIndex)
        : [...prev.days_of_week, dayIndex].sort((a, b) => a - b)

      return { ...prev, days_of_week: nextDays }
    })
  }

  const createGroup = async (e) => {
    e.preventDefault()
    setGroupError('')
    setGroupSuccess('')

    if (!groupForm.name.trim()) {
      setGroupError('יש להזין שם קבוצה')
      return
    }

    if (groupForm.days_of_week.length === 0) {
      setGroupError('יש לבחור לפחות יום פעילות אחד')
      return
    }

    try {
      setGroupSaving(true)
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupForm.name.trim(),
          coach_id: coach.id,
          color: groupForm.color,
          start_date: groupForm.start_date,
          days_of_week: groupForm.days_of_week,
          start_time: groupForm.start_time || '',
          end_time: groupForm.end_time || '',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'שמירת הקבוצה נכשלה')
      }

      setGroupSuccess('הקבוצה נוספה בהצלחה')
      setGroupModalOpen(false)
      await loadSessions()
    } catch (error) {
      setGroupError(error.message)
    } finally {
      setGroupSaving(false)
    }
  }

  if (!coach) {
    return <div className="p-5 text-muted-foreground text-center">טוען...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold mb-1">📅 לוח אימונים</h1>
        <p className="text-muted-foreground text-sm">ברוכים הבאים, {coach?.name}!</p>
      </div>

      <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
      <FilterToggle currentFilter={filterMode} onFilterChange={setFilterMode} />

      {loading ? <div className="text-center p-5 text-muted-foreground">טוען...</div> : null}
      {groupSuccess ? <div className="text-xs text-drc-green mb-3">{groupSuccess}</div> : null}

      {!loading && viewMode === 'month' ? (
        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          onDateClick={handleDateClick}
          getDayContent={getDayContent}
        />
      ) : null}

      {!loading && viewMode === 'week' ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2.5 px-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}>
              →
            </Button>
            <div className="flex-1 text-center">
              <div className="text-sm font-bold">השבוע הנוכחי</div>
              <div className="text-xs text-muted-foreground">{weekRangeLabel}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}>
              ←
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {weekDays.map((day) => {
              const daySessions = getSessionsForDate(day.date)
              return (
                <Card key={day.date}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="text-right"
                        onClick={() => {
                          setCurrentDate(day.dateObj)
                          setViewMode('day')
                        }}
                      >
                        <div className="text-sm font-bold">{day.dayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {day.dayNum}.{String(day.dateObj.getMonth() + 1).padStart(2, '0')}
                        </div>
                      </button>
                    </div>

                    <div className="relative mt-3 mb-3">
                      <div className="border-t border-border" />
                      <Button
                        size="sm"
                        className="absolute -top-3 left-0 h-6 px-2 text-xs"
                        onClick={() => openAddGroupModal(day.dateObj)}
                      >
                        + קבוצה
                      </Button>
                    </div>

                    {daySessions.length > 0 ? (
                      <div className="flex flex-col gap-2.5 pt-1">
                        {daySessions.map((session) => (
                          <div
                            key={session.id}
                            onClick={() => {
                              setSelectedSession(session)
                              setDetailModalOpen(true)
                            }}
                            className="bg-secondary border border-border rounded-lg p-3 cursor-pointer hover:opacity-80 transition-opacity flex gap-3 items-center"
                          >
                            <div className={cn('w-[3px] h-10 rounded-sm shrink-0', getColorClass(session.groups?.color))} />

                            <div className="flex-1">
                              <div className="text-sm font-semibold mb-0.5">{session.groups?.name || 'קבוצה'}</div>
                              <div className="text-xs text-muted-foreground">
                                {session.start_time || 'אין שעה'} • {session.coaches?.name || 'לא מוגדר'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-xs py-2">אין פעילויות</div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : null}

      {!loading && viewMode === 'day' ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2.5 px-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}>
              →
            </Button>
            <div className="flex-1 text-center">
              <div className="text-sm font-bold">תצוגת יום</div>
              <div className="text-xs text-muted-foreground">{toHebrewDate(currentDate)}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}>
              ←
            </Button>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={() => openAddGroupModal(currentDate)}>
              הוסף קבוצה ליום זה
            </Button>
          </div>

          {currentDaySessions.length === 0 ? (
            <div className="text-muted-foreground text-center p-5">אין אירועים ביום זה</div>
          ) : (
            <div className="space-y-3">
              {currentDaySessions.map((session) => (
                <Card
                  key={session.id}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedSession(session)
                    setDetailModalOpen(true)
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn('w-1 h-14 rounded-sm shrink-0', getColorClass(session.groups?.color))} />

                    <div className="flex-1">
                      <div className="text-sm font-bold mb-1">{session.groups?.name || 'קבוצה'}</div>
                      <div className="text-xs text-muted-foreground mb-1">{session.date} • {session.start_time || 'אין שעה'}</div>
                      <div className="text-xs text-muted-foreground">מדריך: {session.coaches?.name || 'לא מוגדר'}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">🏡 קבוצה חדשה</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={createGroup}>
            <div>
              <Label>שם הקבוצה *</Label>
              <Input
                value={groupForm.name}
                onChange={(e) => setGroupForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="לדוגמה: אופטימיסט מתקדמים"
                required
              />
            </div>

            <div>
              <Label>צבע</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {GROUP_COLORS.map((color) => {
                  const isSelected = groupForm.color === color
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setGroupForm((s) => ({ ...s, color }))}
                      className={cn(
                        'h-8 w-8 rounded-full ring-2 transition-all',
                        getColorClass(color),
                        isSelected ? 'ring-white scale-105' : 'ring-transparent'
                      )}
                      aria-label={`בחר צבע ${color}`}
                    />
                  )
                })}
              </div>
            </div>

            <div>
              <Label>ימי פעילות</Label>
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {DAY_TOGGLE_LABELS.map((label, dayIndex) => {
                  const active = groupForm.days_of_week.includes(dayIndex)
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleGroupDay(dayIndex)}
                      className={`h-8 rounded-md text-xs font-bold border transition-colors ${active ? 'bg-blue-600 text-white border-blue-500' : 'bg-background text-muted-foreground border-border hover:bg-secondary'}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label>שעות פעילות</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={groupForm.start_time}
                  onChange={(e) => setGroupForm((s) => ({ ...s, start_time: e.target.value }))}
                />
                <Input
                  type="time"
                  value={groupForm.end_time}
                  onChange={(e) => setGroupForm((s) => ({ ...s, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>תאריך תחילת פעילות</Label>
              <Input
                type="date"
                value={groupForm.start_date}
                onChange={(e) => setGroupForm((s) => ({ ...s, start_date: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground mt-1">הקבוצה תופיע בלוח מתאריך זה</p>
            </div>

            {groupError ? <div className="text-xs text-red-400">{groupError}</div> : null}

            <Button type="submit" className="w-full" disabled={groupSaving}>
              {groupSaving ? 'שומר...' : 'צור קבוצה'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
