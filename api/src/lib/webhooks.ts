/**
 * Webhook System
 * Simple webhook delivery for external integrations
 */

import { EventEmitter } from 'events'

interface WebhookPayload {
  event: string
  data: any
  timestamp: string
  workspace_id?: string
  user_id?: string
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  secret?: string
  active: boolean
  workspace_id?: string
}

class WebhookManager extends EventEmitter {
  private endpoints: Map<string, WebhookEndpoint> = new Map()

  /**
   * Register a webhook endpoint
   */
  register(endpoint: WebhookEndpoint) {
    this.endpoints.set(endpoint.id, endpoint)
    console.log(`🔗 Webhook registered: ${endpoint.url} for events: ${endpoint.events.join(', ')}`)
  }

  /**
   * Unregister a webhook endpoint
   */
  unregister(id: string) {
    const endpoint = this.endpoints.get(id)
    if (endpoint) {
      this.endpoints.delete(id)
      console.log(`🔗 Webhook unregistered: ${endpoint.url}`)
    }
  }

  /**
   * Send webhook to all registered endpoints
   */
  async send(event: string, data: any, workspace_id?: string, user_id?: string) {
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      workspace_id,
      user_id
    }

    const relevantEndpoints = Array.from(this.endpoints.values()).filter(endpoint => 
      endpoint.active && 
      endpoint.events.includes(event) &&
      (!workspace_id || !endpoint.workspace_id || endpoint.workspace_id === workspace_id)
    )

    const promises = relevantEndpoints.map(endpoint => 
      this.deliverWebhook(endpoint, payload)
    )

    await Promise.allSettled(promises)
  }

  /**
   * Deliver webhook to specific endpoint
   */
  private async deliverWebhook(endpoint: WebhookEndpoint, payload: WebhookPayload) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Krushr-Webhooks/1.0',
          ...(endpoint.secret && {
            'X-Krushr-Signature': this.generateSignature(payload, endpoint.secret)
          })
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      console.log(`✅ Webhook delivered: ${endpoint.url} for ${payload.event}`)
    } catch (error) {
      console.error(`❌ Webhook delivery failed: ${endpoint.url} for ${payload.event}:`, error)
    }
  }

  /**
   * Generate webhook signature for security
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const crypto = require('crypto')
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')
  }

  /**
   * Get all registered endpoints
   */
  getEndpoints(): WebhookEndpoint[] {
    return Array.from(this.endpoints.values())
  }

  /**
   * Get endpoints for a workspace
   */
  getWorkspaceEndpoints(workspace_id: string): WebhookEndpoint[] {
    return Array.from(this.endpoints.values()).filter(
      endpoint => endpoint.workspace_id === workspace_id
    )
  }
}

// Global webhook manager instance
export const webhookManager = new WebhookManager()

// Common webhook events
export const WEBHOOK_EVENTS = {
  // Tasks
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',

  // Projects
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',

  // Teams
  TEAM_MEMBER_ADDED: 'team.member_added',
  TEAM_MEMBER_REMOVED: 'team.member_removed',

  // Comments
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',

  // Files
  FILE_UPLOADED: 'file.uploaded',
} as const

/**
 * Helper function to send webhook for task events
 */
export function sendTaskWebhook(event: string, task: any, workspace_id?: string, user_id?: string) {
  webhookManager.send(event, { task }, workspace_id, user_id)
}

/**
 * Helper function to send webhook for project events
 */
export function sendProjectWebhook(event: string, project: any, workspace_id?: string, user_id?: string) {
  webhookManager.send(event, { project }, workspace_id, user_id)
}

/**
 * Helper function to send webhook for team events
 */
export function sendTeamWebhook(event: string, team: any, member?: any, workspace_id?: string, user_id?: string) {
  webhookManager.send(event, { team, member }, workspace_id, user_id)
}