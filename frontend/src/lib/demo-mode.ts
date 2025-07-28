/**
 * Demo mode for frontend-only deployment
 * Provides mock data and responses when backend is unavailable
 */

export const isDemoMode = () => {
  return typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1'
}

// Demo data
export const demoData = {
  user: {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@krushr.com',
    avatar: undefined,
    createdAt: new Date().toISOString()
  },
  
  workspaces: [
    {
      id: 'demo-workspace',
      name: 'Demo Workspace',
      description: 'Experience Krushr\'s features',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: 'demo-user'
    }
  ],
  
  tasks: [
    {
      id: 'task-1',
      title: 'Welcome to Krushr!',
      description: 'This is a demo task. In the full version, you can create, edit, and manage tasks with your team.',
      status: 'todo',
      priority: 'high',
      workspaceId: 'demo-workspace',
      createdById: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Explore the Kanban Board',
      description: 'Drag and drop tasks between columns. Full version includes real-time collaboration.',
      status: 'in_progress',
      priority: 'medium',
      workspaceId: 'demo-workspace',
      createdById: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: 'Try the Calendar View',
      description: 'Schedule tasks and meetings. Backend required for full functionality.',
      status: 'done',
      priority: 'low',
      workspaceId: 'demo-workspace',
      createdById: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  notes: [
    {
      id: 'note-1',
      title: 'Welcome to Notes',
      content: '<p>This is a demo note. The full version includes rich text editing, folders, and real-time collaboration.</p>',
      workspaceId: 'demo-workspace',
      createdById: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  notifications: []
}

// Mock delay to simulate network requests
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 300))

// Demo responses for tRPC procedures
export const demoResponses: Record<string, () => Promise<any>> = {
  'user.me': async () => {
    await mockDelay()
    return { result: { data: demoData.user } }
  },
  
  'auth.login': async () => {
    await mockDelay()
    return { 
      result: { 
        data: {
          token: 'demo-token',
          user: demoData.user
        }
      }
    }
  },
  
  'workspace.list': async () => {
    await mockDelay()
    return { result: { data: demoData.workspaces } }
  },
  
  'workspace.get': async () => {
    await mockDelay()
    return { result: { data: demoData.workspaces[0] } }
  },
  
  'task.list': async () => {
    await mockDelay()
    return { result: { data: demoData.tasks } }
  },
  
  'task.create': async () => {
    await mockDelay()
    const newTask = {
      ...demoData.tasks[0],
      id: `task-${Date.now()}`,
      title: 'New Demo Task',
      createdAt: new Date().toISOString()
    }
    return { result: { data: newTask } }
  },
  
  'task.update': async () => {
    await mockDelay()
    return { result: { data: { ...demoData.tasks[0], updatedAt: new Date().toISOString() } } }
  },
  
  'notes.list': async () => {
    await mockDelay()
    return { result: { data: demoData.notes } }
  },
  
  'notification.list': async () => {
    await mockDelay()
    return { result: { data: demoData.notifications } }
  }
}

// Extract procedure name from tRPC URL
export const extractProcedure = (url: string): string => {
  const match = url.match(/\/trpc\/([^?]+)/)
  return match ? match[1] : ''
}