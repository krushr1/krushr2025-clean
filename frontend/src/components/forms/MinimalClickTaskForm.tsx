import React, { useState, useRef, useCallback, useMemo, useReducer, lazy, Suspense } from 'react'
import { format, addDays, endOfWeek, addWeeks, isSameDay } from 'date-fns'
import { 
  Circle, CheckCircle2, AlertCircle, Loader2, Calendar, User, Hash, 
  Paperclip, Flag, X, Plus, MessageSquare, FileText, FileImage,
  FileSpreadsheet, FileArchive, FileVideo, FileAudio, File,
  ChevronRight, Briefcase, Target, Brain, Clock, Link2,
  Repeat, Eye, Lock, Template, Ban, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FloatingInput } from '@/components/ui/floating-input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc'
import { Priority, TaskStatus } from '@/types/enums'
import { toast } from 'sonner'

// Lazy load heavy components
const FileUpload = lazy(() => import('@/components/common/FileUpload'))

// Types
interface MinimalClickTaskFormProps {
  workspaceId: string
  kanbanColumnId?: string
  onSuccess?: () => void
  onClose?: () => void
}

interface LocalAttachment {
  id: string
  name: string
  size: number
  type: string
  mimeType?: string
  file: File
  thumbnailDataUrl?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  uploadedId?: string
}

// Form state reducer for optimized state management
type FormState = {
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  assigneeId: string | null
  projectId: string | null
  dueDate: Date | null
  startDate: Date | null
  tags: string[]
  storyPoints: number | null
  businessValue: number | null
  complexity: number | null
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  estimatedHours: number | null
  epicId: string | null
  parentTaskId: string | null
  recurringPattern: string | null
  watchers: string[]
  isTemplate: boolean
  isPrivate: boolean
  isBlocked: boolean
  blockedBy: string | null
  blockedReason: string | null
  attachments: LocalAttachment[]
  checklists: Array<{
    id: string
    title: string
    items: Array<{
      id: string
      text: string
      completed: boolean
    }>
  }>
  customFields: Record<string, any>
}

type FormAction = 
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'TOGGLE_TAG'; tag: string }
  | { type: 'TOGGLE_WATCHER'; userId: string }
  | { type: 'ADD_ATTACHMENT'; attachment: LocalAttachment }
  | { type: 'REMOVE_ATTACHMENT'; id: string }
  | { type: 'UPDATE_ATTACHMENT'; id: string; updates: Partial<LocalAttachment> }
  | { type: 'ADD_CHECKLIST'; title: string }
  | { type: 'REMOVE_CHECKLIST'; id: string }
  | { type: 'ADD_CHECKLIST_ITEM'; checklistId: string; text: string }
  | { type: 'TOGGLE_CHECKLIST_ITEM'; checklistId: string; itemId: string }
  | { type: 'REMOVE_CHECKLIST_ITEM'; checklistId: string; itemId: string }
  | { type: 'UPDATE_CHECKLIST_ITEM'; checklistId: string; itemId: string; text: string }
  | { type: 'RESET' }

