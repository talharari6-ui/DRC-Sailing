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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar as CalendarIcon, Plus, ClipboardList } from 'lucide-react'

const SessionDetailModal = dynamic(() => import('@/src/components/SessionDetailModal'), { ssr: false })
const SailorManagementModal = dynamic(() => import('@/src/components/SailorManagementModal'), { ssr: false })
const HEBREW_DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const REQUEST_STATUS_STORAGE_KEY = 'coach-board-request-status'

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
const toDateStr = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function SchedulePage() {
  const authResult = useAuth()
  const coach = authResult?.coach
  const [sessions, setSessions] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('week')
  const [filterMode, setFilterMode] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [sailorModalOpen, setSailorModalOpen] = useState(false)
  const [groupSailors, setGroupSailors] = useState([])
  const [availableSailors, setAvailableSailors] = useState([])
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
  const [selectedDayDate, setSelectedDayDate] = useState(() => toDateStr(new Date()))
  const [managerRequestNotice, setManagerRequestNotice] = useState('')
  const [collapsedWeekDates, setCollapsedWeekDates] = useState({})
  const [requestStatusBySession, setRequestStatusBySession] = useState(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(window.localStorage.getItem(REQUEST_STATUS_STORAGE_KEY) || '{}') || {}
    } catch (error) {
      console.error('Error reading saved request statuses:', error)
      return {}
    }
  })
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
        setBoardDataError('שגיאה בטעינת הפעילויות. הלוח מוצג חלקית.')
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(REQUEST_STATUS_STORAGE_KEY, JSON.stringify(requestStatusBySession))
    } catch (error) {
      console.error('Error saving request statuses:', error)
    }
  }, [requestStatusBySession])

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

  const filteredSessions = useMemo(() => {
    return mergedSessions.filter(s => {
      if (filterMode === 'my') {
        return s.coach_id === coach?.id || s.substitute_coach_id === coach?.id
      }
      return true
    })
  }, [mergedSessions, filterMode, coach?.id])

  const getSessionsForDate = useCallback((dateStr) => {
    return filteredSessions.filter(s => s.date === dateStr)
  }, [filteredSessions])

  const dayViewSessions = useMemo(() => getSessionsForDate(selectedDayDate), [getSessionsForDate, selectedDayDate])
  const daySelectedDateObj = useMemo(() => new Date(`${selectedDayDate}T12:00:00`), [selectedDayDate])
  const daySelectedMeta = useMemo(() => ({
    date: selectedDayDate,
    dayName: HEBREW_DAY_NAMES[daySelectedDateObj.getDay()],
    dayNum: daySelectedDateObj.getDate(),
    monthNum: String(daySelectedDateObj.getMonth() + 1).padStart(2, '0'),
    dateObj: daySelectedDateObj,
  }), [selectedDayDate, daySelectedDateObj])
  const sortedByStartTime = (items) => {
    return [...items].sort((a, b) => (a.start_time || '99:99').localeCompare(b.start_time || '99:99'))
  }
  const getAttendanceSummary = (session) => {
    const records = Array.isArray(session?.attendance) ? session.attendance : []
    const attendedCount = records.filter((record) => record?.present === true).length
    const markedCount = records.filter((record) => typeof record?.present === 'boolean').length
    return {
      attendedCount,
      markedCount,
    }
  }
  const renderAttendanceIndicator = (session) => {
    const { attendedCount, markedCount } = getAttendanceSummary(session)
    return (
      <div className="shrink-0 min-w-[52px] text-left">
        <div className="rounded-md border border-border bg-background/60 px-2 py-1 text-[11px] font-semibold text-foreground">
          {attendedCount}
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {markedCount > 0 ? 'attendance' : 'attendance'}
        </div>
      </div>
    )
  }
  const ensureRealSessionForAttendance = useCallback(async (session) => {
    if (!session?.id || !String(session.id).startsWith('virtual-')) {
      return session?.id
    }
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: session.group_id,
        date: session.date,
        coach_id: session.coach_id || coach?.id,
      }),
    })
    const created = await res.json()
    if (!res.ok || !created?.id) {
      throw new Error(created?.error || 'Failed creating real session for attendance')
    }
    const createdSession = {
      ...session,
      ...created,
      attendance: [],
      is_virtual: false,
    }
    setSessions((prev) => {
      const withoutVirtual = prev.filter((s) => s.id !== session.id)
      return [createdSession, ...withoutVirtual]
    })
    setSelectedSession((prev) => {
      if (!prev || prev.id !== session.id) return prev
      return {
        ...prev,
        ...createdSession,
      }
    })
    return created.id
  }, [coach?.id])

  const renderSessionActions = (session) => {
    const isAssignedInstructor = session.coach_id === coach?.id || session.substitute_coach_id === coach?.id
    if (!isAssignedInstructor) return null
    return (
      <div className="mt-2 space-y-2">
        <div className="text-xs text-muted-foreground mb-1">פעולות זמינות:</div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            type="button"
            onClick={() => {
              handleOpenAttendanceModal(session)
            }}
          >
            מילוי נוכחות
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => {
              handleOpenSailorModal(session)
            }}
          >
            הוספה / הסרה חניכים
          </Button>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => {
              const current = requestStatusBySession[session.id] || {}
              if (current.delay) return cancelPostponeRequest(session)
              handlePostponeRequest(session)
            }}
          >
            {(requestStatusBySession[session.id] || {}).delay ? 'בטל דחייה' : 'דחיית פעילות'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => {
              const current = requestStatusBySession[session.id] || {}
              if (current.switch) return cancelSwitchRequest(session)
              handleSwitchRequest(session)
            }}
          >
            {(requestStatusBySession[session.id] || {}).switch ? 'בטל החלפה' : 'פתיחה להחלפת מדריך'}
          </Button>
        </div>
        {(requestStatusBySession[session.id] || {}).delay ? (
          <div className="text-[11px] text-amber-400">סטטוס דחייה: ממתין לאישור מנהל</div>
        ) : null}
        {(requestStatusBySession[session.id] || {}).switch ? (
          <div className="text-[11px] text-cyan-400">סטטוס החלפה: ממתין לאישור מנהל</div>
        ) : null}
        <div className="text-[11px] text-muted-foreground">
          דחייה/החלפה מחייבות אישור מנהל בטרמינל המנהל
        </div>
      </div>
    )
  }
  const toggleDayCollapse = (dateStr) => {
    setCollapsedWeekDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }))
  }


  const handleAttendanceUpdate = async (sessionId, sailorId, present, reason) => {
    try {
      let targetSessionId = sessionId
      const isVirtual = String(sessionId || '').startsWith('virtual-')
      if (isVirtual) {
        const sourceSession = selectedSession?.id === sessionId
          ? selectedSession
          : mergedSessions.find((s) => s.id === sessionId)
        if (!sourceSession) throw new Error('Session not found for attendance update')
        targetSessionId = await ensureRealSessionForAttendance(sourceSession)
      }
      const res = await fetch(`/api/sessions/${targetSessionId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sailor_id: sailorId, present, absence_reason: reason })
      })
      if (!res.ok) throw new Error('Failed to update attendance')
      const savedAttendance = await res.json()
      setSessions((prev) => prev.map((session) => {
        if (session.id !== targetSessionId) return session
        const existingAttendance = Array.isArray(session.attendance) ? session.attendance : []
        const nextAttendance = existingAttendance.some((record) => record?.sailor_id === sailorId)
          ? existingAttendance.map((record) => (
            record?.sailor_id === sailorId
              ? { ...record, present, absence_reason: reason || null }
              : record
          ))
          : [...existingAttendance, savedAttendance]
        return {
          ...session,
          attendance: nextAttendance,
        }
      }))
      setSelectedSession((prev) => {
        if (!prev || prev.id !== targetSessionId) return prev
        const existingAttendance = Array.isArray(prev.attendance) ? prev.attendance : []
        const nextAttendance = existingAttendance.some((record) => record?.sailor_id === sailorId)
          ? existingAttendance.map((record) => (
            record?.sailor_id === sailorId
              ? { ...record, present, absence_reason: reason || null }
              : record
          ))
          : [...existingAttendance, savedAttendance]
        return {
          ...prev,
          attendance: nextAttendance,
        }
      })
      // Reload board data after a short delay to ensure fresh data
      setTimeout(() => {
        loadBoardData()
      }, 300)
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }
  const handleOpenAttendanceModal = async (session) => {
    let enriched = session
    if (session?.group_id) {
      try {
        const requests = [
          fetch(`/api/groups/${session.group_id}/sailors`),
        ]
        if (!String(session.id || '').startsWith('virtual-')) {
          requests.push(fetch(`/api/sessions/${session.id}`))
        }
        const responses = await Promise.all(requests)
        const groupSailorsRes = responses[0]
        const groupSailorsData = await groupSailorsRes.json()
        const mapped = (Array.isArray(groupSailorsData) ? groupSailorsData : []).map((sailor) => ({
          sailor_id: sailor.id,
          sailors: sailor,
        }))
        let attendance = Array.isArray(session.attendance) ? session.attendance : []
        if (responses[1]?.ok) {
          const sessionData = await responses[1].json()
          attendance = Array.isArray(sessionData?.attendance) ? sessionData.attendance : attendance
        }
        enriched = { ...session, group_sailors: mapped, attendance }
      } catch (error) {
        console.error('Error loading attendance sailors:', error)
      }
    }
    setSelectedSession(enriched)
    setDetailModalOpen(true)
  }
  const handleOpenSailorModal = async (session) => {
    setSelectedSession(session)
    setSailorModalOpen(true)
    if (!session?.group_id) {
      setGroupSailors([])
      setAvailableSailors([])
      return
    }
    try {
      const [groupSailorsRes, sailorsRes] = await Promise.all([
        fetch(`/api/groups/${session.group_id}/sailors`),
        fetch('/api/sailors'),
      ])
      const [groupSailorsData, sailorsData] = await Promise.all([groupSailorsRes.json(), sailorsRes.json()])
      const current = Array.isArray(groupSailorsData) ? groupSailorsData : []
      const all = Array.isArray(sailorsData) ? sailorsData : []
      setGroupSailors(current)
      setAvailableSailors(all.filter((s) => !current.some((c) => c.id === s.id)))
    } catch (error) {
      console.error('Error loading sailors for group:', error)
      setGroupSailors([])
      setAvailableSailors([])
    }
  }

  const handleAddSailorToGroup = async (groupId, sailorId, newSailor) => {
    const res = await fetch(`/api/groups/${groupId}/sailors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sailor_id: sailorId, new_sailor: newSailor }),
    })
    if (!res.ok) throw new Error('Failed to add sailor')
    await handleOpenSailorModal(selectedSession)
    const refreshedGroup = await fetch(`/api/groups/${groupId}/sailors`).then(r => r.json()).catch(() => [])
    setSessions((prev) => prev.map((s) => {
      if (s.group_id !== groupId) return s
      return {
        ...s,
        group_sailors: (Array.isArray(refreshedGroup) ? refreshedGroup : []).map((sailor) => ({
          sailor_id: sailor.id,
          sailors: sailor,
        })),
      }
    }))
    setSelectedSession((prev) => {
      if (!prev || prev.group_id !== groupId) return prev
      return {
        ...prev,
        group_sailors: (Array.isArray(refreshedGroup) ? refreshedGroup : []).map((sailor) => ({
          sailor_id: sailor.id,
          sailors: sailor,
        })),
      }
    })
  }

  const handleRemoveSailorFromGroup = async (groupId, sailorId) => {
    const res = await fetch(`/api/groups/${groupId}/sailors?sailor_id=${sailorId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to remove sailor')
    await handleOpenSailorModal(selectedSession)
    const refreshedGroup = await fetch(`/api/groups/${groupId}/sailors`).then(r => r.json()).catch(() => [])
    setSessions((prev) => prev.map((s) => {
      if (s.group_id !== groupId) return s
      return {
        ...s,
        group_sailors: (Array.isArray(refreshedGroup) ? refreshedGroup : []).map((sailor) => ({
          sailor_id: sailor.id,
          sailors: sailor,
        })),
      }
    }))
    setSelectedSession((prev) => {
      if (!prev || prev.group_id !== groupId) return prev
      return {
        ...prev,
        group_sailors: (Array.isArray(refreshedGroup) ? refreshedGroup : []).map((sailor) => ({
          sailor_id: sailor.id,
          sailors: sailor,
        })),
      }
    })
  }


  const handlePostponeRequest = (session) => {
    if (session.coach_id !== coach?.id && session.substitute_coach_id !== coach?.id) return
    setManagerRequestNotice(`בקשת דחייה נשלחה לאישור מנהל עבור ${session.groups?.name || 'קבוצה'}`)
    setRequestStatusBySession((prev) => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), delay: true } }))
  }

  const handleSwitchRequest = (session) => {
    if (session.coach_id !== coach?.id && session.substitute_coach_id !== coach?.id) return
    setManagerRequestNotice(`בקשת החלפה נשלחה לאישור מנהל עבור ${session.groups?.name || 'קבוצה'}`)
    setRequestStatusBySession((prev) => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), switch: true } }))
  }
  const cancelPostponeRequest = (session) => {
    setManagerRequestNotice(`בקשת דחייה בוטלה עבור ${session.groups?.name || 'קבוצה'}`)
    setRequestStatusBySession((prev) => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), delay: false } }))
  }
  const cancelSwitchRequest = (session) => {
    setManagerRequestNotice(`בקשת החלפה בוטלה עבור ${session.groups?.name || 'קבוצה'}`)
    setRequestStatusBySession((prev) => ({ ...prev, [session.id]: { ...(prev[session.id] || {}), switch: false } }))
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
      setGroups((prev) => [data, ...prev])
      await loadBoardData()

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
    <div className="pb-24">
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
              onDateClick={(dateStr) => {
                setSelectedDayDate(dateStr)
                setViewMode('day')
              }}
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
            <h2 className="text-sm sm:text-base font-extrabold flex-1 text-center flex items-center justify-center gap-2"><CalendarIcon size={18} className="sm:w-5 sm:h-5" /> השבוע</h2>
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
              const isCollapsed = !!collapsedWeekDates[day.date]
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
                      <button
                        type="button"
                        className="h-5 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-xs"
                        onClick={() => toggleDayCollapse(day.date)}
                        aria-label="מזער יום"
                      >
                        {isCollapsed ? '▾' : '▴'}
                      </button>
                    </div>
                    {isCollapsed ? null : daySessions.length > 0 ? (
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
                                {session.coaches?.name || 'לא מוגדר'}
                              </div>
                              {renderSessionActions(session)}
                            </div>
                            {renderAttendanceIndicator(session)}
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
          <div className="flex items-center justify-between gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const d = new Date(`${selectedDayDate}T12:00:00`)
                d.setDate(d.getDate() - 1)
                setSelectedDayDate(toDateStr(d))
              }}
              className="h-9 w-9 p-0"
            >
              ←
            </Button>
            <h2 className="text-sm sm:text-base font-extrabold flex-1 text-center flex items-center justify-center gap-2"><ClipboardList size={18} className="sm:w-5 sm:h-5" /> יום {daySelectedMeta.dayName}</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const d = new Date(`${selectedDayDate}T12:00:00`)
                d.setDate(d.getDate() + 1)
                setSelectedDayDate(toDateStr(d))
              }}
              className="h-9 w-9 p-0"
            >
              →
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="flex items-center gap-3" dir="ltr">
                  <Button size="sm" onClick={() => openAddGroupDialog({
                    date: selectedDayDate,
                    dayName: daySelectedMeta.dayName,
                    dayNum: daySelectedMeta.dayNum,
                    dateObj: daySelectedMeta.dateObj,
                  })}>
                    <Plus size={16} className="inline" /> הוסף קבוצה
                  </Button>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </div>
              {dayViewSessions.length === 0 ? (
                <div className="text-muted-foreground text-center p-5">אין פעילויות ליום זה</div>
              ) : (
                <div className="space-y-3">
                  {sortedByStartTime(dayViewSessions).map((session) => (
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
                        <div className="text-xs text-muted-foreground mb-0.5">
                          {session.start_time && session.end_time
                            ? `${session.start_time} - ${session.end_time}`
                            : session.start_time || 'אין שעה'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {session.coaches?.name || 'לא מוגדר'}
                        </div>
                        {renderSessionActions(session)}
                      </div>
                      {renderAttendanceIndicator(session)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <SessionDetailModal
        session={selectedSession}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        coachId={coach?.id}
        onAttendanceUpdate={handleAttendanceUpdate}
      />

      <SailorManagementModal
        groupId={selectedSession?.group_id}
        sailors={groupSailors}
        availableSailors={availableSailors}
        onAddSailor={handleAddSailorToGroup}
        onRemoveSailor={handleRemoveSailorFromGroup}
        isOpen={sailorModalOpen}
        onClose={() => setSailorModalOpen(false)}
      />


      <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
        <DialogContent dir="rtl" className="max-h-[80vh] overflow-y-auto pb-24">
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
