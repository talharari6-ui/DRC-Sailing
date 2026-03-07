'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

function FilterToggle({ currentFilter, onFilterChange }) {
  const filters = [
    { value: 'all', label: 'כל המדריכים' },
    { value: 'my', label: 'שלי בלבד' },
  ]

  return (
    <div className="flex justify-center py-2 sm:py-3" dir="rtl">
      <ToggleGroup
        type="single"
        value={currentFilter}
        onValueChange={(value) => value && onFilterChange(value)}
        className="gap-2"
      >
        {filters.map((filter) => (
          <ToggleGroupItem
            key={filter.value}
            value={filter.value}
            className="px-4 py-2 min-w-[80px] text-sm data-[state=on]:bg-drc-blue-light data-[state=on]:text-white"
          >
            {filter.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export default FilterToggle
