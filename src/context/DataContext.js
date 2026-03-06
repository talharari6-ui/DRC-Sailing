'use client'

import React, { createContext, useCallback, useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'

export const DataContext = createContext()

export function DataProvider({ children }) {
  const { coach, isAuthenticated } = useAuth()
  const [groups, setGroups] = useState([])
  const [sailors, setSailors] = useState([])
  const [sessions, setSessions] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadGroups = useCallback(async () => {
    if (!isAuthenticated || !coach?.id) return
    setLoading(true)
    try {
      const url = coach?.is_admin ? '/api/groups' : `/api/groups?coach_id=${coach.id}`
      const res = await fetch(url)
      const data = await res.json()
      setGroups(data)
    } catch (err) {
      setError(err?.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, coach])

  const loadSailors = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await fetch('/api/sailors')
      const data = await res.json()
      setSailors(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadSessions = useCallback(async (dateFrom, dateTo) => {
    if (!isAuthenticated || !coach?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (coach?.id) params.append('coach_id', coach.id)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const res = await fetch(`/api/sessions?${params}`)
      const data = await res.json()
      setSessions(data)
    } catch (err) {
      setError(err?.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, coach])

  const loadAttendance = useCallback(async (sessionId) => {
    if (!isAuthenticated) return
    try {
      const res = await fetch(`/api/sessions/${sessionId}/attendance`)
      const data = await res.json()
      setAttendance((prev) => ({
        ...prev,
        [sessionId]: data,
      }))
    } catch (err) {
      setError(err.message)
    }
  }, [isAuthenticated])

  const value = {
    groups,
    sailors,
    sessions,
    attendance,
    loading,
    error,
    loadGroups,
    loadSailors,
    loadSessions,
    loadAttendance,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
