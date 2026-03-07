'use client'

import { Toaster, toast } from 'sonner'

export function showToast(message, duration = 3000) {
  toast(message, { duration })
}

export function Toast() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        className: 'bg-secondary border border-border text-foreground font-semibold',
        style: {
          bottom: '100px',
        },
      }}
    />
  )
}
