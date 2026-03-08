import Modal from './Modal'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

export default function SessionDetailModal({
  session,
  isOpen,
  onClose,
  coachId,
  onAttendanceUpdate,
}) {
  const [marking, setMarking] = useState(false)
  const [attendance, setAttendance] = useState({})

  useEffect(() => {
    const nextAttendance = {}
    for (const record of session?.attendance || []) {
      if (!record?.sailor_id) continue
      nextAttendance[record.sailor_id] = {
        present: record.present,
        reason: record.absence_reason || null,
      }
    }
    setAttendance(nextAttendance)
  }, [session])

  if (!session) return null

  const isAssignedInstructor = session.coach_id === coachId || session.substitute_coach_id === coachId


  const handleMarkAttendance = async (sailorId, present, reason = null) => {
    setMarking(true)
    try {
      await onAttendanceUpdate(session.id, sailorId, present, reason)
      setAttendance({
        ...attendance,
        [sailorId]: { present, reason }
      })
    } finally {
      setMarking(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={session.groups?.name || 'קבוצה'}>
      <div className="px-4 pb-24 sm:px-6 sm:pb-24" dir="rtl">
        {isAssignedInstructor ? (
          <div className="mb-5">
            <div className="text-xs font-semibold mb-2 text-foreground">
              נוכחות חניכים
            </div>
            <div className="mb-3 rounded-md bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
              הנוכחות נשמרת אוטומטית בכל לחיצה.
              {marking ? ' שומר...' : ' אין צורך בכפתור שמירה.'}
            </div>
            {session.group_sailors && session.group_sailors.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {session.group_sailors.map((gs) => {
                  const sailor = gs.sailors
                  if (!sailor) return null
                  return (
                    <div
                      key={sailor.id}
                      className="flex items-center justify-between gap-3 p-2 bg-secondary rounded-md text-sm"
                    >
                      <span className="flex-1 text-right">{`${sailor.first_name || ''} ${sailor.last_name || sailor.name || ''}`.trim()}</span>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant={attendance[sailor.id]?.present === true ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(sailor.id, true)}
                          disabled={marking}
                          className={attendance[sailor.id]?.present === true ? 'bg-drc-green hover:bg-drc-green/80 h-7 w-7 p-0' : 'h-7 w-7 p-0'}
                        >
                          <Check size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[sailor.id]?.present === false ? 'destructive' : 'outline'}
                          onClick={() => handleMarkAttendance(sailor.id, false, 'היעדרות')}
                          disabled={marking}
                          className="h-7 w-7 p-0"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-muted-foreground text-xs">
                אין חניכים בקבוצה
              </div>
            )}
          </div>
        ) : <div className="text-muted-foreground text-xs">אין הרשאה לנוכחות</div>}

      </div>
    </Modal>
  )
}
