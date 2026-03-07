'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HoursPage() {
  const { coach } = useAuth()
  const [hours, setHours] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  const loadHours = useCallback(async () => {
    if (!coach) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/hours?coach_id=${coach.id}&date_from=${monthStart}&date_to=${monthEnd}`)
      const data = await res.json()
      setHours(data)
    } catch (err) {
      console.error('Error loading hours:', err)
      setError('שגיאה בטעינת שעות העבודה. נסה לרענן את הדף.')
    } finally {
      setLoading(false)
    }
  }, [coach, monthStart, monthEnd])

  useEffect(() => {
    loadHours()
  }, [loadHours])

  const totalHours = hours.reduce((sum, h) => {
    if (!h.start_time || !h.end_time) return sum
    const [sh, sm] = h.start_time.split(':').map(Number)
    const [eh, em] = h.end_time.split(':').map(Number)
    return sum + ((eh - sh) * 60 + (em - sm)) / 60
  }, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">⏰ שעות עבודה</h1>
        <p className="text-muted-foreground text-sm">
          חודש נוכחי: {totalHours.toFixed(1)} שעות
        </p>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                </div>
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hours.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-3">⏰</div>
            <p className="text-muted-foreground text-sm">אין שעות עבודה מתועדות</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {hours.map((h) => (
            <Card key={h.id}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-bold">
                    {new Date(h.date).toLocaleDateString('he-IL')}
                  </div>
                  <Badge variant="outline" className="text-drc-green border-drc-green/30 font-bold">
                    {h.start_time} - {h.end_time}
                  </Badge>
                </div>
                {h.notes ? (
                  <div className="text-xs text-muted-foreground">{h.notes}</div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
