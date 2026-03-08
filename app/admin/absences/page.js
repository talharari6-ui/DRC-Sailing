'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Ban } from 'lucide-react'

export default function AdminAbsences() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold flex items-center gap-2"><Ban size={24} /> חיסורים</h1>
      </div>
      <Card>
        <CardContent className="py-8 text-center">
          <Ban size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            עמוד חיסורים - דוח מפורט של כל החיסורים במערכת
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
