'use client'

import { Card, CardContent } from '@/components/ui/card'

export default function AdminSubstitutions() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold">🔄 החלפות מדריכים</h1>
      </div>
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-muted-foreground text-sm">
            עמוד החלפות מדריכים - ניהול החלפות ואישורים
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
