'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading, error } = useAuth()
  const [loginCode, setLoginCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    router.push('/schedule')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    setIsSubmitting(true)

    try {
      await login(loginCode)
      router.push('/schedule')
    } catch (err) {
      setLocalError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(160deg, var(--bg) 0%, var(--bg2) 50%, var(--bg3) 100%)',
        padding: '20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '320px' }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⛵</div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--blue-light)',
              marginBottom: '6px',
            }}
          >
            חוג שייט
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            מרכז דניאל
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
              קוד כניסה
            </label>
            <input
              type="text"
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value)}
              placeholder="הזן את קוד הכניסה שלך"
              disabled={isSubmitting || isLoading}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                color: 'var(--red)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {localError || error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!loginCode || isSubmitting || isLoading}
            style={{
              width: '100%',
              background: isSubmitting || isLoading ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '14px 20px',
              fontSize: '15px',
              fontWeight: '700',
              borderRadius: '12px',
              cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || isLoading ? 0.7 : 1,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting || isLoading ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}></span>
                ממתין...
              </>
            ) : (
              'כניסה'
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--muted)',
          marginTop: '32px',
        }}>
          גרסה 2.0 • מבוססת Next.js
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
