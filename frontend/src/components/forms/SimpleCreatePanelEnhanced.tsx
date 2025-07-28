import React, { useReducer, useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus, TaskComplexity, TaskRiskLevel } from '../../types/enums'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { format, addDays, addWeeks } from 'date-fns'
import { 
  Calendar as CalendarIcon,
  User,
  Plus,
  X,
  Upload,
  Loader2,
  Tag,
  Briefcase,
  Clock,
  Target,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Repeat,
  GitBranch,
  FileText,
  ChevronDown,
  Circle,
  CheckCircle2,
  AlertCircle,
  Timer,
  Link2,
  Ban,
  Eye,
  Lock,
  Archive,
  Zap
} from 'lucide-react'
import { RichTextEditor } from '../ui/rich-text-editor'

interface SimpleCreatePanelProps {
  workspaceId: string
  kanbanColumnId?: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

type FormState = {
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  projectId: string | null
  assigneeId: string | null
  dueDate: Date | null
  startDate: Date | null
  storyPoints: number | null
  businessValue: number | null
  tags: string[]
  estimatedHours: number | null
  complexity: TaskComplexity | null
  riskLevel: TaskRiskLevel | null
  isRecurring: boolean
  recurringPattern: string | null
  epicId: string | null
  dependsOnTaskIds: string[]
  blockedByTaskIds: string[]
  attachments: Array<{
    id: string
    name: string
    size: number
    type: string
    progress?: number
    error?: string
    file?: File
    url?: string
  }>
  isPrivate: boolean
  isArchived: boolean
  isTemplate: boolean
  autoAssign: boolean
  watchers: string[]
  customFields: Record<string, any>
  isBlocked: boolean
  blockedBy: string | null
  blockedReason: string | null
}

type FormAction = 
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'ADD_TAG'; tag: string }
  | { type: 'REMOVE_TAG'; tag: string }
  | { type: 'ADD_ATTACHMENT'; attachment: any }
  | { type: 'REMOVE_ATTACHMENT'; id: string }
  | { type: 'UPDATE_ATTACHMENT'; id: string; updates: any }
  | { type: 'ADD_WATCHER'; userId: string }
  | { type: 'REMOVE_WATCHER'; userId: string }
  | { type: 'ADD_DEPENDENCY'; taskId: string }
  | { type: 'REMOVE_DEPENDENCY'; taskId: string }
  | { type: 'RESET_FORM' }

const initialState: FormState = {
  title: '',
  description: '',
  priority: Priority.MEDIUM,
  status: TaskStatus.TODO,
  projectId: null,
  assigneeId: null,
  dueDate: null,
  startDate: null,
  storyPoints: null,
  businessValue: null,
  tags: [],
  estimatedHours: null,
  complexity: null,
  riskLevel: null,
  isRecurring: false,
  recurringPattern: null,
  epicId: null,
  dependsOnTaskIds: [],
  blockedByTaskIds: [],
  attachments: [],
  isPrivate: false,
  isArchived: false,
  isTemplate: false,
  autoAssign: false,
  watchers: [],
  customFields: {},
  isBlocked: false,
  blockedBy: null,
  blockedReason: null
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.tag] }
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter(t => t !== action.tag) }
    case 'ADD_ATTACHMENT':
      return { ...state, attachments: [...state.attachments, action.attachment] }
    case 'REMOVE_ATTACHMENT':
      return { ...state, attachments: state.attachments.filter(a => a.id !== action.id) }
    case 'UPDATE_ATTACHMENT':
      return {
        ...state,
        attachments: state.attachments.map(a =>
          a.id === action.id ? { ...a, ...action.updates } : a
        )
      }
    case 'ADD_WATCHER':
      return { ...state, watchers: [...state.watchers, action.userId] }
    case 'REMOVE_WATCHER':
      return { ...state, watchers: state.watchers.filter(id => id !== action.userId) }
    case 'ADD_DEPENDENCY':
      return { ...state, dependsOnTaskIds: [...state.dependsOnTaskIds, action.taskId] }
    case 'REMOVE_DEPENDENCY':
      return { ...state, dependsOnTaskIds: state.dependsOnTaskIds.filter(id => id !== action.taskId) }
    case 'RESET_FORM':
      return initialState
    default:
      return state
  }
}

