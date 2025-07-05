import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, ChevronDown, Plus, Hash, FileText, Trash2, Upload, Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus } from '../../types/enums'

interface BrandKitTaskModalProps {
  open: boolean
  onClose: () => void
  task?: any
  kanbanColumnId?: string
  workspaceId: string
  projectId?: string
  onSuccess?: () => void
}

export default function BrandKitTaskModal({
  open,
  onClose,
  task,
  kanbanColumnId,
  workspaceId,
  projectId,
  onSuccess
}: BrandKitTaskModalProps) {
  const isEditMode = !!task

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [assigneeId, setAssigneeId] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Queries
  const { data: workspaceUsers } = trpc.user.getWorkspaceUsers.useQuery({ workspaceId })
  
  // Mutations
  const createTaskMutation = trpc.task.create.useMutation()
  const updateTaskMutation = trpc.task.update.useMutation()
  const deleteTaskMutation = trpc.task.delete.useMutation()

  // Initialize form data
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || Priority.MEDIUM)
      setStatus(task.status || TaskStatus.TODO)
      setDueDate(task.dueDate ? new Date(task.dueDate) : null)
      setAssigneeId(task.assigneeId || '')
      setEstimatedHours(task.estimatedHours?.toString() || '')
      setTags(task.tags || [])
    } else {
      setTitle('')
      setDescription('')
      setPriority(Priority.MEDIUM)
      setStatus(TaskStatus.TODO)
      setDueDate(null)
      setAssigneeId('')
      setEstimatedHours('')
      setTags([])
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
        dueDate,
        assigneeId: assigneeId || null,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
        tags,
        workspaceId,
        projectId: projectId || null,
        kanbanColumnId: kanbanColumnId || null
      }

      if (isEditMode) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          ...taskData
        })
      } else {
        await createTaskMutation.mutateAsync(taskData)
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setIsLoading(false)
    }
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

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  if (!open) return null

  // Use React Portal to render modal at document body level, outside panel hierarchy
  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-6 animate-fade-in"
      style={{ position: 'fixed', zIndex: 999999 }}
    >
      {/* Transparent Backdrop - just for click handling */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Enhanced Modal - Properly Centered to Screen */}
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl animate-slide-up overflow-hidden"
        style={{
          boxShadow: '0px 15px 40px 5px rgba(136, 136, 136, 0.42)',
          zIndex: 999999,
          position: 'relative'
        }}
      >
        {/* Enhanced Header */}
        <div className="px-8 py-6 border-b border-krushr-gray-border bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-krushr-gray-dark font-manrope">
                {isEditMode ? 'Edit Task' : 'Create New Task'}
              </h3>
              <p className="text-sm text-krushr-gray-600 font-manrope">
                {isEditMode ? 'Update task details and settings' : 'Add a new task to your workflow'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-krushr-gray hover:text-krushr-gray-dark hover:bg-white p-2 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-8 py-8 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title - Full Width */}
            <div>
              <div className="relative">
                <input 
                  type="text" 
                  id="floating_title"
                  placeholder=" " 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block px-3 pb-2.5 pt-4 w-full text-sm text-krushr-gray-900 bg-transparent rounded-md border border-krushr-gray-border appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:border-krushr-primary peer transition-all duration-200 font-manrope"
                  required
                />
                <label 
                  htmlFor="floating_title" 
                  className="absolute text-sm text-krushr-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-manrope"
                >
                  Task Title *
                </label>
              </div>
            </div>
            
            {/* Description - Full Width */}
            <div>
              <div className="relative">
                <textarea 
                  id="floating_description"
                  rows={4} 
                  placeholder=" " 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block px-3 pb-2.5 pt-4 w-full text-sm text-krushr-gray-900 bg-transparent rounded-md border border-krushr-gray-border appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:border-krushr-primary peer resize-vertical transition-all duration-200 font-manrope"
                />
                <label 
                  htmlFor="floating_description" 
                  className="absolute text-sm text-krushr-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-manrope"
                >
                  Description
                </label>
              </div>
            </div>
            
            {/* Enhanced Task Properties Section */}
            <div className="bg-krushr-gray-bg-light p-6 rounded-xl border border-krushr-gray-border">
              <h4 className="text-sm font-semibold text-krushr-gray-dark mb-4 font-manrope flex items-center">
                <div className="w-2 h-2 bg-krushr-primary rounded-full mr-2"></div>
                Task Properties
              </h4>
              <div className="grid grid-cols-3 gap-6">
              {/* Priority - Button Group */}
              <div>
                <label className="block text-sm font-medium text-krushr-gray-dark mb-3 font-manrope">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority(Priority.LOW)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      priority === Priority.LOW
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                    }`}
                  >
                    Low
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority(Priority.MEDIUM)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      priority === Priority.MEDIUM
                        ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                        : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                    }`}
                  >
                    Med
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority(Priority.HIGH)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      priority === Priority.HIGH
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                    }`}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority(Priority.CRITICAL)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      priority === Priority.CRITICAL
                        ? 'bg-red-200 text-red-800 border-2 border-red-400'
                        : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                    }`}
                  >
                    Critical
                  </button>
                </div>
              </div>
              
              {/* Status - Button Group */}
              <div>
                <label className="block text-sm font-medium text-krushr-gray-dark mb-3 font-manrope">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(TaskStatus.TODO)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      status === TaskStatus.TODO
                        ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                    }`}
                  >
                    To Do
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(TaskStatus.IN_PROGRESS)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      status === TaskStatus.IN_PROGRESS
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                    }`}
                  >
                    Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('REVIEW' as TaskStatus)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      status === 'REVIEW'
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                    }`}
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(TaskStatus.COMPLETED)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      status === TaskStatus.COMPLETED
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                    }`}
                  >
                    Done
                  </button>
                </div>
              </div>
              
              {/* Estimated Hours */}
              <div>
                <div className="relative">
                  <input 
                    type="number" 
                    id="floating_hours"
                    step="0.5" 
                    placeholder=" "
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="block px-3 pb-2.5 pt-4 pl-10 w-full text-sm text-krushr-gray-900 bg-white rounded-md border border-krushr-gray-border appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:border-krushr-primary peer transition-all duration-200 font-manrope"
                  />
                  <label 
                    htmlFor="floating_hours" 
                    className="absolute text-sm text-krushr-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-9 font-manrope"
                  >
                    Hours
                  </label>
                  <Clock className="absolute left-3 top-4 w-4 h-4 text-krushr-gray pointer-events-none" />
                </div>
              </div>
            </div>
            </div>
            
            {/* Enhanced Assignment & Timeline Section */}
            <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-200">
              <h4 className="text-sm font-semibold text-krushr-gray-dark mb-4 font-manrope flex items-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                Assignment & Timeline
              </h4>
              <div className="grid grid-cols-2 gap-6">
              {/* Due Date - Inline Calendar Picker */}
              <div>
                <label className="block text-sm font-medium text-krushr-gray-dark mb-3 font-manrope">
                  Due Date
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="date"
                      value={dueDate ? format(dueDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                      className="flex-1 px-3 py-2 text-sm text-krushr-gray-900 bg-white rounded-md border border-krushr-gray-border focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:border-krushr-primary transition-all duration-200 font-manrope"
                    />
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate(null)}
                        className="px-2 py-2 text-xs text-krushr-gray-500 hover:text-krushr-secondary transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDueDate(new Date())}
                      className="px-3 py-1 text-xs bg-krushr-primary text-white rounded-md hover:bg-krushr-primary-700 transition-colors"
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
                      className="px-3 py-1 text-xs bg-white text-krushr-gray-600 border border-krushr-gray-border rounded-md hover:bg-krushr-gray-bg transition-colors"
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
                      className="px-3 py-1 text-xs bg-white text-krushr-gray-600 border border-krushr-gray-border rounded-md hover:bg-krushr-gray-bg transition-colors"
                    >
                      Next Week
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Assignee - Avatar Selection */}
              <div>
                <label className="block text-sm font-medium text-krushr-gray-dark mb-3 font-manrope">
                  Assignee
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAssigneeId('')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        assigneeId === ''
                          ? 'bg-krushr-primary text-white border-2 border-krushr-primary'
                          : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Unassigned</span>
                    </button>
                  </div>
                  {workspaceUsers && workspaceUsers.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {workspaceUsers.map((user) => {
                        const initials = (user.name || user.email).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => setAssigneeId(user.id)}
                            className={`flex items-center space-x-2 px-2 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                              assigneeId === user.id
                                ? 'bg-krushr-primary text-white border-2 border-krushr-primary'
                                : 'bg-white text-krushr-gray-600 border border-krushr-gray-border hover:bg-krushr-gray-bg'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              assigneeId === user.id ? 'bg-white text-krushr-primary' : 'bg-krushr-primary text-white'
                            }`}>
                              {initials}
                            </div>
                            <span className="truncate">{user.name || user.email.split('@')[0]}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
            
            {/* Enhanced Tags Section */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h4 className="text-sm font-semibold text-krushr-gray-dark mb-4 font-manrope flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Tags & Labels
              </h4>
              <div className="relative mb-3">
                <input 
                  type="text" 
                  id="floating_tags"
                  placeholder=" " 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="block px-3 pb-2.5 pt-4 pl-10 w-full text-sm text-krushr-gray-900 bg-white rounded-md border border-krushr-gray-border appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:border-krushr-primary peer transition-all duration-200 font-manrope"
                />
                <label 
                  htmlFor="floating_tags" 
                  className="absolute text-sm text-krushr-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-9 font-manrope"
                >
                  Add Tags (Press Enter)
                </label>
                <Hash className="absolute left-3 top-4 w-4 h-4 text-krushr-gray pointer-events-none" />
                {newTag.trim() && (
                  <button 
                    type="button"
                    onClick={handleAddTag}
                    className="absolute right-3 top-3 px-2 py-1 bg-krushr-primary text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                  >
                    Add
                  </button>
                )}
              </div>
              
              {/* Tag Display */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1 bg-krushr-gray-bg text-krushr-gray-dark text-xs px-3 py-1.5 rounded-md border border-krushr-gray-border font-medium"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-krushr-gray hover:text-krushr-secondary ml-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            {/* Enhanced File Attachments Section */}
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <h4 className="text-sm font-semibold text-krushr-gray-dark mb-4 font-manrope flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                File Attachments
              </h4>
              <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center hover:border-krushr-primary hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-200 rounded-lg flex items-center justify-center group-hover:bg-krushr-primary group-hover:scale-110 transition-all duration-200">
                  <Upload className="w-6 h-6 text-orange-600 group-hover:text-white" />
                </div>
                <p className="text-sm text-krushr-gray font-manrope font-medium">
                  Drop files here or <span className="text-krushr-primary hover:underline font-semibold">browse</span>
                </p>
                <p className="text-xs text-krushr-gray mt-2 opacity-80">Maximum file size: 15MB • Supports images, documents, and more</p>
              </div>
            </div>
          </form>
        </div>
        
        {/* Enhanced Footer */}
        <div className="px-8 py-6 border-t border-krushr-gray-border">
          <div className="flex justify-end gap-3">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-5 py-2.5 text-krushr-secondary border-2 border-krushr-secondary rounded-lg hover:bg-krushr-secondary hover:text-white transition-all duration-200 font-manrope text-sm font-medium disabled:opacity-50 mr-auto flex items-center space-x-2 hover:shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Task</span>
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-krushr-gray-dark border-2 border-krushr-gray-border rounded-lg hover:bg-krushr-gray-bg hover:border-krushr-gray-300 transition-all duration-200 font-manrope text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isLoading || !title.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-krushr-primary to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-manrope text-sm font-medium disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <span>{isEditMode ? 'Update Task' : 'Create Task'}</span>
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}