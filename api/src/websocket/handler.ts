/**
 * WebSocket Handler
 * Real-time communication and live collaboration features
 */

import { IncomingMessage } from 'http'
import { validateSession } from '../lib/auth'
import { logger } from '../utils/logger'

interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
}

interface ConnectedClient {
  socket: any
  userId: string
  workspaceId?: string
  rooms: Set<string>
}

// Store connected clients
const clients = new Map<string, ConnectedClient>()

/**
 * WebSocket connection handler
 */
export async function websocketHandler(socket: any, request: IncomingMessage) {
  let clientId: string | null = null
  let client: ConnectedClient | null = null

  try {
    // Extract auth token from query params or headers
    const url = new URL(request.url || '', `http://${request.headers.host}`)
    const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      socket.close(4001, 'Authentication required')
      return
    }

    // Validate session
    const session = await validateSession(token)
    if (!session) {
      socket.close(4003, 'Invalid or expired token')
      return
    }

    // Generate client ID and store connection
    clientId = `${session.user.id}-${Date.now()}`
    client = {
      socket,
      userId: session.user.id,
      rooms: new Set(),
    }
    clients.set(clientId, client)

    logger.info(`🔌 WebSocket connected: ${session.user.email} (${clientId})`)

    // Send welcome message
    sendMessage(socket, {
      type: 'connected',
      payload: {
        userId: session.user.id,
        message: 'Connected successfully',
      },
      timestamp: Date.now(),
    })

    // Handle incoming messages
    socket.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString())
        await handleMessage(clientId!, message)
      } catch (error) {
        logger.error('❌ WebSocket message error:', error)
        sendMessage(socket, {
          type: 'error',
          payload: { message: 'Invalid message format' },
          timestamp: Date.now(),
        })
      }
    })

    // Handle client disconnect
    socket.on('close', () => {
      if (clientId) {
        logger.info(`🔌 WebSocket disconnected: ${session.user.email} (${clientId})`)
        clients.delete(clientId)
        
        // Notify rooms about user going offline
        if (client) {
          client.rooms.forEach(room => {
            broadcastToRoom(room, {
              type: 'user-offline',
              payload: { userId: session.user.id },
              timestamp: Date.now(),
            }, clientId || undefined)
          })
        }
      }
    })

    // Handle connection errors
    socket.on('error', (error: any) => {
      logger.error('❌ WebSocket error:', error)
    })

  } catch (error) {
    logger.error('❌ WebSocket connection error:', error)
    socket.close(4500, 'Internal server error')
  }
}

/**
 * Handle incoming WebSocket messages
 */
async function handleMessage(clientId: string, message: WebSocketMessage) {
  const client = clients.get(clientId)
  if (!client) return

  logger.debug(`📨 WebSocket message: ${message.type} from ${client.userId}`)

  try {
    switch (message.type) {
      case 'join-workspace':
        await handleJoinWorkspace(client, message.payload)
        break

      case 'leave-workspace':
        await handleLeaveWorkspace(client, message.payload)
        break

      case 'join-kanban':
        await handleJoinKanban(client, message.payload)
        break

      case 'leave-kanban':
        await handleLeaveKanban(client, message.payload)
        break

      case 'task-update':
        await handleTaskUpdate(client, message.payload)
        break

      case 'kanban-update':
        await handleKanbanUpdate(client, message.payload)
        break

      case 'chat-message':
        await handleChatMessage(client, message.payload)
        break

      case 'user-presence':
        await handleUserPresence(client, message.payload)
        break

      case 'typing-start':
      case 'typing-stop':
        await handleTypingStatus(client, message)
        break

      case 'comment-created':
        await handleCommentCreated(client, message.payload)
        break

      case 'comment-updated':
        await handleCommentUpdated(client, message.payload)
        break

      case 'comment-deleted':
        await handleCommentDeleted(client, message.payload)
        break

      case 'comment-reaction-added':
        await handleCommentReactionAdded(client, message.payload)
        break

      case 'comment-reaction-removed':
        await handleCommentReactionRemoved(client, message.payload)
        break

      case 'join-task':
        await handleJoinTask(client, message.payload)
        break

      case 'leave-task':
        await handleLeaveTask(client, message.payload)
        break

      // AI Context Streaming Events
      case 'ai-context-request':
        await handleAiContextRequest(client, message.payload)
        break

      case 'ai-context-update':
        await handleAiContextUpdate(client, message.payload)
        break

      case 'ai-typing-start':
        await handleAiTypingStart(client, message.payload)
        break

      case 'ai-typing-stop':
        await handleAiTypingStop(client, message.payload)
        break

      case 'workspace-activity-stream':
        await handleWorkspaceActivityStream(client, message.payload)
        break

      case 'ai-agent-status':
        await handleAiAgentStatus(client, message.payload)
        break

      default:
        logger.warn(`⚠️ Unknown message type: ${message.type}`)
        sendMessage(client.socket, {
          type: 'error',
          payload: { message: 'Unknown message type' },
          timestamp: Date.now(),
        })
    }
  } catch (error) {
    logger.error('❌ Message handling error:', error)
    sendMessage(client.socket, {
      type: 'error',
      payload: { message: 'Failed to process message' },
      timestamp: Date.now(),
    })
  }
}

