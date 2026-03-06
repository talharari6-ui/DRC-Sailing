'use client'

import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg)',
          padding: '20px',
          flexDirection: 'column',
          textAlign: 'center',
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
          }}>
            <h1 style={{ color: 'var(--red)', marginBottom: '12px' }}>שגיאה</h1>
            <p style={{ color: 'var(--text)', marginBottom: '12px', fontSize: '14px' }}>
              {this.state.error?.message || 'אירעה שגיאה לא צפויה'}
            </p>
            <details style={{ textAlign: 'left', marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--muted)' }}>
                פרטים טכניים
              </summary>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                overflow: 'auto',
                marginTop: '12px',
                color: 'var(--muted)',
              }}>
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: 'var(--blue)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              רענן דף
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
