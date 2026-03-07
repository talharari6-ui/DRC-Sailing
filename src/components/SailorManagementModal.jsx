import Modal from './Modal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function SailorManagementModal({
  groupId,
  isOpen,
  onClose,
  sailors,
  onAddSailor,
  onRemoveSailor,
  availableSailors
}) {
  const [newSailorMode, setNewSailorMode] = useState('existing')
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
      <div className="px-4 pb-5 sm:px-6 sm:pb-6" dir="rtl">
        {/* Current Sailors */}
        <div className="mb-5">
          <div className="text-xs font-semibold mb-2 text-foreground">
            חניכים בקבוצה
          </div>
          {sailors && sailors.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {sailors.map((sailor) => (
                <div
                  key={sailor.id}
                  className="flex justify-between items-center p-3 bg-secondary rounded-md"
                >
                  <span className="text-sm">{sailor.name}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveSailor(groupId, sailor.id)}
                    disabled={loading}
                    className="h-7 text-xs"
                  >
                    הסר
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">
              אין חניכים בקבוצה זו
            </div>
          )}
        </div>

        {/* Add Sailor Mode Toggle */}
        <div className="mb-4">
          <ToggleGroup
            type="single"
            value={newSailorMode}
            onValueChange={(v) => v && setNewSailorMode(v)}
            className="w-full"
          >
            <ToggleGroupItem value="existing" className="flex-1 text-xs data-[state=on]:bg-drc-blue-light data-[state=on]:text-white">
              חניך קיים
            </ToggleGroupItem>
            <ToggleGroupItem value="new" className="flex-1 text-xs data-[state=on]:bg-drc-blue-light data-[state=on]:text-white">
              חניך חדש
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Add Existing Sailor */}
        {newSailorMode === 'existing' ? (
          <div className="mb-4">
            <select
              value={selectedSailorId}
              onChange={(e) => setSelectedSailorId(e.target.value)}
              className="w-full p-2.5 mb-2 rounded-md border border-border bg-secondary text-foreground text-sm"
            >
              <option value="">בחר חניך...</option>
              {availableSailors &&
                availableSailors.map((sailor) => (
                  <option key={sailor.id} value={sailor.id}>
                    {sailor.name}
                  </option>
                ))}
            </select>
            <Button
              onClick={handleAddExisting}
              disabled={!selectedSailorId || loading}
              className="w-full"
            >
              הוסף
            </Button>
          </div>
        ) : null}

        {/* Add New Sailor */}
        {newSailorMode === 'new' ? (
          <div className="mb-4 space-y-2">
            <Input
              type="text"
              placeholder="שם"
              value={newSailorData.name}
              onChange={(e) => setNewSailorData({ ...newSailorData, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="גיל"
              value={newSailorData.age}
              onChange={(e) => setNewSailorData({ ...newSailorData, age: e.target.value })}
            />
            <select
              value={newSailorData.level}
              onChange={(e) => setNewSailorData({ ...newSailorData, level: e.target.value })}
              className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm"
            >
              <option value="beginner">מתחיל</option>
              <option value="intermediate">בינוני</option>
              <option value="advanced">מתקדם</option>
            </select>
            <Button
              onClick={handleAddNew}
              disabled={!newSailorData.name || !newSailorData.age || loading}
              className="w-full"
            >
              הוסף
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
