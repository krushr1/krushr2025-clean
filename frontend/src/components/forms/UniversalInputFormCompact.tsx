
import React, { useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { ChevronDownIcon, ChevronRightIcon, CalendarIcon, PlusIcon, XIcon, UploadIcon } from 'lucide-react'

import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'

import { trpc } from '../../lib/trpc'
import { UniversalFormData, ContentType } from '../../types/universal-form'
import { Priority, TaskStatus } from '../../types/enums'
import { cn } from '../../lib/utils'

interface UniversalInputFormCompactProps {
  contentType?: ContentType
  workspaceId: string
  initialData?: Partial<UniversalFormData>
  onSuccess?: (data: UniversalFormData, type: ContentType) => void
  onClose?: () => void
  integrationMode?: 'modal' | 'panel' | 'inline'
  maxHeight?: string
  showHeader?: boolean
}

const DEFAULT_FORM_DATA: UniversalFormData = {
  contentType: ContentType.TASK,
  title: '',
  description: '',
  priority: Priority.MEDIUM,
  tags: [],
  allDay: false,
  status: TaskStatus.TODO,
  teamMembers: [],
  checklist: [],
  subtasks: [],
  attachments: [],
  assigneeId: undefined,
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
  recurring: {
    enabled: false,
    pattern: 'weekly',
    endDate: undefined
  },
  workspaceId: ''
}

export default function UniversalInputFormCompact({
  contentType = ContentType.TASK,
  workspaceId,
  initialData = {},
  onSuccess,
  onClose,
  integrationMode = 'panel',
  maxHeight = '400px',
  showHeader = true
}: UniversalInputFormCompactProps) {
  
  const [formData, setFormData] = useState<UniversalFormData>({
    ...DEFAULT_FORM_DATA,
    contentType,
    workspaceId,
    ...initialData
  })
  
  const [currentTag, setCurrentTag] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    dates: false,
    team: false,
    workflow: false
  })
  
  const updateField = useCallback(<K extends keyof UniversalFormData>(
    field: K, 
    value: UniversalFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])
  
  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: (data) => {
      onSuccess?.(formData, ContentType.TASK)
      onClose?.()
    }
  })
  
  const createNoteMutation = trpc.notes?.create?.useMutation?.({
    onSuccess: (data) => {
      onSuccess?.(formData, ContentType.NOTE)
      onClose?.()
    }
  }) || { mutate: () => {}, isLoading: false }
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }
  
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateField('tags', [...formData.tags, currentTag.trim()])
      setCurrentTag('')
    }
  }
  
  const removeTag = (tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag))
  }
  
  const renderPriorityDots = (priority: Priority) => {
    const colors = {
      [Priority.LOW]: 'bg-krushr-priority-low',
      [Priority.MEDIUM]: 'bg-krushr-priority-medium', 
      [Priority.HIGH]: 'bg-krushr-priority-high',
      [Priority.CRITICAL]: 'bg-krushr-priority-critical'
    }
    
    const count = {
      [Priority.LOW]: 1,
      [Priority.MEDIUM]: 2,
      [Priority.HIGH]: 3,
      [Priority.CRITICAL]: 4
    }
    
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: count[priority] }).map((_, i) => (
          <div key={i} className={cn('w-1.5 h-1.5 rounded-full', colors[priority])} />
        ))}
      </div>
    )
  }
  
  const handleSubmit = async () => {
    if (!formData.title.trim()) return
    
    try {
      switch (formData.contentType) {
        case ContentType.TASK:
          createTaskMutation.mutate({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            workspaceId: formData.workspaceId,
            tags: formData.tags,
            startDate: formData.startDate,
            endDate: formData.endDate,
            assigneeId: formData.assigneeId
          })
          break
        case ContentType.NOTE:
          createNoteMutation.mutate({
            title: formData.title,
            content: formData.description,
            workspaceId: formData.workspaceId,
            tags: formData.tags
          })
          break
        default:
          console.log('Creating:', formData.contentType, formData)
      }
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }
  
  const isLoading = createTaskMutation.isLoading || createNoteMutation.isLoading
  
  return (
    <div className={cn(
      'bg-white border rounded-lg overflow-hidden',
      integrationMode === 'modal' && 'shadow-lg',
      integrationMode === 'panel' && 'border-gray-200',
      integrationMode === 'inline' && 'border-transparent'
    )}>
      
      {/* Compact Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Select 
              value={formData.contentType} 
              onValueChange={(value: ContentType) => updateField('contentType', value)}
            >
              <SelectTrigger className="h-7 w-auto text-sm border-none bg-transparent p-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ContentType.TASK}>📋 Task</SelectItem>
                <SelectItem value={ContentType.NOTE}>📝 Note</SelectItem>
                <SelectItem value={ContentType.EVENT}>📅 Event</SelectItem>
                <SelectItem value={ContentType.CALENDAR_EVENT}>🗓️ Calendar</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1">
              {renderPriorityDots(formData.priority)}
            </div>
          </div>
          
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      {/* Scrollable Content */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <div className="p-3 space-y-3">
          
          {/* Essential Fields */}
          <div className="space-y-2">
            <FloatingInput
              label="What needs to be done?"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="font-medium border-none shadow-none p-0 text-base focus-visible:ring-0"
              autoFocus
            />
            
            <Textarea
              placeholder="Add description..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="min-h-[60px] resize-none border-none shadow-none p-0 text-base placeholder:text-gray-400 focus-visible:ring-0"
              rows={2}
            />
          </div>
          
          {/* Quick Settings Row - Simplified */}
          <div className="flex items-center gap-2 text-sm">
            {/* Keep only non-priority/status fields here if needed */}
          </div>
          
          {/* Tags */}
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-sm h-5 px-1.5 gap-1"
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
            
            <div className="flex gap-1">
              <FloatingInput
                label="Add tag"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                className="h-6 text-sm flex-1"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addTag}
                className="h-6 w-6 p-0"
              >
                <PlusIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Collapsible Sections */}
          
          {/* Dates Section */}
          <div className="border border-gray-100 rounded">
            <button
              type="button"
              onClick={() => toggleSection('dates')}
              className="flex items-center justify-between w-full p-2 text-sm font-medium text-left hover:bg-gray-50"
            >
              <span>📅 Dates & Timing</span>
              {expandedSections.dates ? (
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronRightIcon className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.dates && (
              <div className="p-2 border-t border-gray-100 space-y-3">
                {/* Main Row: Controls on LEFT, Calendar on RIGHT */}
                <div className="flex gap-4">
                  {/* LEFT: Priority, Column, Assignment controls */}
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    {/* Priority */}
                    <div>
                      <Label className="text-sm text-gray-500">Priority</Label>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3].map((level) => {
                          const isActive = (
                            (formData.priority === Priority.LOW && level <= 1) ||
                            (formData.priority === Priority.MEDIUM && level <= 2) ||
                            (formData.priority === Priority.HIGH && level <= 3)
                          )
                          const targetPriority = level === 1 ? Priority.LOW : level === 2 ? Priority.MEDIUM : Priority.HIGH
                          
                          return (
                            <button
                              key={level}
                              onClick={() => updateField('priority', targetPriority)}
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
                    
                    {/* Column (Status) */}
                    {formData.contentType === ContentType.TASK && (
                      <div>
                        <Label className="text-sm text-gray-500">Column</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value: TaskStatus) => updateField('status', value)}
                        >
                          <SelectTrigger className="h-7 w-full border border-gray-200 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TaskStatus.TODO}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-krushr-task-todo"></div>
                                <span>To Do</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskStatus.IN_PROGRESS}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-krushr-task-progress"></div>
                                <span>In Progress</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={TaskStatus.DONE}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-krushr-task-done"></div>
                                <span>Done</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Assignment */}
                    <div>
                      <Label className="text-sm text-gray-500">Assign To</Label>
                      <Select 
                        value={formData.assigneeId || ''} 
                        onValueChange={(value) => updateField('assigneeId', value)}
                      >
                        <SelectTrigger className="h-7 w-full border border-gray-200 text-sm">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs bg-gray-200">?</AvatarFallback>
                              </Avatar>
                              <span>Unassigned</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="user1">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs bg-krushr-primary text-white">ME</AvatarFallback>
                              </Avatar>
                              <span>Assign to me</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="user2">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs bg-krushr-secondary text-white">JS</AvatarFallback>
                              </Avatar>
                              <span>John Smith</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="user3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs bg-krushr-success text-white">AD</AvatarFallback>
                              </Avatar>
                              <span>Alice Davis</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* RIGHT: Calendar widget */}
                  <div className="flex-shrink-0">
                    <Label className="text-xs text-gray-500">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-7 justify-start text-left text-sm"
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {formData.startDate ? format(formData.startDate, "MMM dd") : "Date"}
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

                {/* Time Row (only when not all day) */}
                {!formData.allDay && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      {/* Empty space to align with controls above */}
                    </div>
                    <div className="flex-shrink-0">
                      <Label className="text-sm text-gray-500">Start Time</Label>
                      <FloatingInput
                        type="time"
                        label="Time"
                        value={formData.startTime || ''}
                        onChange={(e) => updateField('startTime', e.target.value)}
                        className="h-7 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {/* All Day Toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm">All Day</Label>
                  <Switch 
                    checked={formData.allDay}
                    onCheckedChange={(checked) => updateField('allDay', checked)}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Team Section */}
          <div className="border border-gray-100 rounded">
            <button
              type="button"
              onClick={() => toggleSection('team')}
              className="flex items-center justify-between w-full p-2 text-sm font-medium text-left hover:bg-gray-50"
            >
              <span>👥 Team & Assignment</span>
              {expandedSections.team ? (
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronRightIcon className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.team && (
              <div className="p-2 border-t border-gray-100">
                <div className="text-sm text-gray-500">Team assignment features coming soon...</div>
              </div>
            )}
          </div>
          
          {/* Workflow Section */}
          <div className="border border-gray-100 rounded">
            <button
              type="button"
              onClick={() => toggleSection('workflow')}
              className="flex items-center justify-between w-full p-2 text-sm font-medium text-left hover:bg-gray-50"
            >
              <span>⚡ Workflow & Automation</span>
              {expandedSections.workflow ? (
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronRightIcon className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.workflow && (
              <div className="p-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto-assign to team</Label>
                  <Switch 
                    checked={formData.workflow.autoAssign}
                    onCheckedChange={(checked) => 
                      updateField('workflow', { ...formData.workflow, autoAssign: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Notify team members</Label>
                  <Switch 
                    checked={formData.workflow.notifyTeam}
                    onCheckedChange={(checked) => 
                      updateField('workflow', { ...formData.workflow, notifyTeam: checked })
                    }
                  />
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {/* Compact Footer */}
      <div className="flex items-center justify-between p-3 border-t bg-gray-50">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <UploadIcon className="h-3 w-3" />
          </Button>
          <span className="text-sm text-gray-500">
            {formData.attachments.length} files
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-7 text-sm"
            >
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title.trim() || isLoading}
            size="sm"
            className="h-7 text-xs"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
      
    </div>
  )
}