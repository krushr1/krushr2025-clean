import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, ChevronLeft, ChevronRight, User, Tag, Paperclip, Upload, FileText } from 'lucide-react'
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
}

export default function CompactTaskModal({ 
  open, 
  onClose, 
  onTaskCreated, 
  workspaceId, 
  kanbanColumnId,
  task,
  isEditMode = false
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !workspaceId) return

    setIsLoading(true)
    
    try {
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

      onTaskCreated?.()
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
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
        setPriority(task.priority || Priority.MEDIUM)
        setStatus(task.status || TaskStatus.TODO)
        setDueDate(task.dueDate ? new Date(task.dueDate) : null)
        setAssigneeId(task.assigneeId || '')
        setTags(task.tags?.join(', ') || '')
      } else {
        setTitle('')
        setDescription('')
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
      setPendingFiles([])
    }
  }, [open, isEditMode, task, kanbanColumnId])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose])

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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-krushr-gray-200">
          <h2 className="text-xl font-semibold text-krushr-gray-dark font-manrope">
            Task Title
          </h2>
          <button 
            onClick={onClose}
            className="text-krushr-gray-400 hover:text-krushr-gray-600 transition-colors p-2 hover:bg-krushr-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
              {/* Main Content */}
              <div className="space-y-4">
                {/* Task Title - Floating Label */}
                <FloatingInput
                  type="text"
                  label="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                
                {/* Description - Floating Label */}
                <div className="relative">
                  <textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-krushr-gray-dark bg-transparent rounded-lg border border-krushr-gray-border appearance-none focus:outline-none focus:ring-0 focus:border-krushr-primary peer resize-none"
                    placeholder=" "
                    rows={6}
                  />
                  <label 
                    htmlFor="task-description"
                    className="absolute text-sm text-krushr-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-[20px] peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                  >
                    Description
                  </label>
                </div>
                
                {/* Tags - Floating Label */}
                <FloatingInput
                  type="text"
                  label="Tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-krushr-gray-600 mb-2">
                    Attachments
                  </label>
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
                        className="border-2 border-dashed border-krushr-gray-200 rounded-lg p-6 text-center hover:border-krushr-primary transition-colors cursor-pointer"
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
                        <Upload className="w-8 h-8 mx-auto text-krushr-gray-400 mb-2" />
                        <p className="text-sm text-krushr-gray-600">
                          <span className="font-medium text-krushr-primary">Upload files</span> or drag and drop
                        </p>
                        <p className="text-xs text-krushr-gray-500 mt-1">Max 15MB per file</p>
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
                            <div key={index} className="flex items-center justify-between p-3 bg-krushr-gray-50 rounded-lg">
                              <div className="flex items-center gap-3 min-w-0">
                                <FileText className="w-4 h-4 text-krushr-gray-500 flex-shrink-0" />
                                <span className="text-sm text-krushr-gray-700 truncate">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePendingFile(index)}
                                className="text-krushr-gray-400 hover:text-krushr-secondary transition-colors"
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
              
              {/* Right Column - Calendar, Priority, and Status */}
              <div className="lg:border-l lg:border-krushr-gray-100 lg:pl-6 space-y-6">
                {/* Calendar Section */}
                <div className="bg-krushr-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-krushr-gray-700 mb-4">Due Date</h3>
                  
                  {/* Selected Date Display */}
                  {dueDate && (
                    <div className="mb-4 p-3 bg-krushr-primary-100 border border-krushr-primary-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-krushr-primary" />
                          <span className="text-sm font-medium text-krushr-primary-700">
                            {format(dueDate, 'MMMM d, yyyy')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDueDate(null)}
                          className="text-krushr-primary-600 hover:text-krushr-primary-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Calendar Widget */}
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        type="button"
                        onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                        className="p-1 hover:bg-krushr-gray-100 rounded transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-krushr-gray-600" />
                      </button>
                      <h4 className="text-sm font-medium text-krushr-gray-700">
                        {format(calendarDate, 'MMMM yyyy')}
                      </h4>
                      <button 
                        type="button"
                        onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                        className="p-1 hover:bg-krushr-gray-100 rounded transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-krushr-gray-600" />
                      </button>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-3">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-xs font-medium text-krushr-gray-500 text-center py-1">
                          {day}
                        </div>
                      ))}
                      {generateCalendarDays().map((day, i) => (
                        <div key={i} className="aspect-square">
                          {day ? (
                            <button
                              type="button"
                              onClick={() => handleDateSelect(day)}
                              className={cn(
                                "w-full h-full text-xs rounded transition-all",
                                isSameDay(day, dueDate || new Date('1900-01-01')) 
                                  ? "bg-krushr-primary text-white font-medium"
                                  : isToday(day)
                                  ? "bg-krushr-primary-100 text-krushr-primary-700 font-medium"
                                  : "text-krushr-gray-700 hover:bg-krushr-gray-100"
                              )}
                            >
                              {format(day, 'd')}
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-3 border-t border-krushr-gray-100">
                      <button
                        type="button"
                        onClick={() => setDueDate(new Date())}
                        className="flex-1 px-3 py-1.5 text-xs bg-krushr-gray-100 text-krushr-gray-700 rounded hover:bg-krushr-gray-200 transition-colors font-medium"
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
                        className="flex-1 px-3 py-1.5 text-xs bg-krushr-gray-100 text-krushr-gray-700 rounded hover:bg-krushr-gray-200 transition-colors font-medium"
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
                        className="flex-1 px-3 py-1.5 text-xs bg-krushr-gray-100 text-krushr-gray-700 rounded hover:bg-krushr-gray-200 transition-colors font-medium"
                      >
                        Next Week
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Priority Section */}
                <div>
                  <h3 className="text-sm font-medium text-krushr-gray-700 mb-3">Priority</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
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
                              "w-4 h-4 rounded-full transition-all",
                              isActive 
                                ? "bg-krushr-secondary shadow-sm" 
                                : "bg-krushr-gray-200 hover:bg-krushr-gray-300"
                            )}
                            title={`${level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'} Priority`}
                          />
                        )
                      })}
                    </div>
                    <span className="text-sm text-krushr-gray-600 capitalize">
                      {priority.toLowerCase()} priority
                    </span>
                  </div>
                </div>
                
                {/* Status Section */}
                <div>
                  <h3 className="text-sm font-medium text-krushr-gray-700 mb-3">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: TaskStatus.TODO, label: 'Todo', color: 'bg-krushr-gray-500' },
                      { value: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-krushr-primary' },
                      { value: TaskStatus.IN_REVIEW, label: 'Review', color: 'bg-krushr-warning' },
                      { value: TaskStatus.DONE, label: 'Done', color: 'bg-krushr-success' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStatus(option.value)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                          status === option.value
                            ? `${option.color} text-white`
                            : "bg-krushr-gray-100 text-krushr-gray-700 hover:bg-krushr-gray-200"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Assignee Section */}
                <div>
                  <h3 className="text-sm font-medium text-krushr-gray-700 mb-3">Assignee</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAssigneeId('')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-xs rounded-full transition-all",
                        assigneeId === ''
                          ? "bg-krushr-primary text-white"
                          : "bg-krushr-gray-100 text-krushr-gray-700 hover:bg-krushr-gray-200"
                      )}
                    >
                      <div className="w-4 h-4 rounded-full bg-krushr-gray-300" />
                      Unassigned
                    </button>
                    {workspaceUsers?.map((user) => {
                      const initials = (user.name || user.email).slice(0, 2).toUpperCase()
                      
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setAssigneeId(user.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-xs rounded-full transition-all",
                            assigneeId === user.id
                              ? "bg-krushr-primary text-white"
                              : "bg-krushr-gray-100 text-krushr-gray-700 hover:bg-krushr-gray-200"
                          )}
                        >
                          <div className="w-4 h-4 bg-gradient-to-br from-krushr-primary to-krushr-primary-600 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                            {initials}
                          </div>
                          {user.name || user.email.split('@')[0]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-krushr-gray-200 bg-krushr-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-krushr-secondary font-medium hover:bg-krushr-secondary-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Delete Task
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-sm text-krushr-gray-700 font-medium border border-krushr-gray-300 rounded-lg hover:bg-krushr-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || uploadingFiles || !title.trim()}
                  className="px-6 py-2 text-sm text-white font-medium bg-krushr-primary rounded-lg hover:bg-krushr-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(isLoading || uploadingFiles) && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {uploadingFiles ? 'Uploading...' : isLoading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
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