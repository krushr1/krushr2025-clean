import React from 'react'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarDay } from './CalendarDay'
import { CalendarEvent } from './types'
import { getCalendarDays, getEventsForDate } from './utils'

interface MonthViewProps {
  currentDate: Date
  selectedDate: Date | null
  events: CalendarEvent[]
  onDateSelect: (date: Date) => void
  onNavigateMonth: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  selectedDate,
  events,
  onDateSelect,
  onNavigateMonth,
  onGoToToday
}) => {
  const days = getCalendarDays(currentDate)
  const today = new Date()

  return (
    <div className="flex-1 overflow-hidden">
      {/* Month Header */}
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => onNavigateMonth('prev')} className="h-7 w-7 p-0">
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onGoToToday} className="h-7 px-2 text-xs">
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigateMonth('next')} className="h-7 w-7 p-0">
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-px text-xs font-medium text-gray-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-1 text-center">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-1">
        <div className="grid grid-cols-7 gap-px h-full">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(events, day.date)
            const isToday = day.date.toDateString() === today.toDateString()
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()
            
            return (
              <CalendarDay
                key={index}
                day={day}
                events={dayEvents}
                isToday={isToday}
                isSelected={!!isSelected}
                onSelect={onDateSelect}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}