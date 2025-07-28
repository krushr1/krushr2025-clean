import {
  subscribeWithSelector
} from "/chunks/chunk-PFMVW4LI.js";
import {
  create
} from "/chunks/chunk-KDAPYUH3.js";

// ../shared/constants.ts
var API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  // Workspaces
  WORKSPACES: "/workspaces",
  // Teams
  TEAMS: "/teams",
  // Kanbans
  KANBANS: "/kanbans",
  // Tasks
  TASKS: "/tasks",
  // Panels
  PANELS: "/panels",
  // Notifications
  NOTIFICATIONS: "/notifications",
  // Email
  EMAILS: "/emails",
  // Calendar
  CALENDAR: "/calendar",
  // Chat
  CHAT: "/chat",
  PERSONAL_CHAT: "/chat/personal",
  TEAM_CHAT: "/chat/team",
  // OpenAI
  OPENAI: "/openai",
  // Tags
  TAGS: "/tags"
};
var WEBSOCKET_EVENTS = {
  // Chat events
  PERSONAL_CHAT_MESSAGE: "personal-chat-message",
  TEAM_CHAT_MESSAGE: "team-chat-message",
  // Notification events
  NOTIFICATION_CREATED: "notification-created",
  // Task events
  TASK_UPDATED: "task-updated",
  KANBAN_UPDATED: "kanban-updated",
  // Presence events
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline"
};

// src/stores/app-store.ts
var useAppStore = create()(
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
    currentPage: "home",
    loading: false,
    error: null,
    websocket: {
      connected: false,
      socket: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5
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
      tasks: state.tasks.map(
        (task) => task.id === taskId ? { ...task, ...updates } : task
      )
    })),
    deleteTask: (taskId) => set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId)
    })),
    setNotifications: (notifications) => set({ notifications }),
    addNotification: (notification) => set((state) => ({
      notifications: [notification, ...state.notifications]
    })),
    markNotificationRead: (notificationId) => set((state) => ({
      notifications: state.notifications.map(
        (notif) => notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    connectWebSocket: () => {
      const state = get();
      if (state.websocket.socket || !state.isAuthenticated) return;
      const wsUrl = false ? "wss://api.krushr.app/ws" : "ws://localhost:6001/app/krushr";
      try {
        const socket = new WebSocket(wsUrl);
        socket.onopen = () => {
          console.log("WebSocket connected");
          set((state2) => ({
            websocket: {
              ...state2.websocket,
              connected: true,
              socket,
              reconnectAttempts: 0
            }
          }));
        };
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message, set, get);
          } catch (error) {
            console.error("WebSocket message parse error:", error);
          }
        };
        socket.onclose = () => {
          console.log("WebSocket disconnected");
          set((state2) => ({
            websocket: {
              ...state2.websocket,
              connected: false,
              socket: null
            }
          }));
          const currentState = get();
          if (currentState.websocket.reconnectAttempts < currentState.websocket.maxReconnectAttempts) {
            setTimeout(() => {
              set((state2) => ({
                websocket: {
                  ...state2.websocket,
                  reconnectAttempts: state2.websocket.reconnectAttempts + 1
                }
              }));
              get().connectWebSocket();
            }, 2e3 * Math.pow(2, currentState.websocket.reconnectAttempts));
          }
        };
        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          set({ error: "Connection error occurred" });
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        set({ error: "Failed to connect to real-time service" });
      }
    },
    disconnectWebSocket: () => {
      const state = get();
      if (state.websocket.socket) {
        state.websocket.socket.close();
        set((state2) => ({
          websocket: {
            ...state2.websocket,
            connected: false,
            socket: null
          }
        }));
      }
    },
    sendMessage: (event, data) => {
      const state = get();
      if (state.websocket.connected && state.websocket.socket) {
        state.websocket.socket.send(JSON.stringify({
          event,
          data,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    }
  }))
);
function handleWebSocketMessage(message, set, get) {
  const { event, data } = message;
  switch (event) {
    case WEBSOCKET_EVENTS.TASK_UPDATED:
      get().updateTask(data.id, data);
      break;
    case WEBSOCKET_EVENTS.KANBAN_UPDATED:
      set((state) => ({
        kanbans: state.kanbans.map(
          (kanban) => kanban.id === data.id ? data : kanban
        )
      }));
      break;
    case WEBSOCKET_EVENTS.NOTIFICATION_CREATED:
      get().addNotification(data);
      break;
    case WEBSOCKET_EVENTS.PERSONAL_CHAT_MESSAGE:
    case WEBSOCKET_EVENTS.TEAM_CHAT_MESSAGE:
      console.log("Chat message received:", data);
      break;
    case WEBSOCKET_EVENTS.USER_ONLINE:
    case WEBSOCKET_EVENTS.USER_OFFLINE:
      console.log("User presence change:", data);
      break;
    default:
      console.log("Unknown WebSocket event:", event, data);
  }
}
var useWebSocket = () => {
  const connected = useAppStore((state) => state.websocket.connected);
  const sendMessage = useAppStore((state) => state.sendMessage);
  return { connected, sendMessage };
};

export {
  API_ENDPOINTS,
  useAppStore,
  useWebSocket
};
//# sourceMappingURL=/chunks/chunk-YAFXMZPJ.js.map
