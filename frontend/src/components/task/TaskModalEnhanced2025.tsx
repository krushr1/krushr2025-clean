
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { Progress } from '../ui/progress'
import { Switch } from '../ui/switch'
import { 
  CalendarIcon, Plus, X, Paperclip, Tag, Users, Flag, 
  Clock, Target, GitBranch, MessageSquare, Eye, Heart,
  Play, Pause, Square, ChevronRight, ChevronDown,
  Bot, Zap, Link2, Archive, MoreHorizontal, 
  Timer, BarChart3, FileText, Camera, Mic,
  Brain, Sparkles, Network, History, Shield,
  CheckSquare, ListChecks, UserPlus, Calendar as CalendarDays,
  AlertTriangle, Info, ExternalLink, Copy, Share2,
  Settings2, Workflow, Database, Code2, Image as ImageIcon,
  Video, FileAudio, FileImage, Download, Trash2,
  Edit3, AlignLeft, Bold, Italic, Underline, List,
  RotateCcw, RotateCw, Save, Upload, Search,
  Filter, SortAsc, Globe, Lock, Unlock, PlusCircle,
  MinusCircle, Star, Bookmark, Bell, BellOff,
  Maximize2, Minimize2, FullscreenIcon, Move,
  DragHandleDots2Icon, GripVertical, MousePointer,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  CornerUpLeft, CornerUpRight, Hash, AtSign,
  Quote, Code, Terminal, Layers, Package,
  Briefcase, MapPin, Phone, Mail, Globe2,
  Cpu, HardDrive, Wifi, WifiOff, Bluetooth,
  Battery, BatteryLow, Signal, SignalHigh,
  Volume2, VolumeX, MicOff, CameraOff,
  Monitor, Smartphone, Tablet, Laptop,
  Server, Cloud, CloudOff, DatabaseIcon,
  GitCommit, GitMerge, GitPullRequest, Github
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { Priority, TaskStatus } from '../../types/enums'
import AttachmentUpload from '../common/AttachmentUpload'
import AttachmentList from '../common/AttachmentList'

const RichTextEditor = ({ value, onChange, placeholder }: { 
  value: string
  onChange: (value: string) => void
  placeholder?: string 
}) => {
  const [isVisual, setIsVisual] = useState(true)
  
  return (
    <div className="border border-krushr-gray-border rounded-md">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-krushr-gray-border bg-krushr-gray-bg">
        <Button 
          size="sm" 
          variant={isVisual ? "default" : "ghost"} 
          onClick={() => setIsVisual(true)}
          className="h-7 px-2"
        >
          <Eye className="w-3 h-3 mr-1" />
          Visual
        </Button>
        <Button 
          size="sm" 
          variant={!isVisual ? "default" : "ghost"} 
          onClick={() => setIsVisual(false)}
          className="h-7 px-2"
        >
          <Code className="w-3 h-3 mr-1" />
          Markdown
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <Bold className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <Italic className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <Underline className="w-3 h-3" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <List className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <CheckSquare className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <Code2 className="w-3 h-3" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <Link2 className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <ImageIcon className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="AI Assistant">
          <Bot className="w-3 h-3" />
        </Button>
      </div>
      
      {/* Editor */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] border-0 focus:ring-0 resize-none font-manrope"
      />
    </div>
  )
}

const TimeTracker = ({ isTracking, onStart, onStop, duration }: {
  isTracking: boolean
  onStart: () => void
  onStop: () => void
  duration: number
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isTracking ? "destructive" : "default"}
        onClick={isTracking ? onStop : onStart}
        className="h-8"
      >
        {isTracking ? (
          <>
            <Square className="w-3 h-3 mr-1" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-3 h-3 mr-1" />
            Start
          </>
        )}
      </Button>
      <span className="text-sm font-mono font-medium">
        {formatTime(duration)}
      </span>
    </div>
  )
}

