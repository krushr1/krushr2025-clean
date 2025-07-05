// Shared TypeScript types across frontend and backend communication

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

// Task and Kanban types (shared between Laravel and Next.js)
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignees?: User[];
  tags?: Tag[];
  due_date?: string;
  created_at: string;
  updated_at: string;
  kanban_column_id: string;
  order_number: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
  order_number: number;
  is_completed_column?: boolean;
  kanban_id: string;
}

export interface Kanban {
  id: string;
  title: string;
  description?: string;
  columns: KanbanColumn[];
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  team_id?: string;
}

// Workspace and Team types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  is_locked: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

// Panel types (for dashboard layout)
export interface Panel {
  id: string;
  type: 'kanban' | 'calendar' | 'chat' | 'notes' | 'email' | 'contacts';
  title: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_minimized: boolean;
  workspace_id: string;
  data?: Record<string, any>;
}

// Notification types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  sender?: User;
  created_at: string;
}