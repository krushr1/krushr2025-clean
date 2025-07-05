/**
 * Universal Input Form Types
 * Comprehensive type definitions for the universal form component
 * that handles tasks, notes, calendar events, and mixed content creation
 */

import { Priority, TaskStatus } from './enums'

/**
 * Content type determines which fields are shown and how data is processed
 */
export enum ContentType {
  TASK = 'TASK',
  NOTE = 'NOTE', 
  CALENDAR_EVENT = 'CALENDAR_EVENT',
  MIXED = 'MIXED' // Allows creating multiple content types at once
}

/**
 * Priority level with visual indicators
 */
export interface PriorityConfig {
  level: Priority
  dots: number // Number of filled priority dots (1-5)
  color: string
}

/**
 * File attachment structure
 */
export interface FileAttachment {
  id?: string
  name: string
  size: number
  type: string
  url?: string
  file?: File // For new uploads
}

/**
 * Checklist item structure
 */
export interface ChecklistItem {
  id?: string
  text: string
  completed: boolean
  order?: number
}

/**
 * Subtask reference
 */
export interface SubtaskReference {
  id: string
  title: string
  priority: Priority
  status: TaskStatus
  tags: string[]
}

/**
 * Reminder configuration
 */
export interface ReminderConfig {
  enabled: boolean
  timeBefore: string // e.g., "1d", "1h", "30m"
  type: 'email' | 'notification' | 'both'
}

/**
 * Workflow automation toggles
 */
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

/**
 * Recurring event configuration
 */
export interface RecurringConfig {
  enabled: boolean
  startDate?: Date
  endDate?: Date
  pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number
  daysOfWeek?: number[]
}

/**
 * Team member assignment
 */
export interface TeamAssignment {
  userId: string
  name: string
  avatar?: string
  role?: string
}

/**
 * Main form data structure
 */
export interface UniversalFormData {
  // Content identification
  contentType: ContentType
  id?: string // For editing existing content
  
  // Basic fields
  title: string
  description: string
  priority: Priority
  tags: string[]
  
  // Date and time
  allDay: boolean
  startDate?: Date
  startTime?: string
  endDate?: Date
  endTime?: string
  duration?: string
  
  // Calendar specific
  calendar?: string // Email or calendar identifier
  recurring: RecurringConfig
  
  // Task specific
  status: TaskStatus
  assigneeId?: string
  estimatedHours?: number
  kanbanColumnId?: string
  projectId?: string
  
  // Team and collaboration
  teamMembers: TeamAssignment[]
  
  // Content organization
  checklist: ChecklistItem[]
  subtasks: SubtaskReference[]
  attachments: FileAttachment[]
  
  // Workflow automation
  workflow: WorkflowConfig
  
  // Context
  workspaceId: string
  createdBy?: string
  lastUpdatedBy?: string
}

/**
 * Component props interface
 */
export interface UniversalFormProps {
  // Control
  open: boolean
  onClose: () => void
  onSuccess?: (data: UniversalFormData, contentType: ContentType) => void
  
  // Initial data
  initialData?: Partial<UniversalFormData>
  contentType?: ContentType
  
  // Context
  workspaceId: string
  projectId?: string
  kanbanColumnId?: string
  
  // UI configuration
  showWorkflowToggles?: boolean
  showFileUploads?: boolean
  allowContentTypeSwitch?: boolean
  compactMode?: boolean
  
  // Validation
  requiredFields?: string[]
  maxTitleLength?: number
  maxDescriptionLength?: number
}

/**
 * Form validation result
 */
export interface FormValidation {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

/**
 * Form section configuration
 */
export interface FormSection {
  id: string
  title: string
  visible: boolean
  expanded: boolean
  required: boolean
  order: number
}

/**
 * Template configuration for form presets
 */
export interface FormTemplate {
  id: string
  name: string
  description: string
  contentType: ContentType
  defaultData: Partial<UniversalFormData>
  sections: FormSection[]
  workflowDefaults: Partial<WorkflowConfig>
}

/**
 * Utility type for form field updates
 */
export type FormFieldUpdate<K extends keyof UniversalFormData> = {
  field: K
  value: UniversalFormData[K]
}

/**
 * Export all types for easy importing
 */
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