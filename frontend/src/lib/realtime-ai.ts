/**
 * Real-time AI Client
 * WebSocket connection for AI context streaming and live agent awareness
 */

import { useAppStore } from '../stores/app-store'

interface AiContextData {
  workspaceId: string
  recentTasks: {
    created: Array<{ id: string; title: string; priority: string; createdAt: Date }>
    updated: Array<{ id: string; title: string; status: string; updatedAt: Date }>
    completed: Array<{ id: string; title: string; completedAt: Date }>
  }
  activeKanbans: Array<{
    id: string
    title: string
    columnCount: number
    taskCount: number
  }>
  teamActivity: {
    activeUsers: string[]
    recentActions: Array<{
      userId: string
      action: string
      entityType: string
      entityId: string
      timestamp: Date
    }>
  }
  projects: Array<{
    id: string
    name: string
    status: string
    taskCount: number
    progressPercentage: number
  }>
  upcomingDeadlines: Array<{
    taskId: string
    title: string
    dueDate: Date
    priority: string
  }>
  aiInsights: {
    suggestedTasks: number
    completionRate: number
    averageTaskDuration: number
    productivityTrends: Array<{
      date: string
      tasksCompleted: number
      tasksCreated: number
    }>
  }
}

interface AiTypingStatus {
  conversationId: string
  userId: string
  isTyping: boolean
}

interface AiAgentStatus {
  conversationId: string
  status: 'thinking' | 'responding' | 'idle'
  thinkingBudget?: number
  userId: string
}

interface WorkspaceChange {
  workspaceId: string
  updateType: string
  data: any
}

class RealtimeAiClient {
  private static instance: RealtimeAiClient
  private contextSubscriptions = new Map<string, Set<(context: AiContextData) => void>>()
  private typingSubscriptions = new Map<string, Set<(status: AiTypingStatus) => void>>()
  private agentStatusSubscriptions = new Map<string, Set<(status: AiAgentStatus) => void>>()
  private workspaceActivitySubscriptions = new Map<string, Set<(change: WorkspaceChange) => void>>()
  private currentContextData = new Map<string, AiContextData>()
  private currentTypingStatuses = new Map<string, AiTypingStatus[]>()
  private currentAgentStatuses = new Map<string, AiAgentStatus>()

  public static getInstance(): RealtimeAiClient {
    if (!RealtimeAiClient.instance) {
      RealtimeAiClient.instance = new RealtimeAiClient()
    }
    return RealtimeAiClient.instance
  }

  constructor() {
    this.setupWebSocketListeners()
  }

  /**
   * Setup WebSocket event listeners for AI-specific events
   */
  private setupWebSocketListeners() {
    // We'll listen to the app store's WebSocket for AI events
    const { sendMessage } = useAppStore.getState()

    // Handle incoming WebSocket messages in the app store
    useAppStore.subscribe(
      (state) => state.websocket.socket,
      (socket) => {
        if (socket) {
          // Add additional AI-specific message handlers
          const originalOnMessage = socket.onmessage
          socket.onmessage = (event) => {
            // Call original handler first
            if (originalOnMessage) {
              originalOnMessage.call(socket, event)
            }

            // Handle AI-specific messages
            try {
              const message = JSON.parse(event.data)
              this.handleAiMessage(message)
            } catch (error) {
              console.error('Failed to parse AI WebSocket message:', error)
            }
          }
        }
      }
    )
  }

  /**
   * Handle AI-specific WebSocket messages
   */
  private handleAiMessage(message: any) {
    const { type, payload } = message

    switch (type) {
      case 'ai-context-response':
        this.handleContextResponse(payload)
        break

      case 'ai-context-updated':
        this.handleContextUpdate(payload)
        break

      case 'ai-typing-start':
        this.handleTypingStart(payload)
        break

      case 'ai-typing-stop':
        this.handleTypingStop(payload)
        break

      case 'ai-agent-status':
        this.handleAgentStatus(payload)
        break

      case 'workspace-change':
        this.handleWorkspaceChange(payload)
        break

      case 'ai-conversation-status':
        this.handleConversationStatus(payload)
        break

      default:
        // Ignore non-AI messages
        break
    }
  }

