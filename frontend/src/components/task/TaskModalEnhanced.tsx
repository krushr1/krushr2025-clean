
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { RichTextEditor } from '../ui/rich-text-editor'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  CalendarIcon, 
  Plus, 
  X, 
  Paperclip, 
  Tag, 
  Users, 
  Flag, 
  MessageSquare,
  Settings,
  Clock,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus } from '../../types/enums'
import AttachmentUpload from '../common/AttachmentUpload'
import AttachmentList from '../common/AttachmentList'
import { TaskCommentList, useCommentCount } from './comments'

interface TaskModalEnhancedProps {
  open: boolean
  onClose: () => void
  task?: any
  kanbanColumnId?: string
  workspaceId: string
  projectId?: string
  onSuccess?: () => void
  defaultTab?: 'details' | 'comments' | 'attachments' | 'activity'
}

export default function TaskModalEnhanced({
  open,
  onClose,
  task,
  kanbanColumnId,
  workspaceId,
  projectId,
  onSuccess,
  defaultTab = 'details'
}: TaskModalEnhancedProps) {
  const isEditMode = !!task
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [estimatedHours, setEstimatedHours] = useState<string>('')

  const { data: users = [] } = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  const { data: projects = [] } = trpc.project.list.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  
  const { 
    data: attachments = [], 
    refetch: refetchAttachments,
    isLoading: attachmentsLoading 
  } = trpc.upload.getTaskAttachments.useQuery(
    { taskId: task?.id || '' },
    { enabled: !!task?.id && isEditMode }
  )

  const commentCount = useCommentCount(task?.id || '')
  
  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      onSuccess?.()
      onClose()
      resetForm()
    }
  })
  
  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      onSuccess?.()
    }
  })

  const deleteAttachmentMutation = trpc.upload.deleteFile.useMutation({
    onSuccess: () => {
      refetchAttachments()
    },
    onError: (error) => {
      console.error('Failed to delete attachment:', error)
    }
  })

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || Priority.MEDIUM)
      setStatus(task.status || TaskStatus.TODO)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setAssigneeId(task.assigneeId || '')
      setTags(task.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || [])
      setEstimatedHours(task.estimatedHours?.toString() || '')
    }
  }, [task])

  useEffect(() => {
    if (!open) {
      resetForm()
      setActiveTab(defaultTab)
    }
  }, [open, defaultTab])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority(Priority.MEDIUM)
    setStatus(TaskStatus.TODO)
    setDueDate(undefined)
    setAssigneeId('')
    setTags([])
    setCurrentTag('')
    setEstimatedHours('')
  }

  const handleSubmit = () => {
    const taskData = {
      title,
      description,
      priority,
      status,
      dueDate: dueDate?.toISOString(),
      assigneeId: assigneeId || undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      tags,
      workspaceId,
      projectId: projectId || task?.projectId,
      kanbanColumnId: kanbanColumnId || task?.kanbanColumnId,
    }

    if (isEditMode) {
      updateTaskMutation.mutate({ id: task.id, ...taskData })
    } else {
      createTaskMutation.mutate(taskData)
    }
  }

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const getPriorityIcon = (priority: Priority) => {
    const colors = {
      [Priority.LOW]: 'text-green-500',
      [Priority.MEDIUM]: 'text-yellow-500',
      [Priority.HIGH]: 'text-red-500',
      [Priority.CRITICAL]: 'text-red-600'
    }
    return <Flag className={cn("w-4 h-4", colors[priority])} />
  }

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.TODO]: 'text-gray-500',
      [TaskStatus.IN_PROGRESS]: 'text-blue-500',
      [TaskStatus.IN_REVIEW]: 'text-purple-500',
      [TaskStatus.DONE]: 'text-green-500',
      [TaskStatus.CANCELLED]: 'text-red-500'
    }
    return colors[status] || 'text-gray-500'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold font-manrope">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Created {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  {task.updatedAt !== task.createdAt && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Updated {format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments
              {commentCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {commentCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Files
              {attachments.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {attachments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-1">
              {/* Title */}
              <div>
                <FloatingInput
                  id="title"
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Add a detailed description with rich formatting..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Priority */}
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(priority)}
                          <span className="capitalize">{priority.toLowerCase()}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Priority).map((p) => (
                        <SelectItem key={p} value={p}>
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(p)}
                            <span className="capitalize">{p.toLowerCase()}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(status).replace('text-', 'bg-'))} />
                          <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskStatus).map((s) => (
                        <SelectItem key={s} value={s}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(s).replace('text-', 'bg-'))} />
                            <span className="capitalize">{s.toLowerCase().replace('_', ' ')}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Due Date */}
                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Assignee */}
                <div>
                  <Label>Assignee</Label>
                  <Select value={assigneeId || "unassigned"} onValueChange={(value) => setAssigneeId(value === "unassigned" ? "" : value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select assignee">
                        {assigneeId && assigneeId !== "unassigned" && (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={users.find(u => u.id === assigneeId)?.avatar} />
                              <AvatarFallback className="text-xs">
                                {users.find(u => u.id === assigneeId)?.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{users.find(u => u.id === assigneeId)?.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3 text-gray-500" />
                          </div>
                          <span>Unassigned</span>
                        </div>
                      </SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-xs">
                                {user.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Estimated Hours */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Estimated Hours</Label>
                  <FloatingInput
                    id="estimatedHours"
                    label=""
                    type="number"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="mt-2"
                    placeholder="0.0"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <FloatingInput
                    label="Add a tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    className="border-krushr-primary text-krushr-primary hover:bg-krushr-primary hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="flex-1 overflow-hidden">
            {isEditMode && task?.id ? (
              <TaskCommentList
                taskId={task.id}
                workspaceId={workspaceId}
                className="h-full"
                maxHeight="100%"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-manrope">Save the task to add comments</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="flex-1 overflow-y-auto">
            {isEditMode && task?.id ? (
              <div className="space-y-4 p-1">
                {/* Show existing attachments */}
                {attachments && attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 font-manrope">
                      Attached Files ({attachments.length})
                    </h4>
                    <AttachmentList
                      attachments={attachments}
                      canDelete={true}
                      onDelete={(attachmentId) => {
                        deleteAttachmentMutation.mutate({ attachmentId })
                      }}
                    />
                  </div>
                )}
                
                {/* Show loading state for attachments */}
                {attachmentsLoading && (
                  <div className="text-sm text-gray-500 text-center py-8">
                    Loading attachments...
                  </div>
                )}
                
                {/* Upload new attachments */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 font-manrope">
                    Add Files
                  </h4>
                  <AttachmentUpload
                    type="task"
                    targetId={task.id}
                    onUploadComplete={async (uploadedAttachments) => {
                      console.log('Uploaded attachments:', uploadedAttachments)
                      await refetchAttachments()
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Paperclip className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-manrope">Save the task to add attachments</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-manrope">Activity tracking coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {updateTaskMutation.isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-krushr-primary border-t-transparent rounded-full animate-spin" />
                <span>Saving changes...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              {isEditMode ? 'Close' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title || createTaskMutation.isLoading || updateTaskMutation.isLoading}
              className="bg-krushr-primary hover:bg-krushr-primary/90"
            >
              {createTaskMutation.isLoading || updateTaskMutation.isLoading
                ? 'Saving...'
                : isEditMode
                ? 'Save Changes'
                : 'Create Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}