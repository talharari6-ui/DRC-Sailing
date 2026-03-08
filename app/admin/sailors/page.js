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
import { Users, User } from 'lucide-react'

export default function AdminSailors() {
  const [sailors, setSailors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSailors = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/sailors')
        const data = await res.json()
        setSailors(data)
      } catch (err) {
        console.error('Error loading sailors:', err)
        setError('שגיאה בטעינת החניכים. נסה לרענן את הדף.')
      } finally {
        setLoading(false)
      }
    }
    loadSailors()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold flex items-center gap-2"><Users size={24} /> ניהול חניכים</h1>
        <p className="text-muted-foreground text-sm">{sailors.length} חניכים בסה"כ</p>
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
            <p className="text-muted-foreground text-sm">אין חניכים</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-3">
            {sailors.map((sailor) => (
              <Card key={sailor.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-blue-600/20 to-blue-800/25 text-lg">
                      <User size={20} className={sailor.gender === 'female' ? 'text-pink-400' : 'text-blue-400'} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-bold">
                      {sailor.first_name} {sailor.last_name}
                    </div>
                    {sailor.parent_name ? (
                      <div className="text-xs text-muted-foreground">
                        הורה: {sailor.parent_name}
                      </div>
                    ) : null}
                  </div>
                  {sailor.shirt_size ? (
                    <Badge variant="outline" className="text-xs">
                      מידה {sailor.shirt_size}
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
                  <TableHead>הורה</TableHead>
                  <TableHead>מידת חולצה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sailors.map((sailor) => (
                  <TableRow key={sailor.id}>
                    <TableCell className="font-medium">
                      <User size={20} className={sailor.gender === 'female' ? 'text-pink-400' : 'text-blue-400'} />{' '}
                      {sailor.first_name} {sailor.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sailor.parent_name || 'לא מוגדר'}
                    </TableCell>
                    <TableCell>
                      {sailor.shirt_size ? (
                        <Badge variant="outline" className="text-xs">
                          {sailor.shirt_size}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
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
