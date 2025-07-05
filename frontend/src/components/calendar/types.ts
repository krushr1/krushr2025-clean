export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay: boolean
  location?: string
  color: string
  type: 'MEETING' | 'TASK' | 'REMINDER' | 'EVENT' | 'DEADLINE' | 'MILESTONE'
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  visibility: 'DEFAULT' | 'PUBLIC' | 'PRIVATE'
  timezone: string
  workspaceId: string
  createdById: string
  createdAt: string
  updatedAt: string
  attendees: CalendarAttendee[]
  reminders: CalendarReminder[]
}

export interface CalendarAttendee {
  id: string
  email: string
  name?: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'MAYBE'
  response?: string
  isOrganizer: boolean
}

export interface CalendarReminder {
  id: string
  type: 'NOTIFICATION' | 'EMAIL' | 'SMS'
  timing: 'FIVE_MINUTES' | 'TEN_MINUTES' | 'FIFTEEN_MINUTES' | 'THIRTY_MINUTES' | 'ONE_HOUR' | 'TWO_HOURS' | 'ONE_DAY' | 'ONE_WEEK' | 'CUSTOM'
  customMinutes?: number
}

export interface CalendarProps {
  workspaceId?: string
  className?: string
}

export type ViewMode = 'month' | 'week' | 'day' | 'agenda'

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
}