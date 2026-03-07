'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { DAY_NAMES } from '@/src/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function HistoryPage() {
  const { coach } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadHistory = useCallback(async () => {
    if (!coach) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sessions?coach_id=${coach.id}`)
      const data = await res.json()
      setSessions(data.slice(0, 50))
    } catch (err) {
      console.error('Error loading history:', err)
      setError('שגיאה בטעינת ההיסטוריה. נסה לרענן את הדף.')
    } finally {
      setLoading(false)
    }
  }, [coach])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">📊 היסטוריה</h1>
        <p className="text-muted-foreground text-sm">
          {sessions.length} פעילויות
        </p>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-muted-foreground text-sm">אין היסטוריה פעילויות</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const date = new Date(session.date + 'T12:00:00')
            const dow = date.getDay()
            return (
              <Card
                key={session.id}
                className={session.cancelled ? 'bg-drc-red/10 border-drc-red/30 opacity-70' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`text-sm font-bold mb-0.5 ${session.cancelled ? 'line-through' : ''}`}>
                        {session.cancelled ? '❌ ' : ''}יום {DAY_NAMES[dow]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString('he-IL')}
                      </div>
                    </div>
                    <Badge variant={session.cancelled ? 'destructive' : 'outline'} className={session.cancelled ? '' : 'text-drc-green border-drc-green/30'}>
                      {session.cancelled ? 'בוטל' : 'בוצע'}
                    </Badge>
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
