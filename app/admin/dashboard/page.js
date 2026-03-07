'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/src/hooks/useAuth'
import { Calendar } from '@/src/components/Calendar'

export default function AdminDashboard() {
  const { coach } = useAuth()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [groups, setGroups] = useState([])
  const [coaches, setCoaches] = useState([])
  const [sailors, setSailors] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAdminData()
  }, [year, month])

  const loadAdminData = async () => {
    setLoading(true)
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
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

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
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>👑</span> לוח בקרה
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {monthName}
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        {statsData.map((stat, i) => (
          <div
            key={i}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px 10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      {!loading && (
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
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
          ⚡ קישורים מהירים
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { href: '/admin/coaches', icon: '👨‍🏫', label: 'מדריכים' },
            { href: '/admin/sailors', icon: '👥', label: 'חניכים' },
            { href: '/admin/absences', icon: '🚫', label: 'חיסורים' },
            { href: '/admin/substitutions', icon: '🔄', label: 'החלפות' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px',
                textDecoration: 'none',
                color: 'var(--text)',
                transition: 'opacity 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span style={{ fontSize: '18px' }}>{link.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
