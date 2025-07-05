/**
 * Enhanced Kanban Column Component
 * Sortable column with task management
 */

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Plus, MoreVertical, Edit, Trash2, Settings } from 'lucide-react'
import { KanbanColumn, Task } from '../../types'
import TaskCard from './TaskCard'
import { cn } from '../../lib/utils'

interface KanbanColumnProps {
  column: KanbanColumn
  tasks: Task[]
  taskCount: number
  className?: string
  onTaskClick?: (taskId: string) => void
  onAddTask?: () => void
  bulkMode?: boolean
  selectedTasks?: Set<string>
  onTaskSelect?: (taskId: string) => void
  onEditColumn?: () => void
  onDeleteColumn?: () => void
}

export default function KanbanColumnComponent({ 
  column, 
  tasks, 
  taskCount,
  className,
  onTaskClick,
  onAddTask,
  bulkMode = false,
  selectedTasks = new Set(),
  onTaskSelect,
  onEditColumn,
  onDeleteColumn
}: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      accepts: ['task'],
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getColumnColor = () => {
    // Use the column's color property if available
    if (column.color) {
      return ''
    }
    
    if (column.isCompletedColumn) {
      return 'bg-emerald-500'
    }
    
    // Krushr brand colors based on column position
    const colors = [
      'bg-gray-500',           // To Do
      'bg-krushr-secondary',   // In Progress  
      'bg-amber-500',          // Review
      'bg-emerald-500',        // Done
    ]
    
    return colors[column.position % colors.length] || 'bg-krushr-blue'
  }

  return (
    <div
      ref={(node) => {
        setSortableRef(node)
        setDroppableRef(node)
      }}
      style={style}
      className={cn(
        'flex flex-col w-80 h-full transition-all duration-200',
        isDragging && 'opacity-50 scale-105',
        isOver && 'ring-2 ring-krushr-secondary ring-opacity-50',
        className
      )}
      {...attributes}
    >
      <Card className={cn(
        "flex flex-col h-full bg-white transition-all duration-200",
        isOver && "bg-krushr-secondary/5 border-krushr-secondary/20"
      )}>
        {/* Column Header - Single line layout */}
        <CardHeader 
          className="flex-shrink-0 py-2 cursor-grab active:cursor-grabbing"
          {...listeners}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div 
                className={cn('w-3 h-3 rounded-full border flex-shrink-0', !column.color && getColumnColor())}
                style={column.color ? { backgroundColor: column.color } : {}}
                role="presentation"
                aria-hidden="true"
              />
              <h3 className="font-semibold text-gray-900 text-sm truncate font-brand" role="heading" aria-level="3">{column.title}</h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs min-h-[18px] px-1.5 flex-shrink-0 bg-krushr-coral-red text-white",
                  column.wipLimit && taskCount > column.wipLimit && "bg-red-100 text-red-700 border-red-200"
                )}
                role="status"
                aria-label={`${taskCount} tasks${column.wipLimit ? ` out of ${column.wipLimit} limit` : ''}`}
              >
                {taskCount}{column.wipLimit ? `/${column.wipLimit}` : ''}
              </Badge>
              {column.wipLimit && taskCount > column.wipLimit && (
                <Badge variant="outline" className="text-xs text-red-700 border-red-200 px-1.5 py-0 flex-shrink-0 font-manrope">
                  WIP!
                </Badge>
              )}
              {column.isCompletedColumn && (
                <Badge variant="outline" className="text-xs text-green-700 border-green-200 px-1.5 py-0 flex-shrink-0 font-manrope">
                  ✓
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Settings 
                className="w-4 h-4 text-krushr-gray-500 hover:text-krushr-primary cursor-pointer transition-colors"
                onClick={onEditColumn}
                title="Column settings"
              />
              <Plus 
                className="w-4 h-4 text-krushr-gray-500 hover:text-krushr-primary cursor-pointer transition-colors"
                onClick={onAddTask}
                title="Add task"
              />
            </div>
          </div>
        </CardHeader>

        {/* Tasks Container */}
        <CardContent className="flex-1 p-3 pt-0 overflow-y-auto">
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task.id)}
                bulkMode={bulkMode}
                isSelected={selectedTasks.has(task.id)}
                onSelect={() => onTaskSelect?.(task.id)}
              />
            ))}
            
            {/* Add Task Button */}
            <Button
              variant="ghost"
              className={cn(
                "w-full h-12 min-h-[44px] border-2 border-dashed transition-all duration-200",
                "border-gray-200 hover:border-krushr-secondary/30 hover:bg-krushr-secondary/5",
                "focus:border-krushr-secondary/50 focus:bg-krushr-secondary/10 focus:ring-2 focus:ring-krushr-secondary",
                "text-gray-500 hover:text-krushr-secondary focus:text-krushr-secondary",
                "touch-manipulation",
                isOver && "border-krushr-secondary/50 bg-krushr-secondary/10 text-krushr-secondary"
              )}
              onClick={onAddTask}
              aria-label={`Add new task to ${column.title} column`}
              tabIndex={0}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add a task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}