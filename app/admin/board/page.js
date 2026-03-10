'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/src/hooks/useAuth'
import { Calendar } from '@/src/components/Calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar as CalendarIcon } from 'lucide-react'

const HEBREW_DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

const toDateStr = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function AdminBoardPage() {
  const { coach } = useAuth()
  const [sessions, setSessions] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [boardDataError, setBoardDataError] = useState('')

  const loadBoardData = useCallback(async () => {
    setLoading(true)
    setBoardDataError('')
    try {
      const [sessionsRes, groupsRes] = await Promise.all([
        fetch('/api/sessions?include_details=true'),
        fetch('/api/groups'),
      ])
      const sessionsData = await sessionsRes.json()
      const groupsData = await groupsRes.json()

      if (!sessionsRes.ok) {
        console.error('Sessions API error:', sessionsRes.status, sessionsData)
        setSessions([])
        setBoardDataError('شگیاه بטעינת הפעילויות. הלוח מוצג חלקית.')
      } else if (Array.isArray(sessionsData)) {
        setSessions(sessionsData)
      } else {
        setSessions([])
      }

      if (!groupsRes.ok) {
        console.error('Groups API error:', groupsRes.status, groupsData)
        setGroups([])
        setBoardDataError((prev) => prev || 'שגיאה בטעינת הקבוצות. הלוח מוצג חלקית.')
      } else if (Array.isArray(groupsData)) {
        setGroups(groupsData)
      } else {
        setGroups([])
      }
    } catch (error) {
      console.error('Error loading board data:', error)
      setSessions([])
      setGroups([])
      setBoardDataError('שגיאה בטעינת הלוח. נסה לרענן את הדף.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBoardData()
  }, [loadBoardData])

  const mergedSessions = useMemo(() => {
    const realSessions = Array.isArray(sessions) ? sessions : []
    const allGroups = Array.isArray(groups) ? groups : []
    const today = new Date()
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const anchors = [monthStart, weekStart, today]
    const anchorsEnd = [monthEnd, weekEnd, today]
    const rangeStart = new Date(Math.min(...anchors.map((d) => d.getTime())))
    const rangeEnd = new Date(Math.max(...anchorsEnd.map((d) => d.getTime())))

    const existingKeys = new Set(
      realSessions
        .filter((s) => s.group_id && s.date)
        .map((s) => `${s.group_id}__${s.date}`)
    )

    const virtualSessions = []
    for (const group of allGroups) {
      const groupDays = Array.isArray(group.days_of_week) ? group.days_of_week : []
      const groupStart = group.start_date ? new Date(`${group.start_date}T12:00:00`) : null
      const iter = new Date(rangeStart)
      while (iter <= rangeEnd) {
        const dateStr = toDateStr(iter)
        const iterDow = iter.getDay()
        const afterStart = !groupStart || iter >= groupStart
        const isMatchingDay = groupDays.length > 0 ? groupDays.includes(iterDow) : dateStr === group.start_date
        const key = `${group.id}__${dateStr}`
        if (afterStart && isMatchingDay && !existingKeys.has(key)) {
          virtualSessions.push({
            id: `virtual-${group.id}-${dateStr}`,
            group_id: group.id,
            date: dateStr,
            coach_id: group.coach_id,
            start_time: group.start_time || '',
            end_time: group.end_time || '',
            groups: { name: group.name, color: group.color || '#3b82f6' },
            coaches: { name: 'לא מוגדר' },
            is_virtual: true,
          })
        }
        iter.setDate(iter.getDate() + 1)
      }
    }

    return [...realSessions, ...virtualSessions]
  }, [sessions, groups, currentDate])

  const getSessionsForDate = useCallback((dateStr) => {
    return mergedSessions.filter(s => s.date === dateStr)
  }, [mergedSessions])

  const weekDays = useMemo(() => {
    const today = currentDate
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)

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

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold mb-1 flex items-center gap-2"><CalendarIcon size={24} /> לוח כללי</h1>
        <p className="text-muted-foreground text-sm">
          ברוכים הבאים, {coach?.name}!
        </p>
      </div>

      <div className="flex justify-center py-2 sm:py-3 gap-2 mb-4" dir="rtl">
        <Button
          variant={viewMode === 'month' ? 'default' : 'outline'}
          onClick={() => setViewMode('month')}
          className={viewMode === 'month' ? 'bg-drc-blue-light text-white' : ''}
        >
          חודש
        </Button>
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          onClick={() => setViewMode('week')}
          className={viewMode === 'week' ? 'bg-drc-blue-light text-white' : ''}
        >
          שבוע
        </Button>
      </div>

      {boardDataError ? (
        <Alert className="mb-4">
          <AlertDescription>{boardDataError}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="text-center p-5 text-muted-foreground">טוען...</div>
      ) : null}

      {viewMode === 'month' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="h-9 w-9 p-0"
            >
              ←
            </Button>
            <h2 className="text-sm sm:text-base font-extrabold flex-1 text-center">
              {new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(currentDate)}
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="h-9 w-9 p-0"
            >
              →
            </Button>
          </div>
          {loading ? (
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
          ) : (
            <Calendar
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              getDayContent={(dateStr) => {
                const daySessions = getSessionsForDate(dateStr)
                if (daySessions.length === 0) return null
                return (
                  <div className="flex flex-col gap-1">
                    {daySessions.slice(0, 2).map((session) => (
                      <div
                        key={session.id}
                        className="text-[10px] px-1 py-0.5 rounded bg-secondary border border-border line-clamp-1"
                        style={{
                          backgroundColor: (session.groups?.color || '#3b82f6') + '20',
                          borderColor: session.groups?.color || '#3b82f6',
                        }}
                      >
                        {session.groups?.name || 'קבוצה'}
                      </div>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-[9px] text-muted-foreground text-center">
                        +{daySessions.length - 2}
                      </div>
                    )}
                  </div>
                )
              }}
            />
          )}
        </div>
      ) : null}

      {!loading && viewMode === 'week' ? (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const d = new Date(currentDate)
                d.setDate(d.getDate() - 7)
                setCurrentDate(d)
              }}
              className="h-9 w-9 p-0"
            >
              ←
            </Button>
            <h2 className="text-sm sm:text-base font-extrabold flex-1 text-center">השבוע</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const d = new Date(currentDate)
                d.setDate(d.getDate() + 7)
                setCurrentDate(d)
              }}
              className="h-9 w-9 p-0"
            >
              →
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {weekDays.map((day) => {
              const daySessions = getSessionsForDate(day.date)
              return (
                <Card key={day.date}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-sm font-bold">{day.dayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {day.dayNum}.{String(day.dateObj.getMonth() + 1).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                    {daySessions.length > 0 ? (
                      <div className="flex flex-col gap-2.5">
                        {daySessions.map(session => (
                          <div
                            key={session.id}
                            className="bg-secondary border border-border rounded-lg p-3 flex gap-3 items-center"
                          >
                            <div
                              className="w-[3px] h-10 rounded-sm shrink-0"
                              style={{ background: session.groups?.color || '#3b82f6' }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-semibold mb-0.5">
                                {session.groups?.name || 'קבוצה'}
                              </div>
                              <div className="text-xs text-muted-foreground mb-0.5">
                                {session.start_time && session.end_time
                                  ? `${session.start_time} - ${session.end_time}`
                                  : session.start_time || 'אין שעה'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                מדריך: {session.coaches?.name || 'לא מוגדר'}
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
    </div>
  )
}
