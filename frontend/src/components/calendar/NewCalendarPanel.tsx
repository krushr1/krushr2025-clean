import React, { useState, useMemo, useEffect, useRef } from 'react'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  Filter,
  Search,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Zap,
  Eye,
  Edit,
  Trash2,
  List,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { FloatingInput } from '../ui/floating-input'
import { trpc } from '../../lib/trpc'
import { cn } from '../../lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import Holidays from 'date-holidays'
import AgendaView from './AgendaView'

interface NewCalendarPanelProps {
  workspaceId: string
  className?: string
  showHolidays?: boolean
  holidayCountry?: string
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  allDay: boolean
  location?: string
  color: string
  type: 'MEETING' | 'TASK' | 'REMINDER' | 'EVENT' | 'DEADLINE' | 'MILESTONE'
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

const EVENT_COLORS = {
  blue: { bg: 'bg-krushr-primary/10', border: 'border-krushr-primary/20', text: 'text-krushr-primary' },
  green: { bg: 'bg-krushr-success/10', border: 'border-krushr-success/20', text: 'text-krushr-success' },
  purple: { bg: 'bg-krushr-purple/10', border: 'border-krushr-purple/20', text: 'text-krushr-purple' },
  orange: { bg: 'bg-krushr-orange/10', border: 'border-krushr-orange/20', text: 'text-krushr-orange' },
  red: { bg: 'bg-krushr-secondary/10', border: 'border-krushr-secondary/20', text: 'text-krushr-secondary' }
}

const EVENT_TYPE_ICONS = {
  MEETING: Users,
  TASK: CheckCircle2,
  REMINDER: AlertCircle,
  EVENT: CalendarIcon,
  DEADLINE: Zap,
  MILESTONE: CheckCircle2
}

const PRIORITY_COLORS = {
  LOW: 'bg-krushr-priority-low',
  MEDIUM: 'bg-krushr-priority-medium', 
  HIGH: 'bg-krushr-priority-high',
  CRITICAL: 'bg-krushr-priority-critical'
}

export default function NewCalendarPanel({ 
  workspaceId, 
  className,
  showHolidays = true,
  holidayCountry = 'US'
}: NewCalendarPanelProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'agenda'>('month')
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Initialize holidays based on configuration
  const holidays = useMemo(() => showHolidays ? new Holidays(holidayCountry) : null, [showHolidays, holidayCountry])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Create proper calendar grid with 6 weeks (42 days)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday = 0
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const { data: eventsData, isLoading } = trpc.calendar.list.useQuery({
    workspaceId,
    startDate: calendarStart,
    endDate: calendarEnd
  }, {
    retry: false,
    refetchOnWindowFocus: false
  })

  const events: CalendarEvent[] = useMemo(() => {
    if (!eventsData) return []
    return eventsData.map((event: any) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime)
    }))
  }, [eventsData])

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startTime), date) ||
      (event.allDay && isSameDay(new Date(event.startTime), date))
    )
  }

  const getHolidayForDate = (date: Date) => {
    if (!holidays) return null
    const holiday = holidays.isHoliday(date)
    return holiday ? (Array.isArray(holiday) ? holiday[0] : holiday) : null
  }

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setPanelSize({ width: rect.width, height: rect.height })
      }
    }

    const resizeObserver = new ResizeObserver(updateSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
      updateSize() // Initial size
    }

    return () => resizeObserver.disconnect()
  }, [])

  const layoutConfig = useMemo(() => {
    const { width, height } = panelSize
    
    if (width < 300 || height < 200) {
      return {
        size: 'micro',
        showSidebar: false,
        showSearch: true,
        showFilters: true,
        showToday: false,
        showViewToggle: true,
        showEventButton: true,
        headerPadding: 'p-2',
        headerGap: 'gap-1',
        gridCols: 7,
        dayHeight: 'min-h-[40px]',
        fontSize: 'text-xs',
        buttonSize: 'h-8 w-8', // Minimum 32px touch targets
        iconSize: 'w-3 h-3',
        maxEventsPerDay: 0,
        compactMode: true
      }
    }
    
    if (width < 500 || height < 300) {
      return {
        size: 'small',
        showSidebar: false,
        showSearch: true,
        showFilters: true,
        showToday: false,
        showViewToggle: true,
        showEventButton: true,
        headerPadding: 'p-2',
        headerGap: 'gap-1',
        gridCols: 7,
        dayHeight: 'min-h-[50px]',
        fontSize: 'text-xs',
        buttonSize: 'h-8 w-8', // Better touch targets
        iconSize: 'w-3 h-3',
        maxEventsPerDay: 1,
        compactMode: true
      }
    }
    
    if (width < 800 || height < 500) {
      return {
        size: 'medium',
        showSidebar: !!selectedDate,
        showSearch: true,
        showFilters: true,
        showToday: true,
        showViewToggle: true,
        showEventButton: true,
        headerPadding: 'p-3',
        headerGap: 'gap-2',
        gridCols: 7,
        dayHeight: 'min-h-[70px]',
        fontSize: 'text-sm',
        buttonSize: 'h-9 w-9', // Approaching ideal 44px touch targets
        iconSize: 'w-4 h-4',
        maxEventsPerDay: 2,
        compactMode: false
      }
    }
    
    return {
      size: 'large',
      showSidebar: true,
      showSearch: showSearch,
      showFilters: true,
      showToday: true,
      showViewToggle: true,
      showEventButton: true,
      headerPadding: 'p-4',
      headerGap: 'gap-3',
      gridCols: 7,
      dayHeight: 'min-h-[90px]',
      fontSize: 'text-sm',
      buttonSize: 'h-10 w-10', // Ideal 40px touch targets
      iconSize: 'w-4 h-4',
      maxEventsPerDay: 3,
      compactMode: false
    }
  }, [panelSize, selectedDate, showSearch])

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events
    return events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [events, searchQuery])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const handleDateClick = (date: Date) => {
    // If clicking on a date from previous/next month, navigate to that month
    if (!isSameMonth(date, currentDate)) {
      setCurrentDate(date)
      setSelectedDate(date)
    } else {
      setSelectedDate(isSameDay(date, selectedDate || new Date()) ? null : date)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  React.useEffect(() => {
    if (searchQuery === '' && showSearch) {
      const timer = setTimeout(() => {
        setShowSearch(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, showSearch])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'Escape':
          if (showSearch) {
            setShowSearch(false)
            setSearchQuery('')
          } else if (selectedDate) {
            setSelectedDate(null)
          }
          break
        
        case '/':
          if (layoutConfig.showSearch !== false) {
            e.preventDefault()
            setShowSearch(true)
          }
          break
          
        case 'ArrowLeft':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            navigateMonth('prev')
          }
          break
          
        case 'ArrowRight':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            navigateMonth('next')
          }
          break
          
        case 't':
          if (!e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault()
            setCurrentDate(new Date())
          }
          break
          
        case 'm':
          if (layoutConfig.showViewToggle && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault()
            setView('month')
          }
          break
          
        case 'a':
          if (layoutConfig.showViewToggle && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault()
            setView('agenda')
          }
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSearch, selectedDate, layoutConfig, navigateMonth])

  if (isLoading) {
    return (
      <div ref={containerRef} className={cn("flex h-full bg-white", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <CalendarIcon className={cn("text-krushr-primary mx-auto mb-2 animate-pulse", 
              panelSize.width < 200 ? "w-4 h-4" : "w-8 h-8")} />
            {panelSize.width >= 200 && (
              <p className="text-sm text-gray-500 font-manrope">Loading...</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (layoutConfig.size === 'micro' && panelSize.height < 150) {
    return (
      <div ref={containerRef} className={cn("flex h-full bg-white", className)}>
        <div className="flex-1 flex flex-col">
          {/* Ultra-minimal header */}
          <div className="p-2 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="p-1 h-6 w-6 focus:ring-2 focus:ring-krushr-primary focus:outline-none"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <span className="text-xs font-semibold text-gray-900 font-manrope min-w-0 px-1">
                  {format(currentDate, 'M/yy')}
                </span>
                <Button
                  variant="ghost"
                  size="sm" 
                  onClick={() => navigateMonth('next')}
                  className="p-1 h-6 w-6 focus:ring-2 focus:ring-krushr-primary focus:outline-none"
                  title="Next month"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowEventModal(true)}
                className="bg-krushr-primary hover:bg-krushr-primary/90 text-white p-1 h-6 w-6 focus:ring-2 focus:ring-krushr-primary focus:outline-none"
                title="Create new event"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Ultra-compact calendar grid */}
          <div className="flex-1 p-1">
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden text-xs">
              {/* Minimal day headers */}
              {['S','M','T','W','T','F','S'].map((day, index) => (
                <div key={index} className="bg-gray-50 text-center p-0.5">
                  <span className="text-xs font-medium text-gray-600">{day}</span>
                </div>
              ))}
              
              {/* Minimal calendar days */}
              {calendarDays.map(date => {
                const dayEvents = getEventsForDay(date)
                const isCurrentMonth = isSameMonth(date, currentDate)
                const isCurrentDay = isToday(date)
                const holiday = getHolidayForDate(date)
                
                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "bg-white cursor-pointer border-r border-b border-gray-100 hover:bg-gray-50 transition-colors min-h-[20px] p-0.5 text-center",
                      !isCurrentMonth && "bg-gray-50/50 text-gray-400 hover:bg-gray-100",
                      isCurrentDay && "bg-krushr-primary/10 text-krushr-primary font-semibold",
                      holiday && "bg-red-50 border-red-200"
                    )}
                    title={holiday ? holiday.name : undefined}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className={cn(
                        "text-xs",
                        holiday && "text-red-600 font-medium"
                      )}>
                        {format(date, 'd')}
                      </span>
                      {(dayEvents.length > 0 || holiday) && (
                        <div className={cn(
                          "w-1 h-1 rounded-full ml-0.5",
                          holiday ? "bg-red-500" : "bg-krushr-primary"
                        )} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("flex h-full bg-white", className)}>
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200/80 bg-gradient-to-r from-white to-gray-50/30">
          {/* Main Header Row */}
          <div className={cn("flex items-center justify-between", layoutConfig.headerPadding)}>
            {/* Left Section: Navigation & Title */}
            <div className="flex items-center min-w-0 flex-1">
              {/* Month Navigation Group */}
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm">
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className={cn(
                    "h-9 w-9 rounded-l-xl border-r border-gray-100/80 hover:bg-krushr-primary/5 hover:text-krushr-primary transition-all duration-200",
                    "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                  )}
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className={cn(
                  "text-center py-2",
                  layoutConfig.size === 'micro' ? "px-1 min-w-[50px]" : 
                  layoutConfig.size === 'small' ? "px-1.5 min-w-[60px]" : 
                  "px-2 min-w-[80px]"
                )}>
                  <h2 className="font-semibold text-gray-900 font-manrope text-sm leading-none">
                    {layoutConfig.size === 'micro' ? format(currentDate, 'M/yy') :
                     layoutConfig.size === 'small' ? format(currentDate, 'MMM yy') :
                     layoutConfig.size === 'medium' ? format(currentDate, 'MMM yyyy') :
                     format(currentDate, 'MMMM yyyy')}
                  </h2>
                  {layoutConfig.size === 'large' && (
                    <div className="text-xs text-gray-500 mt-0.5 font-manrope">
                      {format(currentDate, 'yyyy')}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm" 
                  onClick={() => navigateMonth('next')}
                  className={cn(
                    "h-9 w-9 rounded-r-xl border-l border-gray-100/80 hover:bg-krushr-primary/5 hover:text-krushr-primary transition-all duration-200",
                    "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                  )}
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Today Button - Elevated design */}
              {layoutConfig.showToday && layoutConfig.size !== 'micro' && layoutConfig.size !== 'small' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className={cn(
                    "ml-3 bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-krushr-primary hover:text-white hover:border-krushr-primary",
                    "shadow-sm transition-all duration-200 font-manrope px-3 h-9",
                    "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                  )}
                  title="Go to today"
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Today
                </Button>
              )}
            </div>

            {/* Right Section: Actions & Controls */}
            <div className="flex items-center gap-2 ml-4">
              {/* View Toggle - Refined segmented control */}
              {layoutConfig.showViewToggle && (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm p-1">
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setView('month')}
                      className={cn(
                        "h-8 px-3 rounded-lg transition-all duration-200 relative",
                        view === 'month' 
                          ? "bg-krushr-primary text-white shadow-md" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-krushr-primary"
                      )}
                      title="Month view"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {layoutConfig.size === 'large' && <span className="ml-1.5 text-xs font-medium">Month</span>}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setView('agenda')}
                      className={cn(
                        "h-8 px-3 rounded-lg transition-all duration-200 relative",
                        view === 'agenda' 
                          ? "bg-krushr-primary text-white shadow-md" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-krushr-primary"
                      )}
                      title="Agenda view"
                    >
                      <List className="w-3.5 h-3.5" />
                      {layoutConfig.size === 'large' && <span className="ml-1.5 text-xs font-medium">Agenda</span>}
                    </Button>
                  </div>
                </div>
              )}

              {/* Secondary Actions Group */}
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm">
                {/* Search button */}
                {layoutConfig.showSearch !== false && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearch(!showSearch)}
                    className={cn(
                      "transition-all duration-200",
                      layoutConfig.size === 'micro' ? "h-8 w-8 rounded-l-lg" : "h-9 w-9 rounded-l-xl",
                      showSearch 
                        ? "bg-krushr-primary/10 text-krushr-primary" 
                        : "hover:bg-gray-50 hover:text-krushr-primary text-gray-500",
                      "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                    )}
                    title="Search events"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                )}

                {/* Filter button */}
                {layoutConfig.showFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "border-l border-gray-100/80 hover:bg-gray-50 hover:text-krushr-primary text-gray-500 transition-all duration-200",
                      layoutConfig.size === 'micro' ? "h-8 w-8" : "h-9 w-9",
                      "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                    )}
                    title="Filter events"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                )}

                {/* Add Event button - Primary CTA */}
                {layoutConfig.showEventButton && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowEventModal(true)}
                    className={cn(
                      "bg-krushr-primary hover:bg-krushr-primary/90 text-white transition-all duration-200 shadow-md",
                      "focus:ring-2 focus:ring-krushr-primary/40 focus:outline-none",
                      layoutConfig.size === 'micro' ? "h-8 rounded-r-lg" : "h-9 rounded-r-xl",
                      layoutConfig.showSearch !== false ? "border-l border-krushr-primary/20" : "rounded-xl",
                      layoutConfig.size === 'micro' ? "px-2" : "px-3"
                    )}
                    title="Create new event"
                  >
                    <Plus className="w-4 h-4" />
                    {layoutConfig.size === 'large' && <span className="ml-1.5 text-xs font-medium">New Event</span>}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar - Floating overlay design */}
          {showSearch && layoutConfig.showSearch !== false && (
            <div className="px-4 pb-3 animate-in slide-in-from-top-2 duration-300">
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <FloatingInput
                  label="Search events, locations, or attendees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 border-0 bg-transparent font-manrope text-sm focus:ring-2 focus:ring-krushr-primary/20"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setShowSearch(false)
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Calendar Content */}
        {view === 'agenda' ? (
          <AgendaView workspaceId={workspaceId} className="flex-1" />
        ) : (
          <div className={cn("flex-1", layoutConfig.headerPadding)}>
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {(layoutConfig.size === 'micro' ? ['S','M','T','W','T','F','S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day, index) => (
              <div key={index} className={cn("bg-gray-50 text-center", layoutConfig.size === 'micro' ? 'p-1' : 'p-2')}>
                <span className={cn("font-medium text-gray-600 font-manrope", layoutConfig.fontSize)}>{day}</span>
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map(date => {
              const dayEvents = getEventsForDay(date)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isCurrentDay = isToday(date)
              const holiday = getHolidayForDate(date)
              
              const maxEvents = layoutConfig.maxEventsPerDay
              
              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "bg-white cursor-pointer border-r border-b border-gray-100 hover:bg-gray-50 transition-colors",
                    layoutConfig.dayHeight,
                    layoutConfig.size === 'micro' ? 'p-1' : 'p-2',
                    !isCurrentMonth && "bg-gray-50/50 text-gray-400 hover:bg-gray-100",
                    isSelected && "bg-krushr-primary/5 border-krushr-primary",
                    isCurrentDay && "bg-krushr-primary/10",
                    holiday && "bg-red-50/50 border-red-200/50"
                  )}
                  title={holiday ? holiday.name : undefined}
                >
                  <div className={cn("flex items-center justify-between", layoutConfig.size !== 'micro' && "mb-1")}>
                    <span className={cn(
                      "font-manrope",
                      layoutConfig.fontSize,
                      isCurrentDay && "font-semibold text-krushr-primary",
                      !isCurrentMonth && "text-gray-400 opacity-75",
                      holiday && isCurrentMonth && "text-red-600 font-medium"
                    )}>
                      {format(date, 'd')}
                    </span>
                    {dayEvents.length > 0 && layoutConfig.size !== 'micro' && (
                      <Badge variant="secondary" className={cn("px-1 py-0", layoutConfig.fontSize === 'text-xs' ? 'text-xs' : 'text-xs')}>
                        {dayEvents.length}
                      </Badge>
                    )}
                    {holiday && layoutConfig.size !== 'micro' && dayEvents.length === 0 && (
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    )}
                    {(dayEvents.length > 0 || holiday) && layoutConfig.size === 'micro' && (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        holiday ? "bg-red-500" : "bg-krushr-primary"
                      )} />
                    )}
                  </div>
                  
                  {/* Events for this day - hide in micro view */}
                  {maxEvents > 0 && (
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, maxEvents).map(event => {
                        const colorConfig = EVENT_COLORS[event.color as keyof typeof EVENT_COLORS] || EVENT_COLORS.blue
                        const IconComponent = EVENT_TYPE_ICONS[event.type]
                        
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventClick(event)
                            }}
                            className={cn(
                              "rounded truncate cursor-pointer transition-colors hover:opacity-80 border",
                              colorConfig.bg,
                              colorConfig.border,
                              colorConfig.text,
                              layoutConfig.size === 'small' ? 'p-0.5' : 'p-1',
                              !isCurrentMonth && "opacity-60"
                            )}
                          >
                            <div className="flex items-center gap-1">
                              {layoutConfig.size !== 'small' && <IconComponent className={cn("flex-shrink-0", layoutConfig.iconSize)} />}
                              <span className={cn("truncate font-manrope", layoutConfig.fontSize)}>{event.title}</span>
                              {event.priority !== 'LOW' && layoutConfig.size !== 'small' && (
                                <div className={cn("rounded-full flex-shrink-0", PRIORITY_COLORS[event.priority], 
                                  layoutConfig.size === 'medium' ? 'w-1 h-1' : 'w-1.5 h-1.5')} />
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {dayEvents.length > maxEvents && (
                        <div className={cn("text-gray-500 font-manrope pl-1", layoutConfig.fontSize)}>
                          +{dayEvents.length - maxEvents} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Event Details */}
      {selectedDate && layoutConfig.showSidebar && (
        <div className={cn("border-l border-gray-200 bg-gray-50", 
          layoutConfig.size === 'medium' ? 'w-64' : 'w-80')}>
          <div className={layoutConfig.headerPadding}>
            <h3 className={cn("font-semibold text-gray-900 mb-2 font-manrope", layoutConfig.fontSize)}>
              {layoutConfig.size === 'medium' 
                ? format(selectedDate, 'MMM d')
                : format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            
            {/* Show holiday information if present */}
            {(() => {
              const holiday = getHolidayForDate(selectedDate)
              return holiday ? (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className={cn("text-red-700 font-medium font-manrope", layoutConfig.fontSize)}>
                      {holiday.name}
                    </span>
                  </div>
                  {holiday.type && (
                    <p className={cn("text-red-600 mt-1 font-manrope", layoutConfig.fontSize === 'text-sm' ? 'text-xs' : 'text-xs')}>
                      {holiday.type}
                    </p>
                  )}
                </div>
              ) : null
            })()}
            
            {getEventsForDay(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className={cn("text-gray-400 mx-auto mb-2", layoutConfig.iconSize === 'w-4 h-4' ? 'w-6 h-6' : 'w-8 h-8')} />
                <p className={cn("text-gray-500 font-manrope", layoutConfig.fontSize)}>No events scheduled</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEventModal(true)}
                  className={cn("mt-2", layoutConfig.buttonSize)}
                >
                  <Plus className={layoutConfig.iconSize} />
                  <span className="ml-1">Add Event</span>
                </Button>
              </div>
            ) : (
              <div className={cn("space-y-2", layoutConfig.size === 'medium' && "space-y-1")}>
                {getEventsForDay(selectedDate).map(event => {
                  const colorConfig = EVENT_COLORS[event.color as keyof typeof EVENT_COLORS] || EVENT_COLORS.blue
                  const IconComponent = EVENT_TYPE_ICONS[event.type]
                  
                  return (
                    <Card key={event.id} className={cn("hover:shadow-sm transition-shadow cursor-pointer", 
                      layoutConfig.size === 'medium' ? 'p-2' : 'p-3')} onClick={() => handleEventClick(event)}>
                      <div className="flex items-start gap-2">
                        <div className={cn("rounded-lg", colorConfig.bg, layoutConfig.size === 'medium' ? 'p-1.5' : 'p-2')}>
                          <IconComponent className={cn(colorConfig.text, layoutConfig.iconSize)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("font-medium text-gray-900 truncate font-manrope", layoutConfig.fontSize)}>{event.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className={cn("text-gray-400", layoutConfig.iconSize)} />
                            <span className={cn("text-gray-600 font-manrope", layoutConfig.fontSize)}>
                              {event.allDay ? 'All day' : `${format(event.startTime, 'h:mm a')} - ${format(event.endTime, 'h:mm a')}`}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className={cn("text-gray-400", layoutConfig.iconSize)} />
                              <span className={cn("text-gray-600 truncate font-manrope", layoutConfig.fontSize)}>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={layoutConfig.fontSize}>
                              {event.type}
                            </Badge>
                            {event.priority !== 'LOW' && (
                              <div className={cn("rounded-full", PRIORITY_COLORS[event.priority], 
                                layoutConfig.size === 'medium' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}