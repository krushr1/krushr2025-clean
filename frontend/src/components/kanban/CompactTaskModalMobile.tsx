import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, ChevronLeft, ChevronRight, User, Tag, Paperclip, Upload, FileText, Clock, Plus, Loader2, ChevronDown } from 'lucide-react'
import { useOptimisticDelete } from '@/hooks/use-optimistic-delete'
import { RichTextEditor } from '../ui/rich-text-editor'
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

// Mobile-optimized Priority Selector
const MobilePrioritySelector = ({ priority, onChange }: { priority: Priority; onChange: (p: Priority) => void }) => {
  const priorities = [
    { value: Priority.LOW, label: 'Low', color: 'bg-krushr-priority-low' },
    { value: Priority.MEDIUM, label: 'Med', color: 'bg-krushr-priority-medium' },
    { value: Priority.HIGH, label: 'High', color: 'bg-krushr-priority-high' }
  ]
  
  return (
    <div className="bg-white border border-krushr-gray-border rounded-md p-2">
      <label className="text-[10px] font-medium text-krushr-gray block mb-1">Priority</label>
      <div className="flex items-center gap-1">
        {priorities.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              "relative w-6 h-6 rounded flex items-center justify-center transition-all",
              "after:absolute after:inset-[-4px] after:content-['']", // Larger touch area
              priority === p.value && "ring-2 ring-krushr-primary ring-offset-1"
            )}
            title={`${p.label} Priority`}
          >
            <div className={cn(
              "w-2 h-2 rounded-full transition-colors",
              priority === p.value ? p.color : "bg-krushr-gray-lighter"
            )} />
          </button>
        ))}
        <span className="text-[10px] text-krushr-gray capitalize ml-1">
          {priority.toLowerCase()}
        </span>
      </div>
    </div>
  )
}

