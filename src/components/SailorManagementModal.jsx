import Modal from './Modal'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'

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
  const filteredAvailable = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return availableSailors || []
    return (availableSailors || []).filter((s) => {
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
      return fullName.includes(query)
    })
  }, [availableSailors, searchTerm])


  const handleSelectExisting = async (sailorId) => {
    if (!sailorId || loading) return
    setLoading(true)
    try {
      await onAddSailor(groupId, sailorId)
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
      <div className="px-4 pb-24 sm:px-6 sm:pb-24" dir="rtl">
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

        <div className="mb-4 sticky top-0 bg-background z-10">
          <ToggleGroup
            type="single"
            value={newSailorMode}
            onValueChange={(v) => {
              if (!v) return
              setNewSailorMode(v)
            }}
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
                    onClick={() => handleSelectExisting(sailor.id)}
                    className="w-full text-right p-2 text-sm border-b border-border last:border-b-0 hover:bg-secondary"
                  >
                    {`${sailor.first_name || ''} ${sailor.last_name || ''}`.trim()}
                  </button>
                ))
              )}
            </div>
            <div className="text-[11px] text-muted-foreground">לחיצה על שם חניך מוסיפה אותו מיד לקבוצה</div>
          </div>
        ) : (
          <div className="mb-4 space-y-3">
            <Label>שם פרטי</Label>
            <Input value={newSailorData.first_name} onChange={(e) => setNewSailorData({ ...newSailorData, first_name: e.target.value })} placeholder="שם פרטי" />
            <Label>שם משפחה</Label>
            <Input value={newSailorData.last_name} onChange={(e) => setNewSailorData({ ...newSailorData, last_name: e.target.value })} placeholder="שם משפחה" />
            <Label>מין</Label>
            <select value={newSailorData.gender} onChange={(e) => setNewSailorData({ ...newSailorData, gender: e.target.value })} className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm">
              <option value="">בחר</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
            <Label>סירה</Label>
            <select value={newSailorData.boat} onChange={(e) => setNewSailorData({ ...newSailorData, boat: e.target.value })} className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm">
              <option value="">בחר</option>
              {['Optimist', 'RS Feva', 'RS Toura'].map((boat) => <option key={boat} value={boat}>{boat}</option>)}
            </select>
            <Label>תאריך לידה</Label>
            <Input type="date" value={newSailorData.birth_date} onChange={(e) => setNewSailorData({ ...newSailorData, birth_date: e.target.value })} />
            <Label>תאריך הצטרפות</Label>
            <Input type="date" value={newSailorData.join_date} onChange={(e) => setNewSailorData({ ...newSailorData, join_date: e.target.value })} />
            <Label>מידת חולצה</Label>
            <select value={newSailorData.shirt_size} onChange={(e) => setNewSailorData({ ...newSailorData, shirt_size: e.target.value })} className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm">
              <option value="">בחר</option>
              {['6', '8', '10', '12', '14', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <Label>שם הורה</Label>
            <Input value={newSailorData.parent_name} onChange={(e) => setNewSailorData({ ...newSailorData, parent_name: e.target.value })} placeholder="שם הורה" />
            <Label>טלפון הורה</Label>
            <Input value={newSailorData.parent_phone} onChange={(e) => setNewSailorData({ ...newSailorData, parent_phone: e.target.value })} placeholder="טלפון הורה" />
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setNewSailorMode('existing')} disabled={loading} className="flex-1">ביטול</Button>
              <Button onClick={handleAddNew} disabled={!newSailorData.first_name || !newSailorData.last_name || loading} className="flex-1">הוסף</Button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  )
}
