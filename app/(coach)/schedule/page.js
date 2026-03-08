'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/src/hooks/useAuth'
import ViewModeToggle from '@/src/components/ViewModeToggle'
import FilterToggle from '@/src/components/FilterToggle'
import { Calendar } from '@/src/components/Calendar'
import { GROUP_COLORS } from '@/src/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar as CalendarIcon, Plus, ClipboardList } from 'lucide-react'

const SessionDetailModal = dynamic(() => import('@/src/components/SessionDetailModal'), { ssr: false })
const SailorManagementModal = dynamic(() => import('@/src/components/SailorManagementModal'), { ssr: false })
const SubstituteCoachModal = dynamic(() => import('@/src/components/SubstituteCoachModal'), { ssr: false })
const HEBREW_DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

const normalizeTimeInput = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''

  let hours = 0
  let minutes = 0

  if (digits.length <= 2) {
    hours = Number(digits)
  } else if (digits.length === 3) {
    hours = Number(digits.slice(0, 1))
    minutes = Number(digits.slice(1))
  } else {
    const fourDigits = digits.slice(0, 4)
    hours = Number(fourDigits.slice(0, 2))
    minutes = Number(fourDigits.slice(2))
  }

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return ''
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return ''
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export default function SchedulePage() {
  const authResult = useAuth()
  const coach = authResult?.coach
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('week')
  const [filterMode, setFilterMode] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [sailorModalOpen, setSailorModalOpen] = useState(false)
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false)
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false)
  const [selectedGroupDay, setSelectedGroupDay] = useState(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6')
  const [newGroupDays, setNewGroupDays] = useState([])
  const [newGroupStartTime, setNewGroupStartTime] = useState('')
  const [newGroupEndTime, setNewGroupEndTime] = useState('')
  const [newGroupStartDate, setNewGroupStartDate] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [groupFormError, setGroupFormError] = useState('')
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date().toISOString().split('T')[0])
  const [managerRequestNotice, setManagerRequestNotice] = useState('')

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

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const todaySessions = useMemo(() => getSessionsForDate(todayDateStr), [getSessionsForDate, todayDateStr])
  const selectedMonthDateSessions = useMemo(
    () => getSessionsForDate(selectedMonthDate),
    [getSessionsForDate, selectedMonthDate]
  )

  const monthSelectedDateObj = useMemo(() => new Date(`${selectedMonthDate}T12:00:00`), [selectedMonthDate])
  const monthSelectedDay = useMemo(() => ({
    date: selectedMonthDate,
    dayName: HEBREW_DAY_NAMES[monthSelectedDateObj.getDay()],
    dayNum: monthSelectedDateObj.getDate(),
    monthNum: String(monthSelectedDateObj.getMonth() + 1).padStart(2, '0'),
    dateObj: monthSelectedDateObj,
  }), [monthSelectedDateObj, selectedMonthDate])

  const renderSessionActions = (session) => {
    const canManageSession = session.coach_id === coach?.id
    return (
      <div className="mt-2 space-y-2">
        <div className="text-xs text-muted-foreground mb-1">
          {canManageSession ? 'פעולות זמינות:' : 'רק מדריך הקבוצה יכול לבצע פעולות'}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            type="button"
            disabled={!canManageSession}
            onClick={() => {
              setSelectedSession(session)
              setDetailModalOpen(true)
            }}
          >
            מילוי נוכחות
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            disabled={!canManageSession}
            onClick={() => {
              setSelectedSession(session)
              setSailorModalOpen(true)
            }}
          >
            הוספה / הסרה חניכים
          </Button>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            disabled={!canManageSession}
            onClick={() => handlePostponeRequest(session)}
          >
            דחיית פעילות
          </Button>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            disabled={!canManageSession}
            onClick={() => handleSwitchRequest(session)}
          >
            פתיחה להחלפת מדריך
          </Button>
        </div>
        <div className="text-[11px] text-muted-foreground">
          דחייה/החלפה מחייבות אישור מנהל בטרמינל המנהל
        </div>
      </div>
    )
  }

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
    setSelectedMonthDate(dateStr)
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

  const handlePostponeRequest = (session) => {
    if (session.coach_id !== coach?.id) return
    setManagerRequestNotice(`בקשת דחייה נשלחה לאישור מנהל עבור ${session.groups?.name || 'קבוצה'}`)
  }

  const handleSwitchRequest = (session) => {
    if (session.coach_id !== coach?.id) return
    setManagerRequestNotice(`בקשת החלפה נשלחה לאישור מנהל עבור ${session.groups?.name || 'קבוצה'}`)
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


  const openAddGroupDialog = (day = null) => {
    setSelectedGroupDay(day)
    setNewGroupName('')
    setNewGroupColor('#3b82f6')
    setNewGroupDays(day?.dateObj ? [day.dateObj.getDay()] : [])
    setNewGroupStartTime('')
    setNewGroupEndTime('')
    setNewGroupStartDate(day?.date || '')
    setGroupFormError('')
    setAddGroupDialogOpen(true)
  }

  const toggleGroupDay = (dayIndex) => {
    setNewGroupDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    )
  }

  const handleCreateGroup = async () => {
    if (!coach?.id) return
    const trimmedName = newGroupName.trim()
    if (!trimmedName) {
      setGroupFormError('יש להזין שם קבוצה')
      return
    }

    setCreatingGroup(true)
    setGroupFormError('')
    try {
      const normalizedStart = normalizeTimeInput(newGroupStartTime)
      const normalizedEnd = normalizeTimeInput(newGroupEndTime)

      if ((newGroupStartTime && !normalizedStart) || (newGroupEndTime && !normalizedEnd)) {
        setGroupFormError('פורמט שעות לא תקין. לדוגמה: 10, 1030, 1300')
        setCreatingGroup(false)
        return
      }

      const payload = {
        name: trimmedName,
        coach_id: coach.id,
        color: newGroupColor,
        days_of_week: newGroupDays,
        start_time: normalizedStart,
        end_time: normalizedEnd,
        start_date: newGroupStartDate || null,
      }

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create group')
      const immediateDate = payload.start_date || selectedGroupDay?.date || null
      if (immediateDate) {
        const syntheticSession = {
          id: `new-group-${data.id}-${Date.now()}`,
          date: immediateDate,
          start_time: payload.start_time || '',
          coach_id: coach.id,
          groups: { name: data.name, color: data.color || payload.color || '#3b82f6' },
          coaches: { name: coach?.name || 'לא מוגדר' },
        }
        setSessions((prev) => [syntheticSession, ...prev])
      }

      setAddGroupDialogOpen(false)
    } catch (error) {
      console.error('Error creating group:', error)
      setGroupFormError('שגיאה ביצירת קבוצה חדשה')
    } finally {
      setCreatingGroup(false)
    }
  }

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
      {managerRequestNotice ? (
        <Alert className="mb-4">
          <AlertDescription>{managerRequestNotice}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="text-center p-5 text-muted-foreground">טוען...</div>
      ) : null}

      {!loading && viewMode === 'month' ? (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="flex items-center gap-3" dir="ltr">
                  <Button size="sm" onClick={() => openAddGroupDialog(monthSelectedDay)}>
                    <Plus size={16} className="inline" /> הוסף קבוצה
                  </Button>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </div>
              <div className="mb-3">
                <div className="text-sm font-bold">{monthSelectedDay.dayName}</div>
                <div className="text-xs text-muted-foreground">
                  {monthSelectedDay.dayNum}.{monthSelectedDay.monthNum} ({monthSelectedDay.date})
                </div>
              </div>
              {selectedMonthDateSessions.length === 0 ? (
                <div className="text-muted-foreground text-xs py-2">אין פעילויות ביום זה</div>
              ) : (
                <div className="space-y-3">
                  {selectedMonthDateSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-secondary border border-border rounded-lg p-3 flex gap-3 items-center"
                    >
                      <div
                        className="w-[3px] h-12 rounded-sm shrink-0"
                        style={{ background: session.groups?.color || '#3b82f6' }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold mb-0.5">{session.groups?.name || 'קבוצה'}</div>
                        <div className="text-xs text-muted-foreground">
                          {session.start_time || 'אין שעה'} • {session.coaches?.name || 'לא מוגדר'}
                        </div>
                        {renderSessionActions(session)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Calendar
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
            onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            onDateClick={handleDateClick}
            getDayContent={getDayContent}
          />
        </div>
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
                    <div className={`mb-3 ${daySessions.length > 0 ? '' : 'mb-2'}`}>
                      <div className="flex items-center gap-3" dir="ltr">
                        <Button size="sm" onClick={() => openAddGroupDialog(day)}>
                          <Plus size={16} className="inline" /> הוסף קבוצה
                        </Button>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    </div>
                    <div className={`flex justify-between items-center ${daySessions.length > 0 ? 'mb-3' : ''}`}>
                      <div>
                        <div className="text-sm font-bold">{day.dayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {day.dayNum}.{String(day.dateObj.getMonth() + 1).padStart(2, '0')} ({day.date})
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
                              <div className="text-xs text-muted-foreground">
                                {session.start_time || 'אין שעה'} • {session.coaches?.name || 'לא מוגדר'}
                              </div>
                              {renderSessionActions(session)}
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
          <h2 className="text-base font-extrabold mb-3 flex items-center gap-2"><ClipboardList size={20} /> היום</h2>
          {todaySessions.length === 0 ? (
            <div className="text-muted-foreground text-center p-5">אין פעילויות להיום</div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="mb-3">
                  <div className="flex items-center gap-3" dir="ltr">
                    <Button size="sm" onClick={() => openAddGroupDialog({
                      date: todayDateStr,
                      dayName: HEBREW_DAY_NAMES[new Date().getDay()],
                      dayNum: new Date().getDate(),
                      dateObj: new Date(),
                    })}>
                      <Plus size={16} className="inline" /> הוסף קבוצה
                    </Button>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                </div>
                <div className="space-y-3">
                  {todaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-secondary border border-border rounded-lg p-3 flex items-center gap-3"
                    >
                      <div
                        className="w-1 h-14 rounded-sm shrink-0"
                        style={{ background: session.groups?.color || '#3b82f6' }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold mb-1">{session.groups?.name || 'קבוצה'}</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {session.start_time || 'אין שעה'} • {session.coaches?.name || 'לא מוגדר'}
                        </div>
                        {renderSessionActions(session)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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

      <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>קבוצה חדשה</DialogTitle>
            <DialogDescription>
              {selectedGroupDay
                ? `הוספת קבוצה ליום ${selectedGroupDay.dayName} (${selectedGroupDay.dayNum}.${String(selectedGroupDay.dateObj.getMonth() + 1).padStart(2, '0')})`
                : 'מלא את פרטי הקבוצה החדשה'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="group-name">שם קבוצה</Label>
            <Input
              id="group-name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="שם קבוצה"
            />
            <div className="space-y-2">
              <Label htmlFor="group-color">צבע קבוצה</Label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  id="group-color"
                  type="color"
                  value={newGroupColor}
                  onChange={(e) => setNewGroupColor(e.target.value)}
                  className="h-10 w-16 p-1"
                />
                <span className="text-xs text-muted-foreground">{newGroupColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-6 w-6 rounded-full border-2 ${newGroupColor === color ? 'border-foreground' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewGroupColor(color)}
                    aria-label={`בחר צבע ${color}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>ימי פעילות הקבוצה</Label>
              <div className="flex flex-wrap gap-2">
                {HEBREW_DAY_NAMES.map((dayLabel, dayIndex) => (
                  <Button
                    key={dayIndex}
                    type="button"
                    size="sm"
                    variant={newGroupDays.includes(dayIndex) ? 'default' : 'outline'}
                    onClick={() => toggleGroupDay(dayIndex)}
                  >
                    {dayLabel}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>שעות פעילות</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  value={newGroupStartTime}
                  onChange={(e) => setNewGroupStartTime(e.target.value)}
                  onBlur={(e) => setNewGroupStartTime(normalizeTimeInput(e.target.value))}
                  placeholder="שעת התחלה (למשל 10 או 1030)"
                />
                <Input
                  type="text"
                  value={newGroupEndTime}
                  onChange={(e) => setNewGroupEndTime(e.target.value)}
                  onBlur={(e) => setNewGroupEndTime(normalizeTimeInput(e.target.value))}
                  placeholder="שעת סיום (למשל 13 או 1300)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-start-date">תאריך התחלה לפעילות</Label>
              <Input
                id="group-start-date"
                type="date"
                value={newGroupStartDate}
                onChange={(e) => setNewGroupStartDate(e.target.value)}
              />
            </div>
            {groupFormError ? (
              <p className="text-xs text-destructive">{groupFormError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGroupDialogOpen(false)} disabled={creatingGroup}>
              ביטול
            </Button>
            <Button onClick={handleCreateGroup} disabled={creatingGroup}>
              {creatingGroup ? 'יוצר קבוצה...' : 'צור קבוצה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