  /**
   * Subscribe to AI context updates for a conversation
   */
  subscribeToContext(conversationId: string, callback: (context: AiContextData) => void) {
    if (!this.contextSubscriptions.has(conversationId)) {
      this.contextSubscriptions.set(conversationId, new Set())
      this.requestAiContext(conversationId)
    }

    this.contextSubscriptions.get(conversationId)!.add(callback)

    // Return current context if available
    const currentContext = this.currentContextData.get(conversationId)
    if (currentContext) {
      callback(currentContext)
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.contextSubscriptions.get(conversationId)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          this.contextSubscriptions.delete(conversationId)
        }
      }
    }
  }

  /**
   * Subscribe to AI typing indicators
   */
  subscribeToTyping(conversationId: string, callback: (status: AiTypingStatus) => void) {
    if (!this.typingSubscriptions.has(conversationId)) {
      this.typingSubscriptions.set(conversationId, new Set())
    }

    this.typingSubscriptions.get(conversationId)!.add(callback)

    // Return current typing statuses if available
    const currentStatuses = this.currentTypingStatuses.get(conversationId) || []
    currentStatuses.forEach(callback)

    // Return unsubscribe function
    return () => {
      const subscribers = this.typingSubscriptions.get(conversationId)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          this.typingSubscriptions.delete(conversationId)
        }
      }
    }
  }

  /**
   * Subscribe to AI agent status updates
   */
  subscribeToAgentStatus(conversationId: string, callback: (status: AiAgentStatus) => void) {
    if (!this.agentStatusSubscriptions.has(conversationId)) {
      this.agentStatusSubscriptions.set(conversationId, new Set())
    }

    this.agentStatusSubscriptions.get(conversationId)!.add(callback)

    // Return current agent status if available
    const currentStatus = this.currentAgentStatuses.get(conversationId)
    if (currentStatus) {
      callback(currentStatus)
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.agentStatusSubscriptions.get(conversationId)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          this.agentStatusSubscriptions.delete(conversationId)
        }
      }
    }
  }

  /**
   * Subscribe to workspace activity stream
   */
  subscribeToWorkspaceActivity(workspaceId: string, callback: (change: WorkspaceChange) => void) {
    if (!this.workspaceActivitySubscriptions.has(workspaceId)) {
      this.workspaceActivitySubscriptions.set(workspaceId, new Set())
      this.subscribeToWorkspaceActivityStream(workspaceId, true)
    }

    this.workspaceActivitySubscriptions.get(workspaceId)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subscribers = this.workspaceActivitySubscriptions.get(workspaceId)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          this.workspaceActivitySubscriptions.delete(workspaceId)
          this.subscribeToWorkspaceActivityStream(workspaceId, false)
        }
      }
    }
  }

  /**
   * Send typing start indicator
   */
  sendTypingStart(conversationId: string) {
    this.sendAiMessage('ai-typing-start', { conversationId })
  }

  /**
   * Send typing stop indicator
   */
  sendTypingStop(conversationId: string) {
    this.sendAiMessage('ai-typing-stop', { conversationId })
  }

  /**
   * Send AI agent status update
   */
  sendAgentStatus(conversationId: string, status: 'thinking' | 'responding' | 'idle', thinkingBudget?: number) {
    this.sendAiMessage('ai-agent-status', { 
      conversationId, 
      status, 
      thinkingBudget 
    })
  }

  /**
   * Request AI context for a conversation
   */
  private requestAiContext(conversationId: string) {
    this.sendAiMessage('ai-context-request', { conversationId })
  }

  /**
   * Subscribe/unsubscribe to workspace activity stream
   */
  private subscribeToWorkspaceActivityStream(workspaceId: string, subscribe: boolean) {
    this.sendAiMessage('workspace-activity-stream', { subscribe })
  }

  /**
   * Send AI-specific WebSocket message
   */
  private sendAiMessage(type: string, payload: any) {
    const { sendMessage } = useAppStore.getState()
    sendMessage(type, payload)
  }

  /**
   * Handle AI context response
   */
  private handleContextResponse(payload: any) {
    const { conversationId, context } = payload
    this.currentContextData.set(conversationId, context)

    const subscribers = this.contextSubscriptions.get(conversationId)
    if (subscribers) {
      subscribers.forEach(callback => callback(context))
    }
  }

  /**
   * Handle AI context updates
   */
  private handleContextUpdate(payload: any) {
    const { conversationId } = payload
    // Request fresh context when updates occur
    this.requestAiContext(conversationId)
  }

  /**
   * Handle typing start
   */
  private handleTypingStart(payload: AiTypingStatus) {
    const { conversationId } = payload
    const currentStatuses = this.currentTypingStatuses.get(conversationId) || []
    
    // Add or update typing status
    const updatedStatuses = [
      ...currentStatuses.filter(s => s.userId !== payload.userId),
      { ...payload, isTyping: true }
    ]
    
    this.currentTypingStatuses.set(conversationId, updatedStatuses)

    const subscribers = this.typingSubscriptions.get(conversationId)
    if (subscribers) {
      subscribers.forEach(callback => callback({ ...payload, isTyping: true }))
    }
  }

  /**
   * Handle typing stop
   */
  private handleTypingStop(payload: AiTypingStatus) {
    const { conversationId } = payload
    const currentStatuses = this.currentTypingStatuses.get(conversationId) || []
    
    // Remove typing status
    const updatedStatuses = currentStatuses.filter(s => s.userId !== payload.userId)
    this.currentTypingStatuses.set(conversationId, updatedStatuses)

    const subscribers = this.typingSubscriptions.get(conversationId)
    if (subscribers) {
      subscribers.forEach(callback => callback({ ...payload, isTyping: false }))
    }
  }

  /**
   * Handle agent status updates
   */
  private handleAgentStatus(payload: AiAgentStatus) {
    const { conversationId } = payload
    this.currentAgentStatuses.set(conversationId, payload)

    const subscribers = this.agentStatusSubscriptions.get(conversationId)
    if (subscribers) {
      subscribers.forEach(callback => callback(payload))
    }
  }

  /**
   * Handle workspace activity changes
   */
  private handleWorkspaceChange(payload: WorkspaceChange) {
    const { workspaceId } = payload
    const subscribers = this.workspaceActivitySubscriptions.get(workspaceId)
    if (subscribers) {
      subscribers.forEach(callback => callback(payload))
    }
  }

  /**
   * Handle conversation status updates
   */
  private handleConversationStatus(payload: any) {
    console.log('AI Conversation Status:', payload)
    // Can be extended for specific conversation status handling
  }

  /**
   * Get current context data for a conversation
   */
  getCurrentContext(conversationId: string): AiContextData | null {
    return this.currentContextData.get(conversationId) || null
  }

  /**
   * Get current typing statuses for a conversation
   */
  getCurrentTypingStatuses(conversationId: string): AiTypingStatus[] {
    return this.currentTypingStatuses.get(conversationId) || []
  }

  /**
   * Get current agent status for a conversation
   */
  getCurrentAgentStatus(conversationId: string): AiAgentStatus | null {
    return this.currentAgentStatuses.get(conversationId) || null
  }
}

