import React from 'react'
import { cn } from '../../lib/utils'
import { CalendarEvent, CalendarDay as CalendarDayType } from './types'

interface CalendarDayProps {
  day: CalendarDayType
  events: CalendarEvent[]
  isToday: boolean
  isSelected: boolean
  onSelect: (date: Date) => void
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  events,
  isToday,
  isSelected,
  onSelect
}) => {
  const { date, isCurrentMonth } = day

  return (
    <button
      onClick={() => onSelect(date)}
      className={cn(
        "p-1 text-left border rounded hover:bg-gray-50 transition-colors min-h-[60px] flex flex-col",
        isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
        isToday && "bg-blue-50 border-blue-200",
        isSelected && "ring-2 ring-blue-500"
      )}
    >
      <span className={cn(
        "text-xs font-medium mb-1",
        isToday && "text-blue-600"
      )}>
        {date.getDate()}
      </span>
      
      <div className="space-y-px flex-1">
        {events.slice(0, 2).map(event => (
          <div
            key={event.id}
            className={cn(
              "text-xs px-1 py-0.5 rounded truncate",
              event.color === 'blue' && "bg-blue-100 text-blue-700",
              event.color === 'green' && "bg-green-100 text-green-700",
              event.color === 'purple' && "bg-purple-100 text-purple-700",
              event.color === 'orange' && "bg-orange-100 text-orange-700",
              event.color === 'red' && "bg-red-100 text-red-700"
            )}
          >
            {event.title}
          </div>
        ))}
        {events.length > 2 && (
          <div className="text-xs text-gray-500">
            +{events.length - 2} more
          </div>
        )}
      </div>
    </button>
  )
}