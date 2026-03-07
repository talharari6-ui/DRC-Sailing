'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function ViewModeToggle({ currentMode, onModeChange }) {
  const modes = [
    { value: 'month', label: 'חודש' },
    { value: 'week', label: 'שבוע' },
    { value: 'day', label: 'יום' },
  ]

  return (
    <div className="flex justify-center py-2 sm:py-3" dir="rtl">
      <div className="flex gap-2">
        {modes.map((mode) => {
          const active = currentMode === mode.value
          return (
            <Button
              key={mode.value}
              type="button"
              variant={active ? 'default' : 'outline'}
              onClick={() => onModeChange(mode.value)}
              className={cn('px-4 py-2 min-w-[60px] text-sm', active ? 'bg-drc-blue-light text-white hover:bg-drc-blue-light/90' : '')}
            >
              {mode.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default ViewModeToggle