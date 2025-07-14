
import { ApiResponse, PaginatedResponse, User, Kanban, Task, Team, Workspace, Notification } from '../../../shared/types'
import { API_ENDPOINTS, HTTP_STATUS } from '../../../shared/constants'

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.krushr.app' 
  : 'http://localhost:8000/api'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('auth_token')
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response.success && response.data?.token) {
      this.token = response.data.token
      localStorage.setItem('auth_token', this.token)
    }
    
    return response
  }

  async logout(): Promise<void> {
    await this.request(API_ENDPOINTS.LOGOUT, { method: 'POST' })
    this.token = null
    localStorage.removeItem('auth_token')
  }

  async me(): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.ME)
  }

  async getWorkspaces(): Promise<ApiResponse<Workspace[]>> {
    return this.request<Workspace[]>(API_ENDPOINTS.WORKSPACES)
  }

  async createWorkspace(data: Partial<Workspace>): Promise<ApiResponse<Workspace>> {
    return this.request<Workspace>(API_ENDPOINTS.WORKSPACES, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTeams(): Promise<ApiResponse<Team[]>> {
    return this.request<Team[]>(API_ENDPOINTS.TEAMS)
  }

  async createTeam(data: Partial<Team>): Promise<ApiResponse<Team>> {
    return this.request<Team>(API_ENDPOINTS.TEAMS, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getKanbans(): Promise<ApiResponse<Kanban[]>> {
    return this.request<Kanban[]>(API_ENDPOINTS.KANBANS)
  }

  async getKanban(id: string): Promise<ApiResponse<Kanban>> {
    return this.request<Kanban>(`${API_ENDPOINTS.KANBANS}/${id}`)
  }

  async createKanban(data: Partial<Kanban>): Promise<ApiResponse<Kanban>> {
    return this.request<Kanban>(API_ENDPOINTS.KANBANS, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateKanban(id: string, data: Partial<Kanban>): Promise<ApiResponse<Kanban>> {
    return this.request<Kanban>(`${API_ENDPOINTS.KANBANS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getTasks(kanbanId?: string): Promise<ApiResponse<Task[]>> {
    const endpoint = kanbanId 
      ? `${API_ENDPOINTS.TASKS}?kanban_id=${kanbanId}`
      : API_ENDPOINTS.TASKS
    return this.request<Task[]>(endpoint)
  }

  async createTask(data: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(`${API_ENDPOINTS.TASKS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_ENDPOINTS.TASKS}/${id}`, {
      method: 'DELETE',
    })
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>(API_ENDPOINTS.NOTIFICATIONS)
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, {
      method: 'PUT',
    })
  }
}

export const api = new ApiClient(API_BASE_URL)

export const auth = {
  login: api.login.bind(api),
  logout: api.logout.bind(api),
  me: api.me.bind(api),
}

export const workspaces = {
  list: api.getWorkspaces.bind(api),
  create: api.createWorkspace.bind(api),
}

export const teams = {
  list: api.getTeams.bind(api),
  create: api.createTeam.bind(api),
}

export const kanbans = {
  list: api.getKanbans.bind(api),
  get: api.getKanban.bind(api),
  create: api.createKanban.bind(api),
  update: api.updateKanban.bind(api),
}

export const tasks = {
  list: api.getTasks.bind(api),
  create: api.createTask.bind(api),
  update: api.updateTask.bind(api),
  delete: api.deleteTask.bind(api),
}

export const notifications = {
  list: api.getNotifications.bind(api),
  markRead: api.markNotificationRead.bind(api),
}