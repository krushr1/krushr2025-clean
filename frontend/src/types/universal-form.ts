
import { Priority, TaskStatus } from './enums'

export enum ContentType {
  TASK = 'TASK',
  NOTE = 'NOTE', 
  CALENDAR_EVENT = 'CALENDAR_EVENT',
  MIXED = 'MIXED' // Allows creating multiple content types at once
}

export interface PriorityConfig {
  level: Priority
  dots: number // Number of filled priority dots (1-5)
  color: string
}

export interface FileAttachment {
  id?: string
  name: string
  size: number
  type: string
  url?: string
  file?: File // For new uploads
}

export interface ChecklistItem {
  id?: string
  text: string
  completed: boolean
  order?: number
}

export interface SubtaskReference {
  id: string
  title: string
  priority: Priority
  status: TaskStatus
  tags: string[]
}

export interface ReminderConfig {
  enabled: boolean
  timeBefore: string // e.g., "1d", "1h", "30m"
  type: 'email' | 'notification' | 'both'
}

export interface WorkflowConfig {
  createVideoMeeting: boolean
  createCall: boolean
  kanbanTaskBoard: boolean
  notes: boolean
  ganttTimeline: boolean
  ganttDependency: boolean
  reminder: boolean
  notifyTeam: boolean
  changesNotifyTeam: boolean
  reminders: ReminderConfig[]
}

export interface RecurringConfig {
  enabled: boolean
  startDate?: Date
  endDate?: Date
  pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number
  daysOfWeek?: number[]
}

export interface TeamAssignment {
  userId: string
  name: string
  avatar?: string
  role?: string
}

export interface UniversalFormData {
  contentType: ContentType
  id?: string // For editing existing content
  
  title: string
  description: string
  priority: Priority
  tags: string[]
  
  allDay: boolean
  startDate?: Date
  startTime?: string
  endDate?: Date
  endTime?: string
  duration?: string
  
  calendar?: string // Email or calendar identifier
  recurring: RecurringConfig
  
  status: TaskStatus
  assigneeId?: string
  estimatedHours?: number
  kanbanColumnId?: string
  projectId?: string
  
  teamMembers: TeamAssignment[]
  
  checklist: ChecklistItem[]
  subtasks: SubtaskReference[]
  attachments: FileAttachment[]
  
  workflow: WorkflowConfig
  
  workspaceId: string
  createdBy?: string
  lastUpdatedBy?: string
}

export interface UniversalFormProps {
  open: boolean
  onClose: () => void
  onSuccess?: (data: UniversalFormData, contentType: ContentType) => void
  
  initialData?: Partial<UniversalFormData>
  contentType?: ContentType
  
  workspaceId: string
  projectId?: string
  kanbanColumnId?: string
  
  showWorkflowToggles?: boolean
  showFileUploads?: boolean
  allowContentTypeSwitch?: boolean
  compactMode?: boolean
  
  requiredFields?: string[]
  maxTitleLength?: number
  maxDescriptionLength?: number
}

export interface FormValidation {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

export interface FormSection {
  id: string
  title: string
  visible: boolean
  expanded: boolean
  required: boolean
  order: number
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  contentType: ContentType
  defaultData: Partial<UniversalFormData>
  sections: FormSection[]
  workflowDefaults: Partial<WorkflowConfig>
}

export type FormFieldUpdate<K extends keyof UniversalFormData> = {
  field: K
  value: UniversalFormData[K]
}

export type {
  ContentType,
  PriorityConfig,
  FileAttachment,
  ChecklistItem,
  SubtaskReference,
  ReminderConfig,
  WorkflowConfig,
  RecurringConfig,
  TeamAssignment,
  UniversalFormData,
  UniversalFormProps,
  FormValidation,
  FormSection,
  FormTemplate,
  FormFieldUpdate
}