/**
 * Task Creation/Edit Modal
 * Comprehensive form for managing tasks with all fields
 */

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
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
import { CalendarIcon, Plus, X, Paperclip, Tag, Users, Flag } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus } from '../../types/enums'
import AttachmentUpload from '../common/AttachmentUpload'
import AttachmentList from '../common/AttachmentList'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  task?: any
  kanbanColumnId?: string
  workspaceId: string
  projectId?: string
  onSuccess?: () => void
}

export default function TaskModal({
  open,
  onClose,
  task,
  kanbanColumnId,
  workspaceId,
  projectId,
  onSuccess
}: TaskModalProps) {
  const isEditMode = !!task
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [estimatedHours, setEstimatedHours] = useState<string>('')

  // Queries
  const { data: users = [] } = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  const { data: projects = [] } = trpc.project.list.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  
  // Attachment query - refetch when task changes
  const { 
    data: attachments = [], 
    refetch: refetchAttachments,
    isLoading: attachmentsLoading 
  } = trpc.upload.getTaskAttachments.useQuery(
    { taskId: task?.id || '' },
    { enabled: !!task?.id && isEditMode }
  )
  
  // Mutations
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
      onClose()
    }
  })

  // Delete attachment mutation
  const deleteAttachmentMutation = trpc.upload.deleteFile.useMutation({
    onSuccess: () => {
      refetchAttachments()
    },
    onError: (error) => {
      console.error('Failed to delete attachment:', error)
    }
  })

  // Initialize form with task data in edit mode
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
      [Priority.LOW]: 'text-krushr-priority-low',
      [Priority.MEDIUM]: 'text-krushr-priority-medium',
      [Priority.HIGH]: 'text-krushr-priority-high',
    }
    return <Flag className={cn("w-4 h-4", colors[priority])} />
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div>
            <FloatingInput
              id="title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <div className="mt-1">
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Add a detailed description with rich formatting..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger className="mt-1">
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
                <SelectTrigger className="mt-1">
                  <SelectValue>
                    <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="capitalize">{s.toLowerCase().replace('_', ' ')}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
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
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignee">
                    {assigneeId && assigneeId !== "unassigned" && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
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
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
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
          <div>
            <FloatingInput
              id="estimatedHours"
              label="Estimated Hours"
              type="number"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="mt-1 w-32"
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1">
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
                className="border-krushr-secondary text-krushr-secondary hover:bg-krushr-secondary hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
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

          {/* Attachments */}
          {isEditMode && task?.id && (
            <div>
              <Label className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments
              </Label>
              
              <div className="mt-2 space-y-4">
                {/* Show existing attachments */}
                {attachments && attachments.length > 0 && (
                  <AttachmentList
                    attachments={attachments}
                    canDelete={true}
                    onDelete={(attachmentId) => {
                      deleteAttachmentMutation.mutate({ attachmentId })
                    }}
                  />
                )}
                
                {/* Show loading state for attachments */}
                {attachmentsLoading && (
                  <div className="text-sm text-muted-foreground">
                    Loading attachments...
                  </div>
                )}
                
                {/* Upload new attachments */}
                <AttachmentUpload
                  type="task"
                  targetId={task.id}
                  onUploadComplete={async (uploadedAttachments) => {
                    console.log('Uploaded attachments:', uploadedAttachments)
                    // Refresh attachments immediately to show the new uploads
                    await refetchAttachments()
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || createTaskMutation.isLoading || updateTaskMutation.isLoading}
          >
            {createTaskMutation.isLoading || updateTaskMutation.isLoading
              ? 'Saving...'
              : isEditMode
              ? 'Update Task'
              : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}