const initialState: FormState = {
  title: '',
  description: '',
  priority: Priority.MEDIUM,
  status: TaskStatus.TODO,
  assigneeId: null,
  projectId: null,
  dueDate: null,
  startDate: null,
  tags: [],
  storyPoints: null,
  businessValue: null,
  complexity: null,
  riskLevel: 'LOW',
  estimatedHours: null,
  epicId: null,
  parentTaskId: null,
  recurringPattern: null,
  watchers: [],
  isTemplate: false,
  isPrivate: false,
  isBlocked: false,
  blockedBy: null,
  blockedReason: null,
  attachments: [],
  checklists: [],
  customFields: {}
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'TOGGLE_TAG':
      return {
        ...state,
        tags: state.tags.includes(action.tag)
          ? state.tags.filter(t => t !== action.tag)
          : [...state.tags, action.tag]
      }
    case 'TOGGLE_WATCHER':
      return {
        ...state,
        watchers: state.watchers.includes(action.userId)
          ? state.watchers.filter(id => id !== action.userId)
          : [...state.watchers, action.userId]
      }
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
    case 'ADD_CHECKLIST':
      return {
        ...state,
        checklists: [...state.checklists, {
          id: `checklist-${Date.now()}`,
          title: action.title,
          items: []
        }]
      }
    case 'REMOVE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.filter(c => c.id !== action.id)
      }
    case 'ADD_CHECKLIST_ITEM':
      return {
        ...state,
        checklists: state.checklists.map(checklist =>
          checklist.id === action.checklistId
            ? {
                ...checklist,
                items: [...checklist.items, {
                  id: `item-${Date.now()}`,
                  text: action.text,
                  completed: false
                }]
              }
            : checklist
        )
      }
    case 'TOGGLE_CHECKLIST_ITEM':
      return {
        ...state,
        checklists: state.checklists.map(checklist =>
          checklist.id === action.checklistId
            ? {
                ...checklist,
                items: checklist.items.map(item =>
                  item.id === action.itemId
                    ? { ...item, completed: !item.completed }
                    : item
                )
              }
            : checklist
        )
      }
    case 'REMOVE_CHECKLIST_ITEM':
      return {
        ...state,
        checklists: state.checklists.map(checklist =>
          checklist.id === action.checklistId
            ? {
                ...checklist,
                items: checklist.items.filter(item => item.id !== action.itemId)
              }
            : checklist
        )
      }
    case 'UPDATE_CHECKLIST_ITEM':
      return {
        ...state,
        checklists: state.checklists.map(checklist =>
          checklist.id === action.checklistId
            ? {
                ...checklist,
                items: checklist.items.map(item =>
                  item.id === action.itemId
                    ? { ...item, text: action.text }
                    : item
                )
              }
            : checklist
        )
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

// CSS Module for optimized styles
const styles = {
  button: 'px-4 py-3 rounded-lg font-medium transition-all duration-200 border-2 transform hover:scale-105',
  buttonSelected: 'border-transparent shadow-elevation-md',
  buttonDefault: 'bg-white border-krushr-gray-border text-krushr-gray hover:border-krushr-gray',
  sectionLabel: 'text-sm font-medium text-krushr-gray mb-3 block',
  card: 'p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105',
  chip: 'px-3 py-1.5 rounded-full text-sm transition-all',
  avatar: 'aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center overflow-hidden hover:scale-105'
}

// Memoized components
const PriorityButton = React.memo(({ priority, selected, onClick, label, color }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      styles.button,
      selected ? `${color} text-white ${styles.buttonSelected}` : styles.buttonDefault
    )}
  >
    <div className="flex items-center justify-center gap-2">
      <Flag className="w-4 h-4" />
      {label}
    </div>
  </button>
))

const StatusCard = React.memo(({ status, selected, onClick, label, icon: Icon, color }: any) => (
  <button
    key={status}
    type="button"
    onClick={onClick}
    className={cn(
      styles.card,
      'flex flex-col items-center gap-2',
      selected
        ? 'border-krushr-primary bg-krushr-primary-50 shadow-elevation-sm'
        : 'border-krushr-gray-border hover:border-krushr-gray bg-white'
    )}
  >
    <Icon className={cn('w-6 h-6', color)} />
    <span className="text-sm font-medium">{label}</span>
  </button>
))

