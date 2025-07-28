import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Flame,
  Clock,
  Loader2
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { useAuthStore } from '../../stores/auth-store'

interface ProductivityInsightsProps {
  className?: string
  workspaceId?: string
}

export default function ProductivityInsights({ className, workspaceId }: ProductivityInsightsProps) {
  const { user } = useAuthStore()
  
  // Fetch real tasks data
  const { data: allTasks = [], isLoading } = trpc.task.list.useQuery(
    { workspaceId: workspaceId || '' },
    { enabled: !!workspaceId }
  )

  // Calculate weekly completion data
  const weeklyData = useMemo(() => {
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const data = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const completedCount = allTasks.filter(task => {
        if (task.status !== 'DONE' && task.status !== 'COMPLETED') return false
        const updatedAt = new Date(task.updatedAt)
        return updatedAt >= date && updatedAt < nextDate
      }).length
      
      data.push({
        day: days[date.getDay()],
        date: date,
        completed: completedCount,
        isToday: i === 0
      })
    }
    
    return data
  }, [allTasks])

  // Calculate velocity (this week vs last week)
  const velocity = useMemo(() => {
    const thisWeekCompleted = weeklyData.reduce((sum, day) => sum + day.completed, 0)
    
    // Get last week's data
    const lastWeekStart = new Date()
    lastWeekStart.setDate(lastWeekStart.getDate() - 14)
    lastWeekStart.setHours(0, 0, 0, 0)
    
    const lastWeekEnd = new Date()
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)
    lastWeekEnd.setHours(0, 0, 0, 0)
    
    const lastWeekCompleted = allTasks.filter(task => {
      if (task.status !== 'DONE' && task.status !== 'COMPLETED') return false
      const updatedAt = new Date(task.updatedAt)
      return updatedAt >= lastWeekStart && updatedAt < lastWeekEnd
    }).length
    
    const percentChange = lastWeekCompleted > 0 
      ? Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100)
      : thisWeekCompleted > 0 ? 100 : 0
      
    return {
      thisWeek: thisWeekCompleted,
      lastWeek: lastWeekCompleted,
      percentChange,
      isUp: percentChange > 0
    }
  }, [weeklyData, allTasks])

  // Calculate completion streak
  const streak = useMemo(() => {
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Work backwards from today
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const hasCompletedTask = allTasks.some(task => {
        if (task.status !== 'DONE' && task.status !== 'COMPLETED') return false
        const updatedAt = new Date(task.updatedAt)
        return updatedAt >= date && updatedAt < nextDate
      })
      
      if (hasCompletedTask) {
        currentStreak++
      } else if (i > 0) {
        // Don't break streak for today if it's still in progress
        break
      }
    }
    
    return currentStreak
  }, [allTasks])

  // Find best focus time based on completion patterns
  const focusTime = useMemo(() => {
    const hourCounts = new Array(24).fill(0)
    
    allTasks.forEach(task => {
      if (task.status === 'DONE' || task.status === 'COMPLETED') {
        const hour = new Date(task.updatedAt).getHours()
        hourCounts[hour]++
      }
    })
    
    let maxHour = 14 // Default to 2 PM
    let maxCount = 0
    
    // Find peak productivity hour
    for (let i = 8; i <= 18; i++) { // Only consider work hours 8 AM - 6 PM
      if (hourCounts[i] > maxCount) {
        maxCount = hourCounts[i]
        maxHour = i
      }
    }
    
    const endHour = Math.min(maxHour + 2, 18) // 2-hour window, capped at 6 PM
    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
      return `${displayHour} ${period}`
    }
    
    return {
      start: formatHour(maxHour),
      end: formatHour(endHour),
      hasData: maxCount > 0
    }
  }, [allTasks])

  // Calculate max value for chart scaling
  const maxCompleted = Math.max(...weeklyData.map(d => d.completed), 5)

  if (isLoading) {
    return (
      <Card className={cn('h-full flex items-center justify-center', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Productivity Insights</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Weekly Completion Trend */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Weekly Completion Trend</h4>
          <div className="flex items-end justify-between h-20 gap-1">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div 
                  className={cn(
                    "w-full rounded-t transition-all duration-300",
                    day.isToday ? "bg-krushr-primary" : "bg-krushr-primary/60",
                    "animate-slide-up"
                  )}
                  style={{
                    height: `${day.completed > 0 ? (day.completed / maxCompleted) * 100 : 5}%`,
                    animationDelay: `${index * 50}ms`
                  }}
                />
                <span className={cn(
                  "text-xs",
                  day.isToday ? "font-semibold text-krushr-primary" : "text-gray-500"
                )}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{weeklyData.reduce((sum, d) => sum + d.completed, 0)} tasks completed this week</span>
          </div>
        </div>

        {/* Velocity Indicator */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {velocity.isUp ? (
                <div className="p-1.5 bg-green-100 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              ) : velocity.percentChange < 0 ? (
                <div className="p-1.5 bg-red-100 rounded-full">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
              ) : (
                <div className="p-1.5 bg-gray-100 rounded-full">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  You're {Math.abs(velocity.percentChange)}% {velocity.isUp ? 'more' : velocity.percentChange < 0 ? 'less' : 'as'} productive
                </p>
                <p className="text-xs text-gray-500">
                  {velocity.percentChange !== 0 ? 'than last week' : 'as last week'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {velocity.thisWeek} vs {velocity.lastWeek}
            </Badge>
          </div>
        </div>

        {/* Streak Counter */}
        {streak > 0 && (
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600 animate-pulse-slow" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    {streak} day completion streak!
                  </p>
                  <p className="text-xs text-orange-700">
                    Keep up the great work
                  </p>
                </div>
              </div>
              {streak >= 7 && (
                <Badge className="bg-orange-600 hover:bg-orange-700">
                  On Fire!
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Focus Time Suggestion */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-900">
                Best time to focus: {focusTime.start} - {focusTime.end}
              </p>
              <p className="text-xs text-blue-700">
                {focusTime.hasData 
                  ? "Based on your completion patterns"
                  : "Start completing tasks to see personalized insights"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}