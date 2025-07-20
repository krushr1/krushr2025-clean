
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { 
  Calendar, 
  MessageCircle, 
  Paperclip, 
  CheckSquare, 
  Clock,
  AlertCircle,
  User,
  MoreHorizontal
} from 'lucide-react'
import { Task } from '../../types'
import { cn } from '../../lib/utils'
import { formatDate } from '../../lib/utils'

interface TaskCardProps {
  task: Task
  isDragOverlay?: boolean
  className?: string
  onClick?: () => void
  bulkMode?: boolean
  isSelected?: boolean
  onSelect?: () => void
}

export default function TaskCard({ 
  task, 
  isDragOverlay = false, 
  className, 
  onClick,
  bulkMode = false,
  isSelected = false,
  onSelect 
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
    disabled: isDragOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'critical': return 'border-l-krushr-priority-critical bg-red-50/30'
      case 'high': return 'border-l-krushr-priority-high bg-red-50/30'
      case 'medium': return 'border-l-krushr-priority-medium bg-orange-50/30'
      case 'low': return 'border-l-krushr-priority-low bg-green-50/30'
      default: return 'border-l-gray-300 bg-white'
    }
  }

  const getPriorityBadgeColor = () => {
    switch (task.priority) {
      case 'critical': return 'bg-krushr-priority-critical/10 text-krushr-priority-critical border-krushr-priority-critical/20 font-medium'
      case 'high': return 'bg-krushr-priority-high/10 text-krushr-priority-high border-krushr-priority-high/20 font-medium'
      case 'medium': return 'bg-krushr-priority-medium/10 text-krushr-priority-medium border-krushr-priority-medium/20 font-medium'
      case 'low': return 'bg-krushr-priority-low/10 text-krushr-priority-low border-krushr-priority-low/20 font-medium'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
  const isDueSoon = task.dueDate && 
    new Date(task.dueDate) > new Date() && 
    new Date(task.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) // Due within 24 hours

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md border-l-4 group',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'min-h-[44px] touch-manipulation',
        getPriorityColor(),
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        isDragOverlay && 'rotate-2 shadow-xl',
        isSelected && 'ring-2 ring-krushr-primary bg-krushr-primary-50',
        bulkMode && 'cursor-pointer',
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}${task.description ? ` - ${task.description.substring(0, 50)}...` : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-3">
          {bulkMode && (
            <div className="mr-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation()
                  onSelect?.()
                }}
                className="w-5 h-5 min-w-[20px] min-h-[20px] text-krushr-primary border-krushr-gray-300 rounded focus:ring-krushr-primary focus:ring-2"
                aria-label={`Select task: ${task.title}`}
                tabIndex={0}
              />
            </div>
          )}
          <h4 className="font-medium text-gray-900 line-clamp-2 flex-1 font-brand">
            {task.title}
          </h4>
          <button 
            className="w-8 h-8 bg-krushr-gray-light text-krushr-gray-dark rounded-md flex items-center justify-center hover:bg-krushr-gray transition-colors opacity-0 group-hover:opacity-100 ml-2"
            aria-label={`More options for ${task.title}`}
            tabIndex={0}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 font-manrope">
            {task.description}
          </p>
        )}


        {/* Attachment Thumbnails */}
        {task.attachments && task.attachments.length > 0 && (() => {
          const imageAttachments = task.attachments.filter(att => 
            att.mimeType?.startsWith('image/') && att.thumbnailUrl
          )
          
          if (imageAttachments.length > 0) {
            return (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {imageAttachments.slice(0, 3).map((attachment) => (
                    <img
                      key={attachment.id}
                      src={attachment.thumbnailUrl}
                      alt={attachment.filename}
                      className="w-12 h-12 rounded object-cover border border-gray-200"
                    />
                  ))}
                  {imageAttachments.length > 3 && (
                    <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium font-manrope">
                        +{imageAttachments.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          }
          return null
        })()}

        {/* Task Metadata - Compact Single Line */}
        <div className="flex items-center justify-between text-xs text-gray-500 font-manrope">
          <div className="flex items-center space-x-2">
            {/* Priority Badge - Smaller */}
            <Badge 
              variant="outline" 
              className={cn('capitalize font-manrope px-2 py-1 text-xs font-medium', getPriorityBadgeColor())}
              role="status"
              aria-label={`Priority: ${task.priority}`}
            >
              {task.priority}
            </Badge>

            {/* Due Date - Inline */}
            {task.dueDate && (
              <>
                <span className="text-gray-300">•</span>
                <div className={cn(
                  'flex items-center space-x-1',
                  isOverdue && 'text-krushr-secondary',
                  isDueSoon && 'text-amber-600'
                )}>
                  {isOverdue ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : (
                    <Calendar className="w-3 h-3" />
                  )}
                  <span className="font-medium">
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Task Stats - Compact */}
          <div className="flex items-center space-x-1.5">
            {/* Comments Count */}
            {(task._count?.comments || 0) > 0 && (
              <div className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="w-3 h-3" />
                <span>{task._count.comments}</span>
              </div>
            )}

            {/* Attachments Count */}
            {(task._count?.attachments || 0) > 0 && (
              <div className="flex items-center space-x-1 text-gray-500">
                <Paperclip className="w-3 h-3" />
                <span>{task._count.attachments}</span>
              </div>
            )}

            {/* Checklist Progress */}
            {task.checklists && task.checklists.length > 0 && (() => {
              const totalItems = task.checklists.reduce((acc, checklist) => acc + (checklist.items?.length || 0), 0)
              const completedItems = task.checklists.reduce((acc, checklist) => 
                acc + (checklist.items?.filter(item => item.completed).length || 0), 0)
              
              return totalItems > 0 ? (
                <div className={cn(
                  "flex items-center space-x-1",
                  completedItems === totalItems ? "text-emerald-600" : "text-gray-500"
                )}>
                  <CheckSquare className="w-3 h-3" />
                  <span>{completedItems}/{totalItems}</span>
                </div>
              ) : null
            })()}
          </div>
        </div>

        {/* Assignee - Compact Single Line */}
        {task.assignee && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Avatar className="w-5 h-5 border border-white">
                <AvatarImage src={task.assignee.avatar || undefined} />
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-krushr-secondary to-krushr-secondary/80 text-white font-medium">
                  {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600 truncate">{task.assignee.name}</span>
              <span className="text-gray-300 text-xs">•</span>
              <div className="flex items-center space-x-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{task.estimatedHours || 0}h</span>
              </div>
              
              {/* Tags - Inline with assignee */}
              {task.tags && task.tags.length > 0 && (
                <>
                  <span className="text-gray-300 text-xs">•</span>
                  <div className="flex items-center space-x-1">
                    {task.tags.slice(0, 2).map((tag) => (
                      <Badge 
                        key={typeof tag === 'string' ? tag : tag.id}
                        variant="secondary" 
                        className="px-1.5 py-0.5 text-xs font-medium"
                      >
                        {typeof tag === 'string' ? tag : tag.name}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <Badge variant="secondary" className="px-1.5 py-0.5 text-xs font-medium">
                        +{task.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Empty State for Unassigned - Compact */}
        {!task.assignee && (
          <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-gray-400">
              <User className="w-3 h-3" />
              <span className="text-xs">Unassigned</span>
              <span className="text-gray-300 text-xs">•</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{task.estimatedHours || 0}h</span>
              </div>
              
              {/* Tags - Inline with unassigned */}
              {task.tags && task.tags.length > 0 && (
                <>
                  <span className="text-gray-300 text-xs">•</span>
                  <div className="flex items-center space-x-1">
                    {task.tags.slice(0, 2).map((tag) => (
                      <Badge 
                        key={typeof tag === 'string' ? tag : tag.id}
                        variant="secondary" 
                        className="px-1.5 py-0.5 text-xs font-medium"
                      >
                        {typeof tag === 'string' ? tag : tag.name}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <Badge variant="secondary" className="px-1.5 py-0.5 text-xs font-medium">
                        +{task.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}