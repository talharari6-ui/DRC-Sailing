'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { DAY_NAMES } from '@/src/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart3, XCircle } from 'lucide-react'

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
    <div className="pb-24">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-extrabold flex items-center gap-2"><BarChart3 size={20} className="sm:w-6 sm:h-6" /> היסטוריה</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
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
            <BarChart3 size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">אין היסטוריה פעילויות</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {sessions.map((session) => {
            const date = new Date(session.date + 'T12:00:00')
            const dow = date.getDay()
            return (
              <Card
                key={session.id}
                className={session.cancelled ? 'bg-drc-red/10 border-drc-red/30 opacity-70' : ''}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs sm:text-sm font-bold mb-0.5 ${session.cancelled ? 'line-through' : ''} truncate`}>
                        {session.cancelled ? <><XCircle size={12} className="sm:w-3.5 sm:h-3.5 inline me-1" /></> : null}יום {DAY_NAMES[dow]}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {date.toLocaleDateString('he-IL')}
                      </div>
                    </div>
                    <Badge variant={session.cancelled ? 'destructive' : 'outline'} className={`text-[10px] sm:text-xs ${session.cancelled ? '' : 'text-drc-green border-drc-green/30'} shrink-0`}>
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
