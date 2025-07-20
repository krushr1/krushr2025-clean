import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, User, Tag, ChevronLeft, ChevronRight, Paperclip, Upload, File, FileText, FileImage, FileVideo } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus } from '../../types/enums'
import { RichTextEditor } from '../ui/rich-text-editor'
import { AttachmentUpload } from '../common/AttachmentUpload'

interface CompactTaskModalProps {
  open: boolean
  onClose: () => void
  task?: any
  kanbanColumnId?: string
  workspaceId: string
  projectId?: string
  onSuccess?: () => void
}

export default function CompactTaskModal({
  open,
  onClose,
  task,
  kanbanColumnId,
  workspaceId,
  projectId,
  onSuccess
}: CompactTaskModalProps) {
  const isEditMode = !!task

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [assigneeId, setAssigneeId] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [tags, setTags] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { data: workspaceUsers } = trpc.user.getWorkspaceUsers.useQuery({ workspaceId })
  
  const createTaskMutation = trpc.task.create.useMutation()
  const updateTaskMutation = trpc.task.update.useMutation()
  const deleteTaskMutation = trpc.task.delete.useMutation()
  const uploadTaskFile = trpc.upload.uploadTaskFile.useMutation()

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || Priority.MEDIUM)
      setStatus(task.status || TaskStatus.TODO)
      setDueDate(task.dueDate ? new Date(task.dueDate) : null)
      setAssigneeId(task.assigneeId || '')
      setEstimatedHours(task.estimatedHours?.toString() || '')
      setTags(task.tags?.join(', ') || '')
    } else {
      setTitle('')
      setDescription('')
      setPriority(Priority.MEDIUM)
      setStatus(TaskStatus.TODO)
      setDueDate(null)
      setAssigneeId('')
      setEstimatedHours('')
      setTags('')
      setPendingFiles([])
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        assigneeId: assigneeId || undefined,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        workspaceId,
        projectId: projectId || undefined,
        kanbanColumnId: selectedColumnId || kanbanColumnId || undefined
      }

      let createdTask
      if (isEditMode) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          ...taskData
        })
        createdTask = task
      } else {
        createdTask = await createTaskMutation.mutateAsync(taskData)
      }

      if (pendingFiles.length > 0 && createdTask?.id) {
        setUploadingFiles(true)
        for (const file of pendingFiles) {
          try {
            const arrayBuffer = await fileToArrayBuffer(file)
            const buffer = Array.from(new Uint8Array(arrayBuffer))
            
            await uploadTaskFile.mutateAsync({
              taskId: createdTask.id,
              file: {
                filename: file.name,
                mimetype: file.type,
                size: file.size,
                buffer
              }
            })
          } catch (uploadError) {
            console.error('Error uploading file:', file.name, uploadError)
          }
        }
        setUploadingFiles(false)
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setIsLoading(false)
      setUploadingFiles(false)
    }
  }

  const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'))
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileSelect = (files: File[]) => {
    setPendingFiles(prev => [...prev, ...files])
  }

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDelete = async () => {
    if (!task?.id) return
    
    setIsLoading(true)
    try {
      await deleteTaskMutation.mutateAsync({ id: task.id })
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateCalendarDays = () => {
    const start = startOfMonth(calendarDate)
    const end = endOfMonth(calendarDate)
    const days = eachDayOfInterval({ start, end })
    const startDay = getDay(start)
    
    const emptyDays = Array(startDay).fill(null)
    
    return [...emptyDays, ...days]
  }

  const handleDateSelect = (date: Date) => {
    setDueDate(date)
  }

  const setQuickDate = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setDueDate(date)
  }

  useEffect(() => {
    if (!isEditMode && kanbanColumnId && !task) {
      setSelectedColumnId(kanbanColumnId)
      
      const columnIdLower = kanbanColumnId.toLowerCase()
      
      if (columnIdLower.includes('urgent') || columnIdLower.includes('critical')) {
        setPriority(Priority.URGENT)
      } else if (columnIdLower.includes('high') || columnIdLower.includes('important')) {
        setPriority(Priority.HIGH)
      }
      
      if (columnIdLower.includes('progress') || columnIdLower.includes('doing') || columnIdLower.includes('active')) {
        setStatus(TaskStatus.IN_PROGRESS)
      } else if (columnIdLower.includes('review') || columnIdLower.includes('testing') || columnIdLower.includes('qa')) {
        setStatus(TaskStatus.IN_REVIEW)
      } else if (columnIdLower.includes('done') || columnIdLower.includes('complete') || columnIdLower.includes('finished')) {
        setStatus(TaskStatus.DONE)
      } else if (columnIdLower.includes('cancelled') || columnIdLower.includes('blocked') || columnIdLower.includes('abandoned')) {
        setStatus(TaskStatus.CANCELLED)
      } else {
        // Default to TODO for unknown columns
        setStatus(TaskStatus.TODO)
      }
    }
  }, [kanbanColumnId, isEditMode, task])


  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Modal Overlay - Brandkit Pattern */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Container - Smart Responsive */}
      <div className="relative w-full max-w-5xl mx-4 h-[90vh] bg-white rounded-xl border border-krushr-gray-border shadow-krushr-modal overflow-hidden flex flex-col">
        {/* Header - Brandkit Panel Header Pattern */}
        <div className="flex items-center justify-between p-4 border-b border-krushr-gray-border bg-krushr-gray-bg-light rounded-t-xl">
          <h3 className="text-xl font-semibold text-krushr-gray-dark font-manrope">
            {isEditMode ? 'Edit Task' : 'Create Task'}
          </h3>
          <button 
            onClick={onClose}
            className="w-6 h-6 rounded text-krushr-gray hover:text-krushr-gray-dark hover:bg-krushr-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content - Full Height Utilization */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 p-6 space-y-4">
            {/* Title Field - Brandkit Floating Label */}
            <div className="relative">
              <input 
                type="text" 
                id="floating_title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block px-2.5 pb-2.5 pt-4 w-full text-base text-krushr-gray-dark bg-transparent rounded-lg border border-krushr-gray-border appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary/20 focus:border-krushr-primary transition-all duration-200 peer font-manrope"
                placeholder=" "
                required
                autoFocus
              />
              <label 
                htmlFor="floating_title" 
                className="absolute text-sm text-krushr-gray duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-manrope"
              >
                Task Title *
              </label>
            </div>
            
            {/* Description Field - Shorter with Dynamic Growth */}
            <div>
              <label className="block text-base font-medium text-krushr-gray-dark mb-2 font-manrope">
                Description
              </label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Add task description with rich formatting..."
                className="min-h-[60px] max-h-[120px] overflow-y-auto"
                minimal={!description}
                editable={true}
              />
            </div>
            
            {/* Responsive Layout with Visual Grouping */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
              {/* Priority & Status Section */}
              <div className="bg-krushr-gray-bg-light p-4 rounded-lg space-y-4 border border-krushr-gray-border"
                   role="group" aria-labelledby="priority-status-section">
                <h3 id="priority-status-section" className="sr-only">Priority and Status</h3>
                {/* Priority Badges */}
                <div>
                  <label className="block text-base font-medium text-krushr-gray-dark mb-2 font-manrope">
                    Priority
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setPriority(Priority.URGENT)}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${priority === Priority.URGENT
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-red-50'
                        }
                      `}
                    >
                      Urgent
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority(Priority.HIGH)}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${priority === Priority.HIGH
                          ? 'bg-krushr-secondary text-white border-krushr-secondary'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-secondary/10'
                        }
                      `}
                    >
                      High
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setPriority(Priority.MEDIUM)}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${priority === Priority.MEDIUM
                          ? 'bg-krushr-warning text-white border-krushr-warning'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-warning/10'
                        }
                      `}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority(Priority.LOW)}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${priority === Priority.LOW
                          ? 'bg-krushr-success text-white border-krushr-success'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-success/10'
                        }
                      `}
                    >
                      Low
                    </button>
                  </div>
                </div>
                
                {/* Column Badges */}
                <div>
                  <label className="block text-base font-medium text-krushr-gray-dark mb-2 font-manrope">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2 max-w-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStatus(TaskStatus.TODO)
                        setSelectedColumnId('todo')
                      }}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${status === TaskStatus.TODO
                          ? 'bg-krushr-gray text-white border-krushr-gray'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-gray/10'
                        }
                      `}
                    >
                      Todo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus(TaskStatus.IN_PROGRESS)
                        setSelectedColumnId('progress')
                      }}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${status === TaskStatus.IN_PROGRESS
                          ? 'bg-krushr-primary text-white border-krushr-primary'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-primary/10'
                        }
                      `}
                    >
                      Doing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus(TaskStatus.IN_REVIEW)
                        setSelectedColumnId('review')
                      }}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${status === TaskStatus.IN_REVIEW
                          ? 'bg-krushr-warning text-white border-krushr-warning'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-warning/10'
                        }
                      `}
                    >
                      Review
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-w-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStatus(TaskStatus.DONE)
                        setSelectedColumnId('done')
                      }}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${status === TaskStatus.DONE
                          ? 'bg-krushr-success text-white border-krushr-success'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-success/10'
                        }
                      `}
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus(TaskStatus.CANCELLED)
                        setSelectedColumnId('cancelled')
                      }}
                      className={`
                        px-3 py-3 text-sm font-medium rounded border transition-all duration-200 font-manrope min-h-[44px] min-w-[80px]
                        ${status === TaskStatus.CANCELLED
                          ? 'bg-krushr-secondary text-white border-krushr-secondary'
                          : 'border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-secondary/10'
                        }
                      `}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
                
                {/* Assignment */}
                <div>
                  <label className="block text-base font-medium text-krushr-gray-dark mb-2 font-manrope">
                    <User className="w-4 h-4 inline mr-1" />
                    Assign To
                  </label>
                  <div className="flex gap-2 flex-wrap max-w-md">
                    <button
                      type="button"
                      onClick={() => setAssigneeId('')}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium font-manrope transition-all duration-200
                        ${assigneeId === ''
                          ? 'bg-krushr-primary/10 border border-krushr-primary text-krushr-primary'
                          : 'border border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-primary/5'
                        }
                      `}
                    >
                      <div className="w-5 h-5 rounded-full bg-krushr-gray-400 flex items-center justify-center text-white text-xs">
                        —
                      </div>
                      <span>Unassigned</span>
                    </button>
                    {workspaceUsers?.slice(0, 2).map((user) => {
                      const initials = (user.name || user.email).slice(0, 2).toUpperCase()
                      const isSelected = assigneeId === user.id
                      const displayName = user.name || user.email.split('@')[0]
                      
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setAssigneeId(user.id)}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium font-manrope transition-all duration-200
                            ${isSelected
                              ? 'bg-krushr-primary/10 border border-krushr-primary text-krushr-primary'
                              : 'border border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-primary/5'
                            }
                          `}
                          title={user.name || user.email}
                        >
                          <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {initials}
                          </div>
                          <span>{displayName}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Due Date Section */}
              <div className="bg-krushr-gray-bg-light p-4 rounded-lg border border-krushr-gray-border"
                   role="group" aria-labelledby="due-date-section">
                <h3 id="due-date-section" className="sr-only">Due Date</h3>
                <label className="block text-base font-medium text-krushr-gray-dark mb-2 font-manrope">
                  Due Date
                </label>
                
                {/* Constrained Calendar Widget */}
                <div className="bg-white border border-krushr-gray-200 rounded-lg p-3 shadow-sm w-full max-w-xs">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-krushr-gray-100">
                    <button 
                      type="button"
                      onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                      className="w-5 h-5 flex items-center justify-center rounded text-krushr-gray-400 hover:text-krushr-primary hover:bg-krushr-gray-50 transition-all duration-200"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <h4 className="text-xs font-medium text-krushr-gray-dark font-manrope">
                      {format(calendarDate, 'MMM yyyy')}
                    </h4>
                    <button 
                      type="button"
                      onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                      className="w-5 h-5 flex items-center justify-center rounded text-krushr-gray-400 hover:text-krushr-primary hover:bg-krushr-gray-50 transition-all duration-200"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Selected Date Display */}
                  {dueDate && (
                    <div className="mb-2 p-1 bg-krushr-primary-50 border border-krushr-primary-200 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-krushr-primary" />
                          <span className="text-xs font-medium text-krushr-primary font-manrope">
                            {format(dueDate, 'MMM dd')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDueDate(null)}
                          className="text-krushr-primary hover:text-krushr-primary-700 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0.5 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-xs font-medium text-krushr-gray p-1 text-center font-manrope">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((day, i) => (
                      <div key={i} className="text-xs p-0.5">
                        {day ? (
                          <button
                            type="button"
                            onClick={() => handleDateSelect(day)}
                            className={`w-full h-8 rounded font-medium transition-all duration-200 font-manrope ${
                              isSameDay(day, dueDate || new Date('1900-01-01')) 
                                ? 'bg-krushr-primary text-white shadow-sm ring-1 ring-krushr-primary ring-offset-1'
                                : isToday(day)
                                ? 'bg-krushr-primary-100 text-krushr-primary border border-krushr-primary-200'
                                : 'text-krushr-gray-700 hover:bg-krushr-gray-100'
                            }`}
                          >
                            {format(day, 'd')}
                          </button>
                        ) : (
                          <div className="w-full h-8"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-1 pt-1 border-t border-krushr-gray-100">
                    <button
                      type="button"
                      onClick={() => setDueDate(new Date())}
                      className="flex-1 px-1 py-1 text-sm bg-krushr-gray-100 text-krushr-gray-700 rounded hover:bg-krushr-primary hover:text-white transition-all duration-200 font-manrope font-medium"
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
                      className="flex-1 px-1 py-1 text-sm bg-krushr-gray-100 text-krushr-gray-700 rounded hover:bg-krushr-primary hover:text-white transition-all duration-200 font-manrope font-medium"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextWeek = new Date()
                        nextWeek.setDate(nextWeek.getDate() + 7)
                        setDueDate(nextWeek)
                      }}
                      className="flex-1 px-1 py-1 text-sm bg-krushr-gray-100 text-krushr-gray-700 rounded hover:bg-krushr-primary hover:text-white transition-all duration-200 font-manrope font-medium"
                    >
                      +7
                    </button>
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate(null)}
                        className="px-1 py-1 text-sm bg-krushr-danger-100 text-krushr-danger-600 rounded hover:bg-krushr-danger hover:text-white transition-all duration-200 font-manrope font-medium"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Show/Hide Advanced Options */}
              <div className="lg:col-span-2 xl:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-krushr-primary hover:text-krushr-primary/80 font-manrope mb-4"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Advanced Options</span>
                </button>
                
                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0">
                {/* Tags - Moved here for better space usage */}
                <div className="relative">
                  <input 
                    type="text" 
                    id="floating_tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-krushr-gray-dark bg-transparent rounded-lg border border-krushr-gray-border appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary/20 focus:border-krushr-primary transition-all duration-200 peer font-manrope"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="floating_tags" 
                    className="absolute text-sm text-krushr-gray duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-manrope"
                  >
                    Tags
                  </label>
                  <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-krushr-gray pointer-events-none" />
                </div>
                
                {/* Estimated Hours */}
                <div className="relative">
                  <input 
                    type="number" 
                    id="floating_hours"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-krushr-gray-dark bg-transparent rounded-lg border border-krushr-gray-border appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary/20 focus:border-krushr-primary transition-all duration-200 peer font-manrope"
                    placeholder=" "
                    min="0"
                    step="0.5"
                  />
                  <label 
                    htmlFor="floating_hours" 
                    className="absolute text-sm text-krushr-gray duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-manrope"
                  >
                    Estimated Hours
                  </label>
                </div>
              </div>
              
              {/* Attachments Column */}
              <div className="xl:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </label>
                  
                  {task?.id ? (
                    <AttachmentUpload
                      type="task"
                      targetId={task.id}
                      onUploadComplete={(attachments) => {
                        console.log('Files uploaded:', attachments)
                      }}
                      className="w-full"
                    />
                  ) : (
                    <>
                      {/* Compact File Drop Zone */}
                      <div 
                        className="border-2 border-dashed border-krushr-gray-border rounded-lg p-3 text-center hover:border-krushr-primary transition-colors cursor-pointer"
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
                        <Upload className="w-5 h-5 mx-auto text-krushr-gray mb-1 block" />
                        <p className="text-sm text-krushr-gray font-manrope">
                          <span className="font-medium text-krushr-primary">Upload</span> or drag files
                        </p>
                        <p className="text-xs text-krushr-gray mt-1">Max: 15MB</p>
                        <input
                          id="file-input"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const files = Array.from(e.target.files)
                              handleFileSelect(files)
                            }
                          }}
                        />
                      </div>
                      
                      {/* Compact Pending Files List */}
                      {pendingFiles.length > 0 && (
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {pendingFiles.map((file, index) => {
                            const fileExt = file.name.split('.').pop()?.toLowerCase()
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExt || '')
                            const isDoc = ['pdf', 'doc', 'docx', 'txt', 'md'].includes(fileExt || '')
                            
                            const iconColor = isImage ? 'text-krushr-success' : isDoc ? 'text-krushr-info' : 'text-krushr-gray'
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-krushr-gray-bg rounded text-xs">
                                <div className="flex items-center gap-1 min-w-0">
                                  <FileText className={`w-3 h-3 ${iconColor} flex-shrink-0`} />
                                  <span className="text-krushr-gray-dark font-manrope truncate">{file.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePendingFile(index)}
                                  className="text-krushr-secondary hover:text-red-600 p-0.5 transition-colors flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
                    </div>
                  )}
                )}
              </div>
            </div>
            </div>
            
            {/* Footer - Sticky at Bottom */}
            <div className="flex-shrink-0 border-t border-krushr-gray-border bg-krushr-gray-bg-light p-4">
              <div className="flex justify-between items-center">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-krushr-secondary border border-krushr-secondary rounded-lg hover:bg-krushr-secondary-50 disabled:opacity-50 transition-all duration-200 font-manrope"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-sm text-krushr-gray-700 border border-krushr-gray-border rounded-lg hover:bg-krushr-gray-100 transition-all duration-200 font-manrope"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading || uploadingFiles || !title.trim()}
                    className="inline-flex items-center space-x-2 px-6 py-2 bg-krushr-primary text-white text-sm rounded-lg hover:bg-krushr-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-krushr-button-dark font-manrope"
                  >
                    {isLoading || uploadingFiles ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{uploadingFiles ? 'Uploading...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <span>{isEditMode ? 'Update Task' : 'Create Task'}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}