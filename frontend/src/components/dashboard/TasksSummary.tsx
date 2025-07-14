
import React from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface TasksSummaryProps {
  className?: string
}

export default function TasksSummary({ className }: TasksSummaryProps) {
  const navigate = useNavigate()
  
  const tasks = [
    { id: '1', title: 'Complete Dashboard', due_date: '2025-06-27', priority: 'high', kanban_column_id: 'in-progress' },
    { id: '2', title: 'Review Code', due_date: '2025-06-28', priority: 'medium', kanban_column_id: 'done' },
    { id: '3', title: 'Update Documentation', due_date: '2025-06-25', priority: 'low', kanban_column_id: 'todo' },
    { id: '4', title: 'Fix Bug #123', due_date: '2025-06-24', priority: 'high', kanban_column_id: 'done' },
  ]

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => 
    task.kanban_column_id.includes('done') || task.kanban_column_id.includes('complete')
  ).length
  const inProgressTasks = tasks.filter(task => 
    task.kanban_column_id.includes('progress') || task.kanban_column_id.includes('review')
  ).length
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false
    return new Date(task.due_date) < new Date()
  }).length
  const dueSoonTasks = tasks.filter(task => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
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
    .filter(task => task.due_date && new Date(task.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
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

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Tasks Overview</CardTitle>
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
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          task.priority === 'high' && 'border-red-200 text-red-700',
                          task.priority === 'medium' && 'border-orange-200 text-orange-700',
                          task.priority === 'low' && 'border-green-200 text-green-700'
                        )}
                      >
                        {task.priority}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>Assigned</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">
                      {formatDueDate(task.due_date!)}
                    </span>
                  </div>
                </div>
              ))}
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