import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, ChevronLeft, ChevronRight, User, Tag, Paperclip, Upload, FileText, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { useAuthStore } from '../../stores/auth-store'
import { TaskStatus, Priority } from '../../types/enums'
import { trpc } from '../../lib/trpc'
import { DueDatePicker } from '../forms/DueDatePicker'
import { AttachmentUpload } from '../common/AttachmentUpload'
import { FloatingInput } from '../ui/floating-input'
import { cn } from '../../lib/utils'

interface CompactTaskModalProps {
  open: boolean
  onClose: () => void
  onTaskCreated?: () => void
  workspaceId: string
  kanbanColumnId?: string
  task?: any
  isEditMode?: boolean
  mode?: 'task' | 'calendar'
  selectedDate?: Date | null
}

export default function CompactTaskModal({ 
  open, 
  onClose, 
  onTaskCreated, 
  workspaceId, 
  kanbanColumnId,
  task,
  isEditMode = false,
  mode = 'task',
  selectedDate
}: CompactTaskModalProps) {
  // Form state
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.MEDIUM)
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.TODO)
  const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null)
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '')
  const [tags, setTags] = useState(task?.tags?.join(', ') || '')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(kanbanColumnId || null)
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
  const { currentWorkspace } = useAuthStore()
  const { data: workspaceUsers } = trpc.workspace.listUsers.useQuery(
    { workspaceId: currentWorkspace?.id || '' },
    { enabled: !!currentWorkspace?.id }
  )

  // tRPC mutations
  const createTaskMutation = trpc.task.create.useMutation()
  const updateTaskMutation = trpc.task.update.useMutation()
  const deleteTaskMutation = trpc.task.delete.useMutation()
  const uploadMutation = trpc.uploadNew.uploadFiles.useMutation()

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
      if (status !== TaskStatus.IN_REVIEW && currentMode === 'task') {
        suggestions.push('👀 Consider setting status to "In Review"')
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

  const handleSubmit = async (e: React.FormEvent) => {
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
          type: eventType as any,
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
          priority,
          status,
          dueDate: dueDate ? dueDate.toISOString() : null,
          assigneeId: assigneeId || null,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          workspaceId
        }

        let createdTaskId = task?.id

        if (isEditMode && task?.id) {
          await updateTaskMutation.mutateAsync({
            id: task.id,
            ...taskData
          })
        } else {
          const newTask = await createTaskMutation.mutateAsync(taskData)
          createdTaskId = newTask.id
        }

        // Handle file uploads if any
        if (pendingFiles.length > 0 && createdTaskId) {
          setUploadingFiles(true)
          const formData = new FormData()
          pendingFiles.forEach(file => {
            formData.append('files', file)
          })
          formData.append('type', 'task')
          formData.append('targetId', createdTaskId)

          await uploadMutation.mutateAsync(formData as any)
        }
      }

      onTaskCreated?.()
      onClose()
    } catch (error) {
      console.error(`Failed to save ${mode}:`, error)
    } finally {
      setIsLoading(false)
      setUploadingFiles(false)
    }
  }

  const handleDelete = async () => {
    if (!task?.id || !confirm('Are you sure you want to delete this task?')) return
    
    setIsLoading(true)
    try {
      await deleteTaskMutation.mutateAsync({ id: task.id })
      onTaskCreated?.()
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (files: File[]) => {
    setPendingFiles(prev => [...prev, ...files])
  }

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
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
          setStatus(task.status || TaskStatus.TODO)
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
          setStatus(kanbanColumnId === 'todo' ? TaskStatus.TODO : 
                   kanbanColumnId === 'progress' ? TaskStatus.IN_PROGRESS :
                   kanbanColumnId === 'review' ? TaskStatus.IN_REVIEW :
                   kanbanColumnId === 'done' ? TaskStatus.DONE : 
                   TaskStatus.TODO)
          setDueDate(null)
          setAssigneeId('')
          setTags('')
        }
      }
      setPendingFiles([])
    }
  }, [open, isEditMode, task, kanbanColumnId, mode, selectedDate])

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
          handleSubmit(e as any)
        }
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleKeydown)
      return () => document.removeEventListener('keydown', handleKeydown)
    }
  }, [open, onClose, title, isLoading, uploadingFiles, handleSubmit])

  // Map column IDs to task status
  useEffect(() => {
    if (kanbanColumnId) {
      if (kanbanColumnId === 'todo') setStatus(TaskStatus.TODO)
      else if (kanbanColumnId === 'progress') setStatus(TaskStatus.IN_PROGRESS)
      else if (kanbanColumnId === 'review') setStatus(TaskStatus.IN_REVIEW)
      else if (kanbanColumnId === 'done') setStatus(TaskStatus.DONE)
      else if (kanbanColumnId === 'cancelled') setStatus(TaskStatus.CANCELLED)
    }
  }, [kanbanColumnId, isEditMode, task])


  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Modal Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Container - Simple Original Design */}
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {/* Unified Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {currentMode === 'calendar' ? (
                <Calendar className="w-5 h-5 text-blue-600" />
              ) : (
                <Tag className="w-5 h-5 text-green-600" />
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit' : 'Create'} {currentMode === 'calendar' ? 'Event' : 'Task'}
              </h2>
            </div>
            {/* Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setCurrentMode('task')}
                className={cn(
                  "px-3 py-1 text-sm rounded-md transition-all",
                  currentMode === 'task' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Task
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('calendar')}
                className={cn(
                  "px-3 py-1 text-sm rounded-md transition-all",
                  currentMode === 'calendar' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Event
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Unified Form Fields */}
            <div className="space-y-6">
              {/* Essential Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
                <div className="space-y-4">
                  {/* Title - Universal */}
                  <div className="space-y-2">
                    <FloatingInput
                      type="text"
                      label={currentMode === 'calendar' ? 'Event title' : 'Task title'}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                        analyzeTitle(e.target.value)
                      }}
                      autoFocus
                      className="text-lg font-semibold"
                    />
                    
                    {/* Smart Suggestions */}
                    {smartSuggestions.length > 0 && (
                      <div className="space-y-1">
                        {smartSuggestions.map((suggestion, index) => (
                          <div key={index} className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-2">
                            <span>{suggestion}</span>
                            {suggestion.includes('calendar event') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentMode('calendar')
                                  setSmartSuggestions(prev => prev.filter((_, i) => i !== index))
                                }}
                                className="text-blue-700 hover:text-blue-900 underline"
                              >
                                Switch
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Mode Detection Alert */}
                    {autoDetectedMode && autoDetectedMode !== currentMode && (
                      <div className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-yellow-800">
                          💡 This looks like a {autoDetectedMode === 'calendar' ? 'calendar event' : 'task'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentMode(autoDetectedMode)
                            setAutoDetectedMode(null)
                          }}
                          className="text-yellow-700 hover:text-yellow-900 underline font-medium"
                        >
                          Switch to {autoDetectedMode}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Description - Universal */}
                  <div className="relative">
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-krushr-primary peer resize-none"
                      placeholder=" "
                      rows={3}
                    />
                    <label 
                      htmlFor="description"
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-[20px] peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                      Description
                    </label>
                  </div>

                  {/* Timing Fields - Intelligent for Both */}
                  {currentMode === 'calendar' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingInput
                        type="datetime-local"
                        label="Start time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                      <FloatingInput
                        type="datetime-local"
                        label="End time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                      <FloatingInput
                        type="text"
                        label="Location (optional)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="all-day"
                          checked={allDay}
                          onChange={(e) => setAllDay(e.target.checked)}
                          className="rounded border-gray-300 focus:ring-krushr-primary"
                        />
                        <label htmlFor="all-day" className="text-sm text-gray-700 font-medium">
                          All day event
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="date"
                        value={dueDate ? format(dueDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-krushr-primary focus:ring-0"
                        placeholder="Due date"
                      />
                      <FloatingInput
                        type="text"
                        label="Tags (comma separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
                {/* Intelligent Sidebar */}
                <div className="space-y-4">
                {/* Priority - Small Dot System */}
                {mode === 'task' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map((p) => {
                          const colors = {
                            [Priority.LOW]: 'bg-gray-400',
                            [Priority.MEDIUM]: 'bg-krushr-warning', 
                            [Priority.HIGH]: 'bg-krushr-secondary'
                          }
                          
                          const count = {
                            [Priority.LOW]: 1,
                            [Priority.MEDIUM]: 2,
                            [Priority.HIGH]: 3
                          }
                          
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPriority(p)}
                              className={cn(
                                "flex gap-1 items-center px-3 py-2 rounded-lg transition-all hover:bg-gray-50",
                                priority === p ? "bg-gray-100" : "hover:bg-gray-50"
                              )}
                              title={`${p} Priority`}
                            >
                              <div className="flex gap-1">
                                {Array.from({ length: count[p] }).map((_, i) => (
                                  <div key={i} className={cn('w-2 h-2 rounded-full', priority === p ? colors[p] : 'bg-gray-300')} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600 ml-1">{p}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                  {/* Status/Type - Unified */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentMode === 'calendar' ? 'Event Type' : 'Status'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {currentMode === 'calendar' ? (
                        ['MEETING', 'TASK', 'EVENT', 'REMINDER'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setEventType(type)}
                            className={cn(
                              "px-3 py-2 text-xs rounded-lg transition-all",
                              eventType === type
                                ? "bg-krushr-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {type}
                          </button>
                        ))
                      ) : (
                        [
                          { value: TaskStatus.TODO, label: 'Todo' },
                          { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
                          { value: TaskStatus.IN_REVIEW, label: 'Review' },
                          { value: TaskStatus.DONE, label: 'Done' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setStatus(option.value)}
                            className={cn(
                              "px-3 py-2 text-xs rounded-lg transition-all",
                              status === option.value
                                ? "bg-krushr-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {option.label}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                
                  {/* Color/Priority Indicator */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentMode === 'calendar' ? 'Color Theme' : 'Priority'}
                    </label>
                    {currentMode === 'calendar' ? (
                      <div className="flex gap-2 justify-center">
                        {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEventColor(color)}
                            className={cn(
                              "w-8 h-8 rounded-lg transition-all border-2 relative",
                              eventColor === color ? "border-gray-400 scale-110 shadow-lg" : "border-transparent hover:scale-105",
                              color === 'blue' && "bg-blue-500",
                              color === 'green' && "bg-green-500",
                              color === 'purple' && "bg-purple-500",
                              color === 'orange' && "bg-orange-500",
                              color === 'red' && "bg-red-500"
                            )}
                          >
                            {eventColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map((p) => {
                          const colors = {
                            [Priority.LOW]: 'bg-gray-400',
                            [Priority.MEDIUM]: 'bg-krushr-warning', 
                            [Priority.HIGH]: 'bg-krushr-secondary'
                          }
                          
                          const count = {
                            [Priority.LOW]: 1,
                            [Priority.MEDIUM]: 2,
                            [Priority.HIGH]: 3
                          }
                          
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPriority(p)}
                              className={cn(
                                "flex gap-1 items-center px-3 py-2 rounded-lg transition-all hover:bg-gray-50",
                                priority === p ? "bg-gray-100" : "hover:bg-gray-50"
                              )}
                              title={`${p} Priority`}
                            >
                              <div className="flex gap-1">
                                {Array.from({ length: count[p] }).map((_, i) => (
                                  <div key={i} className={cn('w-2 h-2 rounded-full', priority === p ? colors[p] : 'bg-gray-300')} />
                                ))}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                
                  {/* Advanced Options Toggle */}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full"
                    >
                      <ChevronRight className={cn("w-4 h-4 transition-transform", showAdvanced && "rotate-90")} />
                      Advanced Options
                    </button>
                    
                    {showAdvanced && (
                      <div className="mt-4 space-y-4">
                        {/* Assignee/Organizer - Universal */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {currentMode === 'calendar' ? 'Organizer' : 'Assignee'}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setAssigneeId('')}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all",
                                assigneeId === ''
                                  ? "bg-krushr-primary text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              <div className="w-4 h-4 rounded-full bg-gray-300" />
                              {currentMode === 'calendar' ? 'No organizer' : 'Unassigned'}
                            </button>
                            {workspaceUsers?.slice(0, 3).map((user) => {
                              const initials = (user.name || user.email).slice(0, 2).toUpperCase()
                              
                              return (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => setAssigneeId(user.id)}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all",
                                    assigneeId === user.id
                                      ? "bg-krushr-primary text-white"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  )}
                                >
                                  <div className="w-4 h-4 bg-gradient-to-br from-krushr-primary to-blue-600 rounded-full flex items-center justify-center text-white text-[9px] font-medium">
                                    {initials}
                                  </div>
                                  {user.name || user.email.split('@')[0]}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        
                        {/* Context-specific Advanced Options */}
                        {currentMode === 'calendar' ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Reminders</label>
                              <div className="flex gap-2">
                                {['5 min', '15 min', '30 min', '1 hour'].map((reminder) => (
                                  <button
                                    key={reminder}
                                    type="button"
                                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    {reminder}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Smart cross-mode suggestion */}
                            {assigneeId && (
                              <div className="text-xs bg-green-50 border border-green-200 rounded-lg p-2">
                                💡 <strong>Smart tip:</strong> Create follow-up tasks for attendees?
                                <button className="ml-2 text-green-700 underline">Create tasks</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Dependencies</label>
                              <FloatingInput
                                type="text"
                                label="Blocked by (optional)"
                                value=""
                                onChange={() => {}}
                                className="text-sm"
                              />
                            </div>
                            
                            {/* Smart cross-mode suggestions */}
                            {dueDate && (
                              <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg p-2">
                                📅 <strong>Smart tip:</strong> Add calendar reminder for this deadline?
                                <button 
                                  className="ml-2 text-blue-700 underline"
                                  onClick={() => {
                                    setCurrentMode('calendar')
                                    setStartTime(format(dueDate, "yyyy-MM-dd'T'HH:mm"))
                                    setEndTime(format(dueDate, "yyyy-MM-dd'T'HH:mm"))
                                  }}
                                >
                                  Create reminder
                                </button>
                              </div>
                            )}
                            
                            {priority === Priority.HIGH && (
                              <div className="text-xs bg-red-50 border border-red-200 rounded-lg p-2">
                                🚨 <strong>High priority task:</strong> Consider setting earlier due date or notifying team
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                
                {/* Due Date with Calendar Widget */}
                {mode === 'task' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    {dueDate ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              {format(dueDate, 'MMM d, yyyy')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDueDate(null)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setDueDate(new Date())}
                            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
                            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
                            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                          >
                            Next Week
                          </button>
                        </div>
                        
                        {/* Compact Calendar Widget */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <button
                              type="button"
                              onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium">
                              {format(calendarDate, 'MMMM yyyy')}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-7 gap-1 text-xs">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                              <div key={day} className="text-center text-gray-500 p-1 font-medium">
                                {day}
                              </div>
                            ))}
                            {generateCalendarDays().map((date, index) => {
                              if (!date) {
                                return <div key={index} className="p-1" />
                              }
                              
                              const isToday = isSameDay(date, new Date())
                              const isCurrentMonth = isSameMonth(date, calendarDate)
                              const isSelected = dueDate && isSameDay(date, dueDate)
                              
                              return (
                                <button
                                  key={date.toISOString()}
                                  type="button"
                                  onClick={() => intelligentDateSelect(date)}
                                  className={cn(
                                    "p-1 text-center rounded transition-colors",
                                    isCurrentMonth ? "text-gray-900" : "text-gray-400",
                                    isToday && "bg-krushr-primary text-white font-medium",
                                    isSelected && "bg-blue-500 text-white",
                                    !isToday && !isSelected && "hover:bg-gray-100"
                                  )}
                                >
                                  {format(date, 'd')}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Attachments - Bottom Section */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Attachments</label>
              {task?.id ? (
                <AttachmentUpload
                  type="task"
                  targetId={task.id}
                  onUploadComplete={() => {}}
                  className="w-full"
                />
              ) : (
                <div>
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-krushr-primary transition-colors cursor-pointer hover:bg-gray-50"
                    onClick={() => document.getElementById('file-input')?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('border-krushr-primary', 'bg-krushr-primary-50')
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-krushr-primary', 'bg-krushr-primary-50')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-krushr-primary', 'bg-krushr-primary-50')
                      const files = Array.from(e.dataTransfer.files)
                      handleFileSelect(files)
                    }}
                  >
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-krushr-primary">Upload files</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Max 15MB per file</p>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileSelect(Array.from(e.target.files))
                        }
                      }}
                    />
                  </div>
                  
                  {pendingFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {pendingFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePendingFile(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                >
                  Delete {currentMode === 'calendar' ? 'Event' : 'Task'}
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || uploadingFiles || !title.trim()}
                  className="px-4 py-2 text-sm bg-krushr-primary text-white rounded-lg hover:bg-krushr-primary-700 transition-colors disabled:opacity-50"
                >
                  {isLoading || uploadingFiles ? 'Saving...' : isEditMode ? 'Update' : 'Create'} {currentMode === 'calendar' ? 'Event' : 'Task'}
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