export default function CompactTaskModalMobile({ 
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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false)

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
  const uploadMutation = trpc.uploadNew.uploadFiles.useMutation()

  // Detect if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

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

      // Handle file uploads
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
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setIsLoading(false)
      setUploadingFiles(false)
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

  // Quick date options
  const quickDates = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d })() },
    { label: 'This Week', date: (() => { const d = new Date(); d.setDate(d.getDate() + (7 - d.getDay())); return d })() },
    { label: 'Next Week', date: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d })() },
    { label: 'Next Month', date: (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d })() }
  ]

  // Reset form when modal opens/closes
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
      setPendingFiles([])
      setShowAdvancedOptions(false)
    }
  }, [open, isEditMode, task])
  
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
      
      if (e.key === 'Escape') {
        onClose()
      }
      
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
  }, [open, onClose, title, isLoading, uploadingFiles])

  // Adjust viewport for mobile keyboard
  useEffect(() => {
    if (open && isMobile) {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1')
      }
    }
  }, [open, isMobile])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Modal Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Mobile-Optimized Modal Container */}
      <div className={cn(
        "relative bg-white rounded-lg overflow-hidden flex flex-col shadow-lg border border-krushr-gray-border",
        // Mobile: Full height with safe areas
        "w-[calc(100%-16px)] h-[calc(100vh-32px)]",
        // Desktop: Standard modal sizing
        "sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[90vh]",
        "mx-2 sm:mx-4"
      )}>
        {/* Compact Header */}
        <div className="px-3 py-2 sm:py-3 border-b border-krushr-gray-border bg-gradient-to-r from-krushr-gray-bg-light to-white">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="flex-1 mr-3 text-base sm:text-lg font-semibold border-0 px-0 py-0 focus:outline-none focus:ring-0 bg-transparent placeholder:text-krushr-gray-light"
              placeholder={isEditMode ? 'Edit task title...' : 'What needs to be done?'}
            />
            <button 
              onClick={onClose}
              className="text-krushr-gray hover:text-krushr-gray-dark transition-colors p-2 -m-1 hover:bg-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content - Mobile Optimized */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Description - Compact on mobile */}
              <div>
                <label className="text-xs font-medium text-krushr-gray mb-1.5 block">Description</label>
                <div className="border border-krushr-gray-border rounded-md overflow-hidden">
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Add details..."
                    className={cn(
                      "min-h-[80px] sm:min-h-[150px] lg:min-h-[250px]",
                      "[&>div:last-child]:min-h-[40px] sm:[&>div:last-child]:min-h-[110px]",
                      "[&_.border-b]:border-krushr-gray-border"
                    )}
                    minimal={isMobile}
                  />
                </div>
              </div>

              {/* Mobile: Column Selection - Horizontal scroll */}
              <div className="sm:hidden">
                <label className="text-xs font-medium text-krushr-gray mb-1.5 block">Column</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {columns.map((column) => (
                    <button
                      key={column.id}
                      type="button"
                      onClick={() => setSelectedColumnId(column.id)}
                      className={cn(
                        "shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border transition-all",
                        selectedColumnId === column.id
                          ? "bg-krushr-primary text-white border-krushr-primary"
                          : "bg-white text-krushr-gray border-krushr-gray-border hover:border-krushr-gray"
                      )}
                    >
                      {column.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop: Column Grid */}
              <div className="hidden sm:block">
                <label className="text-xs font-medium text-krushr-gray mb-2 block">Column</label>
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                  {columns.map((column) => (
                    <button
                      key={column.id}
                      type="button"
                      onClick={() => setSelectedColumnId(column.id)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md border transition-all",
                        selectedColumnId === column.id
                          ? "bg-krushr-primary text-white border-krushr-primary"
                          : "bg-white text-krushr-gray border-krushr-gray-border hover:border-krushr-gray"
                      )}
                    >
                      {column.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date Section */}
              <div>
                {/* Due Date Display */}
                {dueDate && (
                  <div className="p-2 sm:p-3 bg-krushr-info-50 border border-krushr-info rounded-md mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-krushr-info" />
                        <span className="text-xs sm:text-sm font-medium text-krushr-gray-dark">
                          {format(dueDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDueDate(null)}
                        className="text-krushr-gray hover:text-krushr-secondary p-1 -m-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Date Buttons - Horizontal scroll on mobile */}
                <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 mb-3">
                  {quickDates.map((quick) => (
                    <button
                      key={quick.label}
                      type="button"
                      onClick={() => setDueDate(quick.date)}
                      className={cn(
                        "shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border transition-all",
                        dueDate && isSameDay(dueDate, quick.date)
                          ? "bg-krushr-info-50 text-krushr-info border-krushr-info"
                          : "bg-white text-krushr-gray border-krushr-gray-border hover:border-krushr-info"
                      )}
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>

                {/* Compact Calendar Widget */}
                <div className="bg-white border border-krushr-gray-border rounded-md p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <button
                      type="button"
                      onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                      className="p-0.5 sm:p-1 hover:bg-krushr-gray-bg-light rounded touch-target-expand relative"
                    >
                      <ChevronLeft className="w-3 h-3 text-krushr-gray" />
                    </button>
                    <span className="text-[11px] sm:text-xs font-semibold text-krushr-gray-dark">
                      {format(calendarDate, 'MMM yyyy')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                      className="p-0.5 sm:p-1 hover:bg-krushr-gray-bg-light rounded touch-target-expand relative"
                    >
                      <ChevronRight className="w-3 h-3 text-krushr-gray" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={`${day}-${index}`} className="text-center text-krushr-gray p-0.5 text-[9px] sm:text-[10px] font-medium">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((date, index) => {
                      if (!date) {
                        return <div key={index} className="p-0.5 sm:p-1" />
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
                            "relative p-0.5 sm:p-1 text-center rounded text-[10px] sm:text-xs transition-all",
                            // Larger touch area
                            "after:absolute after:inset-[-4px] after:content-['']",
                            // Visual styles
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
              </div>

              {/* Essential Controls - Compact Grid on Mobile */}
              <div className="grid grid-cols-2 gap-2">
                {/* Priority Selector */}
                <MobilePrioritySelector priority={priority} onChange={setPriority} />

                {/* Assignee - Compact */}
                <div className="bg-white border border-krushr-gray-border rounded-md p-2">
                  <label className="text-[10px] font-medium text-krushr-gray block mb-1">Assignee</label>
                  {!assigneeId ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (workspaceUsers && workspaceUsers.length === 1) {
                          setAssigneeId(workspaceUsers[0].id)
                        } else {
                          setShowAssigneeMenu(!showAssigneeMenu)
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1 py-1 text-xs text-krushr-gray hover:text-krushr-primary"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-krushr-primary rounded-full flex items-center justify-center text-white text-[10px] font-medium shrink-0">
                        {workspaceUsers?.find(u => u.id === assigneeId)?.name?.[0] || '?'}
                      </div>
                      <span className="text-[10px] truncate flex-1">
                        {workspaceUsers?.find(u => u.id === assigneeId)?.name?.split(' ')[0] || 'User'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAssigneeId('')}
                        className="text-krushr-gray hover:text-krushr-secondary p-0.5 shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {showAssigneeMenu && workspaceUsers && workspaceUsers.length > 1 && !assigneeId && (
                    <div className="absolute mt-1 bg-white border border-krushr-gray-border rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                      {workspaceUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setAssigneeId(user.id)
                            setShowAssigneeMenu(false)
                          }}
                          className="block w-full px-3 py-1.5 text-xs text-left hover:bg-krushr-gray-bg"
                        >
                          {user.name || user.email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Options - Collapsible on Mobile */}
              <details className="border border-krushr-gray-border rounded-md">
                <summary 
                  className="px-3 py-2 text-xs font-medium text-krushr-gray cursor-pointer flex items-center justify-between"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowAdvancedOptions(!showAdvancedOptions)
                  }}
                >
                  <span>Advanced Options</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    showAdvancedOptions && "rotate-180"
                  )} />
                </summary>
                {showAdvancedOptions && (
                  <div className="p-3 space-y-3 border-t border-krushr-gray-border">
                    {/* Tags */}
                    <div>
                      <FloatingInput
                        type="text"
                        label="Tags (comma separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full text-xs"
                      />
                      {tags && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {tags.split(',').map((tag, idx) => tag.trim() && (
                            <span key={idx} className="text-[10px] bg-krushr-gray-bg px-1.5 py-0.5 rounded">
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Attachments */}
                    <div>
                      <label className="text-xs font-medium text-krushr-gray mb-1 block">Attachments</label>
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="w-full px-3 py-2 text-xs border border-dashed border-krushr-gray-border rounded hover:border-krushr-primary hover:bg-krushr-gray-bg-light transition-colors"
                      >
                        <Upload className="w-3 h-3 inline mr-1" />
                        Add files
                      </button>
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
                      {pendingFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {pendingFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-1 bg-krushr-gray-bg-light rounded text-xs">
                              <span className="truncate text-[10px]">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removePendingFile(index)}
                                className="text-krushr-gray hover:text-krushr-secondary p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </details>
            </div>
          </div>
        </form>
        
        {/* Sticky Mobile Footer */}
        <div className="sticky bottom-0 px-3 py-2 sm:py-3 border-t border-krushr-gray-border bg-white safe-area-pb">
          <div className="flex gap-2">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-xs text-krushr-secondary hover:text-krushr-secondary/80 disabled:opacity-50"
              >
                Delete
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-xs font-medium border border-krushr-gray-border rounded-md hover:bg-krushr-gray-bg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || uploadingFiles || !title.trim()}
              className="flex-1 px-3 py-2 text-xs font-medium bg-krushr-primary text-white rounded-md hover:bg-krushr-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              {isLoading || uploadingFiles ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update' : 'Create'}</span>
              )}
            </button>
          </div>
          {/* Keyboard hints - hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-krushr-gray mt-2">
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
        </div>
      </div>
    </div>,
    document.body
  )
}

// Add these styles to your global CSS
const globalStyles = `
  /* Hide scrollbar but keep functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Safe area padding for iOS */
  .safe-area-pb {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }

  /* Larger touch targets while keeping visual size */
  .touch-target-expand::after {
    content: '';
    position: absolute;
    inset: -8px;
  }
`