// Priority Dots Component with hover preview
const PrioritySelector = React.memo(({ 
  value, 
  onChange 
}: { 
  value: Priority
  onChange: (priority: Priority) => void 
}) => {
  const [hoveredPriority, setHoveredPriority] = useState<Priority | null>(null)
  
  const priorities = [
    { value: Priority.LOW, color: 'bg-krushr-priority-low', label: 'Low Priority' },
    { value: Priority.MEDIUM, color: 'bg-krushr-priority-medium', label: 'Medium Priority' },
    { value: Priority.HIGH, color: 'bg-krushr-priority-high', label: 'High Priority' }
  ]

  const getPriorityIndex = (priority: Priority) => {
    return priorities.findIndex(p => p.value === priority)
  }

  const currentIndex = getPriorityIndex(value)
  const hoveredIndex = hoveredPriority ? getPriorityIndex(hoveredPriority) : -1

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-krushr-gray-dark">Priority:</span>
      <div className="flex gap-1" onMouseLeave={() => setHoveredPriority(null)}>
        {priorities.map((priority, index) => {
          const isActive = index <= currentIndex
          const isHovered = hoveredIndex >= 0 && index <= hoveredIndex
          
          return (
            <button
              key={priority.value}
              type="button"
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-200 shadow-sm",
                isActive && !hoveredPriority ? priority.color : "bg-krushr-gray-300",
                isHovered ? priority.color : "",
                "hover:scale-125"
              )}
              title={priority.label}
              onMouseEnter={() => setHoveredPriority(priority.value)}
              onClick={() => onChange(priority.value)}
            />
          )
        })}
      </div>
      <span className="text-xs text-krushr-gray ml-1">
        {hoveredPriority || value}
      </span>
    </div>
  )
})

PrioritySelector.displayName = 'PrioritySelector'

