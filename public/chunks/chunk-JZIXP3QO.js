import {
  __toESM,
  cn,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-CPGAIYPB.js";

// src/components/ui/textarea.tsx
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "textarea",
    {
      className: cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";

// ../node_modules/zustand/esm/vanilla.mjs
var createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
var createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;

// ../node_modules/zustand/esm/react.mjs
var import_react = __toESM(require_react(), 1);
var identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = import_react.default.useSyncExternalStore(
    api.subscribe,
    () => selector(api.getState()),
    () => selector(api.getInitialState())
  );
  import_react.default.useDebugValue(slice);
  return slice;
}
var createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
var create = (createState) => createState ? createImpl(createState) : createImpl;

// ../node_modules/zustand/esm/middleware.mjs
var subscribeWithSelectorImpl = (fn) => (set, get, api) => {
  const origSubscribe = api.subscribe;
  api.subscribe = (selector, optListener, options) => {
    let listener = selector;
    if (optListener) {
      const equalityFn = (options == null ? void 0 : options.equalityFn) || Object.is;
      let currentSlice = selector(api.getState());
      listener = (state) => {
        const nextSlice = selector(state);
        if (!equalityFn(currentSlice, nextSlice)) {
          const previousSlice = currentSlice;
          optListener(currentSlice = nextSlice, previousSlice);
        }
      };
      if (options == null ? void 0 : options.fireImmediately) {
        optListener(currentSlice, currentSlice);
      }
    }
    return origSubscribe(listener);
  };
  const initialState = fn(set, get, api);
  return initialState;
};
var subscribeWithSelector = subscribeWithSelectorImpl;
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, options == null ? void 0 : options.reviver);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(name, JSON.stringify(newValue, options == null ? void 0 : options.replacer)),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
var toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
var persistImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            const migration = options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
            if (migration instanceof Promise) {
              return migration.then((result) => [true, result]);
            }
            return [true, migration];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
var persist = persistImpl;

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
  create,
  persist,
  Textarea,
  API_ENDPOINTS,
  useAppStore,
  useWebSocket
};
//# sourceMappingURL=/chunks/chunk-JZIXP3QO.js.map
