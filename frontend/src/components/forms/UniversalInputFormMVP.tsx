
import React, { useState, useCallback } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns'
import { 
  XIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, 
  ClipboardListIcon, BoldIcon, ItalicIcon, ListIcon, LinkIcon, CodeIcon
} from 'lucide-react'

import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'

import { trpc } from '../../lib/trpc'
import { UniversalFormData, ContentType } from '../../types/universal-form'
import { Priority, TaskStatus } from '../../types/enums'
import { cn } from '../../lib/utils'

interface UniversalInputFormMVPProps {
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
  priority: Priority.HIGH,
  tags: ['frontend', 'auth'],
  status: TaskStatus.TODO,
  assigneeId: 'user1',
  checklist: ['Setup auth middleware', 'Create login forms', 'OAuth integration'],
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

export default function UniversalInputFormMVP({
  workspaceId,
  kanbanColumnId,
  initialData = {},
  onSuccess,
  onClose,
  integrationMode = 'modal'
}: UniversalInputFormMVPProps) {
  
  const [formData, setFormData] = useState<UniversalFormData>({
    ...DEFAULT_FORM_DATA,
    workspaceId,
    description: 'Implement user authentication system with email/password login, OAuth integration, and session management.',
    ...initialData
  })
  
  const [currentTag, setCurrentTag] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [calendarDate, setCalendarDate] = useState(new Date())
  
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
  
  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      updateField('checklist', [...(formData.checklist || []), newChecklistItem.trim()])
      setNewChecklistItem('')
    }
  }
  
  const toggleChecklistItem = (index: number) => {
    const updatedChecklist = [...(formData.checklist || [])]
    updatedChecklist.splice(index, 1)
    updateField('checklist', updatedChecklist)
  }
  
  const generateCalendarDays = () => {
    const start = startOfMonth(calendarDate)
    const end = endOfMonth(calendarDate)
    const days = eachDayOfInterval({ start, end })
    const startDay = getDay(start)
    
    const emptyDays = Array(startDay).fill(null)
    return [...emptyDays, ...days]
  }
  
  const handleDateSelect = (date: Date) => {
    updateField('startDate', date)
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
      integrationMode === 'modal' && 'max-w-4xl mx-auto',
      integrationMode === 'panel' && 'w-full',
      integrationMode === 'inline' && 'border-transparent shadow-none'
    )}>
      
      {/* Simple Header */}
      <div className="px-6 py-4 border-b border-krushr-gray-border rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 mr-4">
            <FloatingInput
              label="Task Title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="text-xl font-semibold bg-transparent border-transparent focus:border-krushr-primary font-manrope"
              placeholder=" "
              autoFocus
            />
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-krushr-gray hover:text-krushr-gray-dark p-2 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Power User Rapid Task Creation */}
      <div className="p-6 space-y-6">
        
        {/* Rich Text Description (Full Width) - MOVED ABOVE */}
        <div>
          <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
            Task Description
          </Label>
          <div className="border border-krushr-gray-border rounded-lg">
            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-krushr-gray-border bg-krushr-gray-bg-light">
              <button className="p-1.5 hover:bg-white rounded text-krushr-gray-dark hover:text-krushr-primary transition-colors" title="Bold">
                <BoldIcon className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white rounded text-krushr-gray-dark hover:text-krushr-primary transition-colors" title="Italic">
                <ItalicIcon className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white rounded text-krushr-gray-dark hover:text-krushr-primary transition-colors" title="List">
                <ListIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-krushr-gray-border mx-1"></div>
              <button className="p-1.5 hover:bg-white rounded text-krushr-gray-dark hover:text-krushr-primary transition-colors" title="Link">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white rounded text-krushr-gray-dark hover:text-krushr-primary transition-colors" title="Code">
                <CodeIcon className="w-4 h-4" />
              </button>
            </div>
            <Textarea
              rows={3}
              placeholder="Describe the task in detail..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full p-3 border-none resize-none focus:outline-none focus:ring-0 font-manrope text-sm"
            />
          </div>
        </div>
        
        {/* Two-Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Left Column: Quick Controls */}
          <div className="space-y-4">
            
            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
                  Priority
                </Label>
                <div className="flex gap-1">
                  <button 
                    onClick={() => updateField('priority', Priority.HIGH)}
                    className={cn(
                      'flex-1 px-2 py-1 rounded text-xs font-medium font-manrope transition-colors',
                      formData.priority === Priority.HIGH
                        ? 'bg-krushr-secondary text-white'
                        : 'border border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-secondary/10'
                    )}
                  >
                    High
                  </button>
                  <button 
                    onClick={() => updateField('priority', Priority.MEDIUM)}
                    className={cn(
                      'flex-1 px-2 py-1 rounded text-xs font-medium font-manrope transition-colors',
                      formData.priority === Priority.MEDIUM
                        ? 'bg-krushr-warning text-white'
                        : 'border border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-warning/10'
                    )}
                  >
                    Med
                  </button>
                  <button 
                    onClick={() => updateField('priority', Priority.LOW)}
                    className={cn(
                      'flex-1 px-2 py-1 rounded text-xs font-medium font-manrope transition-colors',
                      formData.priority === Priority.LOW
                        ? 'bg-krushr-gray text-white'
                        : 'border border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-gray/10'
                    )}
                  >
                    Low
                  </button>
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
                  Status
                </Label>
                <div className="flex gap-1">
                  <button 
                    onClick={() => updateField('status', TaskStatus.TODO)}
                    className={cn(
                      'flex-1 px-2 py-1 rounded text-xs font-medium font-manrope transition-colors',
                      formData.status === TaskStatus.TODO
                        ? 'bg-krushr-gray text-white'
                        : 'border border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-gray/10'
                    )}
                  >
                    Todo
                  </button>
                  <button 
                    onClick={() => updateField('status', TaskStatus.IN_PROGRESS)}
                    className={cn(
                      'flex-1 px-2 py-1 rounded text-xs font-medium font-manrope transition-colors',
                      formData.status === TaskStatus.IN_PROGRESS
                        ? 'bg-krushr-primary text-white'
                        : 'border border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-primary/10'
                    )}
                  >
                    Doing
                  </button>
                  <button 
                    onClick={() => updateField('status', TaskStatus.DONE)}
                    className={cn(
                      'flex-1 px-2 py-1 rounded text-xs font-medium font-manrope transition-colors',
                      formData.status === TaskStatus.DONE
                        ? 'bg-krushr-success text-white'
                        : 'border border-krushr-gray-border text-krushr-gray-dark hover:bg-krushr-success/10'
                    )}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
            
            {/* Assignee */}
            <div>
              <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
                Assignee
              </Label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateField('assigneeId', 'user1')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-manrope transition-colors',
                    formData.assigneeId === 'user1'
                      ? 'bg-krushr-primary/10 border border-krushr-primary text-krushr-primary'
                      : 'border border-krushr-gray-border hover:bg-krushr-primary/5'
                  )}
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    J
                  </div>
                  John Doe
                </button>
                <button 
                  onClick={() => updateField('assigneeId', '')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-manrope transition-colors',
                    !formData.assigneeId
                      ? 'bg-krushr-primary/10 border border-krushr-primary text-krushr-primary'
                      : 'border border-krushr-gray-border hover:bg-krushr-primary/5'
                  )}
                >
                  <UserIcon className="w-4 h-4 text-krushr-gray" />
                  Assign
                </button>
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
                Tags
              </Label>
              <div className="flex gap-1 flex-wrap mb-2">
                {formData.tags.map((tag) => (
                  <Badge 
                    key={tag}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-manrope cursor-pointer',
                      tag === 'frontend' && 'bg-krushr-primary/10 text-krushr-primary',
                      tag === 'auth' && 'bg-krushr-secondary/10 text-krushr-secondary',
                      !['frontend', 'auth'].includes(tag) && 'bg-krushr-gray/10 text-krushr-gray'
                    )}
                  >
                    {tag}
                    <XIcon 
                      className="w-3 h-3 cursor-pointer hover:opacity-70" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
                <button 
                  onClick={addTag}
                  className="px-2 py-1 border border-dashed border-krushr-gray-border rounded text-xs font-manrope text-krushr-gray hover:text-krushr-primary transition-colors"
                >
                  + Tag
                </button>
              </div>
              {/* Hidden input for new tags */}
              <div className="hidden">
                <FloatingInput
                  label="New tag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            
            {/* Checklist */}
            <div>
              <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
                Checklist
              </Label>
              <div className="border border-krushr-gray-border rounded-lg p-3 space-y-2">
                {formData.checklist?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      onChange={() => toggleChecklistItem(index)}
                    />
                    <span className="flex-1 text-sm font-manrope">{item}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <FloatingInput
                    label="Add item"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                    className="h-8 text-xs flex-1"
                  />
                  <button 
                    onClick={addChecklistItem}
                    className="text-sm text-krushr-primary hover:text-krushr-primary/80 font-manrope"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Right Column: Calendar */}
          <div>
            <Label className="block text-sm font-medium text-krushr-gray-dark mb-2 font-manrope">
              Due Date
            </Label>
            <div className="border border-krushr-gray-border rounded-lg p-4">
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                  className="p-1 hover:bg-krushr-gray-bg rounded transition-colors text-krushr-gray hover:text-krushr-primary"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <h3 className="text-base font-semibold text-krushr-gray-dark font-manrope">
                  {format(calendarDate, 'MMMM yyyy')}
                </h3>
                <button 
                  onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                  className="p-1 hover:bg-krushr-gray-bg rounded transition-colors text-krushr-gray hover:text-krushr-primary"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-xs font-medium text-krushr-gray p-1 font-manrope">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {generateCalendarDays().map((day, index) => (
                  <div key={index} className="text-xs p-1">
                    {day ? (
                      <button
                        onClick={() => handleDateSelect(day)}
                        className={cn(
                          'w-6 h-6 rounded font-medium transition-all duration-200 font-manrope',
                          isSameDay(day, formData.startDate || new Date('1900-01-01'))
                            ? 'bg-krushr-primary text-white shadow-sm'
                            : isToday(day)
                            ? 'bg-krushr-primary/20 text-krushr-primary border border-krushr-primary/30'
                            : 'text-krushr-gray-dark hover:bg-krushr-gray-bg'
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    ) : (
                      <div className="w-6 h-6"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Quick Date Actions */}
              <div className="flex gap-1 mt-3 pt-3 border-t border-krushr-gray-border">
                <button 
                  onClick={() => handleDateSelect(new Date())}
                  className="flex-1 px-2 py-1 text-xs bg-krushr-gray-bg text-krushr-gray-dark rounded hover:bg-krushr-primary hover:text-white transition-colors font-manrope"
                >
                  Today
                </button>
                <button 
                  onClick={() => {
                    const tomorrow = new Date()
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    handleDateSelect(tomorrow)
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-krushr-gray-bg text-krushr-gray-dark rounded hover:bg-krushr-primary hover:text-white transition-colors font-manrope"
                >
                  +1
                </button>
                <button 
                  onClick={() => {
                    const nextWeek = new Date()
                    nextWeek.setDate(nextWeek.getDate() + 7)
                    handleDateSelect(nextWeek)
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-krushr-gray-bg text-krushr-gray-dark rounded hover:bg-krushr-primary hover:text-white transition-colors font-manrope"
                >
                  +7
                </button>
              </div>
              
            </div>
          </div>
          
        </div>
        
      </div>
      
      {/* Footer Actions */}
      <div className="flex items-center justify-between p-6 border-t border-krushr-gray-border bg-krushr-gray-bg-light">
        <div className="flex items-center gap-2">
          <span className="text-sm text-krushr-gray font-manrope">
            MVP Rapid Creation: <span className="font-medium text-krushr-primary">Minimal Dropdowns</span>
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