export default function MinimalClickTaskForm({
  workspaceId,
  kanbanColumnId,
  onSuccess,
  onClose
}: MinimalClickTaskFormProps) {
  // Form state with reducer
  const [state, dispatch] = useReducer(formReducer, initialState)
  const [isCreating, setIsCreating] = useState(false)
  const [showNewTag, setShowNewTag] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  // Queries with caching
  const { data: workspaceMembers = [] } = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId },
    { 
      staleTime: 5 * 60 * 1000, // 5 minute cache
      enabled: !!workspaceId 
    }
  )
  
  const { data: projects = [] } = trpc.project.list.useQuery(
    { workspaceId },
    { 
      staleTime: 5 * 60 * 1000,
      enabled: !!workspaceId 
    }
  )
  
  const { data: epics = [] } = trpc.task.listEpics.useQuery(
    { workspaceId },
    { 
      staleTime: 5 * 60 * 1000,
      enabled: !!workspaceId 
    }
  )
  
  const { data: currentUser } = trpc.user.me.useQuery()
  
  // Available tags from workspace
  const availableTags = useMemo(() => [
    'urgent', 'bug', 'feature', 'enhancement', 'documentation',
    'frontend', 'backend', 'design', 'testing', 'devops'
  ], [])

  // Mutations
  const createTaskMutation = trpc.task.createEnhanced.useMutation()
  const uploadMutation = trpc.uploadNew.uploadTaskFile.useMutation()
  const createChecklistMutation = trpc.checklist.create.useMutation()
  const addChecklistItemMutation = trpc.checklist.addItem.useMutation()

  // Memoized callbacks
  const handleFileUpload = useCallback(async (files: File[]) => {
    const newAttachments: LocalAttachment[] = []
    
    for (const file of files) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 15MB limit`)
        continue
      }
      
      const attachment: LocalAttachment = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        mimeType: file.type,
        file: file,
        status: 'pending',
        progress: 0
      }
      
      if (file.type.startsWith('image/')) {
        try {
          const thumbnailDataUrl = await generateLocalThumbnail(file)
          attachment.thumbnailDataUrl = thumbnailDataUrl
        } catch (error) {
          console.warn('Failed to generate thumbnail:', error)
        }
      }
      
      newAttachments.push(attachment)
    }
    
    newAttachments.forEach(attachment => {
      dispatch({ type: 'ADD_ATTACHMENT', attachment })
    })
  }, [])

  const generateLocalThumbnail = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          const maxSize = 150
          let width = img.width
          let height = img.height
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  const handleSubmit = useCallback(async (createAnother = false) => {
    if (!state.title.trim() || !state.projectId) {
      toast.error('Title and Project are required')
      return
    }
    
    setIsCreating(true)
    try {
      const result = await createTaskMutation.mutateAsync({
        // Basic required fields
        title: state.title.trim(),
        workspaceId,
        projectId: state.projectId,
        
        // Optional fields
        description: state.description || undefined,
        priority: state.priority,
        status: state.status,
        assigneeId: state.assigneeId || undefined,
        kanbanColumnId: kanbanColumnId || undefined,
        
        // Dates
        dueDate: state.dueDate?.toISOString(),
        startDate: state.startDate?.toISOString(),
        
        // Arrays
        tags: state.tags,
        watchers: state.watchers,
        
        // Numbers
        estimatedHours: state.estimatedHours || undefined,
        storyPoints: state.storyPoints || undefined,
        businessValue: state.businessValue || undefined,
        complexity: state.complexity || undefined,
        
        // Advanced fields
        riskLevel: state.riskLevel,
        epicId: state.epicId || undefined,
        parentTaskId: state.parentTaskId || undefined,
        recurringPattern: state.recurringPattern || undefined,
        customFields: state.customFields,
        
        // Flags
        isTemplate: state.isTemplate,
        isPrivate: state.isPrivate,
        
        // Blocking
        isBlocked: state.isBlocked,
        blockedBy: state.blockedBy || undefined,
        blockedReason: state.blockedReason || undefined
      })
      
      // Upload attachments
      for (const attachment of state.attachments) {
        if (attachment.status === 'pending' && attachment.file) {
          dispatch({ 
            type: 'UPDATE_ATTACHMENT', 
            id: attachment.id, 
            updates: { status: 'uploading', progress: 0 } 
          })
          
          try {
            const arrayBuffer = await attachment.file.arrayBuffer()
            const buffer = Array.from(new Uint8Array(arrayBuffer))
            
            await uploadMutation.mutateAsync({
              taskId: result.task.id,
              file: {
                filename: attachment.name,
                mimetype: attachment.mimeType || attachment.type,
                size: attachment.size,
                buffer
              }
            })
            
            dispatch({ 
              type: 'UPDATE_ATTACHMENT', 
              id: attachment.id, 
              updates: { status: 'success', progress: 100 } 
            })
            
          } catch (uploadError) {
            console.error('Failed to upload file:', attachment.name, uploadError)
            dispatch({ 
              type: 'UPDATE_ATTACHMENT', 
              id: attachment.id, 
              updates: { status: 'error' } 
            })
          }
        }
      }
      
      // Create checklists
      for (const checklist of state.checklists) {
        try {
          const createdChecklist = await createChecklistMutation.mutateAsync({
            taskId: result.task.id,
            title: checklist.title
          })
          
          // Add items to the checklist
          for (const item of checklist.items) {
            await addChecklistItemMutation.mutateAsync({
              checklistId: createdChecklist.id,
              text: item.text
            })
          }
        } catch (checklistError) {
          console.error('Failed to create checklist:', checklist.title, checklistError)
        }
      }
      
      toast.success('Task created successfully')
      
      if (createAnother) {
        dispatch({ type: 'RESET' })
        titleRef.current?.focus()
      } else {
        onSuccess?.()
        onClose?.()
      }
    } catch (error) {
      toast.error('Failed to create task')
    } finally {
      setIsCreating(false)
    }
  }, [state, workspaceId, kanbanColumnId, createTaskMutation, uploadMutation, onSuccess, onClose])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch(e.key) {
          case 'Enter':
            e.preventDefault()
            handleSubmit(false)
            break
          case 's':
            e.preventDefault()
            handleSubmit(true)
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleSubmit])

  // Auto-assign to current user if add to my tasks
  React.useEffect(() => {
    if (currentUser && !state.assigneeId) {
      dispatch({ type: 'SET_FIELD', field: 'assigneeId', value: currentUser.id })
    }
  }, [currentUser, state.assigneeId])

  // Memoized file icon getter
  const getFileIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="w-6 h-6 text-blue-500" />
    if (mimeType === 'application/pdf') return <FileText className="w-6 h-6 text-red-500" />
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-6 h-6 text-green-600" />
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return <FileArchive className="w-6 h-6 text-purple-600" />
    if (mimeType.startsWith('video/')) return <FileVideo className="w-6 h-6 text-purple-500" />
    if (mimeType.startsWith('audio/')) return <FileAudio className="w-6 h-6 text-pink-500" />
    return <File className="w-6 h-6 text-gray-500" />
  }, [])

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold font-satoshi text-krushr-gray-dark">
          Create New Task
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-krushr-gray-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-krushr-gray" />
          </button>
        )}
      </div>

      {/* Title Input - Auto-focused */}
      <div className="mb-6">
        <FloatingInput
          ref={titleRef}
          id="task-title"
          value={state.title}
          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })}
          placeholder="What needs to be done?"
          className="text-lg font-medium"
          autoFocus
          required
        />
      </div>

      {/* Project Selection - REQUIRED */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>
          Project <span className="text-krushr-secondary">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'projectId', value: project.id })}
              className={cn(
                'p-3 rounded-lg border-2 text-left',
                'flex items-center gap-2 transition-all',
                state.projectId === project.id
                  ? 'border-krushr-primary bg-krushr-primary-50 shadow-elevation-sm'
                  : 'border-krushr-gray-border hover:border-krushr-gray'
              )}
            >
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Priority Selection - Button Group */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>Priority</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: Priority.LOW, label: 'Low', color: 'bg-krushr-priority-low' },
            { value: Priority.MEDIUM, label: 'Medium', color: 'bg-krushr-priority-medium' },
            { value: Priority.HIGH, label: 'High', color: 'bg-krushr-priority-high' },
            { value: Priority.CRITICAL, label: 'Critical', color: 'bg-krushr-priority-critical' }
          ].map((p) => (
            <PriorityButton
              key={p.value}
              priority={p.value}
              selected={state.priority === p.value}
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'priority', value: p.value })}
              label={p.label}
              color={p.color}
            />
          ))}
        </div>
      </div>

      {/* Assignee - Avatar Grid */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>Assign to</label>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_FIELD', field: 'assigneeId', value: null })}
            className={cn(
              styles.avatar,
              !state.assigneeId
                ? 'border-krushr-primary bg-krushr-primary-50 shadow-elevation-sm'
                : 'border-krushr-gray-border hover:border-krushr-gray bg-white'
            )}
            title="Unassigned"
          >
            <User className="w-5 h-5 text-krushr-gray" />
          </button>
          
          {workspaceMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'assigneeId', value: member.id })}
              className={cn(
                styles.avatar,
                state.assigneeId === member.id
                  ? 'border-krushr-primary ring-2 ring-krushr-primary ring-offset-2 shadow-elevation-sm'
                  : 'border-krushr-gray-border hover:border-krushr-gray'
              )}
              title={member.name}
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className={cn(
                  'w-full h-full flex items-center justify-center',
                  'bg-krushr-primary-100 text-krushr-primary text-sm font-semibold'
                )}>
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Due Date - Quick Select Chips */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>Due Date</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Today', value: () => new Date() },
            { label: 'Tomorrow', value: () => addDays(new Date(), 1) },
            { label: 'This Week', value: () => endOfWeek(new Date()) },
            { label: 'Next Week', value: () => addWeeks(new Date(), 1) },
            { label: 'No Date', value: () => null }
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'dueDate', value: option.value() })}
              className={cn(
                'px-4 py-2.5 rounded-full transition-all duration-200',
                'border font-medium transform hover:scale-105',
                (option.value() && state.dueDate && isSameDay(option.value(), state.dueDate)) ||
                (option.value() === null && !state.dueDate)
                  ? 'bg-krushr-primary text-white border-krushr-primary shadow-elevation-sm'
                  : 'bg-white border-krushr-gray-border text-krushr-gray hover:border-krushr-gray'
              )}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {option.label}
              </div>
            </button>
          ))}
        </div>
        {state.dueDate && (
          <p className="mt-3 text-sm text-krushr-gray flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-krushr-success" />
            Due: {format(state.dueDate, 'EEEE, MMMM d, yyyy')}
          </p>
        )}
      </div>

      {/* Status - Visual Status Cards */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>Initial Status</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: TaskStatus.TODO, label: 'To Do', icon: Circle, color: 'text-krushr-task-todo' },
            { value: TaskStatus.IN_PROGRESS, label: 'In Progress', icon: Loader2, color: 'text-krushr-task-progress' },
            { value: TaskStatus.REVIEW, label: 'Review', icon: MessageSquare, color: 'text-krushr-task-review' },
            { value: TaskStatus.DONE, label: 'Done', icon: CheckCircle2, color: 'text-krushr-task-done' }
          ].map((s) => (
            <StatusCard
              key={s.value}
              status={s.value}
              selected={state.status === s.value}
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'status', value: s.value })}
              label={s.label}
              icon={s.icon}
              color={s.color}
            />
          ))}
        </div>
      </div>

      {/* Agile Metrics - Story Points & Business Value */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className={styles.sectionLabel}>Story Points</label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 8, 13, 21].map((points) => (
              <button
                key={points}
                type="button"
                onClick={() => dispatch({ type: 'SET_FIELD', field: 'storyPoints', value: points })}
                className={cn(
                  'w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all',
                  state.storyPoints === points
                    ? 'border-krushr-primary bg-krushr-primary-50 shadow-elevation-sm'
                    : 'border-krushr-gray-border hover:border-krushr-gray'
                )}
              >
                {points}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className={styles.sectionLabel}>Business Value</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => dispatch({ type: 'SET_FIELD', field: 'businessValue', value })}
                className={cn(
                  'w-10 h-10 rounded-lg border-2 transition-all',
                  state.businessValue === value
                    ? 'border-krushr-success bg-green-50 shadow-elevation-sm'
                    : 'border-krushr-gray-border hover:border-krushr-gray'
                )}
              >
                <span className="text-sm font-medium">{value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tags - Chip Selection */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_TAG', tag })}
              className={cn(
                styles.chip,
                state.tags.includes(tag)
                  ? 'bg-krushr-primary text-white'
                  : 'bg-white border border-krushr-gray-border hover:border-krushr-gray'
              )}
            >
              #{tag}
            </button>
          ))}
          {showNewTag ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTagInput.trim()) {
                    dispatch({ type: 'TOGGLE_TAG', tag: newTagInput.trim() })
                    setNewTagInput('')
                    setShowNewTag(false)
                  }
                }}
                onBlur={() => {
                  if (newTagInput.trim()) {
                    dispatch({ type: 'TOGGLE_TAG', tag: newTagInput.trim() })
                  }
                  setNewTagInput('')
                  setShowNewTag(false)
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:shadow-md focus:border-krushr-primary"
                placeholder="New tag..."
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewTag(true)}
              className="px-3 py-1.5 rounded-full text-sm border border-dashed border-krushr-gray-border hover:border-krushr-gray transition-all"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              New tag
            </button>
          )}
        </div>
      </div>

      {/* Advanced Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Time Estimate */}
        <div>
          <label className="text-xs font-medium text-krushr-gray mb-2 block">Hours</label>
          <div className="flex gap-1">
            {[2, 4, 8].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => dispatch({ type: 'SET_FIELD', field: 'estimatedHours', value: hours })}
                className={cn(
                  'flex-1 py-2 text-sm rounded border-2 transition-all',
                  state.estimatedHours === hours
                    ? 'border-krushr-info bg-blue-50'
                    : 'border-krushr-gray-border hover:border-krushr-gray'
                )}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <label className="text-xs font-medium text-krushr-gray mb-2 block">Complexity</label>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => dispatch({ type: 'SET_FIELD', field: 'complexity', value: level })}
                className={cn(
                  'flex-1 py-2 text-sm rounded border-2 transition-all',
                  state.complexity === level
                    ? 'border-krushr-warning bg-orange-50'
                    : 'border-krushr-gray-border hover:border-krushr-gray'
                )}
              >
                <Brain className="w-3 h-3 inline" />
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label className="text-xs font-medium text-krushr-gray mb-2 block">Risk</label>
          <div className="flex gap-1">
            {['LOW', 'MEDIUM', 'HIGH'].map((risk) => (
              <button
                key={risk}
                type="button"
                onClick={() => dispatch({ type: 'SET_FIELD', field: 'riskLevel', value: risk as any })}
                className={cn(
                  'flex-1 py-2 text-xs rounded border-2 transition-all',
                  state.riskLevel === risk
                    ? risk === 'HIGH' 
                      ? 'border-red-500 bg-red-50'
                      : risk === 'MEDIUM'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-green-500 bg-green-50'
                    : 'border-krushr-gray-border hover:border-krushr-gray'
                )}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring */}
        <div>
          <label className="text-xs font-medium text-krushr-gray mb-2 block">Repeat</label>
          <button
            type="button"
            onClick={() => {
              const patterns = [null, 'daily', 'weekly', 'monthly']
              const current = patterns.indexOf(state.recurringPattern)
              const next = patterns[(current + 1) % patterns.length]
              dispatch({ type: 'SET_FIELD', field: 'recurringPattern', value: next })
            }}
            className={cn(
              'w-full py-2 px-2 text-xs rounded border-2 transition-all flex items-center justify-center gap-1',
              state.recurringPattern
                ? 'border-krushr-purple bg-purple-50'
                : 'border-krushr-gray-border hover:border-krushr-gray'
            )}
          >
            <Repeat className="w-3 h-3" />
            {state.recurringPattern || 'Never'}
          </button>
        </div>
      </div>

      {/* Epic Selection */}
      {epics.length > 0 && (
        <div className="mb-6">
          <label className={styles.sectionLabel}>Part of Epic</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {epics.map((epic) => (
              <button
                key={epic.id}
                type="button"
                onClick={() => dispatch({ type: 'SET_FIELD', field: 'epicId', value: epic.id })}
                className={cn(
                  'w-full p-3 rounded-lg border-2 text-left transition-all',
                  state.epicId === epic.id
                    ? 'border-krushr-primary bg-krushr-primary-50'
                    : 'border-krushr-gray-border hover:border-krushr-gray'
                )}
              >
                <div className="font-medium text-sm">{epic.title}</div>
                <div className="text-xs text-krushr-gray mt-1">
                  {epic.completedTasks || 0}/{epic.totalTasks || 0} tasks complete
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Settings - Toggle Switches */}
      <div className="mb-6 p-4 bg-krushr-gray-bg-light rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium text-krushr-gray group-hover:text-krushr-gray-dark flex items-center gap-2">
              <Template className="w-4 h-4" />
              Save as template
            </span>
            <Switch
              checked={state.isTemplate}
              onCheckedChange={(checked) => dispatch({ type: 'SET_FIELD', field: 'isTemplate', value: checked })}
              className="data-[state=checked]:bg-krushr-primary"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium text-krushr-gray group-hover:text-krushr-gray-dark flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Private task
            </span>
            <Switch
              checked={state.isPrivate}
              onCheckedChange={(checked) => dispatch({ type: 'SET_FIELD', field: 'isPrivate', value: checked })}
              className="data-[state=checked]:bg-krushr-primary"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium text-krushr-gray group-hover:text-krushr-gray-dark flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Task is blocked
            </span>
            <Switch
              checked={state.isBlocked}
              onCheckedChange={(checked) => dispatch({ type: 'SET_FIELD', field: 'isBlocked', value: checked })}
              className="data-[state=checked]:bg-krushr-secondary"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium text-krushr-gray group-hover:text-krushr-gray-dark flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Add watchers
            </span>
            <Badge variant="secondary" className="text-xs">
              {state.watchers.length}
            </Badge>
          </label>
        </div>
        
        {state.isBlocked && (
          <div className="mt-3 pt-3 border-t border-krushr-gray-border">
            <input
              type="text"
              placeholder="Reason for blocking..."
              value={state.blockedReason || ''}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'blockedReason', value: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:shadow-md focus:border-krushr-primary"
            />
          </div>
        )}
      </div>

      {/* Description - Rich Text Editor */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>Description (optional)</label>
        <div className="border border-krushr-gray-border rounded-lg overflow-hidden">
          <RichTextEditor
            content={state.description}
            onChange={(content) => dispatch({ type: 'SET_FIELD', field: 'description', value: content })}
            placeholder="Add details, requirements, or context..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      {/* File Attachments */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Attachments
            {state.attachments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {state.attachments.length}
              </Badge>
            )}
          </div>
        </label>
        
        <Suspense fallback={<div className="h-32 bg-krushr-gray-bg animate-pulse rounded-lg" />}>
          <FileUpload
            onUpload={handleFileUpload}
            accept={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
              'application/pdf': ['.pdf'],
              'text/*': ['.txt', '.md', '.csv'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
            }}
            maxSize={15 * 1024 * 1024}
            maxFiles={10}
            className="mb-4"
          />
        </Suspense>

        {state.attachments.length > 0 && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {state.attachments.map((attachment) => (
              <div key={attachment.id} className="group relative bg-white rounded-lg border border-krushr-gray-border hover:border-krushr-primary transition-all duration-200">
                <div className="flex items-center p-3">
                  <div className="flex-shrink-0 mr-3">
                    {attachment.thumbnailDataUrl ? (
                      <img 
                        src={attachment.thumbnailDataUrl} 
                        alt={attachment.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-krushr-gray-bg flex items-center justify-center">
                        {getFileIcon(attachment.mimeType || attachment.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-krushr-gray-dark truncate">
                      {attachment.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-krushr-gray">
                      <span>{formatFileSize(attachment.size)}</span>
                      {attachment.status === 'uploading' && (
                        <span className="text-blue-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Uploading...
                        </span>
                      )}
                      {attachment.status === 'success' && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => dispatch({ type: 'REMOVE_ATTACHMENT', id: attachment.id })}
                    disabled={attachment.status === 'uploading'}
                  >
                    <X className="w-4 h-4 text-krushr-secondary" />
                  </Button>
                </div>
                
                {attachment.status === 'uploading' && attachment.progress !== undefined && (
                  <div className="px-3 pb-2">
                    <Progress value={attachment.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklists Section */}
      <div className="mb-6">
        <label className={styles.sectionLabel}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Checklists
            {state.checklists.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {state.checklists.reduce((total, checklist) => total + checklist.items.length, 0)} items
              </Badge>
            )}
          </div>
        </label>

        {/* Existing Checklists */}
        {state.checklists.map((checklist) => {
          const completedCount = checklist.items.filter(item => item.completed).length
          const totalCount = checklist.items.length
          const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

          return (
            <div key={checklist.id} className="mb-4 bg-white rounded-lg border border-krushr-gray-border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-krushr-gray-dark">{checklist.title}</h4>
                  {totalCount > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={progress} className="h-1.5 flex-1 max-w-[100px]" />
                      <span className="text-xs text-krushr-gray">{completedCount}/{totalCount}</span>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: 'REMOVE_CHECKLIST', id: checklist.id })}
                  className="h-8 w-8 p-0 hover:text-krushr-secondary"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {checklist.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <button
                      type="button"
                      onClick={() => dispatch({ 
                        type: 'TOGGLE_CHECKLIST_ITEM', 
                        checklistId: checklist.id, 
                        itemId: item.id 
                      })}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded border-2 transition-all",
                        "flex items-center justify-center",
                        item.completed
                          ? "bg-krushr-success border-krushr-success"
                          : "border-krushr-gray-border hover:border-krushr-primary"
                      )}
                    >
                      {item.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={cn(
                      "flex-1 text-sm",
                      item.completed && "line-through text-krushr-gray"
                    )}>
                      {item.text}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ 
                        type: 'REMOVE_CHECKLIST_ITEM', 
                        checklistId: checklist.id, 
                        itemId: item.id 
                      })}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-krushr-secondary"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {/* Add Item */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Add item..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:shadow-md focus:border-krushr-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault()
                        dispatch({
                          type: 'ADD_CHECKLIST_ITEM',
                          checklistId: checklist.id,
                          text: e.currentTarget.value.trim()
                        })
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Add Checklist Button */}
        <button
          type="button"
          className={cn(
            "w-full p-3 rounded-lg border-2 border-dashed",
            "border-krushr-gray-border hover:border-krushr-primary",
            "text-sm text-krushr-gray hover:text-krushr-primary",
            "transition-all duration-200 flex items-center justify-center gap-2"
          )}
          onClick={() => {
            const title = prompt('Checklist title:')
            if (title?.trim()) {
              dispatch({ type: 'ADD_CHECKLIST', title: title.trim() })
            }
          }}
        >
          <Plus className="w-4 h-4" />
          Add Checklist
        </button>
      </div>

      {/* Action Bar - Always Visible */}
      <div className="sticky bottom-0 bg-white border-t border-krushr-gray-border p-4 -mx-6 mt-8">
        <div className="flex gap-3 max-w-4xl mx-auto px-6">
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!state.title.trim() || !state.projectId || isCreating}
            className={cn(
              'flex-1 py-3 text-base font-medium',
              'bg-krushr-primary text-white',
              'hover:bg-krushr-primary-700 hover:scale-105',
              'disabled:opacity-50 disabled:hover:scale-100',
              'transition-all duration-200 shadow-elevation-sm'
            )}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Task
                <span className="ml-2 text-xs opacity-75">⌘↵</span>
              </>
            )}
          </Button>
          
          <Button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={!state.title.trim() || !state.projectId || isCreating}
            variant="outline"
            className={cn(
              'px-6 py-3 text-base font-medium',
              'border-2 border-krushr-gray-border',
              'hover:border-krushr-primary hover:text-krushr-primary hover:scale-105',
              'disabled:opacity-50 disabled:hover:scale-100',
              'transition-all duration-200'
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create & New
            <span className="ml-2 text-xs opacity-75">⌘S</span>
          </Button>
        </div>
      </div>
    </div>
  )
}