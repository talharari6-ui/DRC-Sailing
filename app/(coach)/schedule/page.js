'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/src/hooks/useAuth'
import { Calendar } from '@/src/components/Calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const SessionDetailModal = dynamic(() => import('@/src/components/SessionDetailModal'), { ssr: false })
const SailorManagementModal = dynamic(() => import('@/src/components/SailorManagementModal'), { ssr: false })
const SubstituteCoachModal = dynamic(() => import('@/src/components/SubstituteCoachModal'), { ssr: false })

const DAY_NAMES = ['\u05e8\u05d0\u05e9\u05d5\u05df', '\u05e9\u05e0\u05d9', '\u05e9\u05dc\u05d9\u05e9\u05d9', '\u05e8\u05d1\u05d9\u05e2\u05d9', '\u05d7\u05de\u05d9\u05e9\u05d9', '\u05e9\u05d9\u05e9\u05d9', '\u05e9\u05d1\u05ea']
const DAY_SHORT = ['\u05d0', '\u05d1', '\u05d2', '\u05d3', '\u05d4', '\u05d5', '\u05e9']
const GROUP_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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

function parseGroupTimeInput(value) {
  if (!value) return ''
  const digits = String(value).replace(/\D/g, '')
  if (!digits) return ''

  let hour = null
  let minute = 0

  if (digits.length <= 2) {
    hour = Number(digits)
    if (hour >= 1 && hour <= 6) hour += 12
  } else if (digits.length === 3) {
    hour = Number(digits.slice(0, 1))
    minute = Number(digits.slice(1, 3))
  } else {
    hour = Number(digits.slice(0, 2))
    minute = Number(digits.slice(2, 4))
  }

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function toMinutes(timeValue) {
  if (!timeValue) return null
  const [h, m] = timeValue.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export default function SchedulePage() {
  const { coach } = useAuth()
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
      if (!res.ok) throw new Error(data?.error || '\u05e0\u05db\u05e9\u05dc\u05d4 \u05d8\u05e2\u05d9\u05e0\u05ea \u05d4\u05dc\u05d5\u05d7')
      setSessions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
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
      const groupCoachId = s.groups?.coach_id || s.coach_id
      if (filterMode === 'my') {
        return groupCoachId === coach?.id || s.substitute_coach_id === coach?.id
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
      setGroupError('\u05d9\u05e9 \u05dc\u05d4\u05d6\u05d9\u05df \u05e9\u05dd \u05e7\u05d1\u05d5\u05e6\u05d4')
      return
    }

    if (groupForm.days_of_week.length === 0) {
      setGroupError('\u05d9\u05e9 \u05dc\u05d1\u05d7\u05d5\u05e8 \u05dc\u05e4\u05d7\u05d5\u05ea \u05d9\u05d5\u05dd \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea \u05d0\u05d7\u05d3')
      return
    }

    const normalizedStartTime = parseGroupTimeInput(groupForm.start_time)
    const normalizedEndTime = parseGroupTimeInput(groupForm.end_time)

    if ((groupForm.start_time && normalizedStartTime === null) || (groupForm.end_time && normalizedEndTime === null)) {
      setGroupError('\u05e4\u05d5\u05e8\u05de\u05d8 \u05e9\u05e2\u05d4 \u05dc\u05d0 \u05ea\u05e7\u05d9\u05df. \u05d0\u05e4\u05e9\u05e8 \u05dc\u05d4\u05d6\u05d9\u05df 1, 13 \u05d0\u05d5 1300')
      return
    }

    if ((normalizedStartTime && !normalizedEndTime) || (!normalizedStartTime && normalizedEndTime)) {
      setGroupError('\u05d9\u05e9 \u05dc\u05d4\u05d6\u05d9\u05df \u05d2\u05dd \u05e9\u05e2\u05ea \u05d4\u05ea\u05d7\u05dc\u05d4 \u05d5\u05d2\u05dd \u05e9\u05e2\u05ea \u05e1\u05d9\u05d5\u05dd')
      return
    }

    if (normalizedStartTime && normalizedEndTime) {
      const minAllowed = 7 * 60
      const maxAllowed = 22 * 60
      const startMinutes = toMinutes(normalizedStartTime)
      const endMinutes = toMinutes(normalizedEndTime)

      if (startMinutes < minAllowed || startMinutes > maxAllowed || endMinutes < minAllowed || endMinutes > maxAllowed) {
        setGroupError('\u05e9\u05e2\u05d5\u05ea \u05d4\u05e4\u05e2\u05d9\u05dc\u05d5\u05ea \u05d7\u05d9\u05d9\u05d1\u05d5\u05ea \u05dc\u05d4\u05d9\u05d5\u05ea \u05d1\u05d9\u05df 07:00 \u05dc-22:00')
        return
      }

      if (endMinutes <= startMinutes) {
        setGroupError('\u05e9\u05e2\u05ea \u05d4\u05e1\u05d9\u05d5\u05dd \u05d7\u05d9\u05d9\u05d1\u05ea \u05dc\u05d4\u05d9\u05d5\u05ea \u05d0\u05d7\u05e8\u05d9 \u05e9\u05e2\u05ea \u05d4\u05d4\u05ea\u05d7\u05dc\u05d4')
        return
      }
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
          start_time: normalizedStartTime || '',
          end_time: normalizedEndTime || '',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '\u05e0\u05db\u05e9\u05dc\u05d4 \u05d9\u05e6\u05d9\u05e8\u05ea \u05d4\u05e7\u05d1\u05d5\u05e6\u05d4')

      setGroupSuccess('\u05d4\u05e7\u05d1\u05d5\u05e6\u05d4 \u05e0\u05d5\u05e1\u05e4\u05d4 \u05d1\u05d4\u05e6\u05dc\u05d7\u05d4')
      setGroupModalOpen(false)
      await loadSessions()
    } catch (error) {
      setGroupError(error.message)
    } finally {
      setGroupSaving(false)
    }
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
    await fetch(`/api/sessions/${sessionId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sailor_id: sailorId, present, reason }),
    })
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

  if (!coach) return <div className="p-5 text-center text-muted-foreground">{ '\u05d8\u05d5\u05e2\u05df...' }</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold mb-1">{ '\u05dc\u05d5\u05d7 \u05d0\u05d9\u05de\u05d5\u05e0\u05d9\u05dd' }</h1>
        <p className="text-muted-foreground text-sm">{ '\u05d1\u05e8\u05d5\u05db\u05d9\u05dd \u05d4\u05d1\u05d0\u05d9\u05dd, ' }{coach?.name}</p>
      </div>

      <div className="flex gap-2 justify-center mb-2">
        <Button variant={viewMode === 'month' ? 'default' : 'outline'} onClick={() => setViewMode('month')}>{ '\u05d7\u05d5\u05d3\u05e9' }</Button>
        <Button variant={viewMode === 'week' ? 'default' : 'outline'} onClick={() => setViewMode('week')}>{ '\u05e9\u05d1\u05d5\u05e2' }</Button>
        <Button variant={viewMode === 'day' ? 'default' : 'outline'} onClick={() => setViewMode('day')}>{ '\u05d9\u05d5\u05dd' }</Button>
      </div>

      <div className="flex gap-2 justify-center mb-4">
        <Button variant={filterMode === 'all' ? 'default' : 'outline'} onClick={() => setFilterMode('all')}>{ '\u05db\u05dc \u05d4\u05de\u05d3\u05e8\u05d9\u05db\u05d9\u05dd' }</Button>
        <Button variant={filterMode === 'my' ? 'default' : 'outline'} onClick={() => setFilterMode('my')}>{ '\u05e9\u05dc\u05d9 \u05d1\u05dc\u05d1\u05d3' }</Button>
      </div>

      {loading ? <div className="text-center p-5 text-muted-foreground">{ '\u05d8\u05d5\u05e2\u05df...' }</div> : null}
      {groupSuccess ? <div className="text-xs text-drc-green mb-3">{groupSuccess}</div> : null}

      {!loading && viewMode === 'month' ? (
        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          onDateClick={handleDateClick}
          getDayContent={(dateStr) => {
            const daySessions = getSessionsForDate(dateStr)
            if (daySessions.length === 0) return null
            return (
              <div className="text-xs flex flex-col gap-0.5">
                {daySessions.slice(0, 2).map((s) => (
                  <div key={s.id} className={cn('text-white px-1 py-0.5 rounded-sm overflow-hidden text-ellipsis whitespace-nowrap', getColorClass(s.groups?.color))}>
                    {s.groups?.name?.substring(0, 8)}
                  </div>
                ))}
              </div>
            )
          }}
        />
      ) : null}

      {!loading && viewMode === 'week' ? (
        <div className="space-y-3">
          {weekDays.map((day) => {
            const daySessions = getSessionsForDate(day.date)
            return (
              <Card key={day.date}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">{day.dayName}</div>
                      <div className="text-xs text-muted-foreground">{day.dayNum}.{String(day.dateObj.getMonth() + 1).padStart(2, '0')}</div>
                    </div>
                    <Button size="sm" onClick={() => openAddGroupModal(day.dateObj)}>{ '+ \u05e7\u05d1\u05d5\u05e6\u05d4' }</Button>
                  </div>
                  <div className="mt-3">
                    {daySessions.length > 0 ? daySessions.map((session) => (
                      <div key={session.id} className="bg-secondary border border-border rounded-lg p-3 mt-2 cursor-pointer" onClick={() => { setSelectedSession(session); setDetailModalOpen(true) }}>
                        <div className="text-sm font-semibold">{session.groups?.name || '\u05e7\u05d1\u05d5\u05e6\u05d4'}</div>
                        <div className="text-xs text-muted-foreground">{session.start_time || '\u05d0\u05d9\u05df \u05e9\u05e2\u05d4'}</div>
                      </div>
                    )) : <div className="text-xs text-muted-foreground mt-2">{ '\u05d0\u05d9\u05df \u05e4\u05e2\u05d9\u05dc\u05d5\u05d9\u05d5\u05ea' }</div>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}

      {!loading && viewMode === 'day' ? (
        <div className="space-y-3">
          <div className="flex justify-end"><Button size="sm" onClick={() => openAddGroupModal(currentDate)}>{ '\u05d4\u05d5\u05e1\u05e3 \u05e7\u05d1\u05d5\u05e6\u05d4 \u05dc\u05d9\u05d5\u05dd \u05d6\u05d4' }</Button></div>
          {currentDaySessions.length === 0 ? <div className="text-muted-foreground text-center p-5">{ '\u05d0\u05d9\u05df \u05e4\u05e2\u05d9\u05dc\u05d5\u05d9\u05d5\u05ea \u05d1\u05d9\u05d5\u05dd \u05d6\u05d4' }</div> : currentDaySessions.map((session) => (
            <Card key={session.id} className="cursor-pointer" onClick={() => { setSelectedSession(session); setDetailModalOpen(true) }}>
              <CardContent className="p-4">
                <div className="text-sm font-bold">{session.groups?.name || '\u05e7\u05d1\u05d5\u05e6\u05d4'}</div>
                <div className="text-xs text-muted-foreground">{session.date} • {session.start_time || '\u05d0\u05d9\u05df \u05e9\u05e2\u05d4'}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{ '\u05e7\u05d1\u05d5\u05e6\u05d4 \u05d7\u05d3\u05e9\u05d4' }</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={createGroup}>
            <div><Label>{ '\u05e9\u05dd \u05d4\u05e7\u05d1\u05d5\u05e6\u05d4 *' }</Label><Input value={groupForm.name} onChange={(e) => setGroupForm((s) => ({ ...s, name: e.target.value }))} required /></div>
            <div><Label>{ '\u05e6\u05d1\u05e2' }</Label><div className="mt-2 flex flex-wrap gap-2">{GROUP_COLORS.map((color) => (
              <button key={color} type="button" onClick={() => setGroupForm((s) => ({ ...s, color }))} className={cn('h-8 w-8 rounded-full ring-2', getColorClass(color), groupForm.color === color ? 'ring-white' : 'ring-transparent')} />
            ))}</div></div>
            <div><Label>{ '\u05d9\u05de\u05d9 \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea' }</Label><div className="mt-2 grid grid-cols-7 gap-1.5">{DAY_SHORT.map((label, dayIndex) => {
              const active = groupForm.days_of_week.includes(dayIndex)
              return <button key={`${label}-${dayIndex}`} type="button" onClick={() => toggleGroupDay(dayIndex)} className={`h-8 rounded-md text-xs font-bold border ${active ? 'bg-blue-600 text-white border-blue-500' : 'bg-background text-muted-foreground border-border'}`}>{label}</button>
            })}</div></div>
            <div><Label>{ '\u05e9\u05e2\u05d5\u05ea \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea' }</Label><div className="mt-2 grid grid-cols-2 gap-2"><Input type="text" inputMode="numeric" value={groupForm.start_time} onChange={(e) => setGroupForm((s) => ({ ...s, start_time: e.target.value }))} /><Input type="text" inputMode="numeric" value={groupForm.end_time} onChange={(e) => setGroupForm((s) => ({ ...s, end_time: e.target.value }))} /></div></div>
            <div><Label>{ '\u05ea\u05d0\u05e8\u05d9\u05da \u05ea\u05d7\u05d9\u05dc\u05ea \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea' }</Label><Input type="date" value={groupForm.start_date} onChange={(e) => setGroupForm((s) => ({ ...s, start_date: e.target.value }))} /></div>
            {groupError ? <div className="text-xs text-red-400">{groupError}</div> : null}
            <Button type="submit" className="w-full" disabled={groupSaving}>{groupSaving ? '\u05e9\u05d5\u05de\u05e8...' : '\u05e6\u05d5\u05e8 \u05e7\u05d1\u05d5\u05e6\u05d4'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <SessionDetailModal
        session={selectedSession}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        coachId={coach?.id}
        isAdmin={!!coach?.is_admin}
        onAttendanceUpdate={handleAttendanceUpdate}
        onSubstituteRequest={handleSubstituteRequest}
        onRefresh={loadSessions}
        onEditSailors={handleEditSailors}
      />

      <SailorManagementModal session={selectedSession} isOpen={sailorModalOpen} onClose={() => setSailorModalOpen(false)} />

      <SubstituteCoachModal session={selectedSession} isOpen={substituteModalOpen} onClose={() => setSubstituteModalOpen(false)} onSuccess={loadSessions} />
    </div>
  )
}
