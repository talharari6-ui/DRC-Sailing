'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const BOAT_OPTIONS = ['Optimist', 'RS Feva', 'RS Toura']
const SHIRT_SIZES = ['6', '8', '10', '12', '14', 'XS', 'S', 'M', 'L', 'XL']
const GENDER_OPTIONS = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'other', label: 'אחר' },
]

const initialForm = {
  first_name: '',
  last_name: '',
  boat: 'Optimist',
  shirt_size: 'M',
  birth_date: '',
  join_date: '',
  parent_name: '',
  parent_phone: '',
  gender: 'male',
}

export default function SailorsPage() {
  const { coach } = useAuth()
  const [sailors, setSailors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(initialForm)

  const loadData = useCallback(async () => {
    if (!coach) return
    setLoading(true)
    setError(null)
    try {
      const sailorRes = await fetch('/api/sailors')
      const sailorData = await sailorRes.json()

      if (!sailorRes.ok) {
        throw new Error(sailorData?.error || 'שגיאה בטעינת החניכים')
      }

      setSailors(Array.isArray(sailorData) ? sailorData : [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('שגיאה בטעינת הנתונים. נסה לרענן את הדף.')
    } finally {
      setLoading(false)
    }
  }, [coach])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateSailor = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError('שם פרטי ושם משפחה הם שדות חובה')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/sailors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          boat: form.boat,
          shirt_size: form.shirt_size,
          birth_date: form.birth_date || null,
          join_date: form.join_date || null,
          parent_name: form.parent_name.trim(),
          parent_phone: form.parent_phone.trim(),
          gender: form.gender,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'שמירת החניך נכשלה')
      }

      setModalOpen(false)
      setForm(initialForm)
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold">👥 חניכים</h1>
          <p className="text-muted-foreground text-sm">{sailors.length} חניכים בסה"כ</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setFormError('')
            setForm(initialForm)
            setModalOpen(true)
          }}
        >
          הוסף חניך
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sailors.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-muted-foreground text-sm">אין חניכים מוגדרים</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sailors.map((sailor) => (
            <Card key={sailor.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-600/20 to-blue-800/25 text-lg">
                    {sailor.gender === 'female' ? '👧' : '👦'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-bold mb-0.5">
                    {sailor.first_name} {sailor.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    דגם: {sailor.boat || 'לא הוגדר'} • מידה: {sailor.shirt_size || 'לא הוגדרה'}
                  </div>
                  {sailor.parent_name ? (
                    <div className="text-xs text-muted-foreground">הורה: {sailor.parent_name}</div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>הוספת חניך חדש</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSailor} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>שם פרטי</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>שם משפחה</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>דגם סירה</Label>
                <Select value={form.boat} onValueChange={(value) => setForm((s) => ({ ...s, boat: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר דגם" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOAT_OPTIONS.map((boat) => (
                      <SelectItem key={boat} value={boat}>
                        {boat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>מידת חולצה</Label>
                <Select value={form.shirt_size} onValueChange={(value) => setForm((s) => ({ ...s, shirt_size: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר מידה" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIRT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>תאריך לידה</Label>
                <Input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm((s) => ({ ...s, birth_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>תאריך תחילת פעילות</Label>
                <Input
                  type="date"
                  value={form.join_date}
                  onChange={(e) => setForm((s) => ({ ...s, join_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>שם הורה</Label>
                <Input
                  value={form.parent_name}
                  onChange={(e) => setForm((s) => ({ ...s, parent_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>טלפון הורה</Label>
                <Input
                  type="tel"
                  value={form.parent_phone}
                  onChange={(e) => setForm((s) => ({ ...s, parent_phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>מגדר</Label>
              <Select value={form.gender} onValueChange={(value) => setForm((s) => ({ ...s, gender: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר מגדר" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formError ? <div className="text-xs text-red-400">{formError}</div> : null}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'שומר...' : 'הוסף חניך'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
