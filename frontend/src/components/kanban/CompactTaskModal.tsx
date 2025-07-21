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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !workspaceId) return

    setIsLoading(true)
    
    try {
      if (mode === 'calendar') {
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
      
      {/* Modal Container - Brandkit Compliant */}
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {/* Dark Gradient Hero Header - Enterprise Pricing Template Style */}
        <div 
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #143197 100%)',
            backgroundSize: '100% 100%',
            borderRadius: '30px 30px 0 0',
            padding: '40px 40px 20px'
          }}
        >
          {/* Background Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url('/images/Pricing-Shapes.svg')",
              backgroundPosition: '70%',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '900px'
            }}
          />
          <div className="relative">
            {/* Notice Badge */}
            <div className="mb-4">
              <div 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <span className="text-white opacity-80 mr-2">
                  {mode === 'calendar' ? '📅' : '✨'}
                </span>
                <span className="text-white font-medium">
                  {mode === 'calendar' ? 'Calendar Event' : 'Task Management'}
                </span>
                <span className="text-white opacity-70 ml-1">
                  - {isEditMode ? 'Edit' : 'Create new'}
                </span>
              </div>
            </div>

            {/* Main Title Input */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    placeholder={mode === 'calendar' ? 'Enter event title...' : 'Enter task title...'}
                    className="w-full text-2xl font-bold font-manrope bg-transparent border-none outline-none text-white placeholder-white/50 pb-2 border-b-2 border-white/20 focus:border-white/60 transition-all duration-300"
                  />
                  <div className="text-sm text-white/60 mt-1 font-medium">
                    {mode === 'calendar' ? 'Event title' : 'Task title'}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-white/60 hover:text-white transition-all duration-200 p-3 hover:bg-white/10 rounded-xl backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Info Row with Enhanced Styling */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                <User className="w-4 h-4" />
                <span className="font-medium">You</span>
              </div>
              {mode === 'calendar' && selectedDate && (
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-medium">{format(selectedDate, 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{isEditMode ? 'Editing' : 'Creating'}</span>
              </div>
              {mode === 'calendar' && (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-200 rounded-full px-3 py-1.5 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="font-medium text-xs uppercase tracking-wide">Calendar Event</span>
                </div>
              )}
            </div>
            {/* Floating Action Hint */}
            <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/70 border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">↵</kbd>
                  </div>
                  <span>to save</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="p-6 lg:p-8">
            {/* Intelligent Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
              
              {/* PRIMARY CONTENT - Left Column */}
              <div className="space-y-6">
                
                {/* Essential Details Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-krushr-primary rounded-full"></div>
                    Essential Details
                  </h3>
                  
                  {/* Description */}
                  <div className="relative mb-6">
                    <textarea
                      id="task-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-krushr-gray-dark bg-transparent rounded-lg border border-krushr-gray-border appearance-none focus:outline-none focus:ring-0 focus:border-krushr-primary peer resize-none"
                      placeholder=" "
                      rows={4}
                    />
                    <label 
                      htmlFor="task-description"
                      className="absolute text-sm text-krushr-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-[20px] peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                    >
                      Description
                    </label>
                  </div>

                  {/* Mode-Specific Primary Fields */}
                  {mode === 'calendar' ? (
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
                          className="rounded border-krushr-gray-border focus:ring-krushr-primary"
                        />
                        <label htmlFor="all-day" className="text-sm text-krushr-gray-700 font-medium">
                          All day event
                        </label>
                      </div>
                    </div>
                  ) : (
                    <FloatingInput
                      type="text"
                      label="Tags (comma separated)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  )}
                </div>

                {/* Attachments Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-600" />
                    Attachments
                  </h3>
                  
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
                        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-krushr-primary transition-colors cursor-pointer hover:bg-gray-50"
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
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
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
                        <div className="mt-4 space-y-2">
                          {pendingFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3 min-w-0">
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
              
              {/* SECONDARY CONTENT - Right Sidebar */}
              <div className="space-y-6">
                
                {/* Mode-Specific Configuration */}
                {mode === 'calendar' ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      Event Configuration
                    </h3>
                    
                    {/* Event Type */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['MEETING', 'TASK', 'REMINDER', 'EVENT', 'DEADLINE', 'MILESTONE'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setEventType(type)}
                            className={cn(
                              "px-3 py-2 text-xs font-medium rounded-lg transition-all text-center",
                              eventType === type
                                ? "bg-krushr-primary text-white shadow-sm"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Event Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
                      <div className="flex gap-3 justify-center">
                        {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEventColor(color)}
                            className={cn(
                              "w-10 h-10 rounded-xl transition-all border-2 relative",
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
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      Task Configuration
                    </h3>
                    
                    {/* Priority */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Priority Level</label>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {[1, 2, 3].map((level) => {
                            const isActive = (
                              (priority === Priority.LOW && level <= 1) ||
                              (priority === Priority.MEDIUM && level <= 2) ||
                              (priority === Priority.HIGH && level <= 3)
                            )
                            const targetPriority = level === 1 ? Priority.LOW : level === 2 ? Priority.MEDIUM : Priority.HIGH
                            
                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setPriority(targetPriority)}
                                className={cn(
                                  "w-6 h-6 rounded-full transition-all border-2",
                                  isActive 
                                    ? "bg-krushr-secondary border-krushr-secondary shadow-md scale-110" 
                                    : "bg-gray-200 border-gray-300 hover:bg-gray-300"
                                )}
                                title={`${level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'} Priority`}
                              />
                            )
                          })}
                        </div>
                        <span className="text-sm text-gray-600 font-medium capitalize">
                          {priority.toLowerCase()} priority
                        </span>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: TaskStatus.TODO, label: 'Todo', color: 'bg-gray-500' },
                          { value: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-500' },
                          { value: TaskStatus.IN_REVIEW, label: 'Review', color: 'bg-yellow-500' },
                          { value: TaskStatus.DONE, label: 'Done', color: 'bg-green-500' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setStatus(option.value)}
                            className={cn(
                              "px-3 py-2 text-xs font-medium rounded-lg transition-all relative overflow-hidden",
                              status === option.value
                                ? `${option.color} text-white shadow-sm`
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignment & Scheduling */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    {mode === 'calendar' ? 'Scheduling' : 'Assignment & Timing'}
                  </h3>
                  
                  {mode === 'task' && (
                    <>
                      {/* Assignee */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Assignee</label>
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
                            Unassigned
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
                    </>
                  )}

                  {/* Due Date Widget - Compact for tasks */}
                  {mode === 'task' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Due Date</label>
                      {dueDate ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-blue-600" />
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
                        <div className="grid grid-cols-3 gap-2">
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
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Footer */}
          <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="group px-5 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 border border-red-200 hover:border-red-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {mode === 'calendar' ? 'Delete Event' : 'Delete Task'}
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || uploadingFiles || !title.trim()}
                  className="group px-8 py-3 text-sm text-white font-semibold bg-gradient-to-r from-krushr-primary to-blue-600 rounded-xl hover:from-krushr-primary-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {(isLoading || uploadingFiles) && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{uploadingFiles ? 'Uploading...' : isLoading ? 'Saving...' : isEditMode ? (mode === 'calendar' ? 'Update Event' : 'Update Task') : (mode === 'calendar' ? 'Create Event' : 'Create Task')}</span>
                  {!isLoading && !uploadingFiles && (
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Progress indicator for form completion */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Form completion</span>
                <span>{Math.round((title.trim() ? 40 : 0) + (description.trim() ? 30 : 0) + (mode === 'calendar' ? (startTime && endTime ? 30 : 0) : (dueDate ? 30 : 0)))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-krushr-primary to-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.round((title.trim() ? 40 : 0) + (description.trim() ? 30 : 0) + (mode === 'calendar' ? (startTime && endTime ? 30 : 0) : (dueDate ? 30 : 0)))}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}