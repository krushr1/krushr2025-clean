
import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Filter,
  Download
} from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import { Task } from '../../../../shared/types'
import { formatDate } from '../../../../shared/utils'
import { cn } from '../../lib/utils'

interface CalendarEvent {
  id: string
  title: string
  type: 'task' | 'meeting' | 'deadline' | 'milestone'
  date: Date
  time?: string
  priority?: 'high' | 'medium' | 'low'
  assignees?: Array<{ id: string; name: string; avatar?: string }>
  project?: string
  color: string
}

interface CalendarViewProps {
  className?: string
}

export default function CalendarView({ className }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { tasks } = useAppStore()

  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = []

    tasks.forEach(task => {
      if (task.due_date) {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          type: 'task',
          date: new Date(task.due_date),
          priority: task.priority,
          assignees: task.assignees,
          color: task.priority === 'high' ? 'bg-red-500' : 
                 task.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
        })
      }
    })

    const now = new Date()
    events.push(
      {
        id: 'meeting-1',
        title: 'Team Standup',
        type: 'meeting',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0),
        time: '9:00 AM',
        assignees: [
          { id: '1', name: 'Team Lead', avatar: '' },
          { id: '2', name: 'Developer', avatar: '' }
        ],
        color: 'bg-blue-500'
      },
      {
        id: 'milestone-1',
        title: 'Sprint Review',
        type: 'milestone',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        project: 'Q1 Development',
        color: 'bg-purple-500'
      }
    )

    return events
  }, [tasks])

  const getMonthCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const calendar = []
    const current = new Date(startDate)
    
    for (let week = 0; week < 6; week++) {
      const weekDays = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(current)
        const dayEvents = calendarEvents.filter(event => 
          event.date.toDateString() === date.toDateString()
        )
        
        weekDays.push({
          date: new Date(date),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === new Date().toDateString(),
          events: dayEvents
        })
        
        current.setDate(current.getDate() + 1)
      }
      calendar.push(weekDays)
    }
    
    return calendar
  }

  const monthCalendar = getMonthCalendar()

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 className="w-3 h-3" />
      case 'meeting':
        return <Users className="w-3 h-3" />
      case 'deadline':
        return <AlertTriangle className="w-3 h-3" />
      case 'milestone':
        return <CalendarIcon className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {/* Calendar Header */}
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              {(['month', 'week', 'day'] as const).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setView(viewType)}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>

            <Button
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Show:</span>
                <Badge variant="outline" className="cursor-pointer">Tasks</Badge>
                <Badge variant="outline" className="cursor-pointer">Meetings</Badge>
                <Badge variant="outline" className="cursor-pointer">Deadlines</Badge>
                <Badge variant="outline" className="cursor-pointer">Milestones</Badge>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Calendar Grid */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b bg-gray-50">
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="flex-1 overflow-y-auto">
            {monthCalendar.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b min-h-[120px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={cn(
                      'border-r p-2 cursor-pointer hover:bg-gray-50 transition-colors',
                      !day.isCurrentMonth && 'bg-gray-25 text-gray-400',
                      day.isToday && 'bg-blue-50 border-blue-200',
                      selectedDate?.toDateString() === day.date.toDateString() && 'bg-blue-100'
                    )}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        'text-sm font-medium',
                        day.isToday && 'text-blue-600',
                        !day.isCurrentMonth && 'text-gray-400'
                      )}>
                        {day.date.getDate()}
                      </span>
                      {day.events.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{day.events.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {day.events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            'text-xs p-1 rounded text-white truncate flex items-center space-x-1',
                            event.color
                          )}
                          title={event.title}
                        >
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="flex-shrink-0 border-t bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            {formatDate(selectedDate.toISOString())}
          </h4>
          <div className="space-y-2">
            {calendarEvents
              .filter(event => event.date.toDateString() === selectedDate.toDateString())
              .map(event => (
                <div key={event.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                  <div className={cn('w-3 h-3 rounded-full', event.color)} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.title}</div>
                    {event.time && (
                      <div className="text-xs text-gray-500">{event.time}</div>
                    )}
                  </div>
                  {event.assignees && (
                    <div className="flex -space-x-1">
                      {event.assignees.slice(0, 2).map((assignee) => (
                        <Avatar key={assignee.id} className="w-6 h-6 border-2 border-white">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  )
}