// Status Column Button Component
const StatusColumnButton = React.memo(({ 
  status, 
  label, 
  icon: Icon, 
  isSelected, 
  onClick,
  color 
}: {
  status: TaskStatus
  label: string
  icon: React.ElementType
  isSelected: boolean
  onClick: () => void
  color: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200",
      "flex flex-col items-center gap-2",
      isSelected 
        ? `${color} border-transparent shadow-elevation-sm text-white` 
        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </button>
))

StatusColumnButton.displayName = 'StatusColumnButton'

export default function SimpleCreatePanel({
  workspaceId,
  kanbanColumnId,
  open,
  onClose,
  onSuccess
}: SimpleCreatePanelProps) {
  const [state, dispatch] = useReducer(formReducer, initialState)
  const [isCreating, setIsCreating] = useState(false)
  const [showNewTag, setShowNewTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Queries
  const workspaceMembersQuery = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId },
    { 
      enabled: open && !!workspaceId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000
    }
  )
  const workspaceMembers = workspaceMembersQuery.data || []

  const projectsQuery = trpc.project.listByWorkspace.useQuery(
    { workspaceId },
    { 
      enabled: open && !!workspaceId,
      staleTime: 5 * 60 * 1000
    }
  )
  const projects = projectsQuery.data || []

  // TODO: Add epic query when available
  const epics: any[] = []

  // Predefined tags for now
  const existingTags = [
    { id: '1', name: 'urgent' },
    { id: '2', name: 'bug' },
    { id: '3', name: 'feature' },
    { id: '4', name: 'enhancement' },
    { id: '5', name: 'documentation' },
    { id: '6', name: 'frontend' },
    { id: '7', name: 'backend' },
    { id: '8', name: 'design' },
    { id: '9', name: 'testing' },
    { id: '10', name: 'devops' }
  ]

  // Mutations
  const createTaskMutation = trpc.task.createEnhanced.useMutation({
    onSuccess: () => {
      dispatch({ type: 'RESET_FORM' })
      onSuccess?.()
      onClose()
    }
  })

  // TODO: Add file upload mutation when available
  // const uploadMutation = trpc.upload.single.useMutation()

  // Callbacks
  const handleSetField = useCallback((field: keyof FormState, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }, [])

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      if (file.size > 15 * 1024 * 1024) {
        continue
      }
      
      const tempId = `temp-${Date.now()}-${Math.random()}`
      
      dispatch({
        type: 'ADD_ATTACHMENT',
        attachment: {
          id: tempId,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          file
        }
      })

      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          dispatch({
            type: 'UPDATE_ATTACHMENT',
            id: tempId,
            updates: { progress: i }
          })
        }

        dispatch({
          type: 'UPDATE_ATTACHMENT',
          id: tempId,
          updates: {
            progress: 100,
            url: URL.createObjectURL(file)
          }
        })
      } catch (error) {
        dispatch({
          type: 'UPDATE_ATTACHMENT',
          id: tempId,
          updates: {
            error: 'Upload failed',
            progress: undefined
          }
        })
      }
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!state.title.trim() || !state.projectId) return

    setIsCreating(true)
    try {
      await createTaskMutation.mutateAsync({
        title: state.title.trim(),
        description: state.description,
        priority: state.priority,
        status: state.status,
        projectId: state.projectId,
        workspaceId,
        kanbanColumnId,
        assigneeId: state.assigneeId,
        dueDate: state.dueDate?.toISOString(),
        startDate: state.startDate?.toISOString(),
        storyPoints: state.storyPoints,
        businessValue: state.businessValue,
        tags: state.tags,
        estimatedHours: state.estimatedHours,
        complexity: state.complexity,
        riskLevel: state.riskLevel,
        isRecurring: state.isRecurring,
        recurringPattern: state.recurringPattern,
        epicId: state.epicId,
        watchers: state.watchers,
        customFields: state.customFields,
        isTemplate: state.isTemplate,
        isPrivate: state.isPrivate,
        isBlocked: state.isBlocked,
        blockedBy: state.blockedBy,
        blockedReason: state.blockedReason
      })
    } finally {
      setIsCreating(false)
    }
  }, [state, workspaceId, kanbanColumnId, createTaskMutation])

  const handleCreateAndNew = useCallback(async () => {
    await handleSubmit()
    dispatch({ type: 'RESET_FORM' })
  }, [handleSubmit])

  // Quick date calculations
  const quickDates = useMemo(() => {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    const nextWeek = addWeeks(today, 1)

    return { today, tomorrow, nextWeek }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleCreateAndNew()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handleSubmit, handleCreateAndNew])

  const canSubmit = state.title.trim() && state.projectId && !isCreating

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-brand">Create Task</SheetTitle>
            <PrioritySelector 
              value={state.priority} 
              onChange={(priority) => handleSetField('priority', priority)} 
            />
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Title Input */}
          <div>
            <FloatingInput
              label="Task Title"
              value={state.title}
              onChange={(e) => handleSetField('title', e.target.value)}
              className="text-xl font-semibold"
              autoFocus
              required
            />
          </div>

          {/* Project Selection - REQUIRED */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Project <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleSetField('projectId', project.id)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all",
                    "flex items-center gap-2",
                    state.projectId === project.id
                      ? "bg-krushr-primary text-white border-krushr-primary shadow-elevation-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-krushr-primary"
                  )}
                >
                  <Briefcase className="w-4 h-4" />
                  {project.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status Column Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <div className="grid grid-cols-4 gap-2">
              <StatusColumnButton
                status={TaskStatus.TODO}
                label="To Do"
                icon={Circle}
                isSelected={state.status === TaskStatus.TODO}
                onClick={() => handleSetField('status', TaskStatus.TODO)}
                color="bg-gray-500"
              />
              <StatusColumnButton
                status={TaskStatus.IN_PROGRESS}
                label="In Progress"
                icon={Timer}
                isSelected={state.status === TaskStatus.IN_PROGRESS}
                onClick={() => handleSetField('status', TaskStatus.IN_PROGRESS)}
                color="bg-blue-500"
              />
              <StatusColumnButton
                status={TaskStatus.REVIEW}
                label="Review"
                icon={AlertCircle}
                isSelected={state.status === TaskStatus.REVIEW}
                onClick={() => handleSetField('status', TaskStatus.REVIEW)}
                color="bg-purple-500"
              />
              <StatusColumnButton
                status={TaskStatus.DONE}
                label="Done"
                icon={CheckCircle2}
                isSelected={state.status === TaskStatus.DONE}
                onClick={() => handleSetField('status', TaskStatus.DONE)}
                color="bg-green-500"
              />
            </div>
          </div>

          {/* Assignee Selection - Avatar Grid */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Assignee</label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              <button
                onClick={() => handleSetField('assigneeId', null)}
                className={cn(
                  "aspect-square rounded-lg border-2 transition-all",
                  "flex items-center justify-center",
                  !state.assigneeId
                    ? "bg-gray-100 border-gray-300 shadow-elevation-sm"
                    : "bg-white border-gray-200 hover:border-krushr-primary"
                )}
              >
                <User className="w-5 h-5 text-gray-400" />
              </button>
              {workspaceMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleSetField('assigneeId', member.id)}
                  className={cn(
                    "aspect-square rounded-lg border-2 transition-all overflow-hidden",
                    state.assigneeId === member.id
                      ? "border-krushr-primary ring-2 ring-krushr-primary ring-offset-2"
                      : "border-gray-200 hover:border-krushr-primary"
                  )}
                  title={member.name}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-krushr-primary text-white flex items-center justify-center text-sm font-medium">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date - Calendar Widget */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Due Date</label>
            <div className="space-y-2">
              {/* Quick Date Chips */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSetField('dueDate', quickDates.today)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full border-2 transition-all",
                    state.dueDate?.toDateString() === quickDates.today.toDateString()
                      ? "bg-krushr-primary text-white border-krushr-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-krushr-primary"
                  )}
                >
                  Today
                </button>
                <button
                  onClick={() => handleSetField('dueDate', quickDates.tomorrow)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full border-2 transition-all",
                    state.dueDate?.toDateString() === quickDates.tomorrow.toDateString()
                      ? "bg-krushr-primary text-white border-krushr-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-krushr-primary"
                  )}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => handleSetField('dueDate', quickDates.nextWeek)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full border-2 transition-all",
                    state.dueDate?.toDateString() === quickDates.nextWeek.toDateString()
                      ? "bg-krushr-primary text-white border-krushr-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-krushr-primary"
                  )}
                >
                  Next Week
                </button>
              </div>

              {/* Calendar Popover */}
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !state.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {state.dueDate ? format(state.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={state.dueDate || undefined}
                    onSelect={(date) => {
                      handleSetField('dueDate', date)
                      setShowCalendar(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Agile Metrics Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Story Points */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Target className="inline w-4 h-4 mr-1" />
                Story Points
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 5, 8, 13, 21].map(points => (
                  <button
                    key={points}
                    onClick={() => handleSetField('storyPoints', state.storyPoints === points ? null : points)}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium rounded border-2 transition-all",
                      state.storyPoints === points
                        ? "bg-krushr-primary text-white border-krushr-primary"
                        : "bg-white text-gray-600 border-gray-200 hover:border-krushr-primary"
                    )}
                  >
                    {points}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Value */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Business Value
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    onClick={() => handleSetField('businessValue', state.businessValue === value ? null : value)}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium rounded border-2 transition-all",
                      state.businessValue === value
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-600"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Tag className="inline w-4 h-4 mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {existingTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (state.tags.includes(tag.name)) {
                      dispatch({ type: 'REMOVE_TAG', tag: tag.name })
                    } else {
                      dispatch({ type: 'ADD_TAG', tag: tag.name })
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border-2 transition-all",
                    state.tags.includes(tag.name)
                      ? "bg-krushr-primary text-white border-krushr-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-krushr-primary"
                  )}
                >
                  {tag.name}
                </button>
              ))}
              {!showNewTag ? (
                <button
                  onClick={() => setShowNewTag(true)}
                  className="px-3 py-1.5 text-sm rounded-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-krushr-primary hover:text-krushr-primary transition-all"
                >
                  <Plus className="inline w-3 h-3 mr-1" />
                  New Tag
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        dispatch({ type: 'ADD_TAG', tag: newTag.trim() })
                        setNewTag('')
                        setShowNewTag(false)
                      }
                    }}
                    placeholder="Tag name"
                    className="px-3 py-1.5 text-sm border-2 border-krushr-primary rounded-full focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newTag.trim()) {
                        dispatch({ type: 'ADD_TAG', tag: newTag.trim() })
                        setNewTag('')
                      }
                      setShowNewTag(false)
                    }}
                    className="p-1.5 bg-krushr-primary text-white rounded-full"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Estimated Hours */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                <Clock className="inline w-3 h-3 mr-1" />
                Hours
              </label>
              <input
                type="number"
                value={state.estimatedHours || ''}
                onChange={(e) => handleSetField('estimatedHours', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow focus:shadow-md focus:border-krushr-primary"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>

            {/* Complexity */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                <BarChart3 className="inline w-3 h-3 mr-1" />
                Complexity
              </label>
              <select
                value={state.complexity || ''}
                onChange={(e) => handleSetField('complexity', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow focus:shadow-md focus:border-krushr-primary"
              >
                <option value="">None</option>
                <option value={TaskComplexity.SIMPLE}>Simple</option>
                <option value={TaskComplexity.MEDIUM}>Medium</option>
                <option value={TaskComplexity.COMPLEX}>Complex</option>
              </select>
            </div>

            {/* Risk Level */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                <AlertTriangle className="inline w-3 h-3 mr-1" />
                Risk
              </label>
              <select
                value={state.riskLevel || ''}
                onChange={(e) => handleSetField('riskLevel', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow focus:shadow-md focus:border-krushr-primary"
              >
                <option value="">None</option>
                <option value={TaskRiskLevel.LOW}>Low</option>
                <option value={TaskRiskLevel.MEDIUM}>Medium</option>
                <option value={TaskRiskLevel.HIGH}>High</option>
              </select>
            </div>

            {/* Recurring */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                <Repeat className="inline w-3 h-3 mr-1" />
                Recurring
              </label>
              <button
                onClick={() => handleSetField('isRecurring', !state.isRecurring)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border-2 transition-all",
                  "flex items-center justify-center gap-2 text-sm",
                  state.isRecurring
                    ? "bg-krushr-primary text-white border-krushr-primary"
                    : "bg-white text-gray-600 border-gray-200"
                )}
              >
                {state.isRecurring ? 'Yes' : 'No'}
              </button>
            </div>
          </div>

          {/* Epic Selection */}
          {epics.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <GitBranch className="inline w-4 h-4 mr-1" />
                Epic
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                <button
                  onClick={() => handleSetField('epicId', null)}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 text-left transition-all",
                    !state.epicId
                      ? "border-krushr-primary bg-krushr-primary-50"
                      : "border-gray-200 hover:border-krushr-primary"
                  )}
                >
                  <span className="text-sm text-gray-500">No epic</span>
                </button>
                {epics.map(epic => (
                  <button
                    key={epic.id}
                    onClick={() => handleSetField('epicId', epic.id)}
                    className={cn(
                      "w-full p-3 rounded-lg border-2 text-left transition-all",
                      state.epicId === epic.id
                        ? "border-krushr-primary bg-krushr-primary-50"
                        : "border-gray-200 hover:border-krushr-primary"
                    )}
                  >
                    <div className="font-medium text-sm">{epic.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleSetField('isPrivate', !state.isPrivate)}
              className={cn(
                "px-4 py-3 rounded-lg border-2 transition-all",
                "flex items-center justify-center gap-2 text-sm font-medium",
                state.isPrivate
                  ? "bg-gray-100 text-gray-800 border-gray-300"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              <Lock className="w-4 h-4" />
              Private
            </button>
            <button
              onClick={() => handleSetField('isArchived', !state.isArchived)}
              className={cn(
                "px-4 py-3 rounded-lg border-2 transition-all",
                "flex items-center justify-center gap-2 text-sm font-medium",
                state.isArchived
                  ? "bg-gray-100 text-gray-800 border-gray-300"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              <Archive className="w-4 h-4" />
              Archived
            </button>
            <button
              onClick={() => handleSetField('autoAssign', !state.autoAssign)}
              className={cn(
                "px-4 py-3 rounded-lg border-2 transition-all",
                "flex items-center justify-center gap-2 text-sm font-medium",
                state.autoAssign
                  ? "bg-krushr-primary text-white border-krushr-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-krushr-primary"
              )}
            >
              <Zap className="w-4 h-4" />
              Auto-Assign
            </button>
            <button
              onClick={() => handleSetField('isBlocked', !state.isBlocked)}
              className={cn(
                "px-4 py-3 rounded-lg border-2 transition-all",
                "flex items-center justify-center gap-2 text-sm font-medium",
                state.isBlocked
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
              )}
            >
              <Ban className="w-4 h-4" />
              Blocked
            </button>
          </div>

          {/* Blocked Reason */}
          {state.isBlocked && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Blocked Reason</label>
              <input
                type="text"
                value={state.blockedReason || ''}
                onChange={(e) => handleSetField('blockedReason', e.target.value)}
                placeholder="Why is this task blocked?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow focus:shadow-md focus:border-red-400"
              />
            </div>
          )}

          {/* Watchers */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Eye className="inline w-4 h-4 mr-1" />
              Watchers ({state.watchers.length})
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {workspaceMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => {
                    if (state.watchers.includes(member.id)) {
                      dispatch({ type: 'REMOVE_WATCHER', userId: member.id })
                    } else {
                      dispatch({ type: 'ADD_WATCHER', userId: member.id })
                    }
                  }}
                  className={cn(
                    "aspect-square rounded-lg border-2 transition-all overflow-hidden",
                    state.watchers.includes(member.id)
                      ? "border-krushr-info ring-2 ring-krushr-info ring-offset-2"
                      : "border-gray-200 hover:border-krushr-info opacity-50"
                  )}
                  title={member.name}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-krushr-info text-white flex items-center justify-center text-xs font-medium">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description - Rich Text Editor */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <FileText className="inline w-4 h-4 mr-1" />
              Description
            </label>
            <RichTextEditor
              value={state.description}
              onChange={(value) => handleSetField('description', value)}
              placeholder="Add task details, requirements, or notes..."
              className="min-h-[150px] border-2 border-gray-200 rounded-lg"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Upload className="inline w-4 h-4 mr-1" />
              Attachments
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-krushr-primary transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Drop files here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Maximum file size: 15MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            />
            
            {/* Attachment List */}
            {state.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {state.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{(attachment.size / 1024).toFixed(1)} KB</span>
                        {attachment.progress !== undefined && attachment.progress < 100 && (
                          <>
                            <span>•</span>
                            <span>{attachment.progress}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ATTACHMENT', id: attachment.id })}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar - Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 px-6 py-4 -mx-6 -mb-6 mt-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">⌘↵</span> to create
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">⌘S</span> to create & new
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAndNew}
                disabled={!canSubmit}
                variant="outline"
              >
                Create & New
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}