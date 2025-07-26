import {
  Slot
} from "/chunks/chunk-7PXHSDTH.js";
import {
  Undo2,
  __toESM,
  clsx,
  cn,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-5JVRFF7P.js";

// src/components/ui/button.tsx
var React = __toESM(require_react(), 1);

// ../node_modules/class-variance-authority/dist/index.mjs
var falsyToString = (value) => typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
var cx = clsx;
var cva = (base, config) => (props) => {
  var _config_compoundVariants;
  if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
  const { variants, defaultVariants } = config;
  const getVariantClassNames = Object.keys(variants).map((variant) => {
    const variantProp = props === null || props === void 0 ? void 0 : props[variant];
    const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
    if (variantProp === null) return null;
    const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
    return variants[variant][variantKey];
  });
  const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param) => {
    let [key, value] = param;
    if (value === void 0) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param) => {
    let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
    return Object.entries(compoundVariantOptions).every((param2) => {
      let [key, value] = param2;
      return Array.isArray(value) ? value.includes({
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key]) : {
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key] === value;
    }) ? [
      ...acc,
      cvClass,
      cvClassName
    ] : acc;
  }, []);
  return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
};

// src/components/ui/button.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

// src/hooks/use-toast.ts
var React2 = __toESM(require_react(), 1);
var TOAST_LIMIT = 1;
var TOAST_REMOVE_DELAY = 1e6;
var count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
var toastTimeouts = /* @__PURE__ */ new Map();
var addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
var reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
var listeners = [];
var memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React2.useState(memoryState);
  React2.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}

// ../node_modules/zustand/esm/vanilla.mjs
var createStoreImpl = (createState) => {
  let state;
  const listeners2 = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners2.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners2.add(listener);
    return () => listeners2.delete(listener);
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

// src/stores/undo-store.ts
var useUndoStore = create((set, get) => ({
  actions: /* @__PURE__ */ new Map(),
  addUndoableAction: (type, description, data, onUndo, ttl = 1e4) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;
    const action = {
      id,
      type,
      description,
      data,
      timestamp,
      expiresAt,
      onUndo
    };
    set((state) => {
      const newActions = new Map(state.actions);
      newActions.set(id, action);
      return { actions: newActions };
    });
    setTimeout(() => {
      get().removeAction(id);
    }, ttl);
    return id;
  },
  undo: async (actionId) => {
    const action = get().actions.get(actionId);
    if (!action) return;
    try {
      await action.onUndo();
      get().removeAction(actionId);
    } catch (error) {
      console.error("Failed to undo action:", error);
      throw error;
    }
  },
  cleanupExpired: () => {
    const now = Date.now();
    set((state) => {
      const newActions = /* @__PURE__ */ new Map();
      state.actions.forEach((action, id) => {
        if (action.expiresAt > now) {
          newActions.set(id, action);
        }
      });
      return { actions: newActions };
    });
  },
  removeAction: (actionId) => {
    set((state) => {
      const newActions = new Map(state.actions);
      newActions.delete(actionId);
      return { actions: newActions };
    });
  },
  getAction: (actionId) => {
    return get().actions.get(actionId);
  }
}));
if (typeof window !== "undefined") {
  setInterval(() => {
    useUndoStore.getState().cleanupExpired();
  }, 5e3);
}

// src/hooks/use-optimistic-delete.tsx
var import_react2 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function useOptimisticDelete() {
  const { toast: toast2 } = useToast();
  const { addUndoableAction, removeAction } = useUndoStore();
  const [deletedItems] = (0, import_react2.useState)(/* @__PURE__ */ new Map());
  const pendingDeletions = (0, import_react2.useRef)(/* @__PURE__ */ new Map());
  const deleteItem = async ({
    type,
    item,
    itemName,
    deleteAction,
    onOptimisticRemove,
    onRestore,
    ttl = 1e4
  }) => {
    const deletionKey = `${type}-${Date.now()}-${Math.random()}`;
    deletedItems.set(deletionKey, item);
    onOptimisticRemove?.();
    const typeLabels = {
      task: "Task",
      note: "Note",
      column: "Column",
      comment: "Comment",
      conversation: "Conversation",
      panel: "Panel",
      "bulk-tasks": "Tasks"
    };
    const message = `${typeLabels[type]} ${itemName ? `"${itemName}" ` : ""}deleted`;
    const undoAction = async () => {
      const timeout = pendingDeletions.current.get(deletionKey);
      if (timeout) {
        clearTimeout(timeout);
        pendingDeletions.current.delete(deletionKey);
      }
      const restoredItem = deletedItems.get(deletionKey);
      if (restoredItem && onRestore) {
        onRestore(restoredItem);
      }
      deletedItems.delete(deletionKey);
    };
    const actionId = addUndoableAction(
      type,
      message,
      item,
      undoAction,
      ttl
    );
    toast2({
      title: message,
      duration: ttl,
      action: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        Button,
        {
          size: "sm",
          variant: "outline",
          onClick: async () => {
            try {
              await undoAction();
              removeAction(actionId);
              toast2({
                title: `${typeLabels[type]} restored`,
                duration: 3e3
              });
            } catch (error) {
              toast2({
                title: "Failed to undo",
                description: "The action could not be undone",
                variant: "destructive"
              });
            }
          },
          className: "ml-auto",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Undo2, { className: "mr-1 h-3 w-3" }),
            "Undo"
          ]
        }
      ),
      onOpenChange: (open) => {
        if (!open) {
          removeAction(actionId);
        }
      }
    });
    const deletionTimeout = setTimeout(async () => {
      try {
        await deleteAction();
        deletedItems.delete(deletionKey);
        pendingDeletions.current.delete(deletionKey);
      } catch (error) {
        console.error("Failed to delete item:", error);
        if (onRestore) {
          const restoredItem = deletedItems.get(deletionKey);
          if (restoredItem) {
            onRestore(restoredItem);
          }
        }
        toast2({
          title: "Delete failed",
          description: "The item could not be deleted",
          variant: "destructive"
        });
      }
    }, ttl);
    pendingDeletions.current.set(deletionKey, deletionTimeout);
    return true;
  };
  return { deleteItem };
}

export {
  create,
  cva,
  buttonVariants,
  Button,
  useToast,
  useUndoStore,
  useOptimisticDelete
};
//# sourceMappingURL=/chunks/chunk-WHJPIDLZ.js.map
