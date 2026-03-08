import Modal from './Modal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Pencil, RefreshCw, XOctagon } from 'lucide-react'

export default function SessionDetailModal({
  session,
  isOpen,
  onClose,
  coachId,
  onAttendanceUpdate,
  onSubstituteRequest,
  onDecline,
  onEditSailors
}) {
  const [marking, setMarking] = useState(false)
  const [attendance, setAttendance] = useState({})

  if (!session) return null

  const isOwnSession = session.coach_id === coachId
  const isSubstitute = session.substitute_coach_id === coachId
  const canMarkAttendance = isOwnSession || isSubstitute

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, mins] = time.split(':')
    return `${hours}:${mins}`
  }

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
      <div className="px-4 pb-5 sm:px-6 sm:pb-6" dir="rtl">
        {/* Session Info */}
        <div className="mb-5">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-muted-foreground text-xs">תאריך</div>
              <div className="text-foreground text-sm">{session.date}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">שעה</div>
              <div className="text-foreground text-sm">
                {formatTime(session.start_time)} - {formatTime(session.end_time)}
              </div>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">מדריך</div>
            <div className="text-foreground text-sm">
              {session.coaches?.name || 'לא מוגדר'}
            </div>
          </div>
        </div>

        {/* Attendance */}
        {canMarkAttendance ? (
          <div className="mb-5">
            <div className="text-xs font-semibold mb-2 text-foreground">
              נוכחות חניכים
            </div>
            {session.group_sailors && session.group_sailors.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {session.group_sailors.map((gs) => {
                  const sailor = gs.sailors
                  if (!sailor) return null
                  return (
                    <div
                      key={sailor.id}
                      className="flex justify-between items-center p-2 bg-secondary rounded-md text-sm"
                    >
                      <span>{sailor.name}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={attendance[sailor.id]?.present === true ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(sailor.id, true)}
                          disabled={marking}
                          className={attendance[sailor.id]?.present === true ? 'bg-drc-green hover:bg-drc-green/80 h-8 px-3' : 'h-8 px-3'}
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[sailor.id]?.present === false ? 'destructive' : 'outline'}
                          onClick={() => handleMarkAttendance(sailor.id, false, 'היעדרות')}
                          disabled={marking}
                          className="h-8 px-3"
                        >
                          <X size={16} />
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
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          {isOwnSession ? (
            <>
              <Button onClick={() => onEditSailors(session.id)}>
                <Pencil size={16} /> ערוך חניכים
              </Button>
              <Button variant="secondary" onClick={() => onSubstituteRequest(session.id)}>
                <RefreshCw size={16} /> בקשה להחלפה
              </Button>
              <Button variant="destructive" onClick={() => onDecline(session.id)}>
                <XOctagon size={16} /> דחייה
              </Button>
            </>
          ) : null}

          {isSubstitute ? (
            <>
              <Button onClick={() => onEditSailors(session.id)}>
                <Pencil size={16} /> ערוך חניכים
              </Button>
              <Button variant="destructive" onClick={() => onDecline(session.id)}>
                <XOctagon size={16} /> דחייה
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
