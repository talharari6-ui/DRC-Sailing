'use client'

import { DAY_NAMES } from '@/src/lib/constants'

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
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '8px 12px',
        }}
      >
        <button
          onClick={onPrevMonth}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: '8px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          →
        </button>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontWeight: '800',
            fontSize: '16px',
          }}
        >
          {monthName}
        </div>
        <button
          onClick={onNextMonth}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: '8px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          ←
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '3px',
          marginBottom: '3px',
        }}
      >
        {dayHeaders.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: '800',
              color: 'var(--muted)',
              padding: '5px 0',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '3px',
        }}
      >
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
              style={{
                minHeight: '70px',
                padding: '5px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                transition: 'background 0.15s',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginBottom: '4px',
                }}
              >
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
