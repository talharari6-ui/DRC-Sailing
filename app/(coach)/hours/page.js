'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

const MONTH_NAMES_HE = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

const WEEKDAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function normalizeTimeInput(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''

  if (digits.length <= 2) {
    const hour = Number(digits)
    if (Number.isNaN(hour) || hour > 23) return ''
    return `${String(hour).padStart(2, '0')}:00`
  }

  if (digits.length === 3) {
    const hour = Number(digits.slice(0, 1))
    const minute = Number(digits.slice(1, 3))
    if (hour > 23 || minute > 59) return ''
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  const padded = digits.slice(0, 4)
  const hour = Number(padded.slice(0, 2))
  const minute = Number(padded.slice(2, 4))
  if (hour > 23 || minute > 59) return ''
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function getHoursBetween(startTime, endTime) {
  if (!startTime || !endTime) return 0
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  if ([sh, sm, eh, em].some((value) => Number.isNaN(value))) return 0
  const totalMinutes = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMinutes <= 0) return 0
  return totalMinutes / 60
}

export default function HoursPage() {
  const { coach } = useAuth()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [workingDate, setWorkingDate] = useState(null)
  const dirtyRef = useRef(new Set())
  const entriesRef = useRef(entries)
  entriesRef.current = entries

  const monthStart = useMemo(() => toDateKey(viewYear, viewMonth, 1), [viewYear, viewMonth])
  const monthEnd = useMemo(() => {
    const daysCount = new Date(viewYear, viewMonth + 1, 0).getDate()
    return toDateKey(viewYear, viewMonth, daysCount)
  }, [viewYear, viewMonth])

  const days = useMemo(() => {
    const daysCount = new Date(viewYear, viewMonth + 1, 0).getDate()
    return Array.from({ length: daysCount }, (_, index) => {
      const dayNumber = index + 1
      const date = new Date(viewYear, viewMonth, dayNumber)
      return {
        key: toDateKey(viewYear, viewMonth, dayNumber),
        dayNumber,
        weekdayIndex: date.getDay(),
        weekdayName: WEEKDAY_NAMES_HE[date.getDay()],
      }
    })
  }, [viewYear, viewMonth])

  const monthTitle = `${MONTH_NAMES_HE[viewMonth]} ${viewYear}`

  const loadHours = useCallback(async () => {
    if (!coach?.id) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/hours?coach_id=${coach.id}&date_from=${monthStart}&date_to=${monthEnd}`
      )
      if (!response.ok) throw new Error('Failed to load hours')
      const data = await response.json()
      const map = {}
      for (const row of data || []) {
        map[row.date] = {
          start_time: row.start_time || '',
          end_time: row.end_time || '',
          notes: row.notes || '',
        }
      }
      setEntries(map)
      dirtyRef.current.clear()
    } catch (err) {
      console.error('Hours load error:', err)
      setError('טעינת השעות נכשלה')
    } finally {
      setLoading(false)
    }
  }, [coach?.id, monthEnd, monthStart])

  useEffect(() => {
    loadHours()
  }, [loadHours])

  const monthlyTotal = useMemo(() => {
    return Object.values(entries).reduce((sum, entry) => {
      return sum + getHoursBetween(entry.start_time, entry.end_time)
    }, 0)
  }, [entries])

  const updateField = (date, field, value, markDirty = true) => {
    setEntries((prev) => ({
      ...prev,
      [date]: {
        start_time: prev[date]?.start_time || '',
        end_time: prev[date]?.end_time || '',
        notes: prev[date]?.notes || '',
        [field]: value,
      },
    }))
    if (markDirty) dirtyRef.current.add(date)
  }

  const saveDate = useCallback(async (date, sourceEntries = null) => {
    if (!coach?.id) return
    const dataStore = sourceEntries || entriesRef.current
    const entry = dataStore[date]
    const normalizedStart = normalizeTimeInput(entry?.start_time)
    const normalizedEnd = normalizeTimeInput(entry?.end_time)
    if (!normalizedStart || !normalizedEnd) return
    if (normalizedStart !== entry?.start_time || normalizedEnd !== entry?.end_time) {
      setEntries((prev) => ({
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          start_time: normalizedStart,
          end_time: normalizedEnd,
        },
      }))
    }
    setWorkingDate(date)
    try {
      const response = await fetch('/api/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: coach.id,
          date,
          start_time: normalizedStart,
          end_time: normalizedEnd,
          notes: entry.notes || '',
        }),
      })
      if (!response.ok) throw new Error('Failed to save')
      dirtyRef.current.delete(date)
    } catch (err) {
      console.error('Hours save error:', err)
      setError(`שמירה נכשלה עבור ${date}`)
    } finally {
      setWorkingDate(null)
    }
  }, [coach?.id])

  const flushAllDirty = useCallback(async () => {
    if (!coach?.id) return
    const dirtyDates = Array.from(dirtyRef.current)
    if (dirtyDates.length === 0) return
    const current = entriesRef.current
    const batch = dirtyDates
      .map((date) => {
        const item = current[date]
        const normalizedStart = normalizeTimeInput(item?.start_time)
        const normalizedEnd = normalizeTimeInput(item?.end_time)
        if (!normalizedStart || !normalizedEnd) return null
        return {
          coach_id: coach.id,
          date,
          start_time: normalizedStart,
          end_time: normalizedEnd,
          notes: item.notes || '',
        }
      })
      .filter(Boolean)

    if (batch.length === 0) return
    try {
      const response = await fetch('/api/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch }),
      })
      if (!response.ok) throw new Error('Failed batch save')
      dirtyRef.current.clear()
    } catch (err) {
      console.error('Hours batch save error:', err)
      setError('שמירה אוטומטית נכשלה')
    }
  }, [coach?.id])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushAllDirty()
      }
    }
    window.addEventListener('beforeunload', flushAllDirty)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('beforeunload', flushAllDirty)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [flushAllDirty])

  const clearDay = async (date) => {
    if (!coach?.id) return
    setWorkingDate(date)
    try {
      const response = await fetch('/api/hours', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_id: coach.id, date }),
      })
      if (!response.ok) throw new Error('Failed to clear')
      setEntries((prev) => {
        const next = { ...prev }
        delete next[date]
        return next
      })
      dirtyRef.current.delete(date)
    } catch (err) {
      console.error('Hours clear error:', err)
      setError(`ניקוי נכשל עבור ${date}`)
    } finally {
      setWorkingDate(null)
    }
  }

  const duplicateSameWeekday = async (sourceDate) => {
    const source = entries[sourceDate]
    if (!source?.start_time || !source?.end_time) return
    const sourceWeekday = new Date(sourceDate).getDay()
    const updates = {}
    for (const day of days) {
      if (day.key === sourceDate) continue
      if (day.weekdayIndex === sourceWeekday) {
        updates[day.key] = {
          ...source,
        }
        dirtyRef.current.add(day.key)
      }
    }
    setEntries((prev) => ({ ...prev, ...updates }))
    setTimeout(() => {
      flushAllDirty()
    }, 0)
  }

  const goToPreviousMonth = async () => {
    await flushAllDirty()
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((prev) => prev - 1)
      return
    }
    setViewMonth((prev) => prev - 1)
  }

  const goToNextMonth = async () => {
    await flushAllDirty()
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((prev) => prev + 1)
      return
    }
    setViewMonth((prev) => prev + 1)
  }

  return (
    <div className="space-y-2 sm:space-y-3 pb-24" dir="rtl">
      <div className="flex items-center justify-between gap-1">
        <Button variant="outline" size="icon-sm" onClick={goToNextMonth} title="חודש הבא" className="h-8 w-8">
          <ChevronRight size={16} />
        </Button>
        <div className="text-center flex-1 min-w-0">
          <h1 className="text-sm sm:text-lg font-extrabold flex items-center justify-center gap-1 sm:gap-2">
            {monthTitle}
            <Clock size={14} className="sm:w-4.5 sm:h-4.5" />
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground">סה״כ לחודש: {monthlyTotal.toFixed(1)} שעות</p>
        </div>
        <Button variant="outline" size="icon-sm" onClick={goToPreviousMonth} title="חודש קודם" className="h-8 w-8">
          <ChevronLeft size={16} />
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="pt-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">טוען...</div>
          ) : (
            <div className="space-y-2">

              {days.map((day) => {
                const row = entries[day.key] || {
                  start_time: '',
                  end_time: '',
                  notes: '',
                }
                const hasHours = Boolean(row.start_time && row.end_time)
                const busy = workingDate === day.key
                const dailyHours = getHoursBetween(
                  normalizeTimeInput(row.start_time),
                  normalizeTimeInput(row.end_time)
                )

                return (
                  <div key={day.key} className="rounded-md border p-1.5 sm:p-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex items-center justify-center gap-1">
                        <Input
                          className="h-8 sm:h-9 flex-1 text-xs sm:text-sm text-center"
                          type="text"
                          inputMode="numeric"
                          placeholder="כניסה"
                          value={row.start_time}
                          onChange={(event) => updateField(day.key, 'start_time', event.target.value)}
                          onBlur={(event) => {
                            const normalized = normalizeTimeInput(event.target.value)
                            updateField(day.key, 'start_time', normalized)
                            saveDate(day.key, {
                              ...entriesRef.current,
                              [day.key]: { ...entriesRef.current[day.key], start_time: normalized },
                            })
                          }}
                        />
                        <span className="text-muted-foreground text-xs">-</span>
                        <Input
                          className="h-8 sm:h-9 flex-1 text-xs sm:text-sm text-center"
                          type="text"
                          inputMode="numeric"
                          placeholder="יציאה"
                          value={row.end_time}
                          onChange={(event) => updateField(day.key, 'end_time', event.target.value)}
                          onBlur={(event) => {
                            const normalized = normalizeTimeInput(event.target.value)
                            updateField(day.key, 'end_time', normalized)
                            saveDate(day.key, {
                              ...entriesRef.current,
                              [day.key]: { ...entriesRef.current[day.key], end_time: normalized },
                            })
                          }}
                        />
                      </div>
                      <div className="text-right min-w-[70px]">
                        <div className="text-5xl sm:text-6xl font-extrabold text-white leading-none">{String(day.dayNumber).padStart(2, '0')}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{day.weekdayName}</div>
                        <div className="text-[10px] sm:text-sm font-bold text-drc-green">
                          {dailyHours > 0 ? `${dailyHours.toFixed(1)}ש׳` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <textarea
                        className="flex-1 h-7 sm:h-8 rounded-md border border-input bg-transparent px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                        placeholder="הערה..."
                        value={row.notes}
                        onChange={(event) => updateField(day.key, 'notes', event.target.value)}
                        onBlur={() => saveDate(day.key)}
                      />
                      {hasHours ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 sm:h-8 w-7 sm:w-8 p-0 text-xs sm:text-sm"
                          onClick={() => clearDay(day.key)}
                          disabled={busy}
                          title="ניקוי"
                        >
                          🗑️
                        </Button>
                      ) : null}
                      {hasHours ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 sm:h-8 w-7 sm:w-8 p-0 text-xs sm:text-sm"
                          onClick={() => duplicateSameWeekday(day.key)}
                          disabled={busy}
                          title="שכפול"
                        >
                          📋
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
