import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, ChevronLeft, ChevronRight, User, Tag, Paperclip, Upload, FileText, Clock, Plus, Loader2, Folder } from 'lucide-react'
import { useOptimisticDelete } from '@/hooks/use-optimistic-delete'
import { RichTextEditor } from '../ui/rich-text-editor'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { useAuthStore } from '../../stores/auth-store'
import { Priority } from '../../types/enums'
import { trpc } from '../../lib/trpc'

// Backend Priority enum for API calls (maps to api/src/types/enums.ts)
enum ApiPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Convert frontend Priority to backend ApiPriority
const mapPriorityToApi = (priority: Priority): ApiPriority => {
  switch (priority) {
    case Priority.LOW:
      return ApiPriority.LOW
    case Priority.MEDIUM:
      return ApiPriority.MEDIUM
    case Priority.HIGH:
      return ApiPriority.HIGH
    case Priority.CRITICAL:
      return ApiPriority.URGENT
    default:
      return ApiPriority.MEDIUM
  }
}
import { cn } from '../../lib/utils'
import { toast } from 'sonner'
import { Buffer } from 'buffer'

interface CompactTaskModalProps {
  open: boolean
  onClose: () => void
  onTaskCreated?: () => void
  onSuccess?: () => void
  workspaceId: string
  kanbanColumnId?: string
  kanbanId?: string
  task?: any // Keep as any since task structure varies
  isEditMode?: boolean
  mode?: 'task' | 'calendar'
  selectedDate?: Date | null
}

