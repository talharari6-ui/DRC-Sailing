'use client'

import { Button } from '@/components/ui/button'

function ViewModeToggle({ currentMode, onModeChange }) {
  const modes = [
    { value: 'month', label: 'חודש' },
    { value: 'week', label: 'שבוע' },
    { value: 'day', label: 'יום' },
  ]

  return (
    <div className="flex justify-center py-2 sm:py-3 gap-2" dir="rtl">
      {modes.map((mode) => (
        <Button
          key={mode.value}
          variant={currentMode === mode.value ? 'default' : 'outline'}
          onClick={() => onModeChange(mode.value)}
          className={currentMode === mode.value ? 'bg-drc-blue-light text-white' : ''}
        >
          {mode.label}
        </Button>
      ))}
    </div>
  )
}

export default ViewModeToggle
