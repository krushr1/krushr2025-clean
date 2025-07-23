import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, ChevronLeft, ChevronRight, User, Tag, Paperclip, Upload, FileText, Clock, Plus, Loader2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { useAuthStore } from '../../stores/auth-store'
import { Priority } from '../../types/enums'
import { trpc } from '../../lib/trpc'
import { DueDatePicker } from '../forms/DueDatePicker'
import { AttachmentUpload } from '../common/AttachmentUpload'
import { FloatingInput } from '../ui/floating-input'
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
  mode?: 'task' | 'calendar'
  selectedDate?: Date | null
}

// Priority Selector Component with hover functionality
const PrioritySelector = ({ priority, onChange }: { priority: Priority; onChange: (p: Priority) => void }) => {
  const [hoveredPriority, setHoveredPriority] = useState<Priority | null>(null)
  const currentPriority = hoveredPriority || priority
  
  return (
    <div className="bg-white border border-krushr-gray-border rounded p-3">
      <label className="text-xs font-medium text-krushr-gray mb-2 block">Priority</label>
      <div 
        className="flex items-center gap-2"
        onMouseLeave={() => setHoveredPriority(null)}
      >
        <div className="flex gap-1">
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
                  "w-2.5 h-2.5 rounded-full transition-colors duration-150 cursor-pointer",
                  isActive 
                    ? "bg-krushr-secondary" 
                    : "bg-krushr-gray-lighter hover:bg-krushr-gray-light"
                )}
                title={`${p} Priority`}
              />
            )
          })}
        </div>
        <span className="text-xs text-krushr-gray capitalize w-12">{currentPriority.toLowerCase()}</span>
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
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.MEDIUM)
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
  const { currentWorkspace } = useAuthStore()
  const { data: workspaceUsers } = trpc.workspace.listUsers.useQuery(
    { workspaceId: currentWorkspace?.id || '' },
    { enabled: !!currentWorkspace?.id }
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
          dueDate: dueDate ? dueDate.toISOString() : null,
          assigneeId: assigneeId || null,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          workspaceId,
          kanbanColumnId: selectedColumnId || undefined
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
      onSuccess?.()
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
      onSuccess?.()
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
          handleSubmit(e as any)
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
      
      {/* Modal Container - Compact Intelligent Design */}
      <div className="relative w-full max-w-2xl mx-4 max-h-[85vh] bg-white rounded-lg overflow-hidden flex flex-col shadow-lg border border-krushr-gray-border">
        {/* Compact Header with Task Title */}
        <div className="px-4 py-3 border-b border-krushr-gray-border bg-gradient-to-r from-krushr-gray-bg-light to-white">
          <div className="flex items-center justify-between">
            <FloatingInput
              type="text"
              label={isEditMode ? 'Edit task' : 'What needs to be done?'}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                analyzeTitle(e.target.value)
              }}
              autoFocus
              className="flex-1 mr-3 text-lg font-semibold border-0 px-0 py-0 focus:ring-0 bg-transparent placeholder:text-krushr-gray-light"
              placeholder="Enter task title..."
            />
            <button 
              onClick={onClose}
              className="text-krushr-gray hover:text-krushr-gray-dark transition-colors p-1.5 hover:bg-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content - Intelligent Compact Layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Two Column Layout for Efficiency */}
            <div className="grid grid-cols-[1fr,280px] gap-4">
              {/* Left Column - Main Content */}
              <div className="space-y-4">
                {/* Description - Expandable */}
                <div className="relative">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[80px] resize-y text-sm border border-krushr-gray-border rounded-md px-3 pt-5 pb-2 focus:border-krushr-primary focus:ring-1 focus:ring-krushr-primary/20 transition-all duration-200 peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="description"
                    className="absolute text-xs text-gray-500 duration-300 transform -translate-y-3 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-3 left-1"
                  >
                    Description
                  </label>
                </div>

                {/* Quick Properties Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Kanban Column Selection */}
                  <div>
                    <label className="text-xs font-medium text-krushr-gray mb-2 block">Column</label>
                    <div className="grid grid-cols-2 gap-1">
                      {columns.map((column) => (
                        <button
                          key={column.id}
                          type="button"
                          onClick={() => setSelectedColumnId(column.id)}
                          className={cn(
                            "px-2 py-1.5 text-xs font-medium rounded border transition-all",
                            selectedColumnId === column.id
                              ? "bg-krushr-primary text-white border-krushr-primary"
                              : "bg-white text-krushr-gray border-krushr-gray-border hover:border-krushr-gray"
                          )}
                          style={{
                            borderColor: selectedColumnId === column.id ? column.color : undefined
                          }}
                        >
                          {column.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Assignee */}
                  <div className="relative">
                    <select
                      id="assignee"
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full h-[34px] px-2 pt-4 pb-1 text-xs border border-krushr-gray-border rounded focus:border-krushr-primary focus:ring-1 focus:ring-krushr-primary/20 appearance-none bg-white peer"
                    >
                      <option value="" className="text-xs">Unassigned</option>
                      {workspaceUsers?.map((user) => (
                        <option key={user.id} value={user.id} className="text-xs">
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                    <label
                      htmlFor="assignee"
                      className="absolute text-xs text-gray-500 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white px-1 left-2 pointer-events-none"
                    >
                      Assignee
                    </label>
                  </div>
                </div>
                {/* Tags Input */}
                <div>
                  <FloatingInput
                    type="text"
                    label="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-krushr-gray-border rounded focus:border-krushr-primary focus:ring-1 focus:ring-krushr-primary/20"
                  />
                  {tags && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {tags.split(',').map((tag, idx) => tag.trim() && (
                        <span key={idx} className="text-xs bg-krushr-gray-bg px-2 py-0.5 rounded">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attachments */}
                <div>
                  <label className="text-xs font-medium text-krushr-gray mb-2 block">Attachments</label>
                  <div 
                    className="border border-dashed border-krushr-gray-border rounded p-3 text-center hover:border-krushr-primary transition-colors cursor-pointer hover:bg-krushr-gray-bg-light"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <Upload className="w-4 h-4 mx-auto text-krushr-gray mb-1" />
                    <p className="text-xs text-krushr-gray">
                      Drop files or <span className="text-krushr-primary">browse</span>
                    </p>
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
                    <div className="mt-2 space-y-1">
                      {pendingFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-1.5 bg-krushr-gray-bg-light rounded text-xs">
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePendingFile(index)}
                            className="text-krushr-gray hover:text-krushr-secondary"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Calendar */}
              <div className="space-y-4">
                {/* Due Date Display */}
                {dueDate && (
                  <div className="p-3 bg-krushr-info-50 border border-krushr-info rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-krushr-info" />
                        <span className="text-sm font-medium text-krushr-gray-dark">
                          {format(dueDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDueDate(null)}
                        className="text-krushr-gray hover:text-krushr-secondary"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Date Buttons */}
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setDueDate(new Date())}
                    className={cn(
                      "px-2 py-1 text-xs font-medium rounded border transition-all",
                      dueDate && isSameDay(dueDate, new Date())
                        ? "bg-krushr-info-50 text-krushr-info border-krushr-info"
                        : "bg-white text-krushr-gray border-krushr-gray-border hover:border-krushr-info"
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
                    className="px-2 py-1 text-xs font-medium bg-white text-krushr-gray border border-krushr-gray-border rounded hover:border-krushr-info transition-all"
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
                    className="px-2 py-1 text-xs font-medium bg-white text-krushr-gray border border-krushr-gray-border rounded hover:border-krushr-info transition-all"
                  >
                    Next Week
                  </button>
                </div>

                {/* Compact Calendar */}
                <div className="bg-white border border-krushr-gray-border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                      className="p-1 hover:bg-krushr-gray-bg-light rounded"
                    >
                      <ChevronLeft className="w-3 h-3 text-krushr-gray" />
                    </button>
                    <span className="text-xs font-semibold text-krushr-gray-dark">
                      {format(calendarDate, 'MMMM yyyy')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                      className="p-1 hover:bg-krushr-gray-bg-light rounded"
                    >
                      <ChevronRight className="w-3 h-3 text-krushr-gray" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0.5 text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={`${day}-${index}`} className="text-center text-krushr-gray p-1 text-[10px] font-medium">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((date, index) => {
                      if (!date) {
                        return <div key={index} className="p-1" />
                      }
                      
                      const isCurrentDay = isSameDay(date, new Date())
                      const isCurrentMonth = isSameMonth(date, calendarDate)
                      const isSelected = dueDate && isSameDay(date, dueDate)
                      
                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() => setDueDate(date)}
                          className={cn(
                            "p-1 text-center rounded text-xs transition-all",
                            isCurrentMonth ? "text-krushr-gray-dark" : "text-krushr-gray-light",
                            isCurrentDay && !isSelected && "bg-krushr-gray-border text-white",
                            isSelected && "bg-krushr-primary text-white",
                            !isCurrentDay && !isSelected && "hover:bg-krushr-gray-bg-light"
                          )}
                        >
                          {format(date, 'd')}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Priority Selector - Now under calendar */}
                <PrioritySelector priority={priority} onChange={setPriority} />

                {/* Smart Suggestions */}
                {smartSuggestions.length > 0 && (
                  <div className="bg-krushr-info-50 border border-krushr-info rounded p-2">
                    <div className="flex items-start gap-2">
                      <span className="text-krushr-info text-sm">💡</span>
                      <div className="text-xs text-krushr-info space-y-0.5">
                        {smartSuggestions.map((suggestion, idx) => (
                          <div key={idx}>{suggestion}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
        
        {/* Compact Footer */}
        <div className="px-4 py-3 border-t border-krushr-gray-border bg-krushr-gray-bg-light">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-krushr-gray">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-krushr-gray-border rounded text-[10px] font-mono">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-krushr-gray-border rounded text-[10px] font-mono">Enter</kbd>
                <span>to save</span>
              </span>
              <span className="text-krushr-gray-light">•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-krushr-gray-border rounded text-[10px] font-mono">Esc</kbd>
                <span>to cancel</span>
              </span>
            </div>
            <div className="flex gap-2">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-medium text-krushr-secondary hover:text-krushr-secondary/80 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium border border-krushr-gray-border rounded hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading || uploadingFiles || !title.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-krushr-primary text-white rounded hover:bg-krushr-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isLoading || uploadingFiles ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {isEditMode ? 'Update' : 'Create'}
                  </>
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