// Priority Selector Component with hover functionality
const PrioritySelector = ({ priority, onChange }: { priority: Priority; onChange: (p: Priority) => void }) => {
  const [hoveredPriority, setHoveredPriority] = useState<Priority | null>(null)
  const currentPriority = hoveredPriority || priority
  
  return (
    <div className="bg-white border border-krushr-gray-border rounded p-2 sm:p-3">
      <label className="text-xs font-medium text-krushr-gray mb-2 block">Priority</label>
      <div 
        className="flex items-center gap-1.5 sm:gap-2"
        onMouseLeave={() => setHoveredPriority(null)}
      >
        <div className="flex gap-0.5 sm:gap-1">
          {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map((p, index) => {
            const count = index + 1
            const isActive = (
              (currentPriority === Priority.LOW && count <= 1) ||
              (currentPriority === Priority.MEDIUM && count <= 2) ||
              (currentPriority === Priority.HIGH && count <= 3)
            )
            
            return (
              <button
                key={p}
                type="button"
                onMouseEnter={() => setHoveredPriority(p)}
                onClick={() => {
                  onChange(p)
                  setHoveredPriority(null)
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-150 cursor-pointer",
                  isActive 
                    ? "bg-krushr-secondary" 
                    : "bg-krushr-gray-lighter hover:bg-krushr-gray-light"
                )}
                title={`${p} Priority`}
              />
            )
          })}
        </div>
        <span className="text-xs text-krushr-gray capitalize">{currentPriority.toLowerCase()}</span>
      </div>
    </div>
  )
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

export default function CompactTaskModal({ 
  open, 
  onClose, 
  onTaskCreated,
  onSuccess, 
  workspaceId, 
  kanbanColumnId,
  kanbanId,
  task,
  isEditMode = false,
  mode = 'task',
  selectedDate
}: CompactTaskModalProps) {
  // Form state
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<Priority>(
    task?.priority ? (task.priority as Priority) : Priority.MEDIUM
  )
  const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null)
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '')
  const [tags, setTags] = useState(task?.tags?.join(', ') || '')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string>(kanbanColumnId || '')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [currentMode, setCurrentMode] = useState(mode)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([])
  const [autoDetectedMode, setAutoDetectedMode] = useState<'task' | 'calendar' | null>(null)

  // Calendar-specific state
  const [startTime, setStartTime] = useState(
    task?.startTime ? format(new Date(task.startTime), "yyyy-MM-dd'T'HH:mm") :
    selectedDate ? format(selectedDate, "yyyy-MM-dd'T'09:00") :
    format(new Date(), "yyyy-MM-dd'T'09:00")
  )
  const [endTime, setEndTime] = useState(
    task?.endTime ? format(new Date(task.endTime), "yyyy-MM-dd'T'HH:mm") :
    selectedDate ? format(selectedDate, "yyyy-MM-dd'T'10:00") :
    format(new Date(), "yyyy-MM-dd'T'10:00")
  )
  const [allDay, setAllDay] = useState(task?.allDay || false)
  const [location, setLocation] = useState(task?.location || '')
  const [eventType, setEventType] = useState(task?.type || 'EVENT')
  const [eventColor, setEventColor] = useState(task?.color || 'blue')

  // Workspace data
  const { user } = useAuthStore()
  const { data: workspaceUsers } = trpc.user.getWorkspaceUsers.useQuery(
    { workspaceId: workspaceId },
    { enabled: !!workspaceId }
  )

  // Fetch projects for project selection
  const { data: projects = [] } = trpc.project.list.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  
  // Get kanban columns from provided kanbanId
  const { data: kanbanData } = trpc.kanban.get.useQuery(
    { id: kanbanId || '' },
    { enabled: !!kanbanId }
  )
  const columns = kanbanData?.columns || []

  // tRPC mutations
  const createTaskMutation = trpc.task.create.useMutation()
  const updateTaskMutation = trpc.task.update.useMutation()
  const deleteTaskMutation = trpc.task.delete.useMutation()
  const uploadMutation = trpc.upload.uploadTaskFile.useMutation()

  // Calendar mutations
  const createCalendarEventMutation = trpc.calendar.create.useMutation()
  const updateCalendarEventMutation = trpc.calendar.update.useMutation()

  // Intelligence: Analyze title for smart suggestions
  const analyzeTitle = (title: string) => {
    const suggestions: string[] = []
    const lowerTitle = title.toLowerCase()
    
    // Smart mode detection
    if (lowerTitle.includes('meeting') || lowerTitle.includes('call') || lowerTitle.includes('interview')) {
      if (currentMode !== 'calendar') {
        setAutoDetectedMode('calendar')
        suggestions.push('💡 This sounds like a calendar event')
      }
      // Auto-set intelligent defaults for meetings
      if (!startTime || startTime === format(new Date(), "yyyy-MM-dd'T'09:00")) {
        const nextHour = new Date()
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
        setStartTime(format(nextHour, "yyyy-MM-dd'T'HH:mm"))
        const endHour = new Date(nextHour)
        endHour.setHours(endHour.getHours() + 1)
        setEndTime(format(endHour, "yyyy-MM-dd'T'HH:mm"))
      }
    }
    
    if (lowerTitle.includes('deadline') || lowerTitle.includes('due') || lowerTitle.includes('submit')) {
      if (currentMode !== 'calendar') {
        suggestions.push('📅 Consider creating a calendar reminder for this deadline')
      }
      if (!dueDate) {
        suggestions.push('⏰ This seems time-sensitive - set a due date')
      }
    }
    
    if (lowerTitle.includes('urgent') || lowerTitle.includes('asap') || lowerTitle.includes('critical')) {
      if (priority !== Priority.HIGH) {
        setPriority(Priority.HIGH)
        suggestions.push('🔴 Auto-detected high priority')
      }
    }
    
    if (lowerTitle.includes('review') || lowerTitle.includes('feedback')) {
      if (currentMode === 'task') {
        suggestions.push('👀 Consider selecting the Review column')
      }
    }
    
    setSmartSuggestions(suggestions)
  }
  
  // Intelligence: Smart date selection
  const intelligentDateSelect = (date: Date) => {
    setDueDate(date)
    
    // If selecting future date with time, suggest calendar event
    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5
    const isBusinessHours = date.getHours() >= 9 && date.getHours() <= 17
    
    if (isWeekday && isBusinessHours && currentMode === 'task') {
      setSmartSuggestions(prev => [...prev, '💡 Business day/time selected - create calendar event instead?'])
    }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !workspaceId) return

    setIsLoading(true)
    
    try {
      if (currentMode === 'calendar') {
        // Calendar event creation/update
        const calendarEventData = {
          title: title.trim(),
          description: description.trim(),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          allDay,
          location: location.trim() || undefined,
          color: eventColor,
          type: eventType,
          workspaceId
        }

        if (isEditMode && task?.id) {
          await updateCalendarEventMutation.mutateAsync({
            id: task.id,
            ...calendarEventData
          })
        } else {
          await createCalendarEventMutation.mutateAsync(calendarEventData)
        }
      } else {
        // Task creation/update (existing logic)
        const taskData = {
          title: title.trim(),
          description: description.trim(),
          priority: mapPriorityToApi(priority),
          dueDate: dueDate ? dueDate.toISOString() : null,
          assigneeId: assigneeId || null,
          tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
          workspaceId,
          kanbanColumnId: selectedColumnId || undefined,
          projectId: projectId || undefined
        }

        let createdTaskId = task?.id

        if (isEditMode && task?.id) {
          await updateTaskMutation.mutateAsync({
            id: task.id,
            ...taskData
          })
        } else {
          const newTask = await createTaskMutation.mutateAsync(taskData)
          createdTaskId = newTask.task.id
        }

        // Handle file uploads if any
        if (pendingFiles.length > 0 && createdTaskId) {
          setUploadingFiles(true)
          for (const file of pendingFiles) {
            const fileBuffer = await file.arrayBuffer()
            await uploadMutation.mutateAsync({
              taskId: createdTaskId,
              file: {
                filename: file.name,
                mimetype: file.type,
                size: file.size,
                buffer: Buffer.from(fileBuffer),
              },
            })
          }
        }
      }

      toast.success(isEditMode ? 'Item updated' : 'Item created')
      onTaskCreated?.()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error(`Failed to save ${mode}:`, error)
      toast.error(`Failed to save ${mode}`)
    } finally {
      setIsLoading(false)
      setUploadingFiles(false)
    }
  }, [
    title, workspaceId, currentMode, description, startTime, endTime, allDay, location, eventColor, eventType,
    isEditMode, task?.id, priority, dueDate, assigneeId, tags, selectedColumnId, pendingFiles, mode,
    onTaskCreated, onSuccess, onClose, updateCalendarEventMutation, createCalendarEventMutation,
    updateTaskMutation, createTaskMutation, uploadMutation
  ])

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
        onClose() // Close modal immediately
        onTaskCreated?.() // Trigger refresh
        onSuccess?.()
      },
      onRestore: () => {
        // Just trigger a refresh to show the task again
        onTaskCreated?.()
      }
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPendingFiles(Array.from(e.target.files))
    }
  }

  const generateCalendarDays = () => {
    const start = startOfMonth(calendarDate)
    const end = endOfMonth(calendarDate)
    const days = eachDayOfInterval({ start, end })
    
    const startDay = getDay(start)
    const paddingDays = Array(startDay).fill(null)
    
    return [...paddingDays, ...days]
  }

  const handleDateSelect = (date: Date) => {
    setDueDate(date)
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (isEditMode && task) {
        setTitle(task.title || '')
        setDescription(task.description || '')
        
        if (mode === 'calendar') {
          // Calendar event editing
          setStartTime(task.startTime ? format(new Date(task.startTime), "yyyy-MM-dd'T'HH:mm") : 
                      selectedDate ? format(selectedDate, "yyyy-MM-dd'T'09:00") : 
                      format(new Date(), "yyyy-MM-dd'T'09:00"))
          setEndTime(task.endTime ? format(new Date(task.endTime), "yyyy-MM-dd'T'HH:mm") : 
                    selectedDate ? format(selectedDate, "yyyy-MM-dd'T'10:00") : 
                    format(new Date(), "yyyy-MM-dd'T'10:00"))
          setAllDay(task.allDay || false)
          setLocation(task.location || '')
          setEventType(task.type || 'EVENT')
          setEventColor(task.color || 'blue')
        } else {
          // Task editing
          setPriority(task.priority || Priority.MEDIUM)
          setDueDate(task.dueDate ? new Date(task.dueDate) : null)
          setAssigneeId(task.assigneeId || '')
          setTags(task.tags?.join(', ') || '')
        }
      } else {
        // Reset for new item
        setTitle('')
        setDescription('')
        
        if (mode === 'calendar') {
          // New calendar event defaults
          setStartTime(selectedDate ? format(selectedDate, "yyyy-MM-dd'T'09:00") : 
                      format(new Date(), "yyyy-MM-dd'T'09:00"))
          setEndTime(selectedDate ? format(selectedDate, "yyyy-MM-dd'T'10:00") : 
                    format(new Date(), "yyyy-MM-dd'T'10:00"))
          setAllDay(false)
          setLocation('')
          setEventType('EVENT')
          setEventColor('blue')
        } else {
          // New task defaults
          setPriority(Priority.MEDIUM)
          setDueDate(null)
          setAssigneeId('')
          setTags('')
        }
      }
      setPendingFiles([])
    }
  }, [open, isEditMode, task, kanbanColumnId, mode, selectedDate])
  
  // Set initial selected column
  useEffect(() => {
    if (kanbanColumnId) {
      setSelectedColumnId(kanbanColumnId)
    } else if (task?.kanbanColumnId) {
      setSelectedColumnId(task.kanbanColumnId)
    }
  }, [kanbanColumnId, task?.kanbanColumnId])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!open) return
      
      // ESC to close
      if (e.key === 'Escape') {
        onClose()
      }
      
      // CMD/Ctrl + Enter to save
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (title.trim() && !isLoading && !uploadingFiles) {
          // Create a synthetic form event for handleSubmit
          const syntheticEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent
          handleSubmit(syntheticEvent)
        }
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleKeydown)
      return () => document.removeEventListener('keydown', handleKeydown)
    }
  }, [open, onClose, title, isLoading, uploadingFiles, handleSubmit])



  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Modal Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Intelligently Compact Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg border border-krushr-gray-border overflow-hidden">
        {/* Ultra-compact header with priority dots */}
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
            {/* Priority Dots in Header */}
            <div className="flex items-center gap-2 mr-3">
              <span className="text-xs font-medium text-gray-600">Priority:</span>
              <div className="flex gap-0.5">
                {[
                  { value: Priority.LOW, color: 'bg-green-500', hoverColor: 'hover:bg-green-500/50' },
                  { value: Priority.MEDIUM, color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-500/50' },
                  { value: Priority.HIGH, color: 'bg-red-500', hoverColor: 'hover:bg-red-500/50' }
                ].map((p, index) => {
                  const isActive = priority === p.value || 
                                 (priority === Priority.LOW && index === 0) ||
                                 (priority === Priority.MEDIUM && index <= 1) ||
                                 (priority === Priority.HIGH && index <= 2);
                  return (
                    <button
                      key={p.value}
                      type="button"
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-200 shadow-sm",
                        isActive ? p.color : "bg-gray-300",
                        p.hoverColor
                      )}
                      title={`${p.value} Priority`}
                      onClick={() => setPriority(p.value)}
                    />
                  );
                })}
              </div>
            </div>
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

          {/* Column selection - Visual buttons */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Column</label>
            <div className="grid grid-cols-4 gap-2">
              {columns.slice(0, 4).map((column) => {
                const isSelected = selectedColumnId === column.id;
                // Map column names to status colors and icons
                const columnMap: Record<string, { color: string; icon: string }> = {
                  'Backlog': { color: 'bg-gray-500', icon: '○' },
                  'To Do': { color: 'bg-gray-500', icon: '○' },
                  'In Progress': { color: 'bg-blue-500', icon: '◐' },
                  'Review': { color: 'bg-purple-500', icon: '◎' },
                  'Done': { color: 'bg-green-500', icon: '●' }
                };
                const config = columnMap[column.title] || { color: 'bg-gray-400', icon: '○' };
                
                return (
                  <button
                    key={column.id}
                    type="button"
                    onClick={() => setSelectedColumnId(column.id)}
                    className={cn(
                      "px-3 py-3 rounded-lg border-2 transition-all duration-200",
                      "flex flex-col items-center gap-1.5",
                      isSelected 
                        ? `${config.color} text-white border-transparent shadow-sm` 
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-xs font-medium">{column.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignee as avatar grid */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Assignee</label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setAssigneeId('')}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all",
                  !assigneeId 
                    ? "border-krushr-primary bg-gray-100" 
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                )}
                title="Unassigned"
              >
                <User className="w-5 h-5 mx-auto text-gray-400" />
              </button>
              {workspaceUsers?.map((user) => {
                const isSelected = assigneeId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setAssigneeId(user.id)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all font-medium text-sm",
                      isSelected 
                        ? "border-krushr-primary bg-krushr-primary text-white" 
                        : "border-gray-200 bg-gray-100 text-gray-700 hover:border-gray-300"
                    )}
                    title={user.name}
                  >
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date section with quick buttons and calendar */}
          <div>
            <div className="flex items-center justify-between mb-2">
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
            
            {/* Quick date buttons in a compact row */}
            <div className="flex gap-1 mb-2">
              <button
                type="button"
                onClick={() => setDueDate(new Date())}
                className={cn(
                  "flex-1 px-2 py-1 text-xs rounded-md transition-all",
                  dueDate && isSameDay(dueDate, new Date())
                    ? "bg-krushr-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  setDueDate(tomorrow)
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = new Date()
                  nextWeek.setDate(nextWeek.getDate() + 7)
                  setDueDate(nextWeek)
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md"
              >
                Next Week
              </button>
            </div>

            {/* Ultra-compact calendar */}
            <div className="bg-white border border-gray-200 rounded-md p-2">
              <div className="flex items-center justify-between mb-1">
                <button
                  type="button"
                  onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                  className="p-0.5 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-xs font-medium">{format(calendarDate, 'MMM yyyy')}</span>
                <button
                  type="button"
                  onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                  className="p-0.5 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[9px] text-gray-500 text-center p-0.5">{d}</div>
                ))}
                {generateCalendarDays().map((date, index) => {
                  if (!date) return <div key={index} />
                  const isSelected = dueDate && isSameDay(date, dueDate)
                  const isCurrentDay = isSameDay(date, new Date())
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setDueDate(date)}
                      className={cn(
                        "text-[10px] p-0.5 rounded relative",
                        "hover:bg-gray-100",
                        isSelected && "bg-krushr-primary text-white hover:bg-krushr-primary",
                        isCurrentDay && !isSelected && "font-bold text-krushr-primary",
                        !isSameMonth(date, calendarDate) && "text-gray-300",
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
            </div>

            {/* Attachment Section */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Attachments</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <Upload className="w-3 h-3" />
                  <span>{pendingFiles.length > 0 ? `${pendingFiles.length} file(s)`: 'Upload'}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
              </div>
            </div>
        
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
        </form>
      </div>
    </div>,
    document.body
  )
}