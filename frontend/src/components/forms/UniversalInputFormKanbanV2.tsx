
import React, { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, PlusIcon, XIcon, TagIcon, UserIcon, ClipboardListIcon } from 'lucide-react'

import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'

import { trpc } from '../../lib/trpc'
import { UniversalFormData, ContentType } from '../../types/universal-form'
import { Priority, TaskStatus } from '../../types/enums'
import { cn } from '../../lib/utils'

interface UniversalInputFormKanbanV2Props {
  workspaceId: string
  kanbanColumnId?: string
  initialData?: Partial<UniversalFormData>
  onSuccess?: (data: UniversalFormData) => void
  onClose?: () => void
  integrationMode?: 'modal' | 'panel' | 'inline'
}

const DEFAULT_FORM_DATA: UniversalFormData = {
  contentType: ContentType.TASK,
  title: '',
  description: '',
  priority: Priority.MEDIUM,
  tags: [],
  status: TaskStatus.TODO,
  assigneeId: undefined,
  attachments: [],
  workflow: {
    createVideoMeeting: false,
    createCall: false,
    kanbanTaskBoard: false,
    notes: false,
    ganttTimeline: false,
    ganttDependency: false,
    reminder: false,
    notifyTeam: false,
    changesNotifyTeam: false,
    reminders: []
  },
  workspaceId: ''
}

