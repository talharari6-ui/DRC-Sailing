'use client'

import { Card, CardContent } from '@/components/ui/card'

export default function AdminAbsences() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">🚫 חיסורים</h1>
      </div>
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-3">🚫</div>
          <p className="text-muted-foreground text-sm">
            עמוד חיסורים - דוח מפורט של כל החיסורים במערכת
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
