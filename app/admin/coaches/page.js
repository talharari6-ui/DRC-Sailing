'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GraduationCap } from 'lucide-react'

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCoaches = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/coaches')
        const data = await res.json()
        setCoaches(data)
      } catch (err) {
        console.error('Error loading coaches:', err)
        setError('שגיאה בטעינת המדריכים. נסה לרענן את הדף.')
      } finally {
        setLoading(false)
      }
    }
    loadCoaches()
  }, [])

  return (
    <div className="pb-24">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-extrabold flex items-center gap-2"><GraduationCap size={20} className="sm:w-6 sm:h-6" /> ניהול מדריכים</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{coaches.length} מדריכים</p>
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
      ) : coaches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <GraduationCap size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">אין מדריכים</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-2 sm:space-y-3">
            {coaches.map((coach) => (
              <Card key={coach.id}>
                <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600/20 to-blue-800/25 text-sm">
                      <GraduationCap size={16} className="sm:w-5 sm:h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-bold truncate">{coach.name}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {coach.email || 'אין דוא"ל'}
                    </div>
                  </div>
                  {coach.is_admin ? (
                    <Badge className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-[10px] sm:text-xs font-bold shrink-0">
                      מנהל
                    </Badge>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop: table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>דוא"ל</TableHead>
                  <TableHead>תפקיד</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coaches.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell className="font-medium">{coach.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {coach.email || 'לא מוגדר'}
                    </TableCell>
                    <TableCell>
                      {coach.is_admin ? (
                        <Badge className="bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xs font-bold">
                          מנהל
                        </Badge>
                      ) : (
                        <Badge variant="outline">מדריך</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
