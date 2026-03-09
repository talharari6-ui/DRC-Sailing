'use client'

import { Button } from '@/components/ui/button'

function FilterToggle({ currentFilter, onFilterChange }) {
  const filters = [
    { value: 'all', label: 'כל המדריכים' },
    { value: 'my', label: 'שלי בלבד' },
  ]

  return (
    <div className="flex justify-center py-2 sm:py-3 gap-2" dir="rtl">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={currentFilter === filter.value ? 'default' : 'outline'}
          onClick={() => onFilterChange(filter.value)}
          className={currentFilter === filter.value ? 'bg-drc-blue-light text-white' : ''}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}

export default FilterToggle
