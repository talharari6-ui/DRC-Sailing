'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function FilterToggle({ currentFilter, onFilterChange }) {
  const filters = [
    { value: 'all', label: 'כל המדריכים' },
    { value: 'my', label: 'שלי בלבד' },
  ]

  return (
    <div className="flex justify-center py-2 sm:py-3" dir="rtl">
      <div className="flex gap-2">
        {filters.map((filter) => {
          const active = currentFilter === filter.value
          return (
            <Button
              key={filter.value}
              type="button"
              variant={active ? 'default' : 'outline'}
              onClick={() => onFilterChange(filter.value)}
              className={cn('px-4 py-2 min-w-[80px] text-sm', active ? 'bg-drc-blue-light text-white hover:bg-drc-blue-light/90' : '')}
            >
              {filter.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default FilterToggle