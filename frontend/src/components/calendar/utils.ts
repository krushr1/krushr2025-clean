import { CalendarEvent, CalendarDay } from './types'

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  
  return date.toLocaleDateString([], { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  })
}

export const getUpcomingEvents = (events: CalendarEvent[]) => {
  const now = new Date()
  return events
    .filter(event => new Date(event.startTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 10)
}

export const getCalendarDays = (currentDate: Date): CalendarDay[] => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  
  const days: CalendarDay[] = []
  
  // Add days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({ date, isCurrentMonth: false })
  }
  
  // Add days from current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day)
    days.push({ date, isCurrentMonth: true })
  }
  
  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length // 6 weeks × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({ date, isCurrentMonth: false })
  }
  
  return days
}

export const getEventsForDate = (events: CalendarEvent[], date: Date) => {
  return events.filter(event => {
    const eventDate = new Date(event.startTime)
    return eventDate.toDateString() === date.toDateString()
  })
}