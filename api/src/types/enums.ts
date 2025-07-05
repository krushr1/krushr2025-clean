/**
 * Enum Types for SQLite Compatibility
 * Since SQLite doesn't support enums, we define them as TypeScript enums
 */

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ChatThreadType {
  DIRECT = 'DIRECT',
  TEAM = 'TEAM',
  PROJECT = 'PROJECT',
}

export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_UPDATED = 'TASK_UPDATED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  MENTION = 'MENTION',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
  TEAM_INVITATION = 'TEAM_INVITATION',
  USER_INVITED = 'USER_INVITED',
  FILE_SHARED = 'FILE_SHARED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}