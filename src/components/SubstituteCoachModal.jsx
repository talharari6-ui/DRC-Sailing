import Modal from './Modal'
import { useState } from 'react'

export default function SubstituteCoachModal({
  sessionId,
  isOpen,
  onClose,
  coaches,
  onSubstituteSelect
}) {
  const [loading, setLoading] = useState(false)
  const [selectedCoachId, setSelectedCoachId] = useState('')

  const handleSelect = async (coachId) => {
    if (!coachId) return
    setLoading(true)
    try {
      await onSubstituteSelect(sessionId, coachId)
      setSelectedCoachId('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="בחר מדריך להחלפה"
    >
      <div style={{ direction: 'rtl', padding: '0 16px 16px' }}>
        {coaches && coaches.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coaches.map((coach) => (
              <button
                key={coach.id}
                onClick={() => handleSelect(coach.id)}
                disabled={loading}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--bg2)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'right',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: '500' }}>{coach.name}</div>
                {coach.email && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      marginTop: '4px'
                    }}
                  >
                    {coach.email}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--muted)',
              padding: '20px',
              fontSize: '14px'
            }}
          >
            אין מדריכים זמינים
          </div>
        )}
      </div>
    </Modal>
  )
}
