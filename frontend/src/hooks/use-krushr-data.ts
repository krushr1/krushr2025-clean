
import { useState, useEffect } from 'react'
import { User, Kanban, Task, Team, Workspace, Notification } from '../../../shared/types'
import { api } from '../lib/api'

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.me()
        if (response.success && response.data) {
          setUser(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.login(email, password)
      if (response.success && response.data) {
        setUser(response.data.user)
        return response.data
      }
      throw new Error(response.message || 'Login failed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.logout()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return { user, loading, error, login, logout }
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await api.getWorkspaces()
        if (response.success && response.data) {
          setWorkspaces(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workspaces')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaces()
  }, [])

  const createWorkspace = async (data: Partial<Workspace>) => {
    try {
      const response = await api.createWorkspace(data)
      if (response.success && response.data) {
        setWorkspaces(prev => [...prev, response.data!])
        return response.data
      }
      throw new Error(response.message || 'Failed to create workspace')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
      throw err
    }
  }

  return { workspaces, loading, error, createWorkspace }
}

export function useKanbans() {
  const [kanbans, setKanbans] = useState<Kanban[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKanbans = async () => {
      try {
        const response = await api.getKanbans()
        if (response.success && response.data) {
          setKanbans(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch kanbans')
      } finally {
        setLoading(false)
      }
    }

    fetchKanbans()
  }, [])

  const createKanban = async (data: Partial<Kanban>) => {
    try {
      const response = await api.createKanban(data)
      if (response.success && response.data) {
        setKanbans(prev => [...prev, response.data!])
        return response.data
      }
      throw new Error(response.message || 'Failed to create kanban')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create kanban')
      throw err
    }
  }

  const updateKanban = async (id: string, data: Partial<Kanban>) => {
    try {
      const response = await api.updateKanban(id, data)
      if (response.success && response.data) {
        setKanbans(prev => prev.map(k => k.id === id ? response.data! : k))
        return response.data
      }
      throw new Error(response.message || 'Failed to update kanban')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update kanban')
      throw err
    }
  }

  return { kanbans, loading, error, createKanban, updateKanban }
}

export function useKanban(id: string | null) {
  const [kanban, setKanban] = useState<Kanban | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchKanban = async () => {
      try {
        const response = await api.getKanban(id)
        if (response.success && response.data) {
          setKanban(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch kanban')
      } finally {
        setLoading(false)
      }
    }

    fetchKanban()
  }, [id])

  const updateKanban = async (data: Partial<Kanban>) => {
    if (!id) return

    try {
      const response = await api.updateKanban(id, data)
      if (response.success && response.data) {
        setKanban(response.data)
        return response.data
      }
      throw new Error(response.message || 'Failed to update kanban')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update kanban')
      throw err
    }
  }

  return { kanban, loading, error, updateKanban }
}

export function useTasks(kanbanId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.getTasks(kanbanId)
        if (response.success && response.data) {
          setTasks(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [kanbanId])

  const createTask = async (data: Partial<Task>) => {
    try {
      const response = await api.createTask(data)
      if (response.success && response.data) {
        setTasks(prev => [...prev, response.data!])
        return response.data
      }
      throw new Error(response.message || 'Failed to create task')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      throw err
    }
  }

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      const response = await api.updateTask(id, data)
      if (response.success && response.data) {
        setTasks(prev => prev.map(t => t.id === id ? response.data! : t))
        return response.data
      }
      throw new Error(response.message || 'Failed to update task')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await api.deleteTask(id)
      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== id))
      }
      throw new Error(response.message || 'Failed to delete task')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      throw err
    }
  }

  return { tasks, loading, error, createTask, updateTask, deleteTask }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.getNotifications()
        if (response.success && response.data) {
          setNotifications(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return { notifications, loading, error, markRead, unreadCount }
}