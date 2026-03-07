import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function SubstituteCoachModal({
  sessionId,
  isOpen,
  onClose,
  coaches,
  onSubstituteSelect,
}) {
  const [loading, setLoading] = useState(false)

  const handleSelect = async (coachId) => {
    if (!coachId || !onSubstituteSelect) return
    setLoading(true)
    try {
      await onSubstituteSelect(sessionId, coachId)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>בחר מדריך להחלפה</DialogTitle>
        </DialogHeader>

        {coaches && coaches.length > 0 ? (
          <div className="flex flex-col gap-2">
            {coaches.map((coach) => (
              <Button
                key={coach.id}
                variant="secondary"
                onClick={() => handleSelect(coach.id)}
                disabled={loading}
                className="justify-start text-start h-auto py-3"
              >
                <div>
                  <div className="font-medium">{coach.name}</div>
                  {coach.email ? (
                    <div className="text-xs text-muted-foreground mt-1">{coach.email}</div>
                  ) : null}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-5 text-sm">אין מדריכים זמינים</div>
        )}
      </DialogContent>
    </Dialog>
  )
}