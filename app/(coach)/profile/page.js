'use client'

import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, GraduationCap, ShieldCheck, Construction } from 'lucide-react'

export default function ProfilePage() {
  const { coach } = useAuth()

  return (
    <div className="pb-24">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-extrabold flex items-center gap-2"><User size={20} className="sm:w-6 sm:h-6" /> פרופיל</h1>
      </div>

      <Card className="mb-3 sm:mb-4">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-5">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarFallback className="bg-gradient-to-br from-blue-600/20 to-blue-800/25 text-lg sm:text-3xl">
                <GraduationCap size={24} className="sm:w-8 sm:h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-extrabold truncate">
                {coach?.name || 'משתמש'}
              </div>
              <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs">
                {coach?.is_admin ? <span className="flex items-center gap-1"><ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5" /> מנהל</span> : 'מדריך'}
              </Badge>
            </div>
          </div>

          <Separator className="mb-3 sm:mb-4" />

          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">דוא"ל</div>
              <div className="text-xs sm:text-sm break-all">{coach?.email || 'לא מוגדר'}</div>
            </div>

            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">מזהה</div>
              <div className="text-[9px] sm:text-xs font-mono text-drc-blue-light bg-black/20 p-2 rounded-md break-all">
                {coach?.id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6 sm:py-8 text-center">
          <Construction size={36} className="sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-xs sm:text-sm">עמוד הפרופיל בעדכון...</p>
        </CardContent>
      </Card>
    </div>
  )
}
