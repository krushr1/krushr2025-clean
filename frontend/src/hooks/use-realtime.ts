
import { useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/app-store'
import { api } from '../lib/api'

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

export function useOptimisticUpdates() {
  const { updateTask, addTask, deleteTask } = useAppStore()
  const { broadcastTaskUpdate } = useRealtimeActions()

  const optimisticUpdateTask = useCallback(async (
    taskId: string,
    updates: any,
    apiCall: () => Promise<any>
  ) => {
    updateTask(taskId, updates)
    broadcastTaskUpdate({ id: taskId, ...updates })

    try {
      const result = await apiCall()
      if (result.success && result.data) {
        updateTask(taskId, result.data)
      }
      return result
    } catch (error) {
      console.error('Failed to sync task update:', error)
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
      const result = await apiCall()
      if (result.success && result.data) {
        deleteTask(tempId)
        addTask(result.data)
        broadcastTaskUpdate(result.data)
      }
      return result
    } catch (error) {
      deleteTask(tempId)
      throw error
    }
  }, [addTask, deleteTask, broadcastTaskUpdate])

  return {
    optimisticUpdateTask,
    optimisticCreateTask,
  }
}