export default function UniversalInputFormKanbanV2({
  workspaceId,
  kanbanColumnId,
  initialData = {},
  onSuccess,
  onClose,
  integrationMode = 'modal'
}: UniversalInputFormKanbanV2Props) {
  
  const [formData, setFormData] = useState<UniversalFormData>({
    ...DEFAULT_FORM_DATA,
    workspaceId,
    ...initialData
  })
  
  const [currentTag, setCurrentTag] = useState('')
  
  const updateField = useCallback(<K extends keyof UniversalFormData>(
    field: K, 
    value: UniversalFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])
  
  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: (data) => {
      onSuccess?.(formData)
      onClose?.()
    }
  })
  
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateField('tags', [...formData.tags, currentTag.trim()])
      setCurrentTag('')
    }
  }
  
  const removeTag = (tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag))
  }
  
  const renderPriorityBadge = (priority: Priority) => {
    const variants = {
      [Priority.LOW]: 'bg-krushr-success/10 text-krushr-success border-krushr-success/20',
      [Priority.MEDIUM]: 'bg-krushr-warning/10 text-krushr-warning border-krushr-warning/20',
      [Priority.HIGH]: 'bg-krushr-secondary/10 text-krushr-secondary border-krushr-secondary/20'
    }
    
    return (
      <div className={cn(
        'px-2 py-1 text-xs font-medium rounded border transition-all duration-200 font-manrope',
        variants[priority]
      )}>
        {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
      </div>
    )
  }
  
  const handleSubmit = async () => {
    if (!formData.title.trim()) return
    
    try {
      createTaskMutation.mutate({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        workspaceId: formData.workspaceId,
        tags: formData.tags,
        startDate: formData.startDate,
        endDate: formData.endDate,
        assigneeId: formData.assigneeId,
        kanbanColumnId: kanbanColumnId
      })
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }
  
  const isLoading = createTaskMutation.isLoading
  
  return (
    <div className={cn(
      'bg-white border border-krushr-gray-border rounded-xl overflow-hidden shadow-krushr-modal',
      integrationMode === 'modal' && 'max-w-2xl mx-auto',
      integrationMode === 'panel' && 'w-full',
      integrationMode === 'inline' && 'border-transparent shadow-none'
    )}>
      
      {/* Header - Kanban Focused */}
      <div className="flex items-center justify-between p-6 border-b border-krushr-gray-border bg-krushr-gray-bg-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-krushr-primary rounded-lg flex items-center justify-center">
            <ClipboardListIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-krushr-gray-dark font-manrope">
              Create Kanban Task
            </h3>
            <p className="text-sm text-krushr-gray font-manrope">
              Add to {kanbanColumnId ? 'selected column' : 'board'}
            </p>
          </div>
        </div>
        
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-krushr-gray-border"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Core Kanban Form */}
      <div className="p-6 space-y-6">
        
        {/* Essential Fields */}
        <div className="space-y-4">
          {/* Task Title */}
          <div className="relative">
            <FloatingInput
              label="Task Title *"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="text-lg font-medium border-2 border-krushr-gray-border rounded-lg focus:border-krushr-primary font-manrope"
              autoFocus
            />
          </div>
          
          {/* Description */}
          <div>
            <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
              Description
            </Label>
            <Textarea
              placeholder="Describe what needs to be done..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="min-h-[80px] border-2 border-krushr-gray-border rounded-lg focus:border-krushr-primary font-manrope"
              rows={3}
            />
          </div>
        </div>
        
        {/* Core Kanban Controls */}
        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
              Priority
            </Label>
            <div className="flex gap-2">
              {Object.values(Priority).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => updateField('priority', priority)}
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded border transition-all duration-200 font-manrope',
                    formData.priority === priority 
                      ? 'bg-krushr-primary/20 text-krushr-primary border-krushr-primary/30 ring-2 ring-offset-1 ring-krushr-primary/50 font-semibold'
                      : 'bg-krushr-gray-bg text-krushr-gray border-krushr-gray-border hover:bg-krushr-gray-border'
                  )}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          
          {/* Column Status */}
          <div>
            <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
              Column
            </Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: TaskStatus) => updateField('status', value)}
            >
              <SelectTrigger className="h-9 border-2 border-krushr-gray-border font-manrope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskStatus.TODO}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-krushr-gray"></div>
                    <span className="font-manrope">To Do</span>
                  </div>
                </SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-krushr-primary"></div>
                    <span className="font-manrope">In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value={TaskStatus.DONE}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-krushr-success"></div>
                    <span className="font-manrope">Done</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Assignment & Due Date */}
        <div className="grid grid-cols-2 gap-4">
          {/* Assignee */}
          <div>
            <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              Assign To
            </Label>
            <Select 
              value={formData.assigneeId || ''} 
              onValueChange={(value) => updateField('assigneeId', value)}
            >
              <SelectTrigger className="h-9 border-2 border-krushr-gray-border font-manrope">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs bg-krushr-gray-border">?</AvatarFallback>
                    </Avatar>
                    <span className="font-manrope">Unassigned</span>
                  </div>
                </SelectItem>
                <SelectItem value="user1">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs bg-krushr-primary text-white">ME</AvatarFallback>
                    </Avatar>
                    <span className="font-manrope">Assign to me</span>
                  </div>
                </SelectItem>
                <SelectItem value="user2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs bg-krushr-secondary text-white">JS</AvatarFallback>
                    </Avatar>
                    <span className="font-manrope">John Smith</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Due Date */}
          <div>
            <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 justify-start text-left font-manrope border-2 border-krushr-gray-border"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => updateField('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Tags */}
        <div>
          <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope flex items-center gap-1">
            <TagIcon className="w-4 h-4" />
            Tags
          </Label>
          
          {/* Tag Display */}
          <div className="flex flex-wrap gap-1 mb-2">
            {formData.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs h-6 px-2 gap-1 bg-krushr-primary/10 text-krushr-primary border-krushr-primary/20 font-manrope"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(tag)}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <XIcon className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
          
          {/* Tag Input */}
          <div className="flex gap-2">
            <FloatingInput
              label="Add tag"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="h-9 flex-1 border-2 border-krushr-gray-border font-manrope"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addTag}
              className="h-9 w-9 p-0 border-2 border-krushr-gray-border"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
      </div>
      
      {/* Footer Actions */}
      <div className="flex items-center justify-between p-6 border-t border-krushr-gray-border bg-krushr-gray-bg-light">
        <div className="flex items-center gap-2">
          <span className="text-sm text-krushr-gray font-manrope">
            Create in: <span className="font-medium">Kanban Board</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2 border-2 border-krushr-gray-border font-manrope"
            >
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title.trim() || isLoading}
            className="px-6 py-2 bg-krushr-primary hover:bg-krushr-primary/90 text-white font-manrope shadow-krushr-button-dark"
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </div>
      
    </div>
  )
}