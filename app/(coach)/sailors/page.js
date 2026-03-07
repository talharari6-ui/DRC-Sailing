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
  { value: 'male', label: '\u05d6\u05db\u05e8' },
  { value: 'female', label: '\u05e0\u05e7\u05d1\u05d4' },
  { value: 'other', label: '\u05d0\u05d7\u05e8' },
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
  const [editingSailorId, setEditingSailorId] = useState(null)

  const loadData = useCallback(async () => {
    if (!coach) return
    setLoading(true)
    setError(null)
    try {
      const sailorRes = await fetch('/api/sailors')
      const sailorData = await sailorRes.json()

      if (!sailorRes.ok) {
        throw new Error(sailorData?.error || '\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d8\u05e2\u05d9\u05e0\u05ea \u05d4\u05d7\u05e0\u05d9\u05db\u05d9\u05dd')
      }

      setSailors(Array.isArray(sailorData) ? sailorData : [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d8\u05e2\u05d9\u05e0\u05ea \u05d4\u05e0\u05ea\u05d5\u05e0\u05d9\u05dd. \u05e0\u05e1\u05d4 \u05dc\u05e8\u05e2\u05e0\u05df \u05d0\u05ea \u05d4\u05d3\u05e3.')
    } finally {
      setLoading(false)
    }
  }, [coach])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCreateModal = () => {
    setFormError('')
    setEditingSailorId(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEditModal = (sailor) => {
    setFormError('')
    setEditingSailorId(sailor.id)
    setForm({
      first_name: sailor.first_name || '',
      last_name: sailor.last_name || '',
      boat: sailor.boat || 'Optimist',
      shirt_size: sailor.shirt_size || 'M',
      birth_date: sailor.birth_date || '',
      join_date: sailor.join_date || '',
      parent_name: sailor.parent_name || '',
      parent_phone: sailor.parent_phone || '',
      gender: sailor.gender || 'male',
    })
    setModalOpen(true)
  }

  const handleSaveSailor = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError('\u05e9\u05dd \u05e4\u05e8\u05d8\u05d9 \u05d5\u05e9\u05dd \u05de\u05e9\u05e4\u05d7\u05d4 \u05d4\u05dd \u05e9\u05d3\u05d5\u05ea \u05d7\u05d5\u05d1\u05d4')
      return
    }

    try {
      setSaving(true)
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        boat: form.boat,
        shirt_size: form.shirt_size,
        birth_date: form.birth_date || null,
        join_date: form.join_date || null,
        parent_name: form.parent_name.trim(),
        parent_phone: form.parent_phone.trim(),
        gender: form.gender,
      }

      const url = editingSailorId ? `/api/sailors/${editingSailorId}` : '/api/sailors'
      const method = editingSailorId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || (editingSailorId ? '\u05e2\u05d3\u05db\u05d5\u05df \u05d7\u05e0\u05d9\u05da \u05e0\u05db\u05e9\u05dc' : '\u05e9\u05de\u05d9\u05e8\u05ea \u05d7\u05e0\u05d9\u05da \u05e0\u05db\u05e9\u05dc\u05d4'))
      }

      setModalOpen(false)
      setEditingSailorId(null)
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
          <h1 className="text-xl font-extrabold">{'\u05d7\u05e0\u05d9\u05db\u05d9\u05dd'}</h1>
          <p className="text-muted-foreground text-sm">{sailors.length} {'\u05d7\u05e0\u05d9\u05db\u05d9\u05dd \u05d1\u05e1\"\u05d4\"\u05db'}</p>
        </div>
        <Button size="sm" onClick={openCreateModal}>{'\u05d4\u05d5\u05e1\u05e3 \u05d7\u05e0\u05d9\u05da'}</Button>
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
            <p className="text-muted-foreground text-sm">{'\u05d0\u05d9\u05df \u05d7\u05e0\u05d9\u05db\u05d9\u05dd \u05de\u05d5\u05d2\u05d3\u05e8\u05d9\u05dd'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sailors.map((sailor) => (
            <Card key={sailor.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-600/20 to-blue-800/25 text-lg">
                    {sailor.gender === 'female' ? '\u05e0' : '\u05d6'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-bold mb-0.5">{sailor.first_name} {sailor.last_name}</div>
                  <div className="text-xs text-muted-foreground">{'\u05d3\u05d2\u05dd:'} {sailor.boat || '\u05dc\u05d0 \u05d4\u05d5\u05d2\u05d3\u05e8'} {' • '} {'\u05de\u05d9\u05d3\u05d4:'} {sailor.shirt_size || '\u05dc\u05d0 \u05d4\u05d5\u05d2\u05d3\u05e8\u05d4'}</div>
                  {sailor.parent_name ? <div className="text-xs text-muted-foreground">{'\u05d4\u05d5\u05e8\u05d4:'} {sailor.parent_name}</div> : null}
                </div>
                <Button size="sm" variant="outline" onClick={() => openEditModal(sailor)}>{'\u05e2\u05e8\u05d5\u05da'}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSailorId ? '\u05e2\u05e8\u05d9\u05db\u05ea \u05d7\u05e0\u05d9\u05da' : '\u05d4\u05d5\u05e1\u05e4\u05ea \u05d7\u05e0\u05d9\u05da \u05d7\u05d3\u05e9'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSailor} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{'\u05e9\u05dd \u05e4\u05e8\u05d8\u05d9'}</Label>
                <Input value={form.first_name} onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))} required />
              </div>
              <div>
                <Label>{'\u05e9\u05dd \u05de\u05e9\u05e4\u05d7\u05d4'}</Label>
                <Input value={form.last_name} onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{'\u05d3\u05d2\u05dd \u05e1\u05d9\u05e8\u05d4'}</Label>
                <Select value={form.boat} onValueChange={(value) => setForm((s) => ({ ...s, boat: value }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{BOAT_OPTIONS.map((boat) => <SelectItem key={boat} value={boat}>{boat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{'\u05de\u05d9\u05d3\u05ea \u05d7\u05d5\u05dc\u05e6\u05d4'}</Label>
                <Select value={form.shirt_size} onValueChange={(value) => setForm((s) => ({ ...s, shirt_size: value }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{SHIRT_SIZES.map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{'\u05ea\u05d0\u05e8\u05d9\u05da \u05dc\u05d9\u05d3\u05d4'}</Label>
                <Input type="date" value={form.birth_date} onChange={(e) => setForm((s) => ({ ...s, birth_date: e.target.value }))} />
              </div>
              <div>
                <Label>{'\u05ea\u05d0\u05e8\u05d9\u05da \u05ea\u05d7\u05d9\u05dc\u05ea \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea'}</Label>
                <Input type="date" value={form.join_date} onChange={(e) => setForm((s) => ({ ...s, join_date: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{'\u05e9\u05dd \u05d4\u05d5\u05e8\u05d4'}</Label>
                <Input value={form.parent_name} onChange={(e) => setForm((s) => ({ ...s, parent_name: e.target.value }))} />
              </div>
              <div>
                <Label>{'\u05d8\u05dc\u05e4\u05d5\u05df \u05d4\u05d5\u05e8\u05d4'}</Label>
                <Input type="tel" value={form.parent_phone} onChange={(e) => setForm((s) => ({ ...s, parent_phone: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>{'\u05de\u05d2\u05d3\u05e8'}</Label>
              <Select value={form.gender} onValueChange={(value) => setForm((s) => ({ ...s, gender: value }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{GENDER_OPTIONS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {formError ? <div className="text-xs text-red-400">{formError}</div> : null}
            <Button type="submit" className="w-full" disabled={saving}>{saving ? '\u05e9\u05d5\u05de\u05e8...' : (editingSailorId ? '\u05e9\u05de\u05d5\u05e8 \u05e9\u05d9\u05e0\u05d5\u05d9\u05d9\u05dd' : '\u05d4\u05d5\u05e1\u05e3 \u05d7\u05e0\u05d9\u05da')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}