import { create } from 'zustand'

export interface UndoableAction {
  id: string
  type: 'task' | 'note' | 'column' | 'comment' | 'conversation' | 'panel' | 'bulk-tasks'
  description: string
  data: any // The deleted item(s) data
  timestamp: number
  expiresAt: number // When this undo expires
  onUndo: () => Promise<void> // Function to call to restore the item
}

interface UndoStore {
  actions: Map<string, UndoableAction>
  
  // Add a new undoable action
  addUndoableAction: (
    type: UndoableAction['type'],
    description: string,
    data: any,
    onUndo: () => Promise<void>,
    ttl?: number // Time to live in milliseconds (default 10 seconds)
  ) => string
  
  // Execute undo
  undo: (actionId: string) => Promise<void>
  
  // Remove expired actions
  cleanupExpired: () => void
  
  // Remove specific action
  removeAction: (actionId: string) => void
  
  // Get action by ID
  getAction: (actionId: string) => UndoableAction | undefined
}

export const useUndoStore = create<UndoStore>((set, get) => ({
  actions: new Map(),
  
  addUndoableAction: (type, description, data, onUndo, ttl = 10000) => {
    const id = crypto.randomUUID()
    const timestamp = Date.now()
    const expiresAt = timestamp + ttl
    
    const action: UndoableAction = {
      id,
      type,
      description,
      data,
      timestamp,
      expiresAt,
      onUndo
    }
    
    set((state) => {
      const newActions = new Map(state.actions)
      newActions.set(id, action)
      return { actions: newActions }
    })
    
    // Auto cleanup after TTL
    setTimeout(() => {
      get().removeAction(id)
    }, ttl)
    
    return id
  },
  
  undo: async (actionId: string) => {
    const action = get().actions.get(actionId)
    if (!action) return
    
    try {
      await action.onUndo()
      get().removeAction(actionId)
    } catch (error) {
      console.error('Failed to undo action:', error)
      throw error
    }
  },
  
  cleanupExpired: () => {
    const now = Date.now()
    set((state) => {
      const newActions = new Map()
      state.actions.forEach((action, id) => {
        if (action.expiresAt > now) {
          newActions.set(id, action)
        }
      })
      return { actions: newActions }
    })
  },
  
  removeAction: (actionId: string) => {
    set((state) => {
      const newActions = new Map(state.actions)
      newActions.delete(actionId)
      return { actions: newActions }
    })
  },
  
  getAction: (actionId: string) => {
    return get().actions.get(actionId)
  }
}))

// Cleanup expired actions every 5 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    useUndoStore.getState().cleanupExpired()
  }, 5000)
}