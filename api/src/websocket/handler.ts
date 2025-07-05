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