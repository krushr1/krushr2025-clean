/**
 * Universal Input Form - Kanban Variant 3 (Power User)
 * Advanced Kanban features for power users (20% advanced use cases)
 * Comprehensive form with all Kanban functionality
 */

import React, { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { 
  CalendarIcon, PlusIcon, XIcon, TagIcon, UserIcon, ClipboardListIcon,
  ClockIcon, LinkIcon, FileIcon, BellIcon, RepeatIcon, ChevronDownIcon,
  ChevronRightIcon, SettingsIcon, ZapIcon, UsersIcon
} from 'lucide-react'

// UI Components
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
import { Separator } from '../ui/separator'

// tRPC and Types
import { trpc } from '../../lib/trpc'
import { UniversalFormData, ContentType } from '../../types/universal-form'
import { Priority, TaskStatus } from '../../types/enums'
import { cn } from '../../lib/utils'

interface UniversalInputFormKanbanV3Props {
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
  estimatedHours: undefined,
  attachments: [],
  dependencies: [],
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

export default function UniversalInputFormKanbanV3({
  workspaceId,
  kanbanColumnId,
  initialData = {},
  onSuccess,
  onClose,
  integrationMode = 'modal'
}: UniversalInputFormKanbanV3Props) {
  
  // ===== STATE MANAGEMENT =====
  const [formData, setFormData] = useState<UniversalFormData>({
    ...DEFAULT_FORM_DATA,
    workspaceId,
    ...initialData
  })
  
  const [currentTag, setCurrentTag] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    essential: true,
    scheduling: false,
    team: false,
    automation: false,
    advanced: false
  })
  
  // ===== FORM HANDLERS =====
  const updateField = useCallback(<K extends keyof UniversalFormData>(
    field: K, 
    value: UniversalFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])
  
  // ===== MUTATIONS =====
  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: (data) => {
      onSuccess?.(formData)
      onClose?.()
    }
  })
  
  // ===== HELPER FUNCTIONS =====
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
      [Priority.LOW]: 'bg-krushr-success',
      [Priority.MEDIUM]: 'bg-krushr-warning', 
      [Priority.HIGH]: 'bg-krushr-secondary'
    }
    
    const count = {
      [Priority.LOW]: 1,
      [Priority.MEDIUM]: 2,
      [Priority.HIGH]: 3
    }
    
    return (
      <div className="flex gap-1">
        {Array.from({ length: count[priority] }).map((_, i) => (
          <div key={i} className={cn('w-2 h-2 rounded-full', colors[priority])} />
        ))}
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
        estimatedHours: formData.estimatedHours,
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
      integrationMode === 'modal' && 'max-w-4xl mx-auto',
      integrationMode === 'panel' && 'w-full',
      integrationMode === 'inline' && 'border-transparent shadow-none'
    )}>
      
      {/* Advanced Header */}
      <div className="flex items-center justify-between p-6 border-b border-krushr-gray-border bg-gradient-to-r from-krushr-primary to-krushr-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <ClipboardListIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white font-manrope">
              Advanced Kanban Task
            </h3>
            <p className="text-white/80 font-manrope">
              Power user mode with full feature set
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <SettingsIcon className="h-4 w-4 mr-1" />
            Templates
          </Button>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Power User Form */}
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Essential Section */}
          <div className="border border-krushr-gray-border rounded-lg">
            <button
              type="button"
              onClick={() => toggleSection('essential')}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-krushr-gray-bg-light transition-colors"
            >
              <div className="flex items-center gap-2">
                <ClipboardListIcon className="h-5 h-5 text-krushr-primary" />
                <span className="text-lg font-medium text-krushr-gray-dark font-manrope">Essential Details</span>
              </div>
              {expandedSections.essential ? (
                <ChevronDownIcon className="h-4 w-4 text-krushr-gray" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-krushr-gray" />
              )}
            </button>
            
            {expandedSections.essential && (
              <div className="p-4 border-t border-krushr-gray-border space-y-4">
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
                    placeholder="Detailed task description with acceptance criteria..."
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="min-h-[100px] border-2 border-krushr-gray-border rounded-lg focus:border-krushr-primary font-manrope"
                    rows={4}
                  />
                </div>
                
                {/* Priority & Status Row */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Priority */}
                  <div>
                    <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
                      Priority
                    </Label>
                    <div className="space-y-1">
                      {Object.values(Priority).map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => updateField('priority', priority)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded border transition-all duration-200 font-manrope',
                            formData.priority === priority 
                              ? 'bg-krushr-primary/20 text-krushr-primary border-krushr-primary/30 ring-1 ring-krushr-primary/50'
                              : 'bg-white text-krushr-gray border-krushr-gray-border hover:bg-krushr-gray-bg'
                          )}
                        >
                          {renderPriorityDots(priority)}
                          <span>{priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}</span>
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
                      <SelectTrigger className="h-10 border-2 border-krushr-gray-border font-manrope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TaskStatus.TODO}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-krushr-gray"></div>
                            <span className="font-manrope">To Do</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-krushr-primary"></div>
                            <span className="font-manrope">In Progress</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={TaskStatus.DONE}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-krushr-success"></div>
                            <span className="font-manrope">Done</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Estimated Hours */}
                  <div>
                    <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      Estimated Hours
                    </Label>
                    <FloatingInput
                      type="number"
                      label="Hours"
                      value={formData.estimatedHours?.toString() || ''}
                      onChange={(e) => updateField('estimatedHours', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="h-10 border-2 border-krushr-gray-border font-manrope"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Scheduling Section */}
          <div className="border border-krushr-gray-border rounded-lg">
            <button
              type="button"
              onClick={() => toggleSection('scheduling')}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-krushr-gray-bg-light transition-colors"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 h-5 text-krushr-info" />
                <span className="text-lg font-medium text-krushr-gray-dark font-manrope">Scheduling & Deadlines</span>
              </div>
              {expandedSections.scheduling ? (
                <ChevronDownIcon className="h-4 w-4 text-krushr-gray" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-krushr-gray" />
              )}
            </button>
            
            {expandedSections.scheduling && (
              <div className="p-4 border-t border-krushr-gray-border space-y-4">
                {/* Start & Due Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
                      Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-10 justify-start text-left font-manrope border-2 border-krushr-gray-border"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "MMM dd, yyyy") : "Select start date"}
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
                  
                  <div>
                    <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
                      Due Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-10 justify-start text-left font-manrope border-2 border-krushr-gray-border"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(formData.endDate, "MMM dd, yyyy") : "Select due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => updateField('endDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {/* Recurring Tasks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-krushr-gray-dark font-manrope flex items-center gap-2">
                      <RepeatIcon className="w-4 h-4" />
                      Recurring Task
                    </Label>
                    <Switch 
                      checked={formData.recurring?.enabled || false}
                      onCheckedChange={(checked) => 
                        updateField('recurring', { ...formData.recurring, enabled: checked })
                      }
                    />
                  </div>
                  
                  {formData.recurring?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <Select 
                        value={formData.recurring.pattern} 
                        onValueChange={(value) => 
                          updateField('recurring', { ...formData.recurring, pattern: value as any })
                        }
                      >
                        <SelectTrigger className="h-10 border-2 border-krushr-gray-border font-manrope">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-10 justify-start text-left font-manrope border-2 border-krushr-gray-border"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.recurring.endDate ? format(formData.recurring.endDate, "MMM dd, yyyy") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.recurring.endDate}
                            onSelect={(date) => 
                              updateField('recurring', { ...formData.recurring, endDate: date })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Team Section */}
          <div className="border border-krushr-gray-border rounded-lg">
            <button
              type="button"
              onClick={() => toggleSection('team')}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-krushr-gray-bg-light transition-colors"
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 h-5 text-krushr-success" />
                <span className="text-lg font-medium text-krushr-gray-dark font-manrope">Team & Assignment</span>
              </div>
              {expandedSections.team ? (
                <ChevronDownIcon className="h-4 w-4 text-krushr-gray" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-krushr-gray" />
              )}
            </button>
            
            {expandedSections.team && (
              <div className="p-4 border-t border-krushr-gray-border space-y-4">
                {/* Assignee */}
                <div>
                  <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    Primary Assignee
                  </Label>
                  <Select 
                    value={formData.assigneeId || ''} 
                    onValueChange={(value) => updateField('assigneeId', value)}
                  >
                    <SelectTrigger className="h-10 border-2 border-krushr-gray-border font-manrope">
                      <SelectValue placeholder="Select assignee" />
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
                
                {/* Tags */}
                <div>
                  <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope flex items-center gap-1">
                    <TagIcon className="w-4 h-4" />
                    Tags & Labels
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
            )}
          </div>
          
          {/* Automation Section */}
          <div className="border border-krushr-gray-border rounded-lg">
            <button
              type="button"
              onClick={() => toggleSection('automation')}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-krushr-gray-bg-light transition-colors"
            >
              <div className="flex items-center gap-2">
                <ZapIcon className="h-5 h-5 text-krushr-warning" />
                <span className="text-lg font-medium text-krushr-gray-dark font-manrope">Automation & Workflow</span>
              </div>
              {expandedSections.automation ? (
                <ChevronDownIcon className="h-4 w-4 text-krushr-gray" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-krushr-gray" />
              )}
            </button>
            
            {expandedSections.automation && (
              <div className="p-4 border-t border-krushr-gray-border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-krushr-gray-dark font-manrope flex items-center gap-2">
                      <BellIcon className="w-4 h-4" />
                      Auto-notify team
                    </Label>
                    <Switch 
                      checked={formData.workflow.notifyTeam}
                      onCheckedChange={(checked) => 
                        updateField('workflow', { ...formData.workflow, notifyTeam: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-krushr-gray-dark font-manrope flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Create sub-board
                    </Label>
                    <Switch 
                      checked={formData.workflow.kanbanTaskBoard}
                      onCheckedChange={(checked) => 
                        updateField('workflow', { ...formData.workflow, kanbanTaskBoard: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-krushr-gray-dark font-manrope flex items-center gap-2">
                      <FileIcon className="w-4 h-4" />
                      Generate notes
                    </Label>
                    <Switch 
                      checked={formData.workflow.notes}
                      onCheckedChange={(checked) => 
                        updateField('workflow', { ...formData.workflow, notes: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-krushr-gray-dark font-manrope flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      Timeline tracking
                    </Label>
                    <Switch 
                      checked={formData.workflow.ganttTimeline}
                      onCheckedChange={(checked) => 
                        updateField('workflow', { ...formData.workflow, ganttTimeline: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {/* Advanced Footer */}
      <div className="flex items-center justify-between p-6 border-t border-krushr-gray-border bg-krushr-gray-bg-light">
        <div className="flex items-center gap-4">
          <span className="text-sm text-krushr-gray font-manrope">
            Create in: <span className="font-medium text-krushr-primary">Advanced Kanban Board</span>
          </span>
          <Separator orientation="vertical" className="h-4" />
          <Button 
            variant="ghost" 
            size="sm"
            className="text-krushr-gray hover:text-krushr-primary"
          >
            <FileIcon className="h-4 w-4 mr-1" />
            Save as Template
          </Button>
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
            className="px-6 py-2 bg-gradient-to-r from-krushr-primary to-krushr-secondary hover:from-krushr-primary/90 hover:to-krushr-secondary/90 text-white font-manrope shadow-krushr-button-dark"
          >
            {isLoading ? 'Creating...' : 'Create Advanced Task'}
          </Button>
        </div>
      </div>
      
    </div>
  )
}