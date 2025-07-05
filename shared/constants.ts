// Shared constants across frontend and backend

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // Workspaces
  WORKSPACES: '/workspaces',
  
  // Teams
  TEAMS: '/teams',
  
  // Kanbans
  KANBANS: '/kanbans',
  
  // Tasks
  TASKS: '/tasks',
  
  // Panels
  PANELS: '/panels',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  
  // Email
  EMAILS: '/emails',
  
  // Calendar
  CALENDAR: '/calendar',
  
  // Chat
  CHAT: '/chat',
  PERSONAL_CHAT: '/chat/personal',
  TEAM_CHAT: '/chat/team',
  
  // OpenAI
  OPENAI: '/openai',
  
  // Tags
  TAGS: '/tags'
} as const;

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const PANEL_TYPES = {
  KANBAN: 'kanban',
  CALENDAR: 'calendar',
  CHAT: 'chat',
  NOTES: 'notes',
  EMAIL: 'email',
  CONTACTS: 'contacts'
} as const;

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TEAM_INVITATION: 'team_invitation',
  USER_INVITATION: 'user_invitation',
  CHAT_MESSAGE: 'chat_message',
  EMAIL_RECEIVED: 'email_received'
} as const;

export const WEBSOCKET_EVENTS = {
  // Chat events
  PERSONAL_CHAT_MESSAGE: 'personal-chat-message',
  TEAM_CHAT_MESSAGE: 'team-chat-message',
  
  // Notification events
  NOTIFICATION_CREATED: 'notification-created',
  
  // Task events
  TASK_UPDATED: 'task-updated',
  KANBAN_UPDATED: 'kanban-updated',
  
  // Presence events
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  PER_PAGE: 15,
  MAX_PER_PAGE: 100
} as const;