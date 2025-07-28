/**
 * Demo mode for frontend-only deployment
 * Provides mock data and responses when backend is unavailable
 */

export const isDemoMode = () => {
  return typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' &&
    !window.location.port // Ensure no port number (local dev uses :8001)
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
      ownerId: 'demo-user',
      _count: {
        projects: 3,
        teams: 2,
        kanbans: 1,
        tasks: 3,
        members: 1
      }
    }
  ],

  workspaceMembers: [
    {
      id: 'demo-member-1',
      userId: 'demo-user',
      workspaceId: 'demo-workspace',
      role: 'owner',
      user: {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@krushr.com',
        avatar: undefined
      }
    }
  ],

  kanbans: [
    {
      id: 'demo-kanban-1',
      name: 'Demo Project Board',
      workspaceId: 'demo-workspace',
      createdById: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      columns: [
        { id: 'col-1', name: 'Todo', position: 0 },
        { id: 'col-2', name: 'In Progress', position: 1 },
        { id: 'col-3', name: 'Done', position: 2 }
      ]
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
    console.log('[Demo Mode] Returning workspace data:', demoData.workspaces)
    console.log('[Demo Mode] First workspace _count:', demoData.workspaces[0]._count)
    return { result: { data: demoData.workspaces } }
  },
  
  'workspace.get': async () => {
    await mockDelay()
    return { result: { data: demoData.workspaces[0] } }
  },

  'user.listWorkspaceMembers': async () => {
    await mockDelay()
    return { result: { data: demoData.workspaceMembers } }
  },

  'kanban.list': async () => {
    await mockDelay()
    return { result: { data: demoData.kanbans } }
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