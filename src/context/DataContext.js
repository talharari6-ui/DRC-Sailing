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

  const coachId = coach?.id
  const isAdmin = coach?.is_admin

  const loadGroups = useCallback(async () => {
    if (!isAuthenticated || !coachId) return
    setLoading(true)
    try {
      const url = isAdmin ? '/api/groups' : `/api/groups?coach_id=${coachId}`
      const res = await fetch(url)
      const data = await res.json()
      setGroups(data)
    } catch (err) {
      setError(err?.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, coachId, isAdmin])

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
    if (!isAuthenticated || !coachId) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (coachId) params.append('coach_id', coachId)
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
  }, [isAuthenticated, coachId])

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
