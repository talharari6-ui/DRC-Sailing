'use client'

import React, { createContext, useReducer, useCallback, useEffect } from 'react'

export const AuthContext = createContext()

const initialState = {
  coach: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        coach: action.payload,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        error: action.payload,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        coach: null,
        isAuthenticated: false,
        error: null,
      }
    case 'INIT_FROM_STORAGE':
      return {
        ...state,
        coach: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('coach')
    if (stored) {
      try {
        const coach = JSON.parse(stored)
        dispatch({ type: 'INIT_FROM_STORAGE', payload: coach })
      } catch (error) {
        console.error('Failed to parse stored coach:', error)
        localStorage.removeItem('coach')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = useCallback(async (loginCode) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_code: loginCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const coach = await response.json()
      localStorage.setItem('coach', JSON.stringify(coach))
      dispatch({ type: 'LOGIN_SUCCESS', payload: coach })
      return coach
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('coach')
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  const value = {
    ...state,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
