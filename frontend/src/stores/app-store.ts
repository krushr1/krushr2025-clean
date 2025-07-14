
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { User, Kanban, Task, Team, Workspace, Notification } from '../../../shared/types.js'
import { WEBSOCKET_EVENTS } from '../../../shared/constants.js'

interface WebSocketState {
  connected: boolean
  socket: WebSocket | null
  reconnectAttempts: number
  maxReconnectAttempts: number
}

interface AppState {
  // Authentication
  user: User | null
  isAuthenticated: boolean
  
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  teams: Team[]
  kanbans: Kanban[]
  tasks: Task[]
  notifications: Notification[]
  
  sidebarOpen: boolean
  currentPage: string
  loading: boolean
  error: string | null
  
  websocket: WebSocketState
  
  setUser: (user: User | null) => void
  setActiveWorkspace: (workspace: Workspace) => void
  setWorkspaces: (workspaces: Workspace[]) => void
  setTeams: (teams: Team[]) => void
  setKanbans: (kanbans: Kanban[]) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (notificationId: string) => void
  setSidebarOpen: (open: boolean) => void
  setCurrentPage: (page: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  connectWebSocket: () => void
  disconnectWebSocket: () => void
  sendMessage: (event: string, data: any) => void
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    isAuthenticated: false,
    workspaces: [],
    activeWorkspace: null,
    teams: [],
    kanbans: [],
    tasks: [],
    notifications: [],
    sidebarOpen: true,
    currentPage: 'home',
    loading: false,
    error: null,
    websocket: {
      connected: false,
      socket: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
    },

    // Authentication Actions
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    
    setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
    setWorkspaces: (workspaces) => set({ workspaces }),
    setTeams: (teams) => set({ teams }),
    setKanbans: (kanbans) => set({ kanbans }),
    setTasks: (tasks) => set({ tasks }),
    
    addTask: (task) => set((state) => ({
      tasks: [...state.tasks, task]
    })),
    
    updateTask: (taskId, updates) => set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    })),
    
    deleteTask: (taskId) => set((state) => ({
      tasks: state.tasks.filter(task => task.id !== taskId)
    })),
    
    setNotifications: (notifications) => set({ notifications }),
    
    addNotification: (notification) => set((state) => ({
      notifications: [notification, ...state.notifications]
    })),
    
    markNotificationRead: (notificationId) => set((state) => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    })),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    connectWebSocket: () => {
      const state = get()
      if (state.websocket.socket || !state.isAuthenticated) return

      const wsUrl = process.env.NODE_ENV === 'production' 
        ? 'wss://api.krushr.app/ws' 
        : 'ws://localhost:6001/app/krushr'

      try {
        const socket = new WebSocket(wsUrl)
        
        socket.onopen = () => {
          console.log('WebSocket connected')
          set((state) => ({
            websocket: {
              ...state.websocket,
              connected: true,
              socket,
              reconnectAttempts: 0,
            }
          }))
        }

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            handleWebSocketMessage(message, set, get)
          } catch (error) {
            console.error('WebSocket message parse error:', error)
          }
        }

        socket.onclose = () => {
          console.log('WebSocket disconnected')
          set((state) => ({
            websocket: {
              ...state.websocket,
              connected: false,
              socket: null,
            }
          }))
          
          const currentState = get()
          if (currentState.websocket.reconnectAttempts < currentState.websocket.maxReconnectAttempts) {
            setTimeout(() => {
              set((state) => ({
                websocket: {
                  ...state.websocket,
                  reconnectAttempts: state.websocket.reconnectAttempts + 1,
                }
              }))
              get().connectWebSocket()
            }, 2000 * Math.pow(2, currentState.websocket.reconnectAttempts))
          }
        }

        socket.onerror = (error) => {
          console.error('WebSocket error:', error)
          set({ error: 'Connection error occurred' })
        }

      } catch (error) {
        console.error('WebSocket connection failed:', error)
        set({ error: 'Failed to connect to real-time service' })
      }
    },

    disconnectWebSocket: () => {
      const state = get()
      if (state.websocket.socket) {
        state.websocket.socket.close()
        set((state) => ({
          websocket: {
            ...state.websocket,
            connected: false,
            socket: null,
          }
        }))
      }
    },

    sendMessage: (event, data) => {
      const state = get()
      if (state.websocket.connected && state.websocket.socket) {
        state.websocket.socket.send(JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        }))
      }
    },
  }))
)

function handleWebSocketMessage(
  message: any, 
  set: any, 
  get: () => AppState
) {
  const { event, data } = message

  switch (event) {
    case WEBSOCKET_EVENTS.TASK_UPDATED:
      get().updateTask(data.id, data)
      break
      
    case WEBSOCKET_EVENTS.KANBAN_UPDATED:
      set((state: AppState) => ({
        kanbans: state.kanbans.map(kanban =>
          kanban.id === data.id ? data : kanban
        )
      }))
      break
      
    case WEBSOCKET_EVENTS.NOTIFICATION_CREATED:
      get().addNotification(data)
      break
      
    case WEBSOCKET_EVENTS.PERSONAL_CHAT_MESSAGE:
    case WEBSOCKET_EVENTS.TEAM_CHAT_MESSAGE:
      console.log('Chat message received:', data)
      break
      
    case WEBSOCKET_EVENTS.USER_ONLINE:
    case WEBSOCKET_EVENTS.USER_OFFLINE:
      console.log('User presence change:', data)
      break
      
    default:
      console.log('Unknown WebSocket event:', event, data)
  }
}

export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}))

export const useWorkspace = () => useAppStore((state) => ({
  workspaces: state.workspaces,
  activeWorkspace: state.activeWorkspace,
}))

export const useKanbans = () => useAppStore((state) => state.kanbans)
export const useTasks = () => useAppStore((state) => state.tasks)
export const useNotifications = () => useAppStore((state) => state.notifications)
export const useUI = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  currentPage: state.currentPage,
  loading: state.loading,
  error: state.error,
}))

export const useWebSocket = () => {
  const connected = useAppStore((state) => state.websocket.connected)
  const sendMessage = useAppStore((state) => state.sendMessage)
  return { connected, sendMessage }
}