import React, { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { RichTextEditor } from '../ui/rich-text-editor'
import {
  Calendar,
  Clock,
  Flag,
  MessageSquare,
  Paperclip,
  Send,
  Trash2,
  Download,
  FileText,
  Image,
  MoreVertical,
  CheckCircle2,
  Circle,
  AlertCircle,
  User,
  ChevronDown,
  Plus,
  Check,
  X,
  Upload
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus } from '../../types/enums'
import CompactTaskModal from '../kanban/CompactTaskModal'
import AttachmentUploadSimple from '../common/AttachmentUpload-simple'
import AttachmentListSimple from '../common/AttachmentList-simple'
import TaskChecklist from './TaskChecklist'

interface TaskDetailProps {
  taskId: string
  open: boolean
  onClose: () => void
  onUpdate?: () => void
}

export default function TaskDetail({ taskId, open, onClose, onUpdate }: TaskDetailProps) {
  const [comment, setComment] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [tempTitle, setTempTitle] = useState('')
  const [tempDescription, setTempDescription] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: task, refetch } = trpc.task.get.useQuery(
    { id: taskId },
    { 
      enabled: !!taskId,
      onSuccess: (data) => {
        if (data) {
          setTempTitle(data.title || '')
          setTempDescription(data.description || '')
        }
      }
    }
  )
  const { data: comments = [], refetch: refetchComments } = trpc.comment.list.useQuery(
    { taskId },
    { enabled: !!taskId }
  )
  const { data: attachments = [] } = trpc.upload.getTaskAttachments.useQuery(
    { taskId },
    { enabled: !!taskId }
  )
  const { data: activities = [] } = trpc.activity.list.useQuery(
    { taskId },
    { enabled: !!taskId }
  )

  const addCommentMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      setComment('')
      refetchComments() // Instantly refetch comments for immediate display
      refetch() // Also refetch task data for any count updates
    },
    onError: (error) => {
      console.error('Failed to add comment:', error)
    }
  })
  
  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      refetch()
      onUpdate?.()
      setEditingTitle(false)
      setEditingDescription(false)
    }
  })
  
  const deleteTaskMutation = trpc.task.delete.useMutation({
    onSuccess: () => {
      onClose()
      onUpdate?.()
    }
  })
  
  const addChecklistItemMutation = trpc.checklist.addItem.useMutation({
    onSuccess: () => {
      refetch()
      setNewChecklistItem('')
    }
  })
  
  const updateChecklistItemMutation = trpc.checklist.updateItem.useMutation({
    onSuccess: () => {
      refetch()
    }
  })
  
  const deleteChecklistItemMutation = trpc.checklist.deleteItem.useMutation({
    onSuccess: () => {
      refetch()
    }
  })
  
  const { refetch: refetchAttachments } = trpc.upload.getTaskAttachments.useQuery(
    { taskId },
    { enabled: !!taskId }
  )

  if (!task) return null

  const handleAddComment = () => {
    if (comment.trim()) {
      addCommentMutation.mutate({
        taskId,
        content: comment,
      })
    }
  }

  const handleStatusChange = (status: TaskStatus) => {
    updateTaskMutation.mutate({
      id: taskId,
      status,
    })
  }

  const handlePriorityChange = (priority: Priority) => {
    updateTaskMutation.mutate({
      id: taskId,
      priority,
    })
  }

  const handleTitleSave = () => {
    if (tempTitle.trim() && tempTitle !== task?.title) {
      updateTaskMutation.mutate({
        id: taskId,
        title: tempTitle.trim(),
      })
    } else {
      setEditingTitle(false)
      setTempTitle(task?.title || '')
    }
  }

  const handleDescriptionSave = () => {
    if (tempDescription !== task?.description) {
      updateTaskMutation.mutate({
        id: taskId,
        description: tempDescription,
      })
    } else {
      setEditingDescription(false)
      setTempDescription(task?.description || '')
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto shadow-krushr-modal" hideOverlay={true}>
          <SheetHeader className="space-y-0 pb-6 border-b border-krushr-panel-border">
            <div className="flex items-center justify-between">
              {editingTitle ? (
                <FloatingInput
                  label="Task title"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleTitleSave()
                    }
                    if (e.key === 'Escape') {
                      setEditingTitle(false)
                      setTempTitle(task?.title || '')
                    }
                  }}
                  className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                  autoFocus
                />
              ) : (
                <SheetTitle 
                  className="text-xl font-semibold text-krushr-gray-dark cursor-pointer hover:bg-krushr-gray-50 px-2 py-1 rounded-md transition-colors font-brand"
                  onClick={() => {
                    setTempTitle(task?.title || '') // Preserve existing text
                    setEditingTitle(true)
                  }}
                >
                  {task.title}
                </SheetTitle>
              )}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="text-krushr-primary border-krushr-primary hover:bg-krushr-primary hover:text-white"
                >
                  Edit Task
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this task?')) {
                      deleteTaskMutation.mutate({ id: taskId })
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6 font-brand">
            {/* Status + Priority Row */}
            <div className="flex items-center justify-between bg-krushr-gray-50 p-4 rounded-lg border border-krushr-panel-border">
              {/* Status Tags */}
              <div className="flex gap-1">
                {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE].map((status) => {
                  const labels = {
                    [TaskStatus.TODO]: 'To Do',
                    [TaskStatus.IN_PROGRESS]: 'In Progress', 
                    [TaskStatus.REVIEW]: 'Review',
                    [TaskStatus.DONE]: 'Done'
                  }
                  const colors = {
                    [TaskStatus.TODO]: task.status === status ? 'bg-krushr-task-todo/10 text-krushr-task-todo border-krushr-task-todo/30' : 'bg-white text-krushr-gray border-krushr-panel-border hover:bg-krushr-gray-50',
                    [TaskStatus.IN_PROGRESS]: task.status === status ? 'bg-krushr-task-progress/10 text-krushr-task-progress border-krushr-task-progress/30' : 'bg-white text-krushr-gray border-krushr-panel-border hover:bg-krushr-gray-50',
                    [TaskStatus.REVIEW]: task.status === status ? 'bg-krushr-task-review/10 text-krushr-task-review border-krushr-task-review/30' : 'bg-white text-krushr-gray border-krushr-panel-border hover:bg-krushr-gray-50',
                    [TaskStatus.DONE]: task.status === status ? 'bg-krushr-task-done/10 text-krushr-task-done border-krushr-task-done/30' : 'bg-white text-krushr-gray border-krushr-panel-border hover:bg-krushr-gray-50'
                  }
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 shadow-sm",
                        colors[status]
                      )}
                    >
                      {labels[status]}
                    </button>
                  )
                })}
              </div>
              
              {/* Priority Dots */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-krushr-gray-dark mr-1">Priority:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((level) => {
                    const isActive = (
                      (task.priority === Priority.LOW && level <= 1) ||
                      (task.priority === Priority.MEDIUM && level <= 2) ||
                      (task.priority === Priority.HIGH && level <= 3)
                    )
                    const targetPriority = level === 1 ? Priority.LOW : level === 2 ? Priority.MEDIUM : Priority.HIGH
                    
                    return (
                      <button
                        key={level}
                        onClick={() => handlePriorityChange(targetPriority)}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full transition-all duration-200 shadow-sm",
                          isActive ? "bg-krushr-priority-high" : "bg-krushr-gray-300 hover:bg-krushr-priority-high/50"
                        )}
                        title={`${level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'} Priority`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Description - Main Content Area */}
            <div className="flex-1 bg-white rounded-lg border border-krushr-panel-border p-4">
              <label className="text-sm font-medium text-krushr-gray-dark block mb-3">Description & Notes</label>
              {editingDescription ? (
                <RichTextEditor
                  content={tempDescription}
                  onChange={setTempDescription}
                  onBlur={handleDescriptionSave}
                  placeholder="Add a description with rich formatting..."
                  className="min-h-[120px]"
                />
              ) : (
                <div
                  onClick={() => {
                    setTempDescription(task?.description || '') // Preserve existing text
                    setEditingDescription(true)
                  }}
                  className="min-h-[120px] p-3 text-sm border border-krushr-panel-border rounded-md cursor-pointer hover:bg-krushr-gray-50 prose prose-sm max-w-none transition-colors"
                  dangerouslySetInnerHTML={{
                    __html: task.description || '<span class="text-gray-400 italic">Click to add description...</span>'
                  }}
                />
              )}
            </div>

            {/* Metadata - Compact Row */}
            <div className="flex items-center gap-6 text-sm text-krushr-gray bg-krushr-gray-50 p-4 rounded-lg border border-krushr-panel-border">
              {/* Assignee */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <Select
                  value={task.assigneeId || 'unassigned'}
                  onValueChange={(value) => {
                    updateTaskMutation.mutate({
                      id: taskId,
                      assigneeId: value === 'unassigned' ? null : value,
                    })
                  }}
                >
                  <SelectTrigger className="w-auto border-none shadow-none p-0 h-auto text-sm hover:text-krushr-gray-dark focus:ring-0 transition-colors">
                    <SelectValue placeholder="Unassigned">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-krushr-gray-light">Unassigned</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Unassigned</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="user1">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">JD</AvatarFallback>
                        </Avatar>
                        <span>John Doe</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="user2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">JS</AvatarFallback>
                        </Avatar>
                        <span>Jane Smith</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="user3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">MJ</AvatarFallback>
                        </Avatar>
                        <span>Mike Johnson</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Due Date */}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <input
                  type="date"
                  value={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    updateTaskMutation.mutate({
                      id: taskId,
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }}
                  className="bg-transparent border-none text-sm cursor-pointer hover:text-krushr-gray-dark w-20 transition-colors"
                  placeholder="No date"
                />
              </div>
              
              {/* Created */}
              <div className="flex items-center gap-1 text-krushr-gray-light">
                <Clock className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(task.createdAt))} ago</span>
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag: any) => (
                  <Badge key={tag.id || tag} variant="secondary">
                    {typeof tag === 'string' ? tag : tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Checklist Section */}
            <div className="bg-white rounded-lg border border-krushr-panel-border p-4">
              <TaskChecklist 
                taskId={taskId}
                workspaceId={task.project?.workspaceId || ''}
                onUpdate={() => {
                  refetch()
                  onUpdate?.()
                }}
              />
            </div>

            {/* Unified Comments, Files, and Activity View */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              
              {/* Comments Section - Brandkit Inline Comments Style */}
              <div className="space-y-4 bg-white rounded-lg border border-krushr-panel-border p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-krushr-gray-dark">Comments ({comments.length})</h3>
                </div>
                
                {/* Comment Input */}
                <div className="space-y-2">
                  <RichTextEditor
                    content={comment}
                    onChange={setComment}
                    placeholder={addCommentMutation.isLoading ? "Posting comment..." : "Add a comment..."}
                    className="min-h-[80px]"
                    minimal={true}
                    editable={!addCommentMutation.isLoading}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!comment.trim() || addCommentMutation.isLoading}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>

                {/* Comments List - Exact Brandkit Inline Comments Pattern */}
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="border border-krushr-panel-border rounded-lg p-3 bg-krushr-gray-50/50">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-krushr-primary rounded-full flex items-center justify-center text-white text-xs">
                          {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-krushr-gray-dark">
                              {comment.user?.name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-krushr-gray">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <div 
                            className="text-sm text-krushr-gray prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                          />
                          <div className="flex items-center space-x-4 mt-2">
                            <button className="text-xs text-krushr-gray-light hover:text-krushr-primary transition-colors">Reply</button>
                            <button className="text-xs text-krushr-gray-light hover:text-krushr-primary transition-colors">Like</button>
                            <button className="text-xs text-krushr-gray-light hover:text-krushr-primary transition-colors">...</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {comments.length === 0 && (
                    <div className="text-center py-4 text-krushr-gray-light text-sm">
                      No comments yet. Be the first to add one!
                    </div>
                  )}
                </div>
              </div>

              {/* Files Section */}
              <div className="border border-krushr-panel-border rounded-lg bg-white shadow-sm">
                <div className="p-4 border-b border-krushr-panel-border bg-krushr-gray-50">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-krushr-secondary" />
                    <h3 className="font-medium text-krushr-gray-dark">Files ({attachments.length})</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                
                {/* Themed Upload */}
                <div className="border-2 border-dashed border-krushr-panel-border rounded-lg p-4 text-center text-sm text-krushr-gray hover:border-krushr-secondary/50 transition-colors bg-krushr-gray-50">
                  <Upload className="w-5 h-5 mx-auto mb-2 text-krushr-gray-light" />
                  <span className="font-medium">Drop files here or click to upload</span>
                </div>

                {/* Existing Attachments */}
                {attachments.length > 0 && (
                  <div className="pt-2 border-t border-krushr-panel-border">
                    <AttachmentListSimple
                      attachments={attachments}
                      canDelete={true}
                      onRefresh={() => {
                        refetchAttachments()
                      }}
                    />
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="border border-krushr-panel-border rounded-lg bg-white shadow-sm">
              <div className="p-4 border-b border-krushr-panel-border bg-krushr-gray-50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="font-medium text-krushr-gray-dark">Activity</h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
              {activities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-krushr-gray-300 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name}</span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-xs text-krushr-gray">
                      {formatDistanceToNow(new Date(activity.createdAt))} ago
                    </p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Compact Task Edit Modal */}
      <CompactTaskModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        task={task}
        workspaceId={task?.workspaceId || ''}
        onSuccess={() => {
          setShowEditModal(false)
          refetch()
          onUpdate?.()
        }}
      />
    </>
  )
}
