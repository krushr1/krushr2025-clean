/**
 * Frontend type definitions
 * Matches the backend Prisma schema
 */

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Workspace {
  id: string
  name: string
  description?: string | null
  settings?: any
  ownerId: string
  owner?: User
  members?: WorkspaceMember[]
  teams?: Team[]
  projects?: Project[]
  kanbans?: Kanban[]
  createdAt: Date | string
  updatedAt: Date | string
  _count?: {
    projects: number
    teams: number
    kanbans: number
  }
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: string
  user?: User
  workspace?: Workspace
  joinedAt: Date | string
}

export interface Team {
  id: string
  name: string
  description?: string | null
  workspaceId: string
  workspace?: Workspace
  members?: TeamMember[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: string
  user?: User
  team?: Team
  joinedAt: Date | string
}

export interface Project {
  id: string
  name: string
  description?: string | null
  workspaceId: string
  workspace?: Workspace
  tasks?: Task[]
  kanbans?: Kanban[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Kanban {
  id: string
  title: string
  description?: string | null
  position: number
  workspaceId: string
  projectId?: string | null
  workspace?: Workspace
  project?: Project
  columns?: KanbanColumn[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface KanbanColumn {
  id: string
  title: string
  position: number
  color?: string | null
  kanbanId: string
  kanban?: Kanban
  tasks?: Task[]
  isCompletedColumn: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  position: number
  dueDate?: Date | string | null
  estimatedHours?: number | null
  tags?: string[]
  workspaceId: string
  projectId?: string | null
  kanbanColumnId?: string | null
  assigneeId?: string | null
  createdById: string
  workspace?: Workspace
  project?: Project
  kanbanColumn?: KanbanColumn
  assignee?: User
  createdBy?: User
  comments?: Comment[]
  attachments?: Attachment[]
  activities?: Activity[]
  createdAt: Date | string
  updatedAt: Date | string
  _count?: {
    comments: number
    attachments: number
  }
}

export interface Comment {
  id: string
  content: string
  taskId: string
  userId: string
  task?: Task
  user?: User
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Attachment {
  id: string
  filename: string
  downloadUrl: string
  thumbnailUrl?: string | null
  size: number
  mimeType: string
  compressed?: boolean
  uploadedAt: Date | string
}

export interface Activity {
  id: string
  type: string
  userId: string
  taskId?: string | null
  projectId?: string | null
  workspaceId?: string | null
  data?: any
  user?: User
  task?: Task
  project?: Project
  workspace?: Workspace
  createdAt: Date | string
}

export interface Notification {
  id: string
  title: string
  message?: string | null
  type: string
  isRead: boolean
  userId: string
  data?: any
  user?: User
  createdAt: Date | string
}

export interface ChatThread {
  id: string
  name?: string | null
  type: 'DIRECT' | 'TEAM'
  teamId?: string | null
  team?: Team
  participants?: ChatParticipant[]
  messages?: ChatMessage[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ChatParticipant {
  id: string
  userId: string
  threadId: string
  user?: User
  thread?: ChatThread
  joinedAt: Date | string
}

export interface ChatMessage {
  id: string
  content: string
  threadId: string
  userId: string
  thread?: ChatThread
  user?: User
  createdAt: Date | string
  updatedAt: Date | string
}