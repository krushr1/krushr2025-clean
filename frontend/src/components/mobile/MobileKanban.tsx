
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ScrollArea } from '../ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../ui/sheet'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreHorizontal,
  Calendar,
  User,
  MessageCircle,
  Paperclip,
  Flag
} from 'lucide-react'
import { Kanban, Task } from '../../../../shared/types'
import { formatDate } from '../../../../shared/utils'
import { cn } from '../../lib/utils'

interface MobileKanbanProps {
  kanban: Kanban
  className?: string
}

export default function MobileKanban({ kanban, className }: MobileKanbanProps) {
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const currentColumn = kanban.columns[selectedColumnIndex]
  const tasks = currentColumn?.tasks || []

  const navigateColumn = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedColumnIndex > 0) {
      setSelectedColumnIndex(selectedColumnIndex - 1)
    } else if (direction === 'next' && selectedColumnIndex < kanban.columns.length - 1) {
      setSelectedColumnIndex(selectedColumnIndex + 1)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200'
      case 'medium': return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'low': return 'text-green-700 bg-green-50 border-green-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    return (
      <Flag className={cn(
        'w-3 h-3',
        priority === 'high' && 'text-red-600',
        priority === 'medium' && 'text-orange-600',
        priority === 'low' && 'text-green-600'
      )} />
    )
  }

  return (
    <div className={cn('h-full flex flex-col bg-gray-50', className)}>
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {kanban.title}
          </h1>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Column Navigator */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateColumn('prev')}
            disabled={selectedColumnIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex-1 text-center">
            <div className="font-medium text-gray-900">{currentColumn?.title}</div>
            <div className="text-sm text-gray-500">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateColumn('next')}
            disabled={selectedColumnIndex === kanban.columns.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Column Indicators */}
        <div className="flex justify-center space-x-2 mt-3">
          {kanban.columns.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === selectedColumnIndex ? 'bg-blue-600' : 'bg-gray-300'
              )}
              onClick={() => setSelectedColumnIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first task to get started
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          ) : (
            tasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md border-l-4',
                  task.priority === 'high' && 'border-l-red-500',
                  task.priority === 'medium' && 'border-l-yellow-500',
                  task.priority === 'low' && 'border-l-green-500',
                  !task.priority && 'border-l-gray-300'
                )}
                onClick={() => setSelectedTask(task)}
              >
                <CardContent className="p-4">
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex-1 pr-2">
                      {task.title}
                    </h4>
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(task.priority)}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Task Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Task Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {/* Priority Badge */}
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs', getPriorityColor(task.priority))}
                      >
                        {task.priority}
                      </Badge>

                      {/* Due Date */}
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Paperclip className="w-3 h-3" />
                        <span>0</span>
                      </div>
                    </div>
                  </div>

                  {/* Assignees */}
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex -space-x-2">
                        {task.assignees.slice(0, 3).map((assignee) => (
                          <Avatar key={assignee.id} className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback className="text-xs bg-gray-100">
                              {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {task.assignees.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-medium">
                              +{task.assignees.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Empty assignee state */}
                  {(!task.assignees || task.assignees.length === 0) && (
                    <div className="flex items-center mt-3 pt-3 border-t border-gray-100 text-gray-400">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-xs">Unassigned</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <SheetContent side="bottom" className="h-[90vh]">
          {selectedTask && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center space-x-2">
                  {getPriorityIcon(selectedTask.priority)}
                  <span>{selectedTask.title}</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Description */}
                {selectedTask.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedTask.description}</p>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                    <Badge className={getPriorityColor(selectedTask.priority)}>
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  
                  {selectedTask.due_date && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Due Date</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedTask.due_date)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignees */}
                {selectedTask.assignees && selectedTask.assignees.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Assignees</h4>
                    <div className="space-y-2">
                      {selectedTask.assignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback className="text-xs bg-gray-100">
                              {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{assignee.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full">Edit Task</Button>
                  <Button variant="outline" className="w-full">Add Comment</Button>
                  <Button variant="outline" className="w-full">Move to Column</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}