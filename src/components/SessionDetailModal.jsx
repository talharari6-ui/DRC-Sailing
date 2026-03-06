import Modal from './Modal'
import { useState } from 'react'

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
      <div style={{ direction: 'rtl', padding: '0 16px 16px' }}>
        {/* Session Info */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '12px'
            }}
          >
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                תאריך
              </div>
              <div style={{ color: 'var(--text)', fontSize: '14px' }}>
                {session.date}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                שעה
              </div>
              <div style={{ color: 'var(--text)', fontSize: '14px' }}>
                {formatTime(session.start_time)} -{' '}
                {formatTime(session.end_time)}
              </div>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
              מדריך
            </div>
            <div style={{ color: 'var(--text)', fontSize: '14px' }}>
              {session.coaches?.name || 'לא מוגדר'}
            </div>
          </div>
        </div>

        {/* Sailors/Attendance */}
        {canMarkAttendance && (
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text)'
              }}
            >
              נוכחות חניכים
            </div>
            {session.group_sailors && session.group_sailors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {session.group_sailors.map((gs) => {
                  const sailor = gs.sailors || gs
                  return (
                    <div
                      key={sailor.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: 'var(--bg2)',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <span>{sailor.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleMarkAttendance(sailor.id, true)}
                          disabled={marking}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor:
                              attendance[sailor.id]?.present === true
                                ? '#4CAF50'
                                : 'var(--border)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() =>
                            handleMarkAttendance(sailor.id, false, 'היעדרות')
                          }
                          disabled={marking}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor:
                              attendance[sailor.id]?.present === false
                                ? '#f44336'
                                : 'var(--border)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                אין חניכים בקבוצה
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '20px'
          }}
        >
          {isOwnSession && (
            <>
              <button
                onClick={() => onEditSailors(session.id)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--blue-light)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ✏️ ערוך חניכים
              </button>
              <button
                onClick={() => onSubstituteRequest(session.id)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--bg2)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔄 בקשה להחלפה
              </button>
              <button
                onClick={() => onDecline(session.id)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ⛔ דחייה
              </button>
            </>
          )}

          {isSubstitute && (
            <>
              <button
                onClick={() => onEditSailors(session.id)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--blue-light)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ✏️ ערוך חניכים
              </button>
              <button
                onClick={() => onDecline(session.id)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ⛔ דחייה
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