const SubtaskItem = ({ subtask, onUpdate, onDelete }: {
  subtask: any
  onUpdate: (updates: any) => void
  onDelete: () => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="border border-krushr-gray-border rounded-md p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </Button>
        <Input
          value={subtask.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="flex-1 h-8"
          placeholder="Subtask title..."
        />
        <Button size="sm" variant="ghost" onClick={onDelete} className="h-6 w-6 p-0 text-krushr-secondary">
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      {isExpanded && (
        <div className="pl-8 space-y-2">
          <Textarea
            value={subtask.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Subtask description..."
            className="min-h-[60px] text-sm"
          />
          <div className="flex items-center gap-2">
            <Select value={subtask.priority} onValueChange={(value) => onUpdate({ priority: value })}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">🟢 Low</SelectItem>
                <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                <SelectItem value="HIGH">🔴 High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subtask.status} onValueChange={(value) => onUpdate({ status: value })}>
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">📋 To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">⚡ In Progress</SelectItem>
                <SelectItem value="DONE">✅ Done</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.5"
              value={subtask.estimatedHours || ''}
              onChange={(e) => onUpdate({ estimatedHours: parseFloat(e.target.value) || 0 })}
              placeholder="0h"
              className="w-16 h-7 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface TaskModalEnhanced2025Props {
  open: boolean
  onClose: () => void
  task?: any
  kanbanColumnId?: string
  workspaceId: string
  projectId?: string
  epicId?: string
  sprintId?: string
  onSuccess?: () => void
}

export default function TaskModalEnhanced2025({
  open,
  onClose,
  task,
  kanbanColumnId,
  workspaceId,
  projectId,
  epicId,
  sprintId,
  onSuccess
}: TaskModalEnhanced2025Props) {
  const isEditMode = !!task
  const [activeTab, setActiveTab] = useState('details')
  const [timeTracking, setTimeTracking] = useState({ isTracking: false, duration: 0 })
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [richDescription, setRichDescription] = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [taskType, setTaskType] = useState('TASK')
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  
  const [storyPoints, setStoryPoints] = useState<number | undefined>()
  const [estimatedHours, setEstimatedHours] = useState<string>('')
  const [actualHours, setActualHours] = useState<string>('')
  const [remainingHours, setRemainingHours] = useState<string>('')
  const [progressPercent, setProgressPercent] = useState(0)
  const [selectedEpicId, setSelectedEpicId] = useState(epicId || '')
  const [selectedSprintId, setSelectedSprintId] = useState(sprintId || '')
  const [templateId, setTemplateId] = useState('')
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  
  const [subtasks, setSubtasks] = useState<any[]>([])
  const [dependencies, setDependencies] = useState<any[]>([])
  const [blockers, setBlockers] = useState<any[]>([])
  const [linkedTasks, setLinkedTasks] = useState<any[]>([])
  
  const [watchers, setWatchers] = useState<string[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [reactions, setReactions] = useState<Record<string, number>>({})
  
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  
  const [customFields, setCustomFields] = useState<any[]>([])
  const [workflowStates, setWorkflowStates] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [revisionHistory, setRevisionHistory] = useState<any[]>([])
  
  const [automationTriggers, setAutomationTriggers] = useState<string[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  
  const [attachments, setAttachments] = useState<any[]>([])
  const [voiceNotes, setVoiceNotes] = useState<any[]>([])
  const [screenshots, setScreenshots] = useState<any[]>([])

  const { data: users = [] } = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  
  const { data: projects = [] } = trpc.project.list.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )
  
  const epics = [
    { id: '1', title: 'User Authentication System' },
    { id: '2', title: 'Dashboard Redesign' },
    { id: '3', title: 'Mobile App Development' }
  ]
  
  const sprints = [
    { id: '1', name: 'Sprint 24.1', status: 'ACTIVE' },
    { id: '2', name: 'Sprint 24.2', status: 'PLANNED' },
    { id: '3', name: 'Sprint 23.4', status: 'COMPLETED' }
  ]

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setRichDescription(task.richDescription || '')
      setPriority(task.priority || Priority.MEDIUM)
      setStatus(task.status || TaskStatus.TODO)
      setTaskType(task.taskType || 'TASK')
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setStartDate(task.startDate ? new Date(task.startDate) : undefined)
      setAssigneeId(task.assigneeId || '')
      setTags(task.tags?.map((tag: any) => typeof tag === 'string' ? tag : tag.name) || [])
      setStoryPoints(task.storyPoints)
      setEstimatedHours(task.estimatedHours?.toString() || '')
      setActualHours(task.actualHours?.toString() || '')
      setRemainingHours(task.remainingHours?.toString() || '')
      setProgressPercent(task.progressPercent || 0)
      setSelectedEpicId(task.epicId || '')
      setSelectedSprintId(task.sprintId || '')
      setCustomFieldValues(task.customFieldValues ? JSON.parse(task.customFieldValues) : {})
    }
  }, [task])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setRichDescription('')
    setPriority(Priority.MEDIUM)
    setStatus(TaskStatus.TODO)
    setTaskType('TASK')
    setDueDate(undefined)
    setStartDate(undefined)
    setAssigneeId('')
    setTags([])
    setCurrentTag('')
    setStoryPoints(undefined)
    setEstimatedHours('')
    setActualHours('')
    setRemainingHours('')
    setProgressPercent(0)
    setSelectedEpicId(epicId || '')
    setSelectedSprintId(sprintId || '')
    setCustomFieldValues({})
    setSubtasks([])
    setDependencies([])
    setBlockers([])
    setLinkedTasks([])
    setWatchers([])
    setComments([])
    setNewComment('')
    setReactions({})
    setAiSuggestions([])
    setAiPrompt('')
  }

  const handleSubmit = () => {
    const taskData = {
      title,
      description,
      richDescription,
      priority,
      status,
      taskType,
      dueDate: dueDate?.toISOString(),
      startDate: startDate?.toISOString(),
      assigneeId: assigneeId || undefined,
      storyPoints,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      actualHours: actualHours ? parseFloat(actualHours) : undefined,
      remainingHours: remainingHours ? parseFloat(remainingHours) : undefined,
      progressPercent,
      epicId: selectedEpicId || undefined,
      sprintId: selectedSprintId || undefined,
      customFieldValues: JSON.stringify(customFieldValues),
      tags,
      workspaceId,
      projectId: projectId || task?.projectId,
      kanbanColumnId: kanbanColumnId || task?.kanbanColumnId,
    }

    console.log('Enhanced task data:', taskData)
    // TODO: Implement actual mutation calls
    onSuccess?.()
    onClose()
    resetForm()
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

  const handleAddSubtask = () => {
    const newSubtask = {
      id: Date.now().toString(),
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      estimatedHours: 0
    }
    setSubtasks([...subtasks, newSubtask])
  }

  const handleUpdateSubtask = (id: string, updates: any) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, ...updates } : st))
  }

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id))
  }

  const handleAiGenerate = async (type: string) => {
    setAiSuggestions([])
    if (type === 'subtasks') {
      const mockSubtasks = [
        'Set up database schema for user authentication',
        'Create login/signup UI components',
        'Implement JWT token generation and validation',
        'Add password hashing and security measures',
        'Write unit tests for authentication flow'
      ]
      setAiSuggestions(mockSubtasks)
    } else if (type === 'description') {
      const mockDescription = `## Overview
This task involves implementing a comprehensive user authentication system with the following key features:

### Requirements
- **Secure login/signup flow** with email validation
- **JWT-based session management** with refresh tokens
- **Password encryption** using bcrypt
- **Multi-factor authentication** support
- **Role-based access control** (RBAC)

### Acceptance Criteria
- [ ] Users can register with email and password
- [ ] Login returns valid JWT tokens
- [ ] Sessions persist across browser refreshes
- [ ] Password reset functionality works
- [ ] All authentication endpoints are tested

### Technical Notes
- Use \`bcrypt\` for password hashing
- Implement \`refresh token\` rotation
- Add rate limiting to prevent brute force attacks`
      setRichDescription(mockDescription)
    }
  }

  const getPriorityIcon = (priority: Priority) => {
    const colors = {
      [Priority.LOW]: 'text-green-500',
      [Priority.MEDIUM]: 'text-krushr-warning',
      [Priority.HIGH]: 'text-krushr-secondary',
    }
    return <Flag className={cn("w-4 h-4", colors[priority])} />
  }

  const getTaskTypeIcon = (type: string) => {
    const icons = {
      'TASK': <CheckSquare className="w-4 h-4" />,
      'BUG': <AlertTriangle className="w-4 h-4" />,
      'STORY': <FileText className="w-4 h-4" />,
      'EPIC': <Target className="w-4 h-4" />,
      'SUBTASK': <List className="w-4 h-4" />
    }
    return icons[type as keyof typeof icons] || icons.TASK
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {getTaskTypeIcon(taskType)}
              {isEditMode ? 'Edit Task' : 'Create New Task'}
              {task?.id && (
                <Badge variant="outline" className="text-xs">
                  #{task.id.slice(-6)}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <>
                  <Button size="sm" variant="ghost" title="Watch Task">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" title="Star Task">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" title="Share Task">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
              <TabsTrigger value="attachments">Files</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="details" className="space-y-6 p-6">
                {/* Task Type and Template */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Task Type</Label>
                    <Select value={taskType} onValueChange={setTaskType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            {getTaskTypeIcon(taskType)}
                            <span className="capitalize">{taskType.toLowerCase()}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {['TASK', 'BUG', 'STORY', 'EPIC', 'SUBTASK'].map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              {getTaskTypeIcon(type)}
                              <span className="capitalize">{type.toLowerCase()}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Template</Label>
                    <Select value={templateId} onValueChange={setTemplateId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No template</SelectItem>
                        <SelectItem value="1">🐛 Bug Report</SelectItem>
                        <SelectItem value="2">✨ Feature Request</SelectItem>
                        <SelectItem value="3">📝 User Story</SelectItem>
                        <SelectItem value="4">🔒 Security Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Title with AI assistance */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter task title..."
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAiGenerate('title')}
                      title="AI Suggestions"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Rich Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Description</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAiGenerate('description')}
                      className="h-6 px-2 text-xs"
                    >
                      <Bot className="w-3 h-3 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                  <RichTextEditor
                    value={richDescription}
                    onChange={setRichDescription}
                    placeholder="Add a detailed description with rich formatting..."
                  />
                </div>

                {/* Priority, Status, and Progress */}
                <div className="grid grid-cols-3 gap-4">
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

                  <div>
                    <Label>Progress</Label>
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress value={progressPercent} className="flex-1" />
                        <span className="text-sm w-12">{progressPercent}%</span>
                      </div>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={progressPercent}
                        onChange={(e) => setProgressPercent(parseInt(e.target.value))}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Epic and Sprint Assignment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Epic</Label>
                    <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select epic..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No epic</SelectItem>
                        {epics.map((epic) => (
                          <SelectItem key={epic.id} value={epic.id}>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              {epic.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sprint</Label>
                    <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select sprint..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No sprint</SelectItem>
                        {sprints.map((sprint) => (
                          <SelectItem key={sprint.id} value={sprint.id}>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              {sprint.name}
                              <Badge variant={sprint.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                                {sprint.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dates and Time Estimation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

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
                          {dueDate ? format(dueDate, "PPP") : <span>Pick due date</span>}
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
                </div>

                {/* Time Estimation */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Story Points</Label>
                    <Input
                      type="number"
                      min="1"
                      max="21"
                      value={storyPoints || ''}
                      onChange={(e) => setStoryPoints(parseInt(e.target.value) || undefined)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Estimated Hours</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Actual Hours</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={actualHours}
                      onChange={(e) => setActualHours(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Remaining Hours</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={remainingHours}
                      onChange={(e) => setRemainingHours(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Assignee and Watchers */}
                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <Label>Watchers</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {watchers.map((watcherId) => {
                        const user = users.find(u => u.id === watcherId)
                        return user ? (
                          <Badge key={watcherId} variant="secondary" className="gap-1">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-xs">
                                {user.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {user.name}
                            <button
                              onClick={() => setWatchers(watchers.filter(id => id !== watcherId))}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ) : null
                      })}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2"
                        onClick={() => {
                        }}
                      >
                        <UserPlus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag..."
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

                {/* Dependencies and Blockers */}
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Dependencies
                    </Label>
                    <div className="mt-1 p-3 border border-krushr-gray-border rounded-md">
                      {dependencies.length === 0 ? (
                        <p className="text-sm text-krushr-gray text-center py-2">
                          No dependencies defined
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {dependencies.map((dep, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-krushr-gray-bg rounded">
                              <span className="text-sm">{dep.title}</span>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Dependency
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Blockers
                    </Label>
                    <div className="mt-1 p-3 border border-krushr-gray-border rounded-md">
                      {blockers.length === 0 ? (
                        <p className="text-sm text-krushr-gray text-center py-2">
                          No blockers reported
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {blockers.map((blocker, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                              <div>
                                <div className="text-sm font-medium">{blocker.title}</div>
                                <div className="text-xs text-krushr-gray">{blocker.description}</div>
                              </div>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Report Blocker
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Subtasks</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAiGenerate('subtasks')}
                    >
                      <Bot className="w-4 h-4 mr-1" />
                      AI Generate
                    </Button>
                    <Button size="sm" onClick={handleAddSubtask}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Subtask
                    </Button>
                  </div>
                </div>

                {aiSuggestions.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">AI Suggestions</span>
                    </div>
                    <div className="space-y-1">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              const newSubtask = {
                                id: Date.now().toString() + index,
                                title: suggestion,
                                description: '',
                                priority: 'MEDIUM',
                                status: 'TODO',
                                estimatedHours: 0
                              }
                              setSubtasks([...subtasks, newSubtask])
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {subtasks.map((subtask) => (
                    <SubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      onUpdate={(updates) => handleUpdateSubtask(subtask.id, updates)}
                      onDelete={() => handleDeleteSubtask(subtask.id)}
                    />
                  ))}
                  
                  {subtasks.length === 0 && aiSuggestions.length === 0 && (
                    <div className="text-center py-8 text-krushr-gray">
                      <ListChecks className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No subtasks yet</p>
                      <p className="text-xs mt-1">Break down this task into smaller pieces</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Attachments</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Camera className="w-4 h-4 mr-1" />
                      Screenshot
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mic className="w-4 h-4 mr-1" />
                      Voice Note
                    </Button>
                    <Button size="sm">
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Files
                    </Button>
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-krushr-gray-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-krushr-gray mb-2" />
                  <p className="text-sm text-krushr-gray">
                    Drop files here or <button className="text-krushr-primary hover:underline">browse</button>
                  </p>
                  <p className="text-xs text-krushr-gray mt-1">
                    Maximum file size: 50MB • Supports all file types
                  </p>
                </div>

                {/* Existing Attachments */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Document */}
                  <div className="flex items-center gap-3 p-3 border border-krushr-gray-border rounded-md">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">requirements.pdf</div>
                      <div className="text-xs text-krushr-gray">2.3 MB • PDF</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-krushr-secondary">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="flex items-center gap-3 p-3 border border-krushr-gray-border rounded-md">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">mockup-design.png</div>
                      <div className="text-xs text-krushr-gray">1.1 MB • PNG</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-krushr-secondary">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Voice Note */}
                  <div className="flex items-center gap-3 p-3 border border-krushr-gray-border rounded-md">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <FileAudio className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">voice-note-01.mp3</div>
                      <div className="text-xs text-krushr-gray">0:32 • 245 KB</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-krushr-secondary">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Screenshot */}
                  <div className="flex items-center gap-3 p-3 border border-krushr-gray-border rounded-md">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                      <Camera className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">screenshot-bug.png</div>
                      <div className="text-xs text-krushr-gray">Just now • 892 KB</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-krushr-secondary">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Activity & Comments</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </Button>
                    <Button size="sm" variant="outline">
                      <History className="w-4 h-4 mr-1" />
                      History
                    </Button>
                  </div>
                </div>

                {/* Comment Input */}
                <div className="space-y-2">
                  <RichTextEditor
                    value={newComment}
                    onChange={setNewComment}
                    placeholder="Add a comment..."
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <AtSign className="w-4 h-4 mr-1" />
                        Mention
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Paperclip className="w-4 h-4 mr-1" />
                        Attach
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="internal" />
                      <Label htmlFor="internal" className="text-xs">Internal only</Label>
                      <Button size="sm">Comment</Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Activity Feed */}
                <div className="space-y-4">
                  {/* System Activity */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-krushr-primary flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">System</span> created this task
                      </div>
                      <div className="text-xs text-krushr-gray">2 hours ago</div>
                    </div>
                  </div>

                  {/* User Comment */}
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/avatars/alice.jpg" />
                      <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm mb-1">
                        <span className="font-medium">Alice Johnson</span>
                      </div>
                      <div className="bg-krushr-gray-bg border border-krushr-gray-border rounded-md p-3">
                        <p className="text-sm">
                          I've reviewed the requirements and this looks good to start. 
                          We should prioritize the authentication flow first.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                            👍 2
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                            Reply
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-krushr-gray mt-1">1 hour ago</div>
                    </div>
                  </div>

                  {/* Status Change */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">Bob Smith</span> moved this task from 
                        <Badge variant="outline" className="mx-1">To Do</Badge> to 
                        <Badge variant="outline" className="mx-1">In Progress</Badge>
                      </div>
                      <div className="text-xs text-krushr-gray">30 minutes ago</div>
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm mb-1">
                        <span className="font-medium">AI Assistant</span> suggests
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                        <p className="text-sm">
                          Based on similar tasks, you might want to add these subtasks:
                        </p>
                        <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                          <li>Set up database schema</li>
                          <li>Create API endpoints</li>
                          <li>Add unit tests</li>
                        </ul>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                            Apply Suggestions
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-krushr-gray mt-1">15 minutes ago</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="time" className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Time Tracking</h3>
                  <TimeTracker
                    isTracking={timeTracking.isTracking}
                    onStart={() => setTimeTracking({ ...timeTracking, isTracking: true })}
                    onStop={() => setTimeTracking({ ...timeTracking, isTracking: false })}
                    duration={timeTracking.duration}
                  />
                </div>

                {/* Time Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border border-krushr-gray-border rounded-md text-center">
                    <div className="text-2xl font-bold text-krushr-primary">8.5h</div>
                    <div className="text-sm text-krushr-gray">Estimated</div>
                  </div>
                  <div className="p-4 border border-krushr-gray-border rounded-md text-center">
                    <div className="text-2xl font-bold text-krushr-secondary">6.2h</div>
                    <div className="text-sm text-krushr-gray">Actual</div>
                  </div>
                  <div className="p-4 border border-krushr-gray-border rounded-md text-center">
                    <div className="text-2xl font-bold text-krushr-warning">2.3h</div>
                    <div className="text-sm text-krushr-gray">Remaining</div>
                  </div>
                </div>

                {/* Time Entries */}
                <div className="space-y-3">
                  <h4 className="font-medium">Time Entries</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-krushr-gray-border rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">BS</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">Bob Smith</div>
                          <div className="text-xs text-krushr-gray">Initial research and planning</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">2.5h</div>
                        <div className="text-xs text-krushr-gray">Today</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-krushr-gray-border rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">AJ</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">Alice Johnson</div>
                          <div className="text-xs text-krushr-gray">Code review and testing</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">1.5h</div>
                        <div className="text-xs text-krushr-gray">Yesterday</div>
                      </div>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time Entry
                  </Button>
                </div>

                {/* Burndown Chart Placeholder */}
                <div className="p-6 border border-krushr-gray-border rounded-md">
                  <h4 className="font-medium mb-3">Burndown Chart</h4>
                  <div className="h-32 bg-krushr-gray-bg rounded flex items-center justify-center">
                    <div className="text-center text-krushr-gray">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Chart visualization would go here</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">AI Assistant</h3>
                  <Badge variant="secondary">
                    <Brain className="w-3 h-3 mr-1" />
                    GPT-4
                  </Badge>
                </div>

                {/* AI Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleAiGenerate('description')}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Generate Description</span>
                    </div>
                    <p className="text-xs text-left text-krushr-gray">
                      Create detailed task description with acceptance criteria
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleAiGenerate('subtasks')}
                  >
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Generate Subtasks</span>
                    </div>
                    <p className="text-xs text-left text-krushr-gray">
                      Break down task into actionable subtasks
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Estimate Time</span>
                    </div>
                    <p className="text-xs text-left text-krushr-gray">
                      Get AI-powered time estimates based on similar tasks
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Risk Analysis</span>
                    </div>
                    <p className="text-xs text-left text-krushr-gray">
                      Identify potential risks and mitigation strategies
                    </p>
                  </Button>
                </div>

                {/* AI Chat Interface */}
                <div className="border border-krushr-gray-border rounded-md">
                  <div className="p-3 border-b border-krushr-gray-border bg-krushr-gray-bg">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span className="font-medium text-sm">AI Assistant Chat</span>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
                    {/* AI Response */}
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-purple-600" />
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-2 flex-1">
                        <p className="text-sm">
                          I can help you with this task! Based on the title "Implement user authentication", 
                          I suggest breaking it down into these key areas: database setup, API endpoints, 
                          frontend components, and security measures. Would you like me to generate specific subtasks?
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-krushr-gray-border">
                    <div className="flex gap-2">
                      <Input
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ask AI anything..."
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            setAiPrompt('')
                          }
                        }}
                      />
                      <Button size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="space-y-3">
                  <h4 className="font-medium">AI Insights</h4>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-800">Complexity Analysis</div>
                        <div className="text-sm text-blue-700">
                          This task has high complexity due to security requirements. 
                          Consider adding extra time for testing and security reviews.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-orange-800">Potential Blockers</div>
                        <div className="text-sm text-orange-700">
                          Dependencies on external OAuth providers may cause delays. 
                          Consider fallback authentication methods.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-green-800">Optimization Tip</div>
                        <div className="text-sm text-green-700">
                          Similar tasks in your workspace took 20% less time when broken into smaller subtasks.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0 border-t border-krushr-gray-border bg-krushr-gray-bg-light">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {isEditMode && (
                <>
                  <Button size="sm" variant="ghost">
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                  <Button size="sm" variant="ghost" className="text-krushr-secondary">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title}
                className="bg-krushr-primary hover:bg-krushr-primary/90"
              >
                {isEditMode ? (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Update Task
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)