'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Calendar({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onDateClick,
  getDayContent,
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const monthName = new Intl.DateTimeFormat('he-IL', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  const dayHeaders = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

  return (
    <div className="mb-3 sm:mb-4">
      {/* Month navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 bg-card border border-border rounded-xl p-2 sm:p-2.5 sm:px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevMonth}
          className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0"
        >
          <ChevronRight size={16} className="sm:w-5 sm:h-5" />
        </Button>
        <div className="flex-1 text-center font-extrabold text-xs sm:text-base truncate">
          {monthName}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextMonth}
          className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0"
        >
          <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="text-center text-[9px] sm:text-xs font-extrabold text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: totalCells }).map((_, i) => {
          const day = i - firstDay + 1
          const isValid = day >= 1 && day <= daysInMonth

          if (!isValid) {
            return <div key={i} />
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const content = getDayContent ? getDayContent(dateStr, day) : null

          return (
            <div
              key={i}
              onClick={() => onDateClick && onDateClick(dateStr)}
              className="min-h-[56px] sm:min-h-20 p-1 sm:p-2 rounded-lg cursor-pointer border border-border bg-card transition-opacity hover:opacity-80 flex flex-col"
            >
              <div className="text-[10px] sm:text-xs font-semibold text-foreground mb-0.5 sm:mb-1">
                {day}
              </div>
              <div className="text-[8px] sm:text-[10px] overflow-hidden flex-1">
                {content}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
