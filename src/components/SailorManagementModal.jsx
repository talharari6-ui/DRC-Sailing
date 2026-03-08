import Modal from './Modal'
import { useMemo, useState } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [newSailorData, setNewSailorData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    boat: '',
    birth_date: '',
    join_date: '',
    shirt_size: '',
    parent_name: '',
    parent_phone: '',
  })
  const [loading, setLoading] = useState(false)

  const shirtSizes = ['6', '8', '10', '12', '14', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
  const boatOptions = ['Optimist', 'RS Feva', 'RS Toura']
  const filteredAvailable = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return availableSailors || []
    return (availableSailors || []).filter((s) => {
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
      return fullName.includes(query)
    })
  }, [availableSailors, searchTerm])

  const handleAddExisting = async () => {
    if (!selectedSailorId) return
    setLoading(true)
    try {
      await onAddSailor(groupId, selectedSailorId)
      setSelectedSailorId('')
      setSearchTerm('')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = async () => {
    if (!newSailorData.first_name || !newSailorData.last_name) return
    setLoading(true)
    try {
      await onAddSailor(groupId, null, newSailorData)
      setNewSailorData({
        first_name: '',
        last_name: '',
        gender: '',
        boat: '',
        birth_date: '',
        join_date: '',
        shirt_size: '',
        parent_name: '',
        parent_phone: '',
      })
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
                  <span className="text-sm">{`${sailor.first_name || ''} ${sailor.last_name || ''}`.trim()}</span>
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
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש חניך קיים לפי שם"
              className="mb-2"
            />
            <div className="max-h-40 overflow-y-auto border border-border rounded-md mb-2">
              {filteredAvailable.length === 0 ? (
                <div className="text-xs text-muted-foreground p-2">לא נמצאו חניכים</div>
              ) : (
                filteredAvailable.map((sailor) => (
                  <button
                    key={sailor.id}
                    type="button"
                    onClick={() => setSelectedSailorId(sailor.id)}
                    className={`w-full text-right p-2 text-sm border-b border-border last:border-b-0 ${selectedSailorId === sailor.id ? 'bg-secondary' : ''}`}
                  >
                    {`${sailor.first_name || ''} ${sailor.last_name || ''}`.trim()}
                  </button>
                ))
              )}
            </div>
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
              placeholder="שם פרטי"
              value={newSailorData.first_name}
              onChange={(e) => setNewSailorData({ ...newSailorData, first_name: e.target.value })}
            />
            <Input
              type="text"
              placeholder="שם משפחה"
              value={newSailorData.last_name}
              onChange={(e) => setNewSailorData({ ...newSailorData, last_name: e.target.value })}
            />
            <select
              value={newSailorData.gender}
              onChange={(e) => setNewSailorData({ ...newSailorData, gender: e.target.value })}
              className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm"
            >
              <option value="">מין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
            <select
              value={newSailorData.boat}
              onChange={(e) => setNewSailorData({ ...newSailorData, boat: e.target.value })}
              className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm"
            >
              <option value="">סירה</option>
              {boatOptions.map((boat) => (
                <option key={boat} value={boat}>{boat}</option>
              ))}
            </select>
            <Input
              type="date"
              placeholder="תאריך לידה"
              value={newSailorData.birth_date}
              onChange={(e) => setNewSailorData({ ...newSailorData, birth_date: e.target.value })}
            />
            <Input
              type="date"
              placeholder="תאריך הצטרפות"
              value={newSailorData.join_date}
              onChange={(e) => setNewSailorData({ ...newSailorData, join_date: e.target.value })}
            />
            <select
              value={newSailorData.shirt_size}
              onChange={(e) => setNewSailorData({ ...newSailorData, shirt_size: e.target.value })}
              className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm"
            >
              <option value="">מידת חולצה</option>
              {shirtSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <Input
              type="text"
              placeholder="שם הורה"
              value={newSailorData.parent_name}
              onChange={(e) => setNewSailorData({ ...newSailorData, parent_name: e.target.value })}
            />
            <Input
              type="tel"
              placeholder="טלפון הורה"
              value={newSailorData.parent_phone}
              onChange={(e) => setNewSailorData({ ...newSailorData, parent_phone: e.target.value })}
            />
            <Button
              onClick={handleAddNew}
              disabled={!newSailorData.first_name || !newSailorData.last_name || loading}
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
