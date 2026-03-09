'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Users, User, Pencil, Plus } from 'lucide-react'

export default function SailorsPage() {
  const { coach } = useAuth()
  const [sailors, setSailors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSailor, setEditingSailor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
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

  const shirtSizes = ['6', '8', '10', '12', '14', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
  const boatOptions = ['Optimist', 'RS Feva', 'RS Toura']

  useEffect(() => {
    const loadData = async () => {
      if (!coach) return
      setLoading(true)
      setError(null)
      try {
        const sailorRes = await fetch('/api/sailors')
        const sailorData = await sailorRes.json()
        setSailors(sailorData)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('שגיאה בטעינת הנתונים. נסה לרענן את הדף.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [coach])

  const openCreate = () => {
    setEditingSailor(null)
    setForm({
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
    setDialogOpen(true)
  }

  const openEdit = (sailor) => {
    setEditingSailor(sailor)
    setForm({
      first_name: sailor.first_name || '',
      last_name: sailor.last_name || '',
      gender: sailor.gender || '',
      boat: sailor.boat || '',
      birth_date: sailor.birth_date || '',
      join_date: sailor.join_date || '',
      shirt_size: sailor.shirt_size || '',
      parent_name: sailor.parent_name || '',
      parent_phone: sailor.parent_phone || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.first_name || !form.last_name) return
    setSaving(true)
    try {
      const url = editingSailor ? `/api/sailors/${editingSailor.id}` : '/api/sailors'
      const method = editingSailor ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed saving sailor')
      const saved = await res.json()
      if (editingSailor) {
        setSailors((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
      } else {
        setSailors((prev) => [saved, ...prev])
      }
      setDialogOpen(false)
    } catch (err) {
      console.error('Save sailor error:', err)
      setError('שגיאה בשמירת חניך')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-extrabold flex items-center gap-2"><Users size={20} className="sm:w-6 sm:h-6" /> חניכים</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {sailors.length} חניכים בסה&quot;כ
        </p>
        <div className="mt-2 sm:mt-3">
          <Button onClick={openCreate} className="text-xs sm:text-sm">
            <Plus size={14} className="sm:w-4 sm:h-4" /> הוסף חניך
          </Button>
        </div>
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
            <Users size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">אין חניכים מוגדרים</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {sailors.map((sailor) => (
            <Card key={sailor.id}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600/20 to-blue-800/25 text-sm">
                    <User size={16} className={`sm:w-5 sm:h-5 ${sailor.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold mb-0.5 truncate">
                    {sailor.first_name} {sailor.last_name}
                  </div>
                  {sailor.parent_name ? (
                    <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      הורה: {sailor.parent_name}
                    </div>
                  ) : null}
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(sailor)} className="h-8 sm:h-9 text-xs sm:text-sm shrink-0">
                  <Pencil size={12} className="sm:w-4 sm:h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="max-h-[85vh] overflow-y-auto pb-28 sm:pb-24 text-xs sm:text-sm">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{editingSailor ? 'עריכת חניך' : 'חניך חדש'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-xs sm:text-sm">
            <Label>שם פרטי</Label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Label>שם משפחה</Label>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <Label>מין</Label>
            <select className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">בחר</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
            <Label>סירה</Label>
            <select className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm" value={form.boat} onChange={(e) => setForm({ ...form, boat: e.target.value })}>
              <option value="">בחר</option>
              {boatOptions.map((boat) => <option key={boat} value={boat}>{boat}</option>)}
            </select>
            <Label>תאריך לידה</Label>
            <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            <Label>תאריך הצטרפות</Label>
            <Input type="date" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
            <Label>מידת חולצה</Label>
            <select className="w-full p-2.5 rounded-md border border-border bg-secondary text-foreground text-sm" value={form.shirt_size} onChange={(e) => setForm({ ...form, shirt_size: e.target.value })}>
              <option value="">בחר</option>
              {shirtSizes.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <Label>שם הורה</Label>
            <Input value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} />
            <Label>טלפון הורה</Label>
            <Input value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>ביטול</Button>
            <Button onClick={handleSave} disabled={saving || !form.first_name || !form.last_name}>{saving ? 'שומר...' : 'שמור'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