// Export singleton instance
export const realtimeAiClient = RealtimeAiClient.getInstance()

// Export types for use in components
export type { AiContextData, AiTypingStatus, AiAgentStatus, WorkspaceChange }

// Hook for easy use in React components
export function useRealtimeAi() {
  return {
    subscribeToContext: realtimeAiClient.subscribeToContext.bind(realtimeAiClient),
    subscribeToTyping: realtimeAiClient.subscribeToTyping.bind(realtimeAiClient),
    subscribeToAgentStatus: realtimeAiClient.subscribeToAgentStatus.bind(realtimeAiClient),
    subscribeToWorkspaceActivity: realtimeAiClient.subscribeToWorkspaceActivity.bind(realtimeAiClient),
    sendTypingStart: realtimeAiClient.sendTypingStart.bind(realtimeAiClient),
    sendTypingStop: realtimeAiClient.sendTypingStop.bind(realtimeAiClient),
    sendAgentStatus: realtimeAiClient.sendAgentStatus.bind(realtimeAiClient),
    getCurrentContext: realtimeAiClient.getCurrentContext.bind(realtimeAiClient),
    getCurrentTypingStatuses: realtimeAiClient.getCurrentTypingStatuses.bind(realtimeAiClient),
    getCurrentAgentStatus: realtimeAiClient.getCurrentAgentStatus.bind(realtimeAiClient),
  }
}