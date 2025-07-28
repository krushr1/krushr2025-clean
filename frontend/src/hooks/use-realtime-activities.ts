import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/auth-store'

export function useRealtimeActivities(workspaceId?: string) {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  useEffect(() => {
    if (!workspaceId) return

    const connectWebSocket = () => {
      // Get auth token
      const token = localStorage.getItem('auth-token')
      if (!token) return

      // Connect to WebSocket
      const wsUrl = window.location.protocol === 'https:' 
        ? `wss://${window.location.hostname}:3002/ws?token=${token}`
        : `ws://127.0.0.1:3002/ws?token=${token}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected for activities')
        reconnectAttemptsRef.current = 0

        // Join workspace room
        ws.send(JSON.stringify({
          type: 'join-workspace',
          payload: { workspaceId },
          timestamp: Date.now()
        }))

        // Subscribe to activity stream
        ws.send(JSON.stringify({
          type: 'workspace-activity-stream',
          payload: { workspaceId },
          timestamp: Date.now()
        }))
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          // Handle activity updates
          if (message.type === 'activity-created' || message.type === 'workspace-activity-update') {
            const activity = message.payload
            
            // Update the activity feed query cache
            queryClient.setQueryData(
              ['activity.getRecent', { workspaceId, limit: 10 }],
              (oldData: any) => {
                if (!oldData) return [activity]
                
                // Add new activity to the beginning
                const newActivities = [activity, ...oldData]
                
                // Keep only the latest 10
                return newActivities.slice(0, 10)
              }
            )

            // Invalidate to ensure consistency
            queryClient.invalidateQueries({
              queryKey: ['activity.getRecent', { workspaceId }],
              exact: false
            })
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        wsRef.current = null

        // Reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          reconnectAttemptsRef.current++
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting WebSocket (attempt ${reconnectAttemptsRef.current})...`)
            connectWebSocket()
          }, delay)
        }
      }
    }

    connectWebSocket()

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [workspaceId, queryClient])
}