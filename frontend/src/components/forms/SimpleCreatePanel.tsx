import React, { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import {
  Calendar,
  Clock,
  Flag,
  Send,
  X,
  Circle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Upload,
  Trash2,
  User,
  ChevronDown,
  Plus,
  Check
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus } from '../../types/enums'
import AttachmentUploadSimple from '../common/AttachmentUpload-simple'

interface SimpleCreatePanelProps {
  workspaceId: string
  kanbanColumnId?: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function SimpleCreatePanel({ 
  workspaceId, 
  kanbanColumnId,
  open, 
  onClose, 
  onSuccess 
}: SimpleCreatePanelProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [checklistItems, setChecklistItems] = useState<Array<{id: string, text: string, completed: boolean}>>([])  
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<string>('')
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Get workspace members for assignee selection
  const workspaceMembersQuery = trpc.user.listWorkspaceMembers.useQuery({ workspaceId })
  const workspaceMembers = workspaceMembersQuery.data || []

  // Refs for click outside detection
  const assigneeRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false)
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset form when closed
  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority(Priority.MEDIUM)
    setStatus(TaskStatus.TODO)
    setComment('')
    setComments([])
    setAttachments([])
    setChecklistItems([])
    setNewChecklistItem('')
    setAssigneeId(null)
    setDueDate('')
    setShowAssigneeDropdown(false)
    setShowDatePicker(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Create task mutation
  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: async (newTask) => {
      try {
        // Add any pending comments after task creation
        for (const localComment of comments) {
          await addCommentMutation.mutateAsync({
            taskId: newTask.id,
            content: localComment.content
          })
        }

        // Upload any pending files after task creation
        for (const attachment of attachments) {
          if (attachment.file) {
            const formData = new FormData()
            formData.append('file', attachment.file)
            formData.append('taskId', newTask.id)
            
            try {
              // Note: This would need the actual upload endpoint
              await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })
            } catch (uploadError) {
              console.error('Failed to upload file:', attachment.name, uploadError)
            }
          }
        }
      } catch (error) {
        console.error('Failed to process post-creation actions:', error)
      }

      // Reset form and close
      resetForm()
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      console.error('Failed to create task:', error)
    }
  })

  // Add comment mutation
  const addCommentMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      setComment('')
    }
  })

  const handleAddComment = () => {
    if (comment.trim()) {
      // For task creation, store comment temporarily to add after task creation
      const newComment = {
        id: Date.now().toString(),
        content: comment.trim(),
        user: { name: 'You' },
        createdAt: new Date().toISOString(),
        isLocal: true // Mark as local until task is created
      }
      setComments(prev => [...prev, newComment])
      setComment('')
    }
  }

  const handleSubmit = () => {
    if (title.trim()) {
      createTaskMutation.mutate({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        workspaceId,
        kanbanColumnId,
        assigneeId,
        dueDate: dueDate || undefined,
      })
    }
  }

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      [Priority.LOW]: 'text-green-500 bg-green-50 border-green-200',
      [Priority.MEDIUM]: 'text-orange-500 bg-orange-50 border-orange-200',
      [Priority.HIGH]: 'text-red-500 bg-red-50 border-red-200',
    }
    return colors[priority]
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case TaskStatus.IN_PROGRESS:
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-brand">Create New Task</SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                onClick={handleClose}
                title="Cancel creation"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                onClick={handleClose}
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Task Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2 font-manrope">Task Title</label>
            <FloatingInput
              label="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border border-gray-200 rounded-lg px-3 py-2 focus:border-krushr-blue focus:ring-2 focus:ring-krushr-blue/20"
              autoFocus
            />
          </div>

          {/* Status + Priority Row */}
          <div className="flex items-center justify-between">
            {/* Status Tags */}
            <div className="flex gap-1">
              {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE].map((statusOption) => {
                const labels = {
                  [TaskStatus.TODO]: 'To Do',
                  [TaskStatus.IN_PROGRESS]: 'In Progress', 
                  [TaskStatus.REVIEW]: 'Review',
                  [TaskStatus.DONE]: 'Done'
                }
                const colors = {
                  [TaskStatus.TODO]: status === statusOption ? 'bg-blue-50 text-krushr-blue border-krushr-blue/30' : 'bg-white text-gray-600 border-gray-200 hover:border-krushr-blue/30',
                  [TaskStatus.IN_PROGRESS]: status === statusOption ? 'bg-orange-50 text-orange-700 border-orange-300' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300',
                  [TaskStatus.REVIEW]: status === statusOption ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300',
                  [TaskStatus.DONE]: status === statusOption ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                }
                return (
                  <button
                    key={statusOption}
                    onClick={() => setStatus(statusOption)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md border transition-all duration-200",
                      colors[statusOption]
                    )}
                  >
                    {labels[statusOption]}
                  </button>
                )
              })}
            </div>
            
            {/* Priority Dots */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              <div className="flex gap-1">
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
                      onClick={() => setPriority(targetPriority)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-colors border-2",
                        isActive ? "bg-krushr-secondary border-krushr-secondary" : "bg-white border-gray-300 hover:border-krushr-secondary/50"
                      )}
                      title={`${level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'} Priority`}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Description - Main Content Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Description & Notes</label>
            <Textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-y text-sm border-gray-200 rounded-lg p-4 focus:border-krushr-blue focus:ring-2 focus:ring-krushr-blue/20"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && !createTaskMutation.isLoading) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>

          {/* Metadata - Clean Grid */}
          <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
            {/* Assignee */}
            <div className="relative" ref={assigneeRef}>
              <div 
                className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-krushr-blue/50 transition-colors" 
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              >
                {assigneeId ? (
                  <>
                    {(() => {
                      const assignee = workspaceMembers.find(m => m.id === assigneeId)
                      return assignee ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-krushr-blue text-white text-xs flex items-center justify-center">
                            {assignee.name?.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-900">{assignee.name}</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Unassigned</span>
                        </>
                      )
                    })()}
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Unassigned</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-gray-400 ml-auto" />
              </div>
              
              {showAssigneeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  <div 
                    className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => {
                      setAssigneeId(null)
                      setShowAssigneeDropdown(false)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Unassigned</span>
                    </div>
                  </div>
                  {workspaceMembers.map(member => (
                    <div 
                      key={member.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => {
                        setAssigneeId(member.id)
                        setShowAssigneeDropdown(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-krushr-blue text-white text-xs flex items-center justify-center">
                          {member.name?.charAt(0)}
                        </div>
                        <span className="text-gray-900">{member.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Due Date */}
            <div className="relative" ref={datePickerRef}>
              <div 
                className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-krushr-blue/50 transition-colors" 
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {dueDate ? new Date(dueDate).toLocaleDateString() : 'No date'}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400 ml-auto" />
              </div>
              
              {showDatePicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value)
                      setShowDatePicker(false)
                    }}
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-krushr-blue focus:border-krushr-blue"
                  />
                  {dueDate && (
                    <button
                      onClick={() => {
                        setDueDate('')
                        setShowDatePicker(false)
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                    >
                      Clear date
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Created */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Just now</span>
            </div>
          </div>

          {/* Unified Features - Streamlined */}
          <div className="space-y-4">
            
            {/* Comments Section */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-krushr-blue" />
                <h4 className="text-sm font-medium text-gray-900">Comments ({comments.length})</h4>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 min-h-[60px] text-sm resize-none border-gray-200 focus:border-krushr-blue focus:ring-2 focus:ring-krushr-blue/20"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="h-10 px-3 bg-krushr-blue hover:bg-krushr-blue/90"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
              
              {/* Show local comments */}
              {comments.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white rounded p-2 border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-900">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.isLocal ? 'Just now' : 'Unknown'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Files Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Files ({attachments.length})</span>
              </div>
              
              <div className="border border-dashed border-gray-200 rounded-lg p-2 text-center hover:border-krushr-blue/50 transition-colors">
                <Upload className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    const newAttachments = files.map(file => ({
                      id: Date.now() + Math.random(),
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      file: file,
                      isLocal: true
                    }))
                    setAttachments(prev => [...prev, ...newAttachments])
                  }}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-gray-600 hover:text-gray-800 p-0"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Drop files or click to upload
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Paperclip className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{attachment.name}</span>
                        <span className="text-xs text-gray-400">({(attachment.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-red-500 hover:text-red-700 flex-shrink-0"
                        onClick={() => {
                          setAttachments(prev => prev.filter(a => a.id !== attachment.id))
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Summary - Only show if there's content */}
            {(comments.length > 0 || attachments.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Ready to Create</h4>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {comments.length > 0 && (
                    <div>
                      {comments.length} comment{comments.length > 1 ? 's' : ''} prepared
                    </div>
                  )}
                  {attachments.length > 0 && (
                    <div>
                      {attachments.length} file{attachments.length > 1 ? 's' : ''} ready to upload
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={createTaskMutation.isLoading}
              className="h-10 px-4 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || createTaskMutation.isLoading}
              className="h-10 px-6 text-sm gap-2 bg-krushr-secondary hover:bg-krushr-secondary/90 focus:ring-2 focus:ring-krushr-secondary/50 text-white font-medium"
            >
              {createTaskMutation.isLoading ? (
                <>Creating...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Simple Create Panel
 * Clean side panel for creating tasks using the same pattern as TaskDetail
 */