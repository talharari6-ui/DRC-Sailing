import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function SubstituteCoachModal({
  session,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { coach } = useAuth()
  const [loading, setLoading] = useState(false)
  const [coaches, setCoaches] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !session?.id) return
      setError('')
      try {
        const res = await fetch(`/api/sessions/${session.id}/substitute`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load coaches')
        setCoaches(Array.isArray(data) ? data.filter((c) => c.id !== coach?.id) : [])
      } catch (e) {
        setError(e.message)
      }
    }

    load()
  }, [isOpen, session?.id, coach?.id])

  const handleSelect = async (substituteCoachId) => {
    if (!substituteCoachId || !session?.id) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/sessions/${session.id}/substitute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: substituteCoachId,
          requester_id: coach?.id,
          requester_is_admin: !!coach?.is_admin,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to submit substitute request')

      onClose()
      await onSuccess?.(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>בחר מדריך מחליף</DialogTitle>
        </DialogHeader>

        {error ? <div className="text-xs text-red-400">{error}</div> : null}

        {coaches.length > 0 ? (
          <div className="flex flex-col gap-2">
            {coaches.map((item) => (
              <Button
                key={item.id}
                variant="secondary"
                onClick={() => handleSelect(item.id)}
                disabled={loading}
                className="justify-start text-start h-auto py-3"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.email ? <div className="text-xs text-muted-foreground mt-1">{item.email}</div> : null}
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
