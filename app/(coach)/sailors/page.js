'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, User } from 'lucide-react'

export default function SailorsPage() {
  const { coach } = useAuth()
  const [sailors, setSailors] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (!coach) return
      setLoading(true)
      setError(null)
      try {
        const [sailorRes, groupRes] = await Promise.all([
          fetch('/api/sailors'),
          fetch(`/api/groups?coach_id=${coach.id}`)
        ])
        const [sailorData, groupData] = await Promise.all([
          sailorRes.json(),
          groupRes.json()
        ])
        setSailors(sailorData)
        setGroups(groupData)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('שגיאה בטעינת הנתונים. נסה לרענן את הדף.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [coach])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold flex items-center gap-2"><Users size={24} /> חניכים</h1>
        <p className="text-muted-foreground text-sm">
          {sailors.length} חניכים בסה"כ
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
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sailors.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Users size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">אין חניכים מוגדרים</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sailors.map((sailor) => (
            <Card key={sailor.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-600/20 to-blue-800/25 text-lg">
                    <User size={20} className={sailor.gender === 'female' ? 'text-pink-400' : 'text-blue-400'} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-bold mb-0.5">
                    {sailor.first_name} {sailor.last_name}
                  </div>
                  {sailor.parent_name ? (
                    <div className="text-xs text-muted-foreground">
                      הורה: {sailor.parent_name}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
