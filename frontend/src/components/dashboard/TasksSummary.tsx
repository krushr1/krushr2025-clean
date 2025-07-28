
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Calendar as CalendarComponent } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User,
  Calendar,
  ArrowRight,
  TrendingUp,
  Loader2,
  Edit2,
  Save,
  X,
  Check,
  CalendarClock
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { useAuthStore } from '../../stores/auth-store'
import { TaskFilter, filterTasks } from './TaskFilters'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useConfetti, useSuccessSound } from '../../hooks/use-confetti'

interface TasksSummaryProps {
  className?: string
  activeFilter?: TaskFilter
  focusMode?: boolean
}

export default function TasksSummary({ className, activeFilter = 'all', focusMode = false }: TasksSummaryProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState<{ [key: string]: boolean }>({})
  const [successTaskId, setSuccessTaskId] = useState<string | null>(null)
  const { triggerTaskComplete } = useConfetti()
  const { playSuccess } = useSuccessSound()
  
  // Get the first workspace
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()
  const workspaceId = workspaces[0]?.id
  
  // Fetch real tasks data
  const { data: allTasks = [], isLoading, refetch } = trpc.task.list.useQuery(
    { workspaceId: workspaceId || '' },
    { enabled: !!workspaceId }
  )
  
  // Update task mutation
  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: (data, variables) => {
      refetch()
      
      // Trigger success animation
      setSuccessTaskId(variables.id)
      setTimeout(() => setSuccessTaskId(null), 500)
      
      // Show specific success message based on what was updated
      if (variables.title) {
        toast.success('Task title updated')
      } else if (variables.status) {
        // Trigger confetti when task is marked as DONE
        if (variables.status === 'DONE') {
          triggerTaskComplete()
          playSuccess()
          toast.success('🎉 Task completed!')
        } else {
          toast.success(`Status changed to ${variables.status}`)
        }
      } else if (variables.priority) {
        toast.success(`Priority changed to ${variables.priority}`)
      } else if (variables.dueDate !== undefined) {
        toast.success(variables.dueDate ? 'Due date updated' : 'Due date removed')
      } else {
        toast.success('Task updated successfully')
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update task')
    }
  })

  // Apply filter to tasks
  const tasks = React.useMemo(() => {
    let filtered = filterTasks(allTasks, activeFilter, user?.id)
    
    // If focus mode is enabled, hide completed tasks
    if (focusMode) {
      filtered = filtered.filter(task => {
        // Check status field (uppercase)
        if (task.status === 'DONE' || task.status === 'COMPLETED') return false
        // Check kanban column title if available
        if (task.kanbanColumn?.title) {
          const title = task.kanbanColumn.title.toLowerCase()
          return !(title.includes('done') || title.includes('complete'))
        }
        return true
      })
    }
    
    return filtered
  }, [allTasks, activeFilter, user?.id, focusMode])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => {
    // Check status field (uppercase)
    if (task.status === 'DONE' || task.status === 'COMPLETED') return true
    // Check kanban column title if available
    if (task.kanbanColumn?.title) {
      const title = task.kanbanColumn.title.toLowerCase()
      return title.includes('done') || title.includes('complete')
    }
    return false
  }).length
  const inProgressTasks = tasks.filter(task => {
    // Check status field (uppercase)
    if (task.status === 'IN_PROGRESS' || task.status === 'REVIEW') return true
    // Check kanban column title if available
    if (task.kanbanColumn?.title) {
      const title = task.kanbanColumn.title.toLowerCase()
      return title.includes('progress') || title.includes('review') || title.includes('doing')
    }
    return false
  }).length
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    // Don't count completed tasks as overdue
    if (task.status === 'DONE' || task.status === 'COMPLETED') return false
    if (task.kanbanColumn?.title?.toLowerCase().includes('done')) return false
    return new Date(task.dueDate) < new Date()
  }).length
  const dueSoonTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const now = new Date()
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return dueDate > now && dueDate <= oneDayFromNow
  }).length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: CheckCircle2,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  const upcomingTasks = tasks
    .filter(task => task.dueDate && new Date(task.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3)

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Inline editing helpers
  const startEditing = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId)
    setEditingTitle(currentTitle)
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditingTitle('')
  }

  const saveTitle = async (taskId: string) => {
    if (editingTitle.trim()) {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        title: editingTitle.trim()
      })
    }
    cancelEditing()
  }

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveTitle(taskId)
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  const toggleStatus = async (task: any) => {
    const statusCycle = {
      'TODO': 'IN_PROGRESS',
      'IN_PROGRESS': 'IN_REVIEW',
      'IN_REVIEW': 'DONE',
      'DONE': 'TODO'
    }
    
    const newStatus = statusCycle[task.status as keyof typeof statusCycle] || 'TODO'
    
    await updateTaskMutation.mutateAsync({
      id: task.id,
      status: newStatus as any
    })
  }

  const togglePriority = async (task: any) => {
    const priorityCycle = {
      'LOW': 'MEDIUM',
      'MEDIUM': 'HIGH',
      'HIGH': 'URGENT',
      'URGENT': 'LOW'
    }
    
    const newPriority = priorityCycle[task.priority as keyof typeof priorityCycle] || 'MEDIUM'
    
    await updateTaskMutation.mutateAsync({
      id: task.id,
      priority: newPriority as any
    })
  }

  const updateDueDate = async (taskId: string, date: Date | undefined) => {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      dueDate: date?.toISOString()
    })
    setDatePickerOpen(prev => ({ ...prev, [taskId]: false }))
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'TODO': 'bg-gray-100 text-gray-700 border-gray-200',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700 border-blue-200',
      'IN_REVIEW': 'bg-purple-100 text-purple-700 border-purple-200',
      'DONE': 'bg-green-100 text-green-700 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[status as keyof typeof colors] || colors.TODO
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': 'border-green-200 text-green-700 bg-green-50',
      'MEDIUM': 'border-orange-200 text-orange-700 bg-orange-50',
      'HIGH': 'border-red-200 text-red-700 bg-red-50',
      'URGENT': 'border-red-300 text-red-800 bg-red-100'
    }
    return colors[priority as keyof typeof colors] || colors.MEDIUM
  }

  const getNextStatus = (currentStatus: string) => {
    const statusCycle = {
      'TODO': 'IN_PROGRESS',
      'IN_PROGRESS': 'IN_REVIEW',
      'IN_REVIEW': 'DONE',
      'DONE': 'TODO'
    }
    return statusCycle[currentStatus as keyof typeof statusCycle] || 'IN_PROGRESS'
  }

  const getNextPriority = (currentPriority: string) => {
    const priorityCycle = {
      'LOW': 'MEDIUM',
      'MEDIUM': 'HIGH',
      'HIGH': 'URGENT',
      'URGENT': 'LOW'
    }
    return priorityCycle[currentPriority as keyof typeof priorityCycle] || 'MEDIUM'
  }

  if (isLoading) {
    return (
      <Card className={cn('h-full flex items-center justify-center', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </Card>
    )
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {activeFilter === 'all' ? 'Tasks Overview' : 
             activeFilter === 'my-tasks' ? 'My Tasks' :
             activeFilter === 'urgent' ? 'Urgent Tasks' :
             activeFilter === 'due-today' ? 'Due Today' :
             'Unassigned Tasks'}
          </CardTitle>
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            <TrendingUp className="w-3 h-3 mr-1" />
            {completionRate}% Complete
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon
            
            return (
              <div
                key={stat.label}
                className={cn(
                  'p-4 rounded-lg border transition-colors hover:shadow-sm',
                  stat.bgColor
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={cn('w-5 h-5', stat.color)} />
                  <span className={cn('text-2xl font-bold', stat.color)}>
                    {stat.value}
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{completedTasks}/{totalTasks}</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Due Soon Alert */}
        {dueSoonTasks > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                {dueSoonTasks} task{dueSoonTasks > 1 ? 's' : ''} due within 24 hours
              </span>
            </div>
          </div>
        )}

        {/* Upcoming Tasks */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h4>
          
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => {
                const isEditing = editingTaskId === task.id
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
                
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors",
                      successTaskId === task.id && "animate-success-pulse"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, task.id)}
                            className="h-7 text-sm font-medium"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => saveTitle(task.id)}
                            disabled={updateTaskMutation.isPending}
                          >
                            {updateTaskMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={cancelEditing}
                          >
                            <X className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center space-x-2 cursor-pointer"
                          onDoubleClick={() => startEditing(task.id, task.title)}
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(task.id, task.title)
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-1">
                        {/* Status Badge */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs cursor-pointer transition-all hover:scale-105',
                                  getStatusColor(task.status || 'TODO'),
                                  updateTaskMutation.isPending && 'opacity-50 cursor-wait'
                                )}
                                onClick={() => !updateTaskMutation.isPending && toggleStatus(task)}
                              >
                                {updateTaskMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  task.status || 'TODO'
                                )}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Click to change to: {getNextStatus(task.status || 'TODO')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* Priority Badge */}
                        {task.priority && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    'text-xs cursor-pointer transition-all hover:scale-105',
                                    getPriorityColor(task.priority),
                                    updateTaskMutation.isPending && 'opacity-50 cursor-wait'
                                  )}
                                  onClick={() => !updateTaskMutation.isPending && togglePriority(task)}
                                >
                                  {updateTaskMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    task.priority
                                  )}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Click to change to: {getNextPriority(task.priority)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        {/* Assignee */}
                        {task.assignee && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{task.assignee.name?.split(' ')[0] || 'Assigned'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Due Date Picker */}
                    <Popover 
                      open={datePickerOpen[task.id] || false}
                      onOpenChange={(open) => setDatePickerOpen(prev => ({ ...prev, [task.id]: open }))}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-8 px-2 text-xs font-medium',
                            isOverdue && 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                          )}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {task.dueDate ? formatDueDate(task.dueDate) : 'Set due date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={task.dueDate ? new Date(task.dueDate) : undefined}
                          onSelect={(date) => updateDueDate(task.id, date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* View All Tasks Button */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/board')}
          >
            View all tasks
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}