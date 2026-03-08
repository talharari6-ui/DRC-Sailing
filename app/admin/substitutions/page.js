'use client'

import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

export default function AdminSubstitutions() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold flex items-center gap-2"><RefreshCw size={24} /> החלפות מדריכים</h1>
      </div>
      <Card>
        <CardContent className="py-8 text-center">
          <RefreshCw size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            עמוד החלפות מדריכים - ניהול החלפות ואישורים
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
