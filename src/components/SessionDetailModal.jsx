import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const DAY_TOGGLE_LABELS = ['\u05d0', '\u05d1', '\u05d2', '\u05d3', '\u05d4', '\u05d5', '\u05e9']

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

export default function SessionDetailModal({
  session,
  isOpen,
  onClose,
  coachId,
  isAdmin,
  onAttendanceUpdate,
  onSubstituteRequest,
  onRefresh,
  onEditSailors,
}) {
  const [marking, setMarking] = useState(false)
  const [attendance, setAttendance] = useState({})
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [declineLoading, setDeclineLoading] = useState(false)
  const [declineMessage, setDeclineMessage] = useState('')

  const [manageOpen, setManageOpen] = useState(false)
  const [groupSaving, setGroupSaving] = useState(false)
  const [groupMessage, setGroupMessage] = useState('')
  const [groupForm, setGroupForm] = useState({
    name: '',
    color: '#3b82f6',
    start_date: '',
    days_of_week: [],
    start_time: '',
    end_time: '',
  })

  useEffect(() => {
    if (!session?.groups) return
    setGroupForm({
      name: session.groups.name || '',
      color: session.groups.color || '#3b82f6',
      start_date: session.groups.start_date || '',
      days_of_week: Array.isArray(session.groups.days_of_week) ? session.groups.days_of_week : [],
      start_time: session.groups.start_time || '',
      end_time: session.groups.end_time || '',
    })
  }, [session])

  if (!session) return null

  const groupCoachId = session.groups?.coach_id
  const isGroupCoach = !!groupCoachId && groupCoachId === coachId
  const isSubstitute = session.substitute_coach_id === coachId
  const canMarkAttendance = isGroupCoach || isSubstitute || isAdmin
  const canManageGroup = isGroupCoach || isAdmin
  const canDecline = canManageGroup
  const requestStatus =
    session.admin_approved === false && session.cancelled
      ? '\u05d1\u05e7\u05e9\u05ea \u05d3\u05d7\u05d9\u05d9\u05d4 \u05de\u05de\u05ea\u05d9\u05e0\u05d4 \u05dc\u05d0\u05d9\u05e9\u05d5\u05e8 \u05de\u05e0\u05d4\u05dc'
      : session.admin_approved === false && session.substitute_coach_id
        ? '\u05d1\u05e7\u05e9\u05ea \u05d4\u05d7\u05dc\u05e4\u05d4 \u05de\u05de\u05ea\u05d9\u05e0\u05d4 \u05dc\u05d0\u05d9\u05e9\u05d5\u05e8 \u05de\u05e0\u05d4\u05dc'
        : ''

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, mins] = time.split(':')
    return `${hours}:${mins}`
  }

  const handleMarkAttendance = async (sailorId, present, reason = null) => {
    setMarking(true)
    try {
      await onAttendanceUpdate(session.id, sailorId, present, reason)
      setAttendance((prev) => ({
        ...prev,
        [sailorId]: { present, reason },
      }))
    } finally {
      setMarking(false)
    }
  }

  const handleDeclineSubmit = async () => {
    setDeclineLoading(true)
    setDeclineMessage('')
    try {
      const res = await fetch(`/api/sessions/${session.id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_id: coachId,
          requester_is_admin: !!isAdmin,
          reason: declineReason,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to request decline')

      setDeclineOpen(false)
      setDeclineReason('')
      setDeclineMessage(data?.pending_approval ? '\u05d1\u05e7\u05e9\u05ea \u05d3\u05d7\u05d9\u05d9\u05d4 \u05e0\u05e9\u05dc\u05d7\u05d4 \u05dc\u05d0\u05d9\u05e9\u05d5\u05e8 \u05de\u05e0\u05d4\u05dc' : '\u05d4\u05e4\u05e2\u05d9\u05dc\u05d5\u05ea \u05e0\u05d3\u05d7\u05ea\u05d4')
      await onRefresh?.()
    } catch (error) {
      setDeclineMessage(error.message)
    } finally {
      setDeclineLoading(false)
    }
  }

  const toggleDay = (dayIndex) => {
    setGroupForm((prev) => {
      const exists = prev.days_of_week.includes(dayIndex)
      const nextDays = exists
        ? prev.days_of_week.filter((d) => d !== dayIndex)
        : [...prev.days_of_week, dayIndex].sort((a, b) => a - b)

      return { ...prev, days_of_week: nextDays }
    })
  }

  const handleSaveGroup = async () => {
    if (!session.groups?.id) return
    setGroupSaving(true)
    setGroupMessage('')

    const normalizedStartTime = parseGroupTimeInput(groupForm.start_time)
    const normalizedEndTime = parseGroupTimeInput(groupForm.end_time)

    if (!groupForm.name.trim()) {
      setGroupSaving(false)
      setGroupMessage('\u05d9\u05e9 \u05dc\u05d4\u05d6\u05d9\u05df \u05e9\u05dd \u05e7\u05d1\u05d5\u05e6\u05d4')
      return
    }

    if (groupForm.days_of_week.length === 0) {
      setGroupSaving(false)
      setGroupMessage('\u05d9\u05e9 \u05dc\u05d1\u05d7\u05d5\u05e8 \u05dc\u05e4\u05d7\u05d5\u05ea \u05d9\u05d5\u05dd \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea \u05d0\u05d7\u05d3')
      return
    }

    if ((groupForm.start_time && normalizedStartTime === null) || (groupForm.end_time && normalizedEndTime === null)) {
      setGroupSaving(false)
      setGroupMessage('\u05e4\u05d5\u05e8\u05de\u05d8 \u05e9\u05e2\u05d4 \u05dc\u05d0 \u05ea\u05e7\u05d9\u05df')
      return
    }

    if ((normalizedStartTime && !normalizedEndTime) || (!normalizedStartTime && normalizedEndTime)) {
      setGroupSaving(false)
      setGroupMessage('\u05d9\u05e9 \u05dc\u05d4\u05d6\u05d9\u05df \u05d2\u05dd \u05e9\u05e2\u05ea \u05d4\u05ea\u05d7\u05dc\u05d4 \u05d5\u05d2\u05dd \u05e9\u05e2\u05ea \u05e1\u05d9\u05d5\u05dd')
      return
    }

    if (normalizedStartTime && normalizedEndTime) {
      const minAllowed = 7 * 60
      const maxAllowed = 22 * 60
      const startMinutes = toMinutes(normalizedStartTime)
      const endMinutes = toMinutes(normalizedEndTime)

      if (startMinutes < minAllowed || startMinutes > maxAllowed || endMinutes < minAllowed || endMinutes > maxAllowed) {
        setGroupSaving(false)
        setGroupMessage('\u05e9\u05e2\u05d5\u05ea \u05d4\u05e4\u05e2\u05d9\u05dc\u05d5\u05ea \u05d7\u05d9\u05d9\u05d1\u05d5\u05ea \u05dc\u05d4\u05d9\u05d5\u05ea \u05d1\u05d9\u05df 07:00 \u05dc-22:00')
        return
      }

      if (endMinutes <= startMinutes) {
        setGroupSaving(false)
        setGroupMessage('\u05e9\u05e2\u05ea \u05d4\u05e1\u05d9\u05d5\u05dd \u05d7\u05d9\u05d9\u05d1\u05ea \u05dc\u05d4\u05d9\u05d5\u05ea \u05d0\u05d7\u05e8\u05d9 \u05e9\u05e2\u05ea \u05d4\u05d4\u05ea\u05d7\u05dc\u05d4')
        return
      }
    }

    try {
      const res = await fetch(`/api/groups/${session.groups.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupForm.name.trim(),
          color: groupForm.color,
          start_date: groupForm.start_date,
          days_of_week: groupForm.days_of_week,
          start_time: normalizedStartTime || '',
          end_time: normalizedEndTime || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update group')

      setGroupMessage('\u05d4\u05e7\u05d1\u05d5\u05e6\u05d4 \u05e2\u05d5\u05d3\u05db\u05e0\u05d4')
      setManageOpen(false)
      await onRefresh?.()
    } catch (error) {
      setGroupMessage(error.message)
    } finally {
      setGroupSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{session.groups?.name || '\u05e7\u05d1\u05d5\u05e6\u05d4'}</DialogTitle>
        </DialogHeader>

        <div className="pb-2">
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-muted-foreground text-xs">{'\u05ea\u05d0\u05e8\u05d9\u05da'}</div>
                <div className="text-foreground text-sm">{session.date}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">{'\u05e9\u05e2\u05d4'}</div>
                <div className="text-foreground text-sm">
                  {formatTime(session.start_time)} - {formatTime(session.end_time)}
                </div>
              </div>
            </div>
          </div>

          {requestStatus ? <div className="mb-3 text-xs text-amber-300">{requestStatus}</div> : null}
          {declineMessage ? <div className="mb-3 text-xs text-amber-300">{declineMessage}</div> : null}
          {groupMessage ? <div className="mb-3 text-xs text-emerald-300">{groupMessage}</div> : null}

          {canMarkAttendance ? (
            <div className="mb-5">
              <div className="text-xs font-semibold mb-2 text-foreground">{'\u05e0\u05d5\u05db\u05d7\u05d5\u05ea \u05d7\u05e0\u05d9\u05db\u05d9\u05dd'}</div>
              {session.group_sailors && session.group_sailors.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {session.group_sailors.map((gs) => {
                    const sailor = gs.sailors
                    if (!sailor) return null
                    return (
                      <div key={sailor.id} className="flex justify-between items-center p-2 bg-secondary rounded-md text-sm">
                        <span>{sailor.name}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant={attendance[sailor.id]?.present === true ? 'default' : 'outline'} onClick={() => handleMarkAttendance(sailor.id, true)} disabled={marking}>{'\\u2713'}</Button>
                          <Button size="sm" variant={attendance[sailor.id]?.present === false ? 'destructive' : 'outline'} onClick={() => handleMarkAttendance(sailor.id, false, '\u05d4\u05d9\u05e2\u05d3\u05e8\u05d5\u05ea')} disabled={marking}>{'\u2715'}</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">{'\u05d0\u05d9\u05df \u05d7\u05e0\u05d9\u05db\u05d9\u05dd \u05d1\u05e7\u05d1\u05d5\u05e6\u05d4'}</div>
              )}
            </div>
          ) : null}

          {!manageOpen ? (<div className="flex flex-col gap-3 mt-6">
            {(isGroupCoach || isSubstitute || isAdmin) ? <Button onClick={() => onEditSailors(session.id)}>{'\u05e2\u05e8\u05d5\u05da \u05d7\u05e0\u05d9\u05db\u05d9\u05dd'}</Button> : null}
            <Button variant="secondary" onClick={() => onSubstituteRequest(session.id)}>{canManageGroup ? '\u05de\u05d9\u05e0\u05d5\u05d9 \u05de\u05d7\u05dc\u05d9\u05e3' : '\u05d1\u05e7\u05e9\u05ea \u05d4\u05d7\u05dc\u05e4\u05d4'}</Button>
            {canManageGroup ? <Button variant="outline" onClick={() => setManageOpen(true)}>{'\u05e0\u05d9\u05d4\u05d5\u05dc \u05e7\u05d1\u05d5\u05e6\u05d4'}</Button> : null}
            {canDecline ? <Button variant="destructive" onClick={() => setDeclineOpen((v) => !v)}>{'\u05d3\u05d7\u05d9\u05d9\u05ea \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea'}</Button> : null}
          </div>) : null}

          {!manageOpen && declineOpen ? (
            <div className="mt-3 rounded-md border border-border p-3">
              <Label htmlFor="decline-reason">{'\u05e1\u05d9\u05d1\u05ea \u05d3\u05d7\u05d9\u05d9\u05d4 (\u05d0\u05d5\u05e4\u05e6\u05d9\u05d5\u05e0\u05dc\u05d9)'}</Label>
              <Input id="decline-reason" className="mt-2" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={handleDeclineSubmit} disabled={declineLoading}>{declineLoading ? '\u05e9\u05d5\u05dc\u05d7...' : '\u05d0\u05e9\u05e8 \u05d3\u05d7\u05d9\u05d9\u05d4'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeclineOpen(false)}>{'\u05d1\u05d9\u05d8\u05d5\u05dc'}</Button>
              </div>
              {!isAdmin ? <p className="mt-2 text-[11px] text-amber-300">{'\u05d4\u05d1\u05e7\u05e9\u05d4 \u05ea\u05d9\u05e9\u05dc\u05d7 \u05dc\u05d0\u05d9\u05e9\u05d5\u05e8 \u05de\u05e0\u05d4\u05dc'}</p> : null}
            </div>
          ) : null}

          {manageOpen ? (
            <div className="mt-3 rounded-md border border-border p-3 space-y-3">
              <div>
                <Label>{'\u05e9\u05dd \u05e7\u05d1\u05d5\u05e6\u05d4'}</Label>
                <Input value={groupForm.name} onChange={(e) => setGroupForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <Label>{'\u05d9\u05de\u05d9 \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea'}</Label>
                <div className="mt-2 grid grid-cols-7 gap-1.5">
                  {DAY_TOGGLE_LABELS.map((label, dayIndex) => {
                    const active = groupForm.days_of_week.includes(dayIndex)
                    return <button key={label} type="button" onClick={() => toggleDay(dayIndex)} className={`h-8 rounded-md text-xs font-bold border ${active ? 'bg-blue-600 text-white border-blue-500' : 'bg-background text-muted-foreground border-border'}`}>{label}</button>
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>{'\u05d4\u05ea\u05d7\u05dc\u05d4'}</Label><Input value={groupForm.start_time} onChange={(e) => setGroupForm((prev) => ({ ...prev, start_time: e.target.value }))} /></div>
                <div><Label>{'\u05e1\u05d9\u05d5\u05dd'}</Label><Input value={groupForm.end_time} onChange={(e) => setGroupForm((prev) => ({ ...prev, end_time: e.target.value }))} /></div>
              </div>
              <div>
                <Label>{'\u05ea\u05d0\u05e8\u05d9\u05da \u05d4\u05ea\u05d7\u05dc\u05d4'}</Label>
                <Input type="date" value={groupForm.start_date} onChange={(e) => setGroupForm((prev) => ({ ...prev, start_date: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveGroup} disabled={groupSaving}>{groupSaving ? '\u05e9\u05d5\u05de\u05e8...' : '\u05e9\u05de\u05d5\u05e8'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setManageOpen(false)}>{'\u05d1\u05d9\u05d8\u05d5\u05dc'}</Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
