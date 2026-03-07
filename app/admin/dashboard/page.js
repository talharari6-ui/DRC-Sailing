'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/src/hooks/useAuth'
import { Calendar } from '@/src/components/Calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminDashboard() {
  const { coach } = useAuth()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [groups, setGroups] = useState([])
  const [coaches, setCoaches] = useState([])
  const [sailors, setSailors] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true)
      setError(null)
      try {
        const monthStr = String(month + 1).padStart(2, '0')
        const yearStr = String(year)

        const [groupRes, coachRes, sailorRes, sessRes] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/coaches'),
          fetch('/api/sailors'),
          fetch(`/api/sessions?date_from=${yearStr}-${monthStr}-01&date_to=${yearStr}-${monthStr}-31`),
        ])

        const [groupData, coachData, sailorData, sessData] = await Promise.all([
          groupRes.json(),
          coachRes.json(),
          sailorRes.json(),
          sessRes.json(),
        ])

        setGroups(groupData)
        setCoaches(coachData)
        setSailors(sailorData)
        setSessions(sessData)
      } catch (err) {
        console.error('Error loading admin data:', err)
        setError('שגיאה בטעינת נתוני ניהול. נסה לרענן את הדף.')
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [year, month])

  const monthName = new Intl.DateTimeFormat('he-IL', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  const statsData = [
    { icon: '👨‍🏫', value: coaches.length, label: 'מדריכים' },
    { icon: '👥', value: sailors.length, label: 'חניכים' },
    { icon: '📋', value: groups.length, label: 'קבוצות' },
    { icon: '📅', value: sessions.length, label: 'פעילויות' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <span>👑</span> לוח בקרה
        </h2>
        <p className="text-muted-foreground text-sm">{monthName}</p>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Stats Grid */}
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

      {/* Calendar */}
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

      {/* Quick Links */}
      <div className="mt-6">
        <h3 className="text-base font-extrabold mb-3">⚡ קישורים מהירים</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/coaches', icon: '👨‍🏫', label: 'מדריכים' },
            { href: '/admin/sailors', icon: '👥', label: 'חניכים' },
            { href: '/admin/absences', icon: '🚫', label: 'חיסורים' },
            { href: '/admin/substitutions', icon: '🔄', label: 'החלפות' },
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
