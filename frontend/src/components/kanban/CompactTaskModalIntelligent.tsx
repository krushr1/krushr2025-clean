import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, ChevronLeft, ChevronRight, User, Plus, Loader2, Check } from 'lucide-react'
import { useOptimisticDelete } from '@/hooks/use-optimistic-delete'
import { RichTextEditor } from '../ui/rich-text-editor'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { useAuthStore } from '../../stores/auth-store'
import { Priority } from '../../types/enums'
import { trpc } from '../../lib/trpc'
import { cn } from '../../lib/utils'

interface CompactTaskModalProps {
  open: boolean
  onClose: () => void
  onTaskCreated?: () => void
  onSuccess?: () => void
  workspaceId: string
  kanbanColumnId?: string
  kanbanId?: string
  task?: any
  isEditMode?: boolean
}

// Intelligent Compact Priority Selector
const InlinePrioritySelector = ({ priority, onChange }: { priority: Priority; onChange: (p: Priority) => void }) => {
  const priorities = [
    { value: Priority.LOW, color: 'bg-green-500' },
    { value: Priority.MEDIUM, color: 'bg-yellow-500' },
    { value: Priority.HIGH, color: 'bg-red-500' }
  ]
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-krushr-gray">Priority</span>
      <div className="flex items-center gap-1">
        {priorities.map((p, idx) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              "w-4 h-4 rounded-full transition-all relative",
              "hover:scale-110",
              priority === p.value ? p.color : "bg-gray-300",
              // Make touch target larger than visual
              "after:absolute after:inset-[-8px] after:content-['']"
            )}
            title={`${p.value} priority`}
          />
        ))}
        <span className="text-xs text-krushr-gray-dark ml-1 capitalize">
          {priority.toLowerCase()}
        </span>
      </div>
    </div>
  )
}

