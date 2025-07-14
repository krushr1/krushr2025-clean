import { useState, useEffect } from 'react'
import { ViewMode } from './types'
import { trpc } from '../../lib/trpc'

export const useCalendarState = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  // Initialize with localStorage value or 'month' as fallback
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('calendar-view-mode')
      return (saved as ViewMode) || 'month'
    } catch {
      return 'month'
    }
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { data: preferences } = trpc.preferences.get.useQuery()
  const updateCalendarViewMutation = trpc.preferences.updateCalendarView.useMutation()

  // Update viewMode when preferences load, but only if different from current
  useEffect(() => {
    if (preferences?.defaultCalendarView && preferences.defaultCalendarView !== viewMode) {
      setViewMode(preferences.defaultCalendarView as ViewMode)
      localStorage.setItem('calendar-view-mode', preferences.defaultCalendarView)
    }
  }, [preferences?.defaultCalendarView, viewMode])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const setViewModeWithPersistence = async (newViewMode: ViewMode) => {
    setViewMode(newViewMode)
    // Save to localStorage immediately for instant persistence
    localStorage.setItem('calendar-view-mode', newViewMode)
    try {
      await updateCalendarViewMutation.mutateAsync({ view: newViewMode })
    } catch (error) {
      console.error('Failed to save calendar view preference:', error)
    }
  }

  return {
    currentDate,
    viewMode,
    selectedDate,
    setViewMode: setViewModeWithPersistence,
    setSelectedDate,
    navigateMonth,
    goToToday,
    isLoadingPreferences: !preferences
  }
}