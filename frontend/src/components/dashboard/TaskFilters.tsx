import React from 'react'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { useAuthStore } from '../../stores/auth-store'
import { trpc } from '../../lib/trpc'
import { Filter, User, Clock, AlertTriangle, Users } from 'lucide-react'

export type TaskFilter = 'all' | 'my-tasks' | 'urgent' | 'due-today' | 'unassigned'

interface TaskFiltersProps {
  activeFilter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
  workspaceId?: string
  className?: string
}

export default function TaskFilters({ 
  activeFilter, 
  onFilterChange, 
  workspaceId,
  className 
}: TaskFiltersProps) {
  const { user } = useAuthStore()
  
  // Fetch tasks data to calculate filter counts
  const { data: tasks = [] } = trpc.task.list.useQuery(
    { workspaceId: workspaceId || '' },
    { enabled: !!workspaceId }
  )

  // Calculate filter counts
  const counts = React.useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    return {
      all: tasks.length,
      'my-tasks': tasks.filter(task => task.assigneeId === user?.id).length,
      urgent: tasks.filter(task => {
        // High priority or overdue tasks (excluding completed)
        if (task.status === 'DONE' || task.status === 'COMPLETED') return false
        const isHighPriority = task.priority === 'high' || task.priority === 'critical'
        const isOverdue = task.dueDate && new Date(task.dueDate) < now
        return isHighPriority || isOverdue
      }).length,
      'due-today': tasks.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= todayStart && dueDate < todayEnd
      }).length,
      unassigned: tasks.filter(task => !task.assigneeId).length
    }
  }, [tasks, user?.id])

  const filters = [
    {
      id: 'all' as TaskFilter,
      label: 'All Tasks',
      icon: Filter,
      count: counts.all,
      color: 'text-gray-600',
      shortcut: '1'
    },
    {
      id: 'my-tasks' as TaskFilter,
      label: 'My Tasks',
      icon: User,
      count: counts['my-tasks'],
      color: 'text-krushr-primary',
      shortcut: '2'
    },
    {
      id: 'urgent' as TaskFilter,
      label: 'Urgent',
      icon: AlertTriangle,
      count: counts.urgent,
      color: 'text-krushr-priority-high',
      shortcut: '3'
    },
    {
      id: 'due-today' as TaskFilter,
      label: 'Due Today',
      icon: Clock,
      count: counts['due-today'],
      color: 'text-krushr-warning',
      shortcut: '4'
    },
    {
      id: 'unassigned' as TaskFilter,
      label: 'Unassigned',
      icon: Users,
      count: counts.unassigned,
      color: 'text-gray-500',
      shortcut: '5'
    }
  ]

  return (
    <div className={cn(
      "bg-white border-b border-gray-200",
      className
    )}>
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {filters.map((filter) => {
            const IconComponent = filter.icon
            const isActive = activeFilter === filter.id
            
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  "group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all",
                  "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:ring-offset-2",
                  "whitespace-nowrap min-w-fit",
                  isActive ? [
                    "bg-krushr-primary text-white",
                    "hover:bg-krushr-primary-700"
                  ] : [
                    "text-gray-600",
                    "hover:text-gray-900"
                  ]
                )}
              >
                <IconComponent className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                  isActive ? "text-white" : filter.color
                )} />
                
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                
                {filter.count > 0 && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"}
                    className={cn(
                      "ml-1 h-5 px-1.5 text-xs font-semibold",
                      isActive ? [
                        "bg-white/20 text-white border-white/30",
                        "group-hover:bg-white/30"
                      ] : [
                        "bg-gray-100 text-gray-700 border-gray-200",
                        "group-hover:bg-gray-200"
                      ]
                    )}
                  >
                    {filter.count > 99 ? '99+' : filter.count}
                  </Badge>
                )}
                
                {/* Keyboard shortcut hint */}
                {filter.shortcut && (
                  <span className={cn(
                    "absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded text-[10px] font-medium transition-opacity",
                    "opacity-0 group-hover:opacity-100",
                    isActive ? [
                      "bg-white/20 text-white border border-white/30"
                    ] : [
                      "bg-gray-900 text-white"
                    ]
                  )}>
                    {filter.shortcut}
                  </span>
                )}
                
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Export filter function for use in TasksSummary
export function filterTasks(tasks: any[], filter: TaskFilter, userId?: string) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  switch (filter) {
    case 'my-tasks':
      return tasks.filter(task => task.assigneeId === userId)
    
    case 'urgent':
      return tasks.filter(task => {
        if (task.status === 'DONE' || task.status === 'COMPLETED') return false
        const isHighPriority = task.priority === 'high' || task.priority === 'critical'
        const isOverdue = task.dueDate && new Date(task.dueDate) < now
        return isHighPriority || isOverdue
      })
    
    case 'due-today':
      return tasks.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= todayStart && dueDate < todayEnd
      })
    
    case 'unassigned':
      return tasks.filter(task => !task.assigneeId)
    
    case 'all':
    default:
      return tasks
  }
}