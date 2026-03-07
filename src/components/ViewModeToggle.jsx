'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

function ViewModeToggle({ currentMode, onModeChange }) {
  const modes = [
    { value: 'month', label: 'חודש' },
    { value: 'week', label: 'שבוע' },
    { value: 'day', label: 'יום' },
  ]

  return (
    <div className="flex justify-center py-2 sm:py-3" dir="rtl">
      <ToggleGroup
        type="single"
        value={currentMode}
        onValueChange={(value) => value && onModeChange(value)}
        className="gap-2"
      >
        {modes.map((mode) => (
          <ToggleGroupItem
            key={mode.value}
            value={mode.value}
            className="px-4 py-2 min-w-[60px] text-sm data-[state=on]:bg-drc-blue-light data-[state=on]:text-white"
          >
            {mode.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export default ViewModeToggle
