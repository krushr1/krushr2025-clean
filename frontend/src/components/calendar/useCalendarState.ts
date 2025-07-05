import { useState, useEffect } from 'react'
import { ViewMode } from './types'
import { trpc } from '../../lib/trpc'

export const useCalendarState = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get user preferences
  const { data: preferences } = trpc.preferences.get.useQuery()
  const updateCalendarViewMutation = trpc.preferences.updateCalendarView.useMutation()

  // Initialize view mode from user preferences
  useEffect(() => {
    if (preferences?.defaultCalendarView) {
      setViewMode(preferences.defaultCalendarView as ViewMode)
    }
  }, [preferences])

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

  // Enhanced setViewMode that persists to backend
  const setViewModeWithPersistence = async (newViewMode: ViewMode) => {
    setViewMode(newViewMode)
    try {
      await updateCalendarViewMutation.mutateAsync({ view: newViewMode })
    } catch (error) {
      console.error('Failed to save calendar view preference:', error)
      // Optionally show a toast notification about the failure
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