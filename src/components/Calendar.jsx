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
    <div className="mb-4">
      {/* Month navigation */}
      <div className="flex items-center gap-2 mb-3 bg-card border border-border rounded-xl p-2.5 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevMonth}
          className="shrink-0 text-base"
        >
          <ChevronRight size={18} />
        </Button>
        <div className="flex-1 text-center font-extrabold text-base">
          {monthName}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextMonth}
          className="shrink-0 text-base"
        >
          <ChevronLeft size={18} />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-extrabold text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
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
              className="min-h-[72px] sm:min-h-20 p-1.5 sm:p-2 rounded-lg cursor-pointer border border-border bg-card transition-opacity hover:opacity-80 flex flex-col"
            >
              <div className="text-xs font-semibold text-foreground mb-1">
                {day}
              </div>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
