import Modal from './Modal'
import { useState } from 'react'

export default function SailorManagementModal({
  groupId,
  isOpen,
  onClose,
  sailors,
  onAddSailor,
  onRemoveSailor,
  availableSailors
}) {
  const [newSailorMode, setNewSailorMode] = useState('existing') // existing or new
  const [selectedSailorId, setSelectedSailorId] = useState('')
  const [newSailorData, setNewSailorData] = useState({
    name: '',
    age: '',
    level: 'beginner'
  })
  const [loading, setLoading] = useState(false)

  const handleAddExisting = async () => {
    if (!selectedSailorId) return
    setLoading(true)
    try {
      await onAddSailor(groupId, selectedSailorId)
      setSelectedSailorId('')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = async () => {
    if (!newSailorData.name || !newSailorData.age) return
    setLoading(true)
    try {
      await onAddSailor(groupId, null, newSailorData)
      setNewSailorData({ name: '', age: '', level: 'beginner' })
      setNewSailorMode('existing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ערוך חניכים">
      <div style={{ direction: 'rtl', padding: '0 16px 16px' }}>
        {/* Current Sailors */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--text)'
            }}
          >
            חניכים בקבוצה
          </div>
          {sailors && sailors.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sailors.map((sailor) => (
                <div
                  key={sailor.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: 'var(--bg2)',
                    borderRadius: '6px'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{sailor.name}</span>
                  <button
                    onClick={() => onRemoveSailor(groupId, sailor.id)}
                    disabled={loading}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#f44336',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    הסר
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
              אין חניכים בקבוצה זו
            </div>
          )}
        </div>

        {/* Add Sailor Mode Toggle */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <button
            onClick={() => setNewSailorMode('existing')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor:
                newSailorMode === 'existing' ? 'var(--blue-light)' : 'var(--bg2)',
              color: newSailorMode === 'existing' ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            חניך קיים
          </button>
          <button
            onClick={() => setNewSailorMode('new')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor:
                newSailorMode === 'new' ? 'var(--blue-light)' : 'var(--bg2)',
              color: newSailorMode === 'new' ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            חניך חדש
          </button>
        </div>

        {/* Add Sailor - Existing */}
        {newSailorMode === 'existing' && (
          <div style={{ marginBottom: '16px' }}>
            <select
              value={selectedSailorId}
              onChange={(e) => setSelectedSailorId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            >
              <option value="">בחר חניך...</option>
              {availableSailors &&
                availableSailors.map((sailor) => (
                  <option key={sailor.id} value={sailor.id}>
                    {sailor.name}
                  </option>
                ))}
            </select>
            <button
              onClick={handleAddExisting}
              disabled={!selectedSailorId || loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--blue-light)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: !selectedSailorId || loading ? 0.5 : 1
              }}
            >
              הוסף
            </button>
          </div>
        )}

        {/* Add Sailor - New */}
        {newSailorMode === 'new' && (
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="שם"
              value={newSailorData.name}
              onChange={(e) =>
                setNewSailorData({ ...newSailorData, name: e.target.value })
              }
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            />
            <input
              type="number"
              placeholder="גיל"
              value={newSailorData.age}
              onChange={(e) =>
                setNewSailorData({ ...newSailorData, age: e.target.value })
              }
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            />
            <select
              value={newSailorData.level}
              onChange={(e) =>
                setNewSailorData({ ...newSailorData, level: e.target.value })
              }
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            >
              <option value="beginner">מתחיל</option>
              <option value="intermediate">בינוני</option>
              <option value="advanced">מתקדם</option>
            </select>
            <button
              onClick={handleAddNew}
              disabled={!newSailorData.name || !newSailorData.age || loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--blue-light)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity:
                  !newSailorData.name || !newSailorData.age || loading
                    ? 0.5
                    : 1
              }}
            >
              הוסף
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