// Ultra-compact calendar
const MiniCalendar = ({ value, onChange }: { value: Date | null; onChange: (date: Date) => void }) => {
  const [viewDate, setViewDate] = useState(value || new Date())
  
  const days = (() => {
    const start = startOfMonth(viewDate)
    const end = endOfMonth(viewDate)
    const dates = eachDayOfInterval({ start, end })
    const startDay = getDay(start)
    return [...Array(startDay).fill(null), ...dates]
  })()
  
  return (
    <div className="border border-krushr-gray-border rounded-md p-2 bg-white">
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="p-0.5 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <span className="text-xs font-medium">{format(viewDate, 'MMM yyyy')}</span>
        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-0.5 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[9px] text-gray-500 text-center p-0.5">{d}</div>
        ))}
        {days.map((date, idx) => {
          if (!date) return <div key={idx} />
          const isSelected = value && isSameDay(date, value)
          const isCurrentDay = isSameDay(date, new Date())
          
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(date)}
              className={cn(
                "text-[10px] p-0.5 rounded relative",
                "hover:bg-gray-100",
                isSelected && "bg-krushr-primary text-white hover:bg-krushr-primary",
                isCurrentDay && !isSelected && "font-bold text-krushr-primary",
                !isSameMonth(date, viewDate) && "text-gray-300",
                // Larger touch target
                "after:absolute after:inset-[-2px] after:content-['']"
              )}
            >
              {format(date, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CompactTaskModalIntelligent({ 
  open, 
  onClose, 
  onTaskCreated,
  onSuccess, 
  workspaceId, 
  kanbanColumnId,
  kanbanId,
  task,
  isEditMode = false
}: CompactTaskModalProps) {
  // Form state
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.MEDIUM)
  const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null)
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '')
  const [tags, setTags] = useState(task?.tags?.join(', ') || '')
  const [selectedColumnId, setSelectedColumnId] = useState<string>(kanbanColumnId || '')
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  // Workspace data
  const { currentWorkspace } = useAuthStore()
  const { data: workspaceUsers } = trpc.workspace.listUsers.useQuery(
    { workspaceId: currentWorkspace?.id || '' },
    { enabled: !!currentWorkspace?.id }
  )
  
  // Get kanban columns
  const { data: kanbanData } = trpc.kanban.get.useQuery(
    { id: kanbanId || '' },
    { enabled: !!kanbanId }
  )
  const columns = kanbanData?.columns || []

  // tRPC mutations
  const createTaskMutation = trpc.task.create.useMutation()
  const updateTaskMutation = trpc.task.update.useMutation()
  const deleteTaskMutation = trpc.task.delete.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !workspaceId) return

    setIsLoading(true)
    
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? dueDate.toISOString() : null,
        assigneeId: assigneeId || null,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        workspaceId,
        kanbanColumnId: selectedColumnId || undefined
      }

      if (isEditMode && task?.id) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          ...taskData
        })
      } else {
        await createTaskMutation.mutateAsync(taskData)
      }

      onTaskCreated?.()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const { deleteItem } = useOptimisticDelete()

  const handleDelete = async () => {
    if (!task?.id) return
    
    await deleteItem({
      type: 'task',
      item: task,
      itemName: task.title || 'Untitled task',
      deleteAction: async () => {
        await deleteTaskMutation.mutateAsync({ id: task.id })
      },
      onOptimisticRemove: () => {
        onClose()
        onTaskCreated?.()
        onSuccess?.()
      },
      onRestore: () => {
        onTaskCreated?.()
      }
    })
  }

  // Quick dates
  const quickDates = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d })() },
    { label: 'Next Week', date: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d })() }
  ]

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (isEditMode && task) {
        setTitle(task.title || '')
        setDescription(task.description || '')
        setPriority(task.priority || Priority.MEDIUM)
        setDueDate(task.dueDate ? new Date(task.dueDate) : null)
        setAssigneeId(task.assigneeId || '')
        setTags(task.tags?.join(', ') || '')
      } else {
        setTitle('')
        setDescription('')
        setPriority(Priority.MEDIUM)
        setDueDate(null)
        setAssigneeId('')
        setTags('')
      }
    }
  }, [open, isEditMode, task])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Intelligently Compact Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg border border-krushr-gray-border overflow-hidden">
        {/* Ultra-compact header */}
        <div className="px-4 py-2 border-b border-krushr-gray-border bg-gray-50">
          <div className="flex items-center">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="flex-1 mr-3 text-base font-medium border-0 px-0 py-0 focus:outline-none focus:ring-0 bg-transparent placeholder:text-gray-400"
              placeholder={isEditMode ? 'Edit task...' : 'What needs to be done?'}
            />
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Compact content area */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Description - Collapsible height */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Add details..."
                className="min-h-[60px] max-h-[120px] [&>div:last-child]:min-h-[40px]"
                minimal={true}
              />
            </div>
          </div>

          {/* Smart two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left column */}
            <div className="space-y-3">
              {/* Column selection - Horizontal pills */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Column</label>
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                  {columns.map((column) => (
                    <button
                      key={column.id}
                      type="button"
                      onClick={() => setSelectedColumnId(column.id)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md shrink-0 transition-all",
                        selectedColumnId === column.id
                          ? "bg-krushr-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {column.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority & Assignee in same row */}
              <div className="flex items-center justify-between gap-3">
                <InlinePrioritySelector priority={priority} onChange={setPriority} />
                
                {/* Assignee - Compact */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Assignee</span>
                  {!assigneeId ? (
                    <button
                      type="button"
                      onClick={() => {
                        const firstUser = workspaceUsers?.[0]
                        if (firstUser) setAssigneeId(firstUser.id)
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-krushr-primary rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                        {workspaceUsers?.find(u => u.id === assigneeId)?.name?.[0] || '?'}
                      </div>
                      <span className="text-xs text-gray-700">
                        {workspaceUsers?.find(u => u.id === assigneeId)?.name?.split(' ')[0]}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAssigneeId('')}
                        className="text-gray-400 hover:text-red-500 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags - Inline compact */}
              <div>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma separated)"
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-krushr-primary"
                />
              </div>
            </div>

            {/* Right column - Date section */}
            <div className="space-y-2">
              {/* Quick date buttons + selected date */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Due Date</label>
                {dueDate && (
                  <div className="flex items-center gap-1 text-xs text-krushr-primary">
                    <Calendar className="w-3 h-3" />
                    <span>{format(dueDate, 'MMM d')}</span>
                    <button
                      type="button"
                      onClick={() => setDueDate(null)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Quick date buttons in a row */}
              <div className="flex gap-1">
                {quickDates.map((quick) => (
                  <button
                    key={quick.label}
                    type="button"
                    onClick={() => {
                      setDueDate(quick.date)
                      setShowCalendar(false)
                    }}
                    className={cn(
                      "flex-1 px-2 py-1 text-xs rounded-md transition-all",
                      dueDate && isSameDay(dueDate, quick.date)
                        ? "bg-krushr-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {quick.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={cn(
                    "px-2 py-1 text-xs rounded-md transition-all",
                    showCalendar
                      ? "bg-krushr-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <Calendar className="w-3 h-3" />
                </button>
              </div>

              {/* Collapsible mini calendar */}
              {showCalendar && (
                <MiniCalendar 
                  value={dueDate} 
                  onChange={(date) => {
                    setDueDate(date)
                    setShowCalendar(false)
                  }}
                />
              )}
            </div>
          </div>
        </form>
        
        {/* Ultra-compact footer */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <kbd className="px-1 py-0.5 bg-white border rounded text-[9px]">⌘</kbd>
              <kbd className="px-1 py-0.5 bg-white border rounded text-[9px]">Enter</kbd>
              <span>to save</span>
            </div>
            <div className="flex gap-2">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              )}
              <button 
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || !title.trim()}
                className="px-4 py-1 text-xs font-medium bg-krushr-primary text-white rounded-md hover:bg-krushr-primary/90 disabled:opacity-50 flex items-center gap-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Update' : 'Create'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Add to global CSS
const requiredStyles = `
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}`