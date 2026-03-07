'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/src/hooks/useAuth'
import { Calendar } from '@/src/components/Calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

function getPendingType(session) {
  if (session.cancelled) return '\u05d3\u05d7\u05d9\u05d9\u05ea \u05e4\u05e2\u05d9\u05dc\u05d5\u05ea'
  if (session.substitute_coach_id) return '\u05d1\u05e7\u05e9\u05ea \u05de\u05d7\u05dc\u05d9\u05e3'
  return '\u05d1\u05e7\u05e9\u05ea \u05e9\u05d9\u05e0\u05d5\u05d9'
}

export default function AdminDashboard() {
  const { coach } = useAuth()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [groups, setGroups] = useState([])
  const [coaches, setCoaches] = useState([])
  const [sailors, setSailors] = useState([])
  const [sessions, setSessions] = useState([])
  const [pendingSessions, setPendingSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [approvalLoadingId, setApprovalLoadingId] = useState('')

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true)
      setError(null)
      try {
        const monthStr = String(month + 1).padStart(2, '0')
        const yearStr = String(year)

        const [groupRes, coachRes, sailorRes, sessRes, pendingRes] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/coaches'),
          fetch('/api/sailors'),
          fetch(`/api/sessions?include_details=true&date_from=${yearStr}-${monthStr}-01&date_to=${yearStr}-${monthStr}-31`),
          fetch('/api/sessions?include_details=true&admin_approved=false'),
        ])

        const [groupData, coachData, sailorData, sessData, pendingData] = await Promise.all([
          groupRes.json(),
          coachRes.json(),
          sailorRes.json(),
          sessRes.json(),
          pendingRes.json(),
        ])

        setGroups(Array.isArray(groupData) ? groupData : [])
        setCoaches(Array.isArray(coachData) ? coachData : [])
        setSailors(Array.isArray(sailorData) ? sailorData : [])
        setSessions(Array.isArray(sessData) ? sessData : [])
        setPendingSessions(Array.isArray(pendingData) ? pendingData : [])
      } catch (err) {
        console.error('Error loading admin data:', err)
        setError('\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d8\u05e2\u05d9\u05e0\u05ea \u05e0\u05ea\u05d5\u05e0\u05d9 \u05e0\u05d9\u05d4\u05d5\u05dc. \u05e0\u05e1\u05d4 \u05dc\u05e8\u05e2\u05e0\u05df \u05d0\u05ea \u05d4\u05d3\u05e3.')
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [year, month])

  const handleApproval = async (sessionId, action) => {
    setApprovalLoadingId(`${sessionId}-${action}`)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Approval action failed')

      setPendingSessions((prev) => prev.filter((item) => item.id !== sessionId))
    } catch (err) {
      alert(err.message)
    } finally {
      setApprovalLoadingId('')
    }
  }

  const monthName = new Intl.DateTimeFormat('he-IL', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  const statsData = [
    { icon: '👨‍🏫', value: coaches.length, label: '\u05de\u05d3\u05e8\u05d9\u05db\u05d9\u05dd' },
    { icon: '👥', value: sailors.length, label: '\u05d7\u05e0\u05d9\u05db\u05d9\u05dd' },
    { icon: '📋', value: groups.length, label: '\u05e7\u05d1\u05d5\u05e6\u05d5\u05ea' },
    { icon: '📅', value: sessions.length, label: '\u05e4\u05e2\u05d9\u05dc\u05d5\u05d9\u05d5\u05ea' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <span>👑</span> {'\u05dc\u05d5\u05d7 \u05d1\u05e7\u05e8\u05d4'}
        </h2>
        <p className="text-muted-foreground text-sm">{monthName}</p>
      </div>

      {pendingSessions.length > 0 ? (
        <Alert className="mb-4 border-amber-400/50">
          <AlertDescription className="text-amber-200">
            {pendingSessions.length} {'\u05d1\u05e7\u05e9\u05d5\u05ea \u05de\u05de\u05ea\u05d9\u05e0\u05d5\u05ea \u05dc\u05d0\u05d9\u05e9\u05d5\u05e8'}
          </AlertDescription>
        </Alert>
      ) : null}

      {pendingSessions.length > 0 ? (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold mb-3">{'\u05de\u05de\u05ea\u05d9\u05df \u05dc\u05d0\u05d9\u05e9\u05d5\u05e8 \u05de\u05e0\u05d4\u05dc'}</h3>
            <div className="space-y-3">
              {pendingSessions.slice(0, 10).map((session) => (
                <div key={session.id} className="rounded-md border border-border p-3">
                  <div className="text-sm font-semibold">{session.groups?.name || '\u05e7\u05d1\u05d5\u05e6\u05d4'}</div>
                  <div className="text-xs text-muted-foreground">{session.date} • {getPendingType(session)}</div>
                  {session.cancel_reason ? <div className="text-xs mt-1 text-amber-200">{'\u05e1\u05d9\u05d1\u05d4'}: {session.cancel_reason}</div> : null}
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => handleApproval(session.id, 'approve')} disabled={approvalLoadingId === `${session.id}-approve`}>{'\u05d0\u05e9\u05e8'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleApproval(session.id, 'reject')} disabled={approvalLoadingId === `${session.id}-reject`}>{'\u05d3\u05d7\u05d4'}</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statsData.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-extrabold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
      ) : (
        <Calendar
          year={year}
          month={month}
          onPrevMonth={() => {
            if (month === 0) {
              setMonth(11)
              setYear(year - 1)
            } else {
              setMonth(month - 1)
            }
          }}
          onNextMonth={() => {
            if (month === 11) {
              setMonth(0)
              setYear(year + 1)
            } else {
              setMonth(month + 1)
            }
          }}
        />
      )}

      <div className="mt-6">
        <h3 className="text-base font-extrabold mb-3">⚡ {'\u05e7\u05d9\u05e9\u05d5\u05e8\u05d9\u05dd \u05de\u05d4\u05d9\u05e8\u05d9\u05dd'}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/coaches', icon: '👨‍🏫', label: '\u05de\u05d3\u05e8\u05d9\u05db\u05d9\u05dd' },
            { href: '/admin/sailors', icon: '👥', label: '\u05d7\u05e0\u05d9\u05db\u05d9\u05dd' },
            { href: '/admin/absences', icon: '🚫', label: '\u05d7\u05d9\u05e1\u05d5\u05e8\u05d9\u05dd' },
            { href: '/admin/substitutions', icon: '🔄', label: '\u05d4\u05d7\u05dc\u05e4\u05d5\u05ea' },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:opacity-70 transition-opacity cursor-pointer">
                <CardContent className="p-4 flex items-center gap-2">
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-sm font-bold">{link.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
