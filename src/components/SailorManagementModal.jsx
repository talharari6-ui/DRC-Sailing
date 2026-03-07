import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SailorManagementModal({
  groupId,
  isOpen,
  onClose,
  sailors,
  onAddSailor,
  onRemoveSailor,
  availableSailors,
}) {
  const [newSailorMode, setNewSailorMode] = useState('existing')
  const [selectedSailorId, setSelectedSailorId] = useState('')
  const [newSailorData, setNewSailorData] = useState({
    name: '',
    age: '',
    level: 'beginner',
  })
  const [loading, setLoading] = useState(false)

  const handleAddExisting = async () => {
    if (!selectedSailorId || !onAddSailor) return
    setLoading(true)
    try {
      await onAddSailor(groupId, selectedSailorId)
      setSelectedSailorId('')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = async () => {
    if (!newSailorData.name || !newSailorData.age || !onAddSailor) return
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>ערוך חניכים</DialogTitle>
        </DialogHeader>

        <div className="pb-2">
          <div className="mb-5">
            <div className="text-xs font-semibold mb-2 text-foreground">חניכים בקבוצה</div>
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
                      onClick={() => onRemoveSailor?.(groupId, sailor.id)}
                      disabled={loading}
                      className="h-7 text-xs"
                    >
                      הסר
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-xs">אין חניכים בקבוצה זו</div>
            )}
          </div>

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

          {newSailorMode === 'existing' ? (
            <div className="mb-4 space-y-2">
              <Select value={selectedSailorId} onValueChange={setSelectedSailorId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר חניך..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSailors?.map((sailor) => (
                    <SelectItem key={sailor.id} value={String(sailor.id)}>
                      {sailor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddExisting} disabled={!selectedSailorId || loading} className="w-full">
                הוסף
              </Button>
            </div>
          ) : null}

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
              <Select
                value={newSailorData.level}
                onValueChange={(value) => setNewSailorData({ ...newSailorData, level: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">מתחיל</SelectItem>
                  <SelectItem value="intermediate">בינוני</SelectItem>
                  <SelectItem value="advanced">מתקדם</SelectItem>
                </SelectContent>
              </Select>
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
      </DialogContent>
    </Dialog>
  )
}