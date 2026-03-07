import Modal from './Modal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SubstituteCoachModal({
  sessionId,
  isOpen,
  onClose,
  coaches,
  onSubstituteSelect
}) {
  const [loading, setLoading] = useState(false)

  const handleSelect = async (coachId) => {
    if (!coachId) return
    setLoading(true)
    try {
      await onSubstituteSelect(sessionId, coachId)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="בחר מדריך להחלפה">
      <div className="px-4 pb-4" dir="rtl">
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
                    <div className="text-xs text-muted-foreground mt-1">
                      {coach.email}
                    </div>
                  ) : null}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-5 text-sm">
            אין מדריכים זמינים
          </div>
        )}
      </div>
    </Modal>
  )
}
