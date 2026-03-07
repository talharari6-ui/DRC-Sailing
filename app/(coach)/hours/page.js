'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function monthBounds(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return {
    start,
    end,
    from: toDateKey(start),
    to: toDateKey(end),
  }
}

function parseSmartTime(value) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  let hour = ''
  let minute = ''

  if (digits.length <= 2) {
    hour = digits
    minute = '00'
  } else if (digits.length === 3) {
    hour = digits.slice(0, 1)
    minute = digits.slice(1, 3)
  } else {
    hour = digits.slice(0, 2)
    minute = digits.slice(2, 4)
  }

  const h = Math.min(23, Math.max(0, Number(hour)))
  const m = Math.min(59, Math.max(0, Number(minute)))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function durationHours(startTime, endTime) {
  if (!startTime || !endTime) return 0
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  if ([sh, sm, eh, em].some(Number.isNaN)) return 0
  const minutes = (eh - sh) * 60 + (em - sm)
  return minutes > 0 ? minutes / 60 : 0
}

export default function HoursPage() {
  const { coach } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(() => new Date())
  const [hours, setHours] = useState([])
  const [edits, setEdits] = useState({})
  const [loading, setLoading] = useState(false)
  const [savingDates, setSavingDates] = useState({})
  const [error, setError] = useState(null)
  const autoSaveTimersRef = useRef({})

  const bounds = useMemo(() => monthBounds(selectedMonth), [selectedMonth])

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(bounds.start)
  }, [bounds.start])

  const days = useMemo(() => {
    const count = bounds.end.getDate()
    return Array.from({ length: count }).map((_, i) => {
      const dateObj = new Date(bounds.start)
      dateObj.setDate(i + 1)
      return {
        key: toDateKey(dateObj),
        dateObj,
      }
    })
  }, [bounds.start, bounds.end])

  const loadHours = useCallback(async () => {
    if (!coach?.id) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/hours?coach_id=${coach.id}&date_from=${bounds.from}&date_to=${bounds.to}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || '×˜×¢×™× ×ª ×©×¢×•×ª × ×›×©×œ×”')
      }

      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => a.date.localeCompare(b.date))
        : []

      setHours(sorted)
      setEdits({})
    } catch (err) {
      console.error('Error loading hours:', err)
      setError('×©×’×™××” ×‘×˜×¢×™× ×ª ×©×¢×•×ª ×”×¢×‘×•×“×”. × ×¡×” ×œ×¨×¢× ×Ÿ ××ª ×”×“×£.')
    } finally {
      setLoading(false)
    }
  }, [coach?.id, bounds.from, bounds.to])

  useEffect(() => {
    loadHours()
  }, [loadHours])

  const hoursMap = useMemo(() => {
    const map = {}
    for (const h of hours) {
      if (!map[h.date]) {
        map[h.date] = h
      }
    }
    return map
  }, [hours])

  const getRowValue = useCallback((dateKey) => {
    const edit = edits[dateKey]
    const existing = hoursMap[dateKey]
    return {
      start_time: edit?.start_time ?? existing?.start_time ?? '',
      end_time: edit?.end_time ?? existing?.end_time ?? '',
      notes: edit?.notes ?? existing?.notes ?? '',
      id: existing?.id,
    }
  }, [edits, hoursMap])

  const totalHours = useMemo(() => {
    return days.reduce((sum, day) => {
      const row = getRowValue(day.key)
      return sum + durationHours(parseSmartTime(row.start_time), parseSmartTime(row.end_time))
    }, 0)
  }, [days, getRowValue])

  const updateEdit = (dateKey, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [field]: value,
      },
    }))
  }

  const normalizeTimeField = (dateKey, field) => {
    const row = getRowValue(dateKey)
    updateEdit(dateKey, field, parseSmartTime(row[field]))
  }

  const saveDay = async (dateKey) => {
    const row = getRowValue(dateKey)
    const normalizedStart = parseSmartTime(row.start_time)
    const normalizedEnd = parseSmartTime(row.end_time)

    if ((normalizedStart && !normalizedEnd) || (!normalizedStart && normalizedEnd)) {
      setError('×™×© ×œ×”×–×™×Ÿ ×’× ×©×¢×ª ×”×ª×—×œ×” ×•×’× ×©×¢×ª ×¡×™×•×')
      return
    }

    setSavingDates((s) => ({ ...s, [dateKey]: true }))
    setError(null)

    try {
      if (!normalizedStart && !normalizedEnd) {
        if (row.id) {
          const delRes = await fetch(`/api/hours/${row.id}`, { method: 'DELETE' })
          const delData = await delRes.json()
          if (!delRes.ok) throw new Error(delData?.error || '×ž×—×™×§×” × ×›×©×œ×”')
        }
        await loadHours()
        return
      }

      const payload = {
        coach_id: coach.id,
        date: dateKey,
        start_time: normalizedStart,
        end_time: normalizedEnd,
        notes: row.notes || '',
      }

      let res
      if (row.id) {
        res = await fetch(`/api/hours/${row.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start_time: payload.start_time,
            end_time: payload.end_time,
            notes: payload.notes,
          }),
        })
      } else {
        res = await fetch('/api/hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || '×©×ž×™×¨×” × ×›×©×œ×”')
      }

      await loadHours()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingDates((s) => ({ ...s, [dateKey]: false }))
    }
  }

  const deleteDay = async (dateKey) => {
    const row = getRowValue(dateKey)
    if (!row.id) {
      setEdits((prev) => ({ ...prev, [dateKey]: { start_time: '', end_time: '', notes: '' } }))
      return
    }

    setSavingDates((s) => ({ ...s, [dateKey]: true }))
    setError(null)

    try {
      const res = await fetch(`/api/hours/${row.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || '×ž×—×™×§×” × ×›×©×œ×”')
      }
      await loadHours()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingDates((s) => ({ ...s, [dateKey]: false }))
    }
  }

  const copyForward = (dateKey) => {
    const source = getRowValue(dateKey)
    const start = parseSmartTime(source.start_time)
    const end = parseSmartTime(source.end_time)

    if (!start || !end) {
      setError('×™×© ×œ×”×–×™×Ÿ ×©×¢×•×ª ×ª×§×™× ×•×ª ×œ×¤× ×™ ×©×›×¤×•×œ')
      return
    }

    const sourceDate = new Date(`${dateKey}T12:00:00`)
    const sourceDow = sourceDate.getDay()

    setEdits((prev) => {
      const next = { ...prev }
      for (const day of days) {
        const d = day.dateObj
        if (d.getDate() <= sourceDate.getDate()) continue
        if (d.getDay() !== sourceDow) continue

        next[day.key] = {
          ...(next[day.key] || {}),
          start_time: start,
          end_time: end,
          notes: source.notes || '',
        }
      }
      return next
    })
  }


  useEffect(() => {
    const timers = autoSaveTimersRef.current

    Object.keys(edits).forEach((dateKey) => {
      const row = getRowValue(dateKey)
      const existing = hoursMap[dateKey] || {}
      const changed =
        (row.start_time || '') !== (existing.start_time || '') ||
        (row.end_time || '') !== (existing.end_time || '') ||
        (row.notes || '') !== (existing.notes || '')

      if (!changed || savingDates[dateKey]) return

      if (timers[dateKey]) clearTimeout(timers[dateKey])
      timers[dateKey] = setTimeout(() => {
        saveDay(dateKey)
      }, 900)
    })

    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t))
    }
  }, [edits, hoursMap, savingDates])

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-extrabold">â° ×©×¢×•×ª ×¢×‘×•×“×”</h1>
      </div>

      <div className="mb-4 flex items-center gap-2 bg-card border border-border rounded-xl p-2.5 px-4">
        <Button variant="outline" size="sm" onClick={() => setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
          â†’
        </Button>
        <div className="flex-1 text-center">
          <div className="font-bold text-sm">{monthLabel}</div>
          <div className="text-xs text-muted-foreground">×¡×”"×› ×—×•×“×©×™: {totalHours.toFixed(1)} ×©×¢×•×ª</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSelectedMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
          â†
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day) => {
            const row = getRowValue(day.key)
            const isSaving = !!savingDates[day.key]
            const dayLabel = new Intl.DateTimeFormat('he-IL', {
              weekday: 'long',
              day: 'numeric',
              month: 'numeric',
            }).format(day.dateObj)

            return (
              <Card key={day.key}>
                <CardContent className="p-4 space-y-3">
                  <div className="text-sm font-bold">{dayLabel}</div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>×©×¢×ª ×”×ª×—×œ×”</Label>
                      <Input
                        value={row.start_time}
                        onChange={(e) => updateEdit(day.key, 'start_time', e.target.value)}
                        onBlur={() => normalizeTimeField(day.key, 'start_time')}
                      />
                    </div>
                    <div>
                      <Label>×©×¢×ª ×¡×™×•×</Label>
                      <Input
                        value={row.end_time}
                        onChange={(e) => updateEdit(day.key, 'end_time', e.target.value)}
                        onBlur={() => normalizeTimeField(day.key, 'end_time')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>×”×¢×¨×”</Label>
                    <Input
                      value={row.notes}
                      onChange={(e) => updateEdit(day.key, 'notes', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => saveDay(day.key)} disabled={isSaving}>
                      {isSaving ? '×©×•×ž×¨...' : '×©×ž×•×¨'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyForward(day.key)}>
                      ×©×›×¤×œ ×œ×™×ž×™× ×–×”×™× ×‘×”×ž×©×š ×”×—×•×“×©
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteDay(day.key)} disabled={isSaving}>
                      ×ž×—×§
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
