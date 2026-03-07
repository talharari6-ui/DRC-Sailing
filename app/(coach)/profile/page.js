'use client'

import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
  const { coach } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">👤 פרופיל</h1>
      </div>

      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-br from-blue-600/20 to-blue-800/25 text-3xl">
                👨‍🏫
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-extrabold">
                {coach?.name || 'משתמש'}
              </div>
              <Badge variant="outline" className="mt-1">
                {coach?.is_admin ? '🔐 מנהל' : 'מדריך'}
              </Badge>
            </div>
          </div>

          <Separator className="mb-4" />

          <div>
            <div className="text-xs text-muted-foreground mb-2">דוא"ל</div>
            <div className="text-sm mb-4">{coach?.email || 'לא מוגדר'}</div>

            <div className="text-xs text-muted-foreground mb-2">מזהה</div>
            <div className="text-xs font-mono text-drc-blue-light bg-black/20 p-2 rounded-md">
              {coach?.id}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-3">🏗️</div>
          <p className="text-muted-foreground text-sm">עמוד הפרופיל בעדכון...</p>
        </CardContent>
      </Card>
    </div>
  )
}
