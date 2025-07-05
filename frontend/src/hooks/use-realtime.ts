/**
 * Real-time integration hooks
 * Manages WebSocket connections and real-time data synchronization
 */

import { useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/app-store'
import { api } from '../lib/api'

/**
 * Initialize real-time connection and data loading
 */
export function useRealtimeConnection() {
  const {
    user,
    isAuthenticated,
    connectWebSocket,
    disconnectWebSocket,
    setWorkspaces,
    setKanbans,
    setTasks,
    setNotifications,
    setLoading,
    setError,
  } = useAppStore()

  const initializeData = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      // Load initial data in parallel
      const [workspacesRes, kanbansRes, tasksRes, notificationsRes] = await Promise.all([
        api.getWorkspaces(),
        api.getKanbans(),
        api.getTasks(),
        api.getNotifications(),
      ])

      if (workspacesRes.success && workspacesRes.data) {
        setWorkspaces(workspacesRes.data)
      }

      if (kanbansRes.success && kanbansRes.data) {
        setKanbans(kanbansRes.data)
      }

      if (tasksRes.success && tasksRes.data) {
        setTasks(tasksRes.data)
      }

      if (notificationsRes.success && notificationsRes.data) {
        setNotifications(notificationsRes.data)
      }

    } catch (error) {
      console.error('Failed to load initial data:', error)
      setError('Failed to load application data')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, setWorkspaces, setKanbans, setTasks, setNotifications, setLoading, setError])

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connectWebSocket()
      initializeData()
    } else {
      disconnectWebSocket()
    }

    return () => {
      disconnectWebSocket()
    }
  }, [isAuthenticated, user, connectWebSocket, disconnectWebSocket, initializeData])

  return {
    isConnected: useAppStore((state) => state.websocket.connected),
    isLoading: useAppStore((state) => state.loading),
    error: useAppStore((state) => state.error),
  }
}

/**
 * Hook for sending real-time updates
 */
export function useRealtimeActions() {
  const { sendMessage } = useAppStore()

  const broadcastTaskUpdate = useCallback((task: any) => {
    sendMessage('task-updated', task)
  }, [sendMessage])

  const broadcastKanbanUpdate = useCallback((kanban: any) => {
    sendMessage('kanban-updated', kanban)
  }, [sendMessage])

  const broadcastPresence = useCallback((status: 'online' | 'offline') => {
    sendMessage('user-presence', { status, timestamp: new Date().toISOString() })
  }, [sendMessage])

  return {
    broadcastTaskUpdate,
    broadcastKanbanUpdate,
    broadcastPresence,
  }
}

/**
 * Hook for optimistic updates with real-time sync
 */
export function useOptimisticUpdates() {
  const { updateTask, addTask, deleteTask } = useAppStore()
  const { broadcastTaskUpdate } = useRealtimeActions()

  const optimisticUpdateTask = useCallback(async (
    taskId: string,
    updates: any,
    apiCall: () => Promise<any>
  ) => {
    // Apply optimistic update immediately
    updateTask(taskId, updates)
    broadcastTaskUpdate({ id: taskId, ...updates })

    try {
      // Sync with backend
      const result = await apiCall()
      if (result.success && result.data) {
        // Update with server response if different
        updateTask(taskId, result.data)
      }
      return result
    } catch (error) {
      // Revert optimistic update on error
      console.error('Failed to sync task update:', error)
      // Could implement rollback logic here
      throw error
    }
  }, [updateTask, broadcastTaskUpdate])

  const optimisticCreateTask = useCallback(async (
    tempTask: any,
    apiCall: () => Promise<any>
  ) => {
    // Add temporary task immediately
    const tempId = `temp-${Date.now()}`
    const optimisticTask = { ...tempTask, id: tempId }
    addTask(optimisticTask)

    try {
      // Create on backend
      const result = await apiCall()
      if (result.success && result.data) {
        // Replace temp task with real task
        deleteTask(tempId)
        addTask(result.data)
        broadcastTaskUpdate(result.data)
      }
      return result
    } catch (error) {
      // Remove temp task on error
      deleteTask(tempId)
      throw error
    }
  }, [addTask, deleteTask, broadcastTaskUpdate])

  return {
    optimisticUpdateTask,
    optimisticCreateTask,
  }
}