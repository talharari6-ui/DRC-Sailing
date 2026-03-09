'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const GROUP_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe', '#fd79a8']

const normalizeTimeInput = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''

  let hours = 0
  let minutes = 0

  if (digits.length <= 2) {
    hours = Number(digits)
  } else if (digits.length === 3) {
    hours = Number(digits.slice(0, 1))
    minutes = Number(digits.slice(1))
  } else {
    const fourDigits = digits.slice(0, 4)
    hours = Number(fourDigits.slice(0, 2))
    minutes = Number(fourDigits.slice(2))
  }

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return ''
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return ''
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const HEBREW_DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState([])
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    coach_id: '',
    color: '#3b82f6',
    days_of_week: [],
    start_time: '',
    end_time: '',
    start_date: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [groupsRes, coachesRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/coaches'),
      ])
      const groupsData = await groupsRes.json()
      const coachesData = await coachesRes.json()

      if (groupsRes.ok && Array.isArray(groupsData)) {
        setGroups(groupsData)
      }
      if (coachesRes.ok && Array.isArray(coachesData)) {
        setCoaches(coachesData)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('שגיאה בטעינת הנתונים')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openDialog = (group = null) => {
    if (group) {
      setEditingGroup(group)
      setFormData({
        name: group.name,
        coach_id: group.coach_id || '',
        color: group.color || '#3b82f6',
        days_of_week: Array.isArray(group.days_of_week) ? group.days_of_week : [],
        start_time: group.start_time || '',
        end_time: group.end_time || '',
        start_date: group.start_date || '',
      })
    } else {
      setEditingGroup(null)
      setFormData({
        name: '',
        coach_id: '',
        color: '#3b82f6',
        days_of_week: [],
        start_time: '',
        end_time: '',
        start_date: '',
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingGroup(null)
  }

  const toggleDay = (dayIndex) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayIndex)
        ? prev.days_of_week.filter((d) => d !== dayIndex)
        : [...prev.days_of_week, dayIndex].sort((a, b) => a - b),
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.coach_id) {
      setError('שם קבוצה ומדריך הם חובה')
      return
    }

    setLoading(true)
    try {
      const normalizedStart = normalizeTimeInput(formData.start_time)
      const normalizedEnd = normalizeTimeInput(formData.end_time)

      if ((formData.start_time && !normalizedStart) || (formData.end_time && !normalizedEnd)) {
        setError('פורמט שעות לא תקין')
        setLoading(false)
        return
      }

      const payload = {
        name: formData.name.trim(),
        coach_id: formData.coach_id,
        color: formData.color,
        days_of_week: formData.days_of_week,
        start_time: normalizedStart,
        end_time: normalizedEnd,
        start_date: formData.start_date || null,
      }

      let res
      if (editingGroup) {
        res = await fetch(`/api/groups/${editingGroup.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save group')
      }

      await loadData()
      closeDialog()
    } catch (err) {
      console.error('Error saving group:', err)
      setError('שגיאה בשמירת הקבוצה')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (groupId) => {
    if (!confirm('האם אתה בטוח שברצונך להסיר קבוצה זו?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete group')
      await loadData()
    } catch (err) {
      console.error('Error deleting group:', err)
      setError('שגיאה בהסרת הקבוצה')
    } finally {
      setLoading(false)
    }
  }

  const getCoachName = (coachId) => {
    return coaches.find((c) => c.id === coachId)?.name || 'לא הוגדר'
  }

  return (
    <div className="pb-24">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">ניהול קבוצות</h1>
        <Button onClick={() => openDialog()}>
          <Plus size={16} className="me-2" /> קבוצה חדשה
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !groups.length ? (
        <div className="text-center p-5 text-muted-foreground">טוען...</div>
      ) : groups.length === 0 ? (
        <div className="text-center p-5 text-muted-foreground">אין קבוצות</div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: group.color || '#3b82f6' }}
                      />
                      <h3 className="font-bold text-sm">{group.name}</h3>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>מדריך: {getCoachName(group.coach_id)}</div>
                      {group.start_time && group.end_time && (
                        <div>שעות: {group.start_time} - {group.end_time}</div>
                      )}
                      {Array.isArray(group.days_of_week) && group.days_of_week.length > 0 && (
                        <div>
                          ימים: {group.days_of_week.map((d) => HEBREW_DAY_NAMES[d]).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(group)}
                      disabled={loading}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(group.id)}
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-h-[80vh] overflow-y-auto pb-24">
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'ערוך קבוצה' : 'קבוצה חדשה'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>שם קבוצה</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="שם קבוצה"
            />

            <Label>מדריך</Label>
            <select
              value={formData.coach_id}
              onChange={(e) => setFormData({ ...formData, coach_id: e.target.value })}
              className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm"
            >
              <option value="">בחר מדריך</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>

            <Label>צבע</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded border-2 ${formData.color === color ? 'border-foreground' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>

            <Label>ימי פעילות</Label>
            <div className="flex flex-wrap gap-2">
              {HEBREW_DAY_NAMES.map((dayLabel, dayIndex) => (
                <Button
                  key={dayIndex}
                  type="button"
                  size="sm"
                  variant={formData.days_of_week.includes(dayIndex) ? 'default' : 'outline'}
                  onClick={() => toggleDay(dayIndex)}
                >
                  {dayLabel}
                </Button>
              ))}
            </div>

            <Label>שעות</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                onBlur={(e) => setFormData({ ...formData, start_time: normalizeTimeInput(e.target.value) })}
                placeholder="שעה (למשל 10 או 1030)"
              />
              <Input
                type="text"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                onBlur={(e) => setFormData({ ...formData, end_time: normalizeTimeInput(e.target.value) })}
                placeholder="שעה (למשל 13 או 1300)"
              />
            </div>

            <Label>תאריך התחלה</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>
              ביטול
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {editingGroup ? 'עדכן' : 'צור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
