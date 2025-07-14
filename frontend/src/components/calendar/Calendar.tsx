import React from 'react'
import { cn } from '../../lib/utils'
import { CalendarProps } from './types'
import { CalendarHeader } from './CalendarHeader'
import { MonthView } from './MonthView'
import { AgendaView } from './AgendaView'
import { useCalendarState } from './useCalendarState'
import { mockEvents } from './mockData'
import { trpc } from '../../lib/trpc'

export default function Calendar({ workspaceId, className }: CalendarProps) {
  const {
    currentDate,
    viewMode,
    selectedDate,
    setViewMode,
    setSelectedDate,
    navigateMonth,
    goToToday,
    isLoadingPreferences
  } = useCalendarState()

  const { data: backendEvents, isLoading: eventsLoading } = trpc.calendar.list.useQuery(
    {
      workspaceId: workspaceId!,
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)
    },
    {
      enabled: !!workspaceId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  )

  const events = workspaceId ? (backendEvents || []) : mockEvents

  if (isLoadingPreferences || (workspaceId && eventsLoading)) {
    return (
      <div className={cn('flex flex-col h-full bg-white', className)}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-krushr-primary"></div>
        </div>
      </div>
    )
  }



  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Calendar Content */}
      {viewMode === 'month' ? (
        <MonthView
          currentDate={currentDate}
          selectedDate={selectedDate}
          events={events}
          onDateSelect={setSelectedDate}
          onNavigateMonth={navigateMonth}
          onGoToToday={goToToday}
        />
      ) : (
        <AgendaView events={events} />
      )}
    </div>
  )
}
