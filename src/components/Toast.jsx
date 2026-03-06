'use client'

import { useEffect, useState } from 'react'

let toastQueue = []
let toastCallback = null

export function setToastCallback(callback) {
  toastCallback = callback
}

export function showToast(message, duration = 3000) {
  const id = Date.now()
  toastQueue.push({ id, message })
  if (toastCallback) {
    toastCallback([...toastQueue])
  }

  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    if (toastCallback) {
      toastCallback([...toastQueue])
    }
  }, duration)
}

export function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    setToastCallback(setToasts)
  }, [])

  return (
    <>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e293b',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: 200,
            animation: 'slideUp 0.3s ease-out',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.message}
        </div>
      ))}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
