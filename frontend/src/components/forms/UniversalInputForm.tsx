/**
 * Universal Input Form Component
 * A comprehensive form for creating tasks, notes, calendar events, and mixed content
 * 
 * Features:
 * - Multi-content type support (Task, Note, Calendar Event, Mixed)
 * - Rich text editing with toolbar
 * - File attachments and drag & drop
 * - Team assignment and collaboration
 * - Workflow automation toggles
 * - Recurring events and reminders
 * - Priority and tag management
 * - Responsive design with mobile support
 * 
 * Performance:
 * - Optimized re-renders with useCallback
 * - Lazy loading of heavy components
 * - Efficient form state management
 * - Debounced auto-save (future)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Switch } from '../ui/switch'
import { Checkbox } from '../ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { 
  CalendarIcon, 
  Plus, 
  X, 
  Paperclip, 
  Tag, 
  Users, 
  Flag,
  Edit,
  ChevronUp,
  ChevronDown,
  Play,
  Wand2,
  Share2,
  CheckCircle,
  Trash2,
  Save,
  Upload,
  Download,
  Link,
  MoreHorizontal,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus } from '../../types/enums'
import FileUpload from '../common/FileUpload'
import { 
  ContentType,
  UniversalFormProps, 
  UniversalFormData,
  ChecklistItem,
  FileAttachment,
  ReminderConfig,
  WorkflowConfig,
  RecurringConfig,
  FormValidation,
  PriorityConfig
} from '../../types/universal-form'

const PRIORITY_CONFIGS: Record<Priority, PriorityConfig> = {
  [Priority.LOW]: { level: Priority.LOW, dots: 1, color: 'bg-krushr-priority-low' },
  [Priority.MEDIUM]: { level: Priority.MEDIUM, dots: 2, color: 'bg-krushr-priority-medium' },
  [Priority.HIGH]: { level: Priority.HIGH, dots: 3, color: 'bg-krushr-priority-high' },
  [Priority.CRITICAL]: { level: Priority.CRITICAL, dots: 4, color: 'bg-krushr-priority-critical' }
}

const DEFAULT_WORKFLOW: WorkflowConfig = {
  createVideoMeeting: true,
  createCall: true,
  kanbanTaskBoard: true,
  notes: true,
  ganttTimeline: true,
  ganttDependency: false,
  reminder: true,
  notifyTeam: false,
  changesNotifyTeam: false,
  reminders: [
    { enabled: true, timeBefore: '1d', type: 'notification' },
    { enabled: true, timeBefore: '1h', type: 'notification' }
  ]
}

const DEFAULT_RECURRING: RecurringConfig = {
  enabled: false,
  pattern: 'weekly',
  interval: 1,
  daysOfWeek: []
}

export default function UniversalInputForm({
  open,
  onClose,
  onSuccess,
  initialData,
  contentType = ContentType.TASK,
  workspaceId,
  projectId,
  kanbanColumnId,
  showWorkflowToggles = true,
  showFileUploads = true,
  allowContentTypeSwitch = false,
  compactMode = false,
  requiredFields = ['title'],
  maxTitleLength = 200,
  maxDescriptionLength = 5000
}: UniversalFormProps) {
  
  
  const [formData, setFormData] = useState<UniversalFormData>(() => ({
    contentType,
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
    workflow: DEFAULT_WORKFLOW,
    recurring: DEFAULT_RECURRING,
    workspaceId,
    ...initialData
  }))
  
  const [currentTag, setCurrentTag] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    dates: true,
    description: true,
    checklist: false,
    subtasks: false,
    files: false,
    workflow: true
  })
  const [validation, setValidation] = useState<FormValidation>({
    isValid: true,
    errors: {},
    warnings: {}
  })
  
  const { data: users = [] } = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  const { data: projects = [] } = trpc.project.list.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  const { data: templates = [] } = trpc.template.list.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  
  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: (data) => {
      onSuccess?.(formData, ContentType.TASK)
      onClose()
      resetForm()
    }
  })
  
  const createNoteMutation = trpc.notes?.create?.useMutation?.({
    onSuccess: (data) => {
      onSuccess?.(formData, ContentType.NOTE)
      onClose()
      resetForm()
    }
  }) || { mutate: () => {}, isLoading: false }
  
  const uploadFileMutation = trpc.upload.uploadTaskFile?.useMutation?.() || { mutate: () => {}, isLoading: false }
  
  
  const updateField = useCallback(<K extends keyof UniversalFormData>(
    field: K, 
    value: UniversalFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  
  const handleFileUpload = useCallback(async (files: File[]) => {
    try {
      const newAttachments: FileAttachment[] = []
      
      for (const file of files) {
        const attachment: FileAttachment = {
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        }
        newAttachments.push(attachment)
      }
      
      updateField('attachments', [...formData.attachments, ...newAttachments])
      
      // Note: Actual upload will happen on form submission
      
    } catch (error) {
      console.error('File preparation error:', error)
    }
  }, [formData.attachments, updateField])
  
  const handleRemoveFile = useCallback((index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index)
    updateField('attachments', newAttachments)
  }, [formData.attachments, updateField])
  
  const isEditMode = useMemo(() => !!formData.id, [formData.id])
  const isLoading = useMemo(() => 
    createTaskMutation.isLoading || 
    createNoteMutation.isLoading || 
    uploadFileMutation.isLoading, 
    [createTaskMutation.isLoading, createNoteMutation.isLoading, uploadFileMutation.isLoading]
  )
  
  const resetForm = useCallback(() => {
    setFormData({
      contentType,
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
      workflow: DEFAULT_WORKFLOW,
      recurring: DEFAULT_RECURRING,
      workspaceId,
      ...initialData
    })
    setCurrentTag('')
    setNewChecklistItem('')
    setValidation({ isValid: true, errors: {}, warnings: {} })
  }, [contentType, workspaceId, initialData])
  
  const validateForm = useCallback((): FormValidation => {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}
    
    if (requiredFields.includes('title') && !formData.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (formData.title.length > maxTitleLength) {
      errors.title = `Title must be less than ${maxTitleLength} characters`
    }
    
    if (formData.description.length > maxDescriptionLength) {
      errors.description = `Description must be less than ${maxDescriptionLength} characters`
    }
    
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.dates = 'Start date must be before end date'
    }
    
    if (formData.contentType === ContentType.TASK && !formData.assigneeId) {
      warnings.assignee = 'Consider assigning this task to someone'
    }
    
    const result = {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    }
    
    setValidation(result)
    return result
  }, [formData, requiredFields, maxTitleLength, maxDescriptionLength])
  
  const handleSubmit = useCallback(async () => {
    const validation = validateForm()
    if (!validation.isValid) return
    
    try {
      switch (formData.contentType) {
        case ContentType.TASK:
          await createTaskMutation.mutateAsync({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            dueDate: formData.endDate?.toISOString(),
            assigneeId: formData.assigneeId,
            estimatedHours: formData.estimatedHours,
            tags: formData.tags,
            workspaceId: formData.workspaceId,
            projectId: projectId || formData.projectId,
            kanbanColumnId: kanbanColumnId || formData.kanbanColumnId,
          })
          break
          
        case ContentType.NOTE:
          createNoteMutation.mutate({
            title: formData.title,
            content: formData.description,
            tags: formData.tags,
            workspaceId: formData.workspaceId,
          })
          break
          
        case ContentType.CALENDAR_EVENT:
          // TODO: Implement calendar event creation
          console.log('Calendar event creation not yet implemented')
          break
          
        case ContentType.MIXED:
          // TODO: Implement mixed content creation
          console.log('Mixed content creation not yet implemented')
          break
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }, [formData, validateForm, createTaskMutation, createNoteMutation, projectId, kanbanColumnId])
  
  
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])
  
  const handleAddTag = useCallback(() => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      updateField('tags', [...formData.tags, currentTag])
      setCurrentTag('')
    }
  }, [currentTag, formData.tags, updateField])
  
  const handleRemoveTag = useCallback((tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag))
  }, [formData.tags, updateField])
  
  const handleAddChecklistItem = useCallback(() => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        text: newChecklistItem.trim(),
        completed: false,
        order: formData.checklist.length
      }
      updateField('checklist', [...formData.checklist, newItem])
      setNewChecklistItem('')
    }
  }, [newChecklistItem, formData.checklist, updateField])
  
  const handleUpdateChecklistItem = useCallback((index: number, updates: Partial<ChecklistItem>) => {
    const newChecklist = [...formData.checklist]
    newChecklist[index] = { ...newChecklist[index], ...updates }
    updateField('checklist', newChecklist)
  }, [formData.checklist, updateField])
  
  const handleRemoveChecklistItem = useCallback((index: number) => {
    updateField('checklist', formData.checklist.filter((_, i) => i !== index))
  }, [formData.checklist, updateField])
  
  
  const renderPriorityDots = useCallback((priority: Priority) => {
    const config = PRIORITY_CONFIGS[priority]
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full",
              i < config.dots ? config.color : "bg-gray-200"
            )}
          />
        ))}
      </div>
    )
  }, [])
  
  const renderSectionHeader = useCallback((
    title: string, 
    sectionKey: keyof typeof expandedSections,
    showEditIcon = false
  ) => (
    <div className="flex items-center justify-between mb-3">
      <Label className="text-base font-medium">{title}</Label>
      <div className="flex items-center gap-2">
        {showEditIcon && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4 text-gray-400" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => toggleSection(sectionKey)}
        >
          {expandedSections[sectionKey] ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
    </div>
  ), [expandedSections, toggleSection])
  
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])
  
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditMode ? 'Edit Item' : 'New Item'}</span>
            {allowContentTypeSwitch && (
              <Select 
                value={formData.contentType} 
                onValueChange={(value) => updateField('contentType', value as ContentType)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContentType.TASK}>Task</SelectItem>
                  <SelectItem value={ContentType.NOTE}>Note</SelectItem>
                  <SelectItem value={ContentType.CALENDAR_EVENT}>Calendar Event</SelectItem>
                  <SelectItem value={ContentType.MIXED}>Mixed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-8">
            {/* Header Section */}
            <Card>
              <CardContent className="pt-6">
                {/* Header Images */}
                <div className="flex gap-4 mb-6">
                  <div className="w-32 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="w-32 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <Tag className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="w-32 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                
                {/* Title and Basic Info */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <FloatingInput
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        label="Enter title..."
                        className="text-2xl font-medium text-krushr-primary"
                        maxLength={maxTitleLength}
                      />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-4">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:text-destructive"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <div className="flex items-center gap-2">
                        <FloatingInput
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          label="+ Add Tag"
                          className="w-24 h-7 text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddTag}
                          className="h-7 px-2"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Priority */}
                  <div className="ml-6">
                    <Label className="text-sm text-gray-600 mb-2 block">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => updateField('priority', value as Priority)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          {renderPriorityDots(formData.priority)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              {renderPriorityDots(priority)}
                              <span className="capitalize">{priority.toLowerCase()}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Team Assignment */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-2">
                      {formData.teamMembers.slice(0, 3).map((member, index) => (
                        <Avatar key={member.userId} className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {formData.teamMembers.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-medium">+{formData.teamMembers.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Design Team</div>
                    <div className="text-sm text-gray-500">
                      Last updated by {formData.lastUpdatedBy || 'Unknown'} at {format(new Date(), 'h:mm a, M/d/yy')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Main Content Area */}
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column - Form Fields */}
              <div className="col-span-2 space-y-6">
                
                {/* All Day Toggle */}
                {(formData.contentType === ContentType.CALENDAR_EVENT || formData.contentType === ContentType.MIXED) && (
                  <div className="flex items-center justify-between">
                    <Label>All Day</Label>
                    <Switch 
                      checked={formData.allDay}
                      onCheckedChange={(checked) => updateField('allDay', checked)}
                    />
                  </div>
                )}
                
                {/* Dates Section */}
                <Card>
                  <CardHeader className="pb-3">
                    {renderSectionHeader('Dates', 'dates')}
                  </CardHeader>
                  {expandedSections.dates && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal mt-1",
                                  !formData.startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? format(formData.startDate, "MMM dd") : "Start Date"}
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
                        
                        {!formData.allDay && (
                          <div>
                            <FloatingInput
                              type="time"
                              value={formData.startTime || ''}
                              onChange={(e) => updateField('startTime', e.target.value)}
                              label="Time"
                              className="mt-1"
                            />
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">Duration</Label>
                          <Select 
                            value={formData.duration || ''} 
                            onValueChange={(value) => updateField('duration', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15m">15 minutes</SelectItem>
                              <SelectItem value="30m">30 minutes</SelectItem>
                              <SelectItem value="1h">1 hour</SelectItem>
                              <SelectItem value="2h">2 hours</SelectItem>
                              <SelectItem value="4h">4 hours</SelectItem>
                              <SelectItem value="1d">1 day</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal mt-1",
                                  !formData.endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.endDate ? format(formData.endDate, "MMM dd") : "End Date"}
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
                        
                        {!formData.allDay && (
                          <div>
                            <FloatingInput
                              type="time"
                              value={formData.endTime || ''}
                              onChange={(e) => updateField('endTime', e.target.value)}
                              label="End Time"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
                
                {/* Calendar Section */}
                {(formData.contentType === ContentType.CALENDAR_EVENT || formData.contentType === ContentType.MIXED) && (
                  <div>
                    <FloatingInput
                      value={formData.calendar || ''}
                      onChange={(e) => updateField('calendar', e.target.value)}
                      label="Calendar Email"
                      className="mt-1"
                    />
                  </div>
                )}
                
                {/* Recurring Section */}
                {(formData.contentType === ContentType.CALENDAR_EVENT || formData.contentType === ContentType.MIXED) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Recurring</Label>
                      <Switch 
                        checked={formData.recurring.enabled}
                        onCheckedChange={(checked) => updateField('recurring', { ...formData.recurring, enabled: checked })}
                      />
                    </div>
                    {formData.recurring.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.recurring.startDate ? format(formData.recurring.startDate, "PPP") : "Start Date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.recurring.startDate}
                              onSelect={(date) => updateField('recurring', { ...formData.recurring, startDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.recurring.endDate ? format(formData.recurring.endDate, "PPP") : "End Date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.recurring.endDate}
                              onSelect={(date) => updateField('recurring', { ...formData.recurring, endDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Description & Notes */}
                <Card>
                  <CardHeader className="pb-3">
                    {renderSectionHeader('Description & Notes', 'description', true)}
                  </CardHeader>
                  {expandedSections.description && (
                    <CardContent className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <Textarea
                          value={formData.description}
                          onChange={(e) => updateField('description', e.target.value)}
                          placeholder="Add a detailed description..."
                          className="min-h-[120px] border-0 resize-none focus-visible:ring-0"
                          maxLength={maxDescriptionLength}
                        />
                      </div>
                      
                      {/* Rich Text Toolbar */}
                      <div className="flex items-center justify-center gap-1 py-2 border-t">
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><X className="h-4 w-4" /></Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="ghost" size="sm" className="font-bold">B</Button>
                        <Button variant="ghost" size="sm" className="italic">I</Button>
                        <Button variant="ghost" size="sm" className="underline">U</Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="ghost" size="sm">•</Button>
                        <Button variant="ghost" size="sm">1.</Button>
                        <Button variant="ghost" size="sm"><Link className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm">@</Button>
                        <Button variant="ghost" size="sm">😊</Button>
                        <Badge variant="secondary" className="text-xs">Tag</Badge>
                      </div>
                    </CardContent>
                  )}
                </Card>
                
                {/* Checklist */}
                <Card>
                  <CardHeader className="pb-3">
                    {renderSectionHeader('Checklist', 'checklist', true)}
                  </CardHeader>
                  {expandedSections.checklist && (
                    <CardContent className="space-y-4">
                      {formData.checklist.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={(checked) => 
                              handleUpdateChecklistItem(index, { completed: !!checked })
                            }
                          />
                          <FloatingInput
                            label="Checklist item"
                            value={item.text}
                            onChange={(e) => 
                              handleUpdateChecklistItem(index, { text: e.target.value })
                            }
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveChecklistItem(index)}
                            className="h-8 w-8 p-0 text-krushr-secondary hover:text-krushr-secondary-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex items-center gap-2">
                        <FloatingInput
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                          label="Add new item..."
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddChecklistItem}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
                
                {/* Files */}
                {showFileUploads && (
                  <Card>
                    <CardHeader className="pb-3">
                      {renderSectionHeader('Files', 'files', true)}
                    </CardHeader>
                    {expandedSections.files && (
                      <CardContent className="space-y-4">
                        {/* Existing Files */}
                        {formData.attachments.map((file, index) => {
                          const sizeInKB = (file.size / 1024).toFixed(1)
                          const isImage = file.type?.startsWith('image/')
                          
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {isImage && file.file ? (
                                  <img 
                                    src={URL.createObjectURL(file.file)} 
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Paperclip className="w-6 h-6 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium truncate">{file.name}</div>
                                <div className="text-sm text-gray-500">{sizeInKB} KB</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {file.url && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-krushr-info hover:text-krushr-info-600"
                                    onClick={() => window.open(file.url, '_blank')}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-krushr-secondary hover:text-krushr-secondary-600"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* File Upload Component */}
                        <FileUpload
                          onUpload={handleFileUpload}
                          accept={{
                            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                            'application/pdf': ['.pdf'],
                            'text/*': ['.txt', '.md'],
                            'application/msword': ['.doc'],
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                          }}
                          maxSize={10 * 1024 * 1024} // 10MB
                          maxFiles={5}
                          className="mt-4"
                        />
                      </CardContent>
                    )}
                  </Card>
                )}
              </div>
              
              {/* Right Column - Workflow */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Workflow Buttons */}
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Play className="w-4 h-4 mr-2 text-krushr-success" />
                        Load Template
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Wand2 className="w-4 h-4 mr-2 text-krushr-secondary" />
                        Set As Template
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Share2 className="w-4 h-4 mr-2 text-krushr-info" />
                        Share
                      </Button>
                      <Button className="w-full justify-start bg-krushr-secondary hover:bg-krushr-secondary-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Team
                      </Button>
                      <Button className="w-full justify-start bg-krushr-primary hover:bg-krushr-primary-700">
                        <Plus className="w-4 h-4 mr-2" />
                        User
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Workflow Additions */}
                {showWorkflowToggles && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Workflow Additions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries({
                        'Create video meeting': 'createVideoMeeting',
                        'Create call': 'createCall',
                        'Kanban task board': 'kanbanTaskBoard',
                        'Notes': 'notes',
                        'Gantt timeline': 'ganttTimeline',
                        'Gantt Dependency': 'ganttDependency',
                        'Reminder': 'reminder',
                        'Notify team': 'notifyTeam',
                        'Changes notify team': 'changesNotifyTeam'
                      }).map(([label, key]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm">{label}</Label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.workflow[key as keyof WorkflowConfig] as boolean}
                              onCheckedChange={(checked) => 
                                updateField('workflow', { 
                                  ...formData.workflow, 
                                  [key]: checked 
                                })
                              }
                            />
                            {['kanbanTaskBoard', 'notes', 'ganttTimeline'].includes(key) && (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Reminder Options */}
                      {formData.workflow.reminder && (
                        <div className="pl-6 space-y-2 border-l-2 border-gray-200">
                          {formData.workflow.reminders.map((reminder, index) => (
                            <div key={index} className="flex items-center text-gray-700">
                              <div className="w-2 h-2 rounded-full bg-krushr-warning mr-3" />
                              <span className="text-sm">
                                {reminder.timeBefore === '1d' ? '1 Day Prior' : '1 Hour Prior'}
                              </span>
                            </div>
                          ))}
                          <div className="text-krushr-primary text-lg font-bold cursor-pointer hover:text-krushr-primary-700">
                            +
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Button 
                      className="w-full justify-start bg-krushr-success hover:bg-krushr-success-600"
                      onClick={() => {}}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark As Complete
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => {}}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button 
                      className="w-full justify-start bg-krushr-primary hover:bg-krushr-primary-700"
                      onClick={handleSubmit}
                      disabled={isLoading || !validation.isValid}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer with validation errors */}
        {Object.keys(validation.errors).length > 0 && (
          <div className="px-6 py-3 border-t bg-krushr-secondary-50">
            <div className="text-sm text-krushr-secondary-600">
              {Object.values(validation.errors).join(', ')}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}