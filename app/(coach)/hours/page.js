'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
  const [savingDate, setSavingDate] = useState(null)
  const [workingDate, setWorkingDate] = useState(null)

  const monthStart = useMemo(() => toDateKey(viewYear, viewMonth, 1), [viewYear, viewMonth])
  const monthEnd = useMemo(() => {
    const daysCount = new Date(viewYear, viewMonth + 1, 0).getDate()
    return toDateKey(viewYear, viewMonth, daysCount)
  }, [viewYear, viewMonth])

  const days = useMemo(() => {
    const daysCount = new Date(viewYear, viewMonth + 1, 0).getDate()
    return Array.from({ length: daysCount }, (_, index) => {
      const dayNumber = index + 1
      const key = toDateKey(viewYear, viewMonth, dayNumber)
      return {
        key,
        dayNumber,
        weekday: new Date(viewYear, viewMonth, dayNumber).toLocaleDateString('en-US', { weekday: 'long' }),
      }
    })
  }, [viewYear, viewMonth])

  const monthTitle = `${MONTH_NAMES[viewMonth]} ${viewYear}`

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
          change_note: row.change_note || '',
        }
      }
      setEntries(map)
    } catch (err) {
      console.error('Hours load error:', err)
      setError('Failed to load hours for this month.')
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

  const updateEntryField = (date, field, value) => {
    setEntries((prev) => ({
      ...prev,
      [date]: {
        start_time: prev[date]?.start_time || '',
        end_time: prev[date]?.end_time || '',
        notes: prev[date]?.notes || '',
        change_note: prev[date]?.change_note || '',
        [field]: value,
      },
    }))
  }

  const saveDay = async (date) => {
    if (!coach?.id) return
    const entry = entries[date] || {}
    if (!entry.start_time || !entry.end_time) {
      setError('Start and finish hours are required to save.')
      return
    }

    setError(null)
    setSavingDate(date)
    try {
      const response = await fetch('/api/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: coach.id,
          date,
          start_time: entry.start_time,
          end_time: entry.end_time,
          notes: entry.notes || '',
          change_note: entry.change_note || '',
        }),
      })
      if (!response.ok) throw new Error('Failed to save')
      await loadHours()
    } catch (err) {
      console.error('Hours save error:', err)
      setError(`Failed saving ${date}.`)
    } finally {
      setSavingDate(null)
    }
  }

  const clearDay = async (date) => {
    if (!coach?.id) return
    setError(null)
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
    } catch (err) {
      console.error('Hours clear error:', err)
      setError(`Failed clearing ${date}.`)
    } finally {
      setWorkingDate(null)
    }
  }

  const duplicateSameWeekday = async (sourceDate) => {
    if (!coach?.id) return
    const source = entries[sourceDate]
    if (!source?.start_time || !source?.end_time) return

    const sourceDay = new Date(sourceDate).getDay()
    const updates = {}
    for (const day of days) {
      if (day.key === sourceDate) continue
      const weekday = new Date(day.key).getDay()
      if (weekday === sourceDay) {
        updates[day.key] = {
          start_time: source.start_time,
          end_time: source.end_time,
          notes: source.notes || '',
          change_note: source.change_note || '',
        }
      }
    }

    setEntries((prev) => ({ ...prev, ...updates }))
    setWorkingDate(sourceDate)
    setError(null)
    try {
      const payload = Object.entries(updates).map(([date, entry]) => ({
        coach_id: coach.id,
        date,
        start_time: entry.start_time,
        end_time: entry.end_time,
        notes: entry.notes,
        change_note: entry.change_note,
      }))
      if (payload.length > 0) {
        const response = await fetch('/api/hours', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch: payload }),
        })
        if (!response.ok) throw new Error('Failed duplicate save')
      }
      await loadHours()
    } catch (err) {
      console.error('Hours duplicate error:', err)
      setError('Failed to duplicate hours.')
    } finally {
      setWorkingDate(null)
    }
  }

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((prev) => prev - 1)
      return
    }
    setViewMonth((prev) => prev - 1)
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((prev) => prev + 1)
      return
    }
    setViewMonth((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon-sm" onClick={goToPreviousMonth}>
          <ChevronLeft />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-extrabold flex items-center justify-center gap-2">
            <Clock size={22} />
            {monthTitle}
          </h1>
          <p className="text-sm text-muted-foreground">Monthly total: {monthlyTotal.toFixed(1)}h</p>
        </div>
        <Button variant="outline" size="icon-sm" onClick={goToNextMonth}>
          <ChevronRight />
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading month...</div>
            ) : (
              days.map((day) => {
                const dayEntry = entries[day.key] || {
                  start_time: '',
                  end_time: '',
                  notes: '',
                  change_note: '',
                }
                const hasHours = Boolean(dayEntry.start_time && dayEntry.end_time)
                const busy = savingDate === day.key || workingDate === day.key

                return (
                  <div key={day.key} className="rounded-lg border p-3 space-y-2">
                    <div className="font-semibold text-sm">
                      {day.weekday}, {day.dayNumber}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Start</label>
                        <Input
                          type="time"
                          value={dayEntry.start_time}
                          onChange={(event) => updateEntryField(day.key, 'start_time', event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Finish</label>
                        <Input
                          type="time"
                          value={dayEntry.end_time}
                          onChange={(event) => updateEntryField(day.key, 'end_time', event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Comment</label>
                        <textarea
                          className="w-full min-h-16 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          value={dayEntry.notes}
                          onChange={(event) => updateEntryField(day.key, 'notes', event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Postponed / switched activity / switched instructor note
                        </label>
                        <textarea
                          className="w-full min-h-16 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          value={dayEntry.change_note}
                          onChange={(event) => updateEntryField(day.key, 'change_note', event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => saveDay(day.key)} disabled={busy}>
                        {savingDate === day.key ? 'Saving...' : 'Save'}
                      </Button>
                      {hasHours ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => duplicateSameWeekday(day.key)}
                            disabled={busy}
                          >
                            Duplicate to same weekday
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => clearDay(day.key)}
                            disabled={busy}
                          >
                            Clear
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