/**
 * Join workspace room for real-time updates
 */
async function handleJoinWorkspace(client: ConnectedClient, payload: { workspaceId: string }) {
  const roomId = `workspace:${payload.workspaceId}`
  client.rooms.add(roomId)
  client.workspaceId = payload.workspaceId

  // Notify others in the workspace
  broadcastToRoom(roomId, {
    type: 'user-online',
    payload: { userId: client.userId, workspaceId: payload.workspaceId },
    timestamp: Date.now(),
  }, getClientId(client))

  sendMessage(client.socket, {
    type: 'workspace-joined',
    payload: { workspaceId: payload.workspaceId },
    timestamp: Date.now(),
  })
}

/**
 * Leave workspace room
 */
async function handleLeaveWorkspace(client: ConnectedClient, payload: { workspaceId: string }) {
  const roomId = `workspace:${payload.workspaceId}`
  client.rooms.delete(roomId)

  broadcastToRoom(roomId, {
    type: 'user-offline',
    payload: { userId: client.userId, workspaceId: payload.workspaceId },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Join kanban board for real-time collaboration
 */
async function handleJoinKanban(client: ConnectedClient, payload: { kanbanId: string }) {
  const roomId = `kanban:${payload.kanbanId}`
  client.rooms.add(roomId)

  broadcastToRoom(roomId, {
    type: 'user-joined-kanban',
    payload: { userId: client.userId, kanbanId: payload.kanbanId },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Leave kanban board
 */
async function handleLeaveKanban(client: ConnectedClient, payload: { kanbanId: string }) {
  const roomId = `kanban:${payload.kanbanId}`
  client.rooms.delete(roomId)

  broadcastToRoom(roomId, {
    type: 'user-left-kanban',
    payload: { userId: client.userId, kanbanId: payload.kanbanId },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle real-time task updates
 */
async function handleTaskUpdate(client: ConnectedClient, payload: any) {
  const roomId = `kanban:${payload.kanbanId}`
  
  broadcastToRoom(roomId, {
    type: 'task-updated',
    payload: {
      ...payload,
      updatedBy: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle real-time kanban board updates
 */
async function handleKanbanUpdate(client: ConnectedClient, payload: any) {
  const roomId = `kanban:${payload.kanbanId}`
  
  broadcastToRoom(roomId, {
    type: 'kanban-updated',
    payload: {
      ...payload,
      updatedBy: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle chat messages
 */
async function handleChatMessage(client: ConnectedClient, payload: any) {
  const roomId = payload.threadId ? `chat:${payload.threadId}` : `workspace:${client.workspaceId}`
  
  broadcastToRoom(roomId, {
    type: 'chat-message',
    payload: {
      ...payload,
      senderId: client.userId,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  })
}

/**
 * Handle user presence updates
 */
async function handleUserPresence(client: ConnectedClient, payload: { status: 'online' | 'offline' | 'away' }) {
  if (client.workspaceId) {
    const roomId = `workspace:${client.workspaceId}`
    
    broadcastToRoom(roomId, {
      type: 'user-presence',
      payload: {
        userId: client.userId,
        status: payload.status,
      },
      timestamp: Date.now(),
    }, getClientId(client))
  }
}

/**
 * Handle typing status for chat
 */
async function handleTypingStatus(client: ConnectedClient, message: WebSocketMessage) {
  const roomId = message.payload.threadId ? 
    `chat:${message.payload.threadId}` : 
    `workspace:${client.workspaceId}`
  
  broadcastToRoom(roomId, {
    type: message.type,
    payload: {
      userId: client.userId,
      ...message.payload,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Send message to a specific socket
 */
function sendMessage(socket: any, message: WebSocketMessage) {
  try {
    socket.send(JSON.stringify(message))
  } catch (error) {
    logger.error('❌ Failed to send WebSocket message:', error)
  }
}

/**
 * Broadcast message to all clients in a room
 */
function broadcastToRoom(roomId: string, message: WebSocketMessage, excludeClientId?: string) {
  let sentCount = 0
  
  for (const [clientId, client] of clients.entries()) {
    if (clientId === excludeClientId) continue
    if (client.rooms.has(roomId)) {
      sendMessage(client.socket, message)
      sentCount++
    }
  }
  
  logger.debug(`📡 Broadcasted ${message.type} to ${sentCount} clients in room ${roomId}`)
}

/**
 * Get client ID for a connected client
 */
function getClientId(client: ConnectedClient): string | undefined {
  for (const [clientId, c] of clients.entries()) {
    if (c === client) return clientId
  }
  return undefined
}

/**
 * Get all connected users in a workspace
 */
export function getWorkspaceUsers(workspaceId: string): string[] {
  const users: string[] = []
  const roomId = `workspace:${workspaceId}`
  
  for (const client of clients.values()) {
    if (client.rooms.has(roomId)) {
      users.push(client.userId)
    }
  }
  
  return users
}

/**
 * Send notification to specific user
 */
export function sendNotificationToUser(userId: string, notification: any) {
  for (const client of clients.values()) {
    if (client.userId === userId) {
      sendMessage(client.socket, {
        type: 'notification',
        payload: notification,
        timestamp: Date.now(),
      })
    }
  }
}

/**
 * Join task room for real-time comment updates
 */
async function handleJoinTask(client: ConnectedClient, payload: { taskId: string }) {
  const roomId = `task:${payload.taskId}`
  client.rooms.add(roomId)

  broadcastToRoom(roomId, {
    type: 'user-joined-task',
    payload: { userId: client.userId, taskId: payload.taskId },
    timestamp: Date.now(),
  }, getClientId(client))

  sendMessage(client.socket, {
    type: 'task-joined',
    payload: { taskId: payload.taskId },
    timestamp: Date.now(),
  })
}

/**
 * Leave task room
 */
async function handleLeaveTask(client: ConnectedClient, payload: { taskId: string }) {
  const roomId = `task:${payload.taskId}`
  client.rooms.delete(roomId)

  broadcastToRoom(roomId, {
    type: 'user-left-task',
    payload: { userId: client.userId, taskId: payload.taskId },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle real-time comment creation
 */
async function handleCommentCreated(client: ConnectedClient, payload: any) {
  const roomId = `task:${payload.taskId}`
  
  broadcastToRoom(roomId, {
    type: 'comment-created',
    payload: {
      ...payload,
      createdBy: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle real-time comment updates
 */
async function handleCommentUpdated(client: ConnectedClient, payload: any) {
  const roomId = `task:${payload.taskId}`
  
  broadcastToRoom(roomId, {
    type: 'comment-updated',
    payload: {
      ...payload,
      updatedBy: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle real-time comment deletion
 */
async function handleCommentDeleted(client: ConnectedClient, payload: any) {
  const roomId = `task:${payload.taskId}`
  
  broadcastToRoom(roomId, {
    type: 'comment-deleted',
    payload: {
      ...payload,
      deletedBy: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle real-time comment reaction addition
 */
async function handleCommentReactionAdded(client: ConnectedClient, payload: any) {
  const roomId = `task:${payload.taskId}`
  
  broadcastToRoom(roomId, {
    type: 'comment-reaction-added',
    payload: {
      ...payload,
      addedBy: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle real-time comment reaction removal
 */
async function handleCommentReactionRemoved(client: ConnectedClient, payload: any) {
  const roomId = `task:${payload.taskId}`
  
  broadcastToRoom(roomId, {
    type: 'comment-reaction-removed',
    payload: {
      ...payload,
      removedBy: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Broadcast comment update to task room
 */
export function broadcastCommentUpdate(taskId: string, type: string, payload: any) {
  const roomId = `task:${taskId}`
  
  broadcastToRoom(roomId, {
    type,
    payload,
    timestamp: Date.now(),
  })
}

/**
 * Send mention notification with comment context
 */
export function sendCommentMentionNotification(userId: string, data: {
  commentId: string
  taskId: string
  authorName: string
  content: string
  type: 'mention' | 'reply'
}) {
  sendNotificationToUser(userId, {
    type: 'comment-mention',
    data,
  })
}

/**
 * Handle AI context request - provide live workspace data
 */
async function handleAiContextRequest(client: ConnectedClient, payload: { conversationId: string }) {
  if (!client.workspaceId) {
    sendMessage(client.socket, {
      type: 'ai-context-error',
      payload: { error: 'No workspace context available' },
      timestamp: Date.now(),
    })
    return
  }

  // Join AI context room for this conversation
  const roomId = `ai-context:${payload.conversationId}`
  client.rooms.add(roomId)

  // Get workspace activity aggregation (will be implemented in AI Context Manager)
  const contextData = await getWorkspaceContext(client.workspaceId)

  sendMessage(client.socket, {
    type: 'ai-context-response',
    payload: {
      conversationId: payload.conversationId,
      workspaceId: client.workspaceId,
      context: contextData,
    },
    timestamp: Date.now(),
  })
}

/**
 * Handle AI context updates - broadcast workspace changes to AI agents
 */
async function handleAiContextUpdate(client: ConnectedClient, payload: any) {
  const roomId = `ai-context:${payload.conversationId}`
  
  broadcastToRoom(roomId, {
    type: 'ai-context-updated',
    payload: {
      ...payload,
      updatedBy: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle AI typing indicators
 */
async function handleAiTypingStart(client: ConnectedClient, payload: { conversationId: string }) {
  const roomId = `ai-context:${payload.conversationId}`
  
  broadcastToRoom(roomId, {
    type: 'ai-typing-start',
    payload: {
      conversationId: payload.conversationId,
      userId: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

async function handleAiTypingStop(client: ConnectedClient, payload: { conversationId: string }) {
  const roomId = `ai-context:${payload.conversationId}`
  
  broadcastToRoom(roomId, {
    type: 'ai-typing-stop',
    payload: {
      conversationId: payload.conversationId,
      userId: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Handle workspace activity streaming for AI awareness
 */
async function handleWorkspaceActivityStream(client: ConnectedClient, payload: { subscribe: boolean }) {
  if (!client.workspaceId) return

  const roomId = `workspace-activity:${client.workspaceId}`
  
  if (payload.subscribe) {
    client.rooms.add(roomId)
    sendMessage(client.socket, {
      type: 'workspace-activity-subscribed',
      payload: { workspaceId: client.workspaceId },
      timestamp: Date.now(),
    })
  } else {
    client.rooms.delete(roomId)
    sendMessage(client.socket, {
      type: 'workspace-activity-unsubscribed',
      payload: { workspaceId: client.workspaceId },
      timestamp: Date.now(),
    })
  }
}

/**
 * Handle AI agent status updates
 */
async function handleAiAgentStatus(client: ConnectedClient, payload: { 
  conversationId: string
  status: 'thinking' | 'responding' | 'idle'
  thinkingBudget?: number
}) {
  const roomId = `ai-context:${payload.conversationId}`
  
  broadcastToRoom(roomId, {
    type: 'ai-agent-status',
    payload: {
      conversationId: payload.conversationId,
      status: payload.status,
      thinkingBudget: payload.thinkingBudget,
      userId: client.userId,
    },
    timestamp: Date.now(),
  }, getClientId(client))
}

/**
 * Broadcast AI-related workspace changes
 */
export function broadcastAiWorkspaceUpdate(workspaceId: string, updateType: string, data: any) {
  const activityRoomId = `workspace-activity:${workspaceId}`
  
  broadcastToRoom(activityRoomId, {
    type: 'workspace-change',
    payload: {
      workspaceId,
      updateType,
      data,
    },
    timestamp: Date.now(),
  })
}

/**
 * Broadcast AI conversation status to interested clients
 */
export function broadcastAiConversationStatus(conversationId: string, status: string, data?: any) {
  const roomId = `ai-context:${conversationId}`
  
  broadcastToRoom(roomId, {
    type: 'ai-conversation-status',
    payload: {
      conversationId,
      status,
      data,
    },
    timestamp: Date.now(),
  })
}

/**
 * Get workspace context for AI using AI Context Manager
 */
async function getWorkspaceContext(workspaceId: string) {
  try {
    const { aiContextManager } = await import('../lib/ai-context')
    return await aiContextManager.getWorkspaceContext(workspaceId)
  } catch (error) {
    logger.error('Failed to get workspace context:', error)
    return {
      workspaceId,
      lastUpdated: Date.now(),
      error: 'Failed to load workspace context',
    }
  }
}