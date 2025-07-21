/**
 * AI Context Manager
 * Real-time workspace context aggregation for AI agent awareness
 */

import { prisma } from './prisma'
import { safeRedis } from './redis'
import { broadcastAiWorkspaceUpdate } from '../websocket/handler'
import { logger } from '../utils/logger'

interface WorkspaceContext {
  workspaceId: string
  lastUpdated: number
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
  recentNotes: Array<{
    id: string
    title: string
    updatedAt: Date
    authorId: string
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

interface ActivityEvent {
  type: 'task-created' | 'task-updated' | 'task-completed' | 'note-updated' | 'kanban-updated' | 'project-updated'
  workspaceId: string
  userId: string
  entityId: string
  data: any
  timestamp: Date
}

export class AiContextManager {
  private static instance: AiContextManager
  private contextCache = new Map<string, WorkspaceContext>()
  private readonly CACHE_TTL = 300 // 5 minutes
  private readonly ACTIVITY_BUFFER_SIZE = 50

  public static getInstance(): AiContextManager {
    if (!AiContextManager.instance) {
      AiContextManager.instance = new AiContextManager()
    }
    return AiContextManager.instance
  }

  /**
   * Get live workspace context for AI agents
   */
  async getWorkspaceContext(workspaceId: string): Promise<WorkspaceContext> {
    const cacheKey = `ai-context:${workspaceId}`
    
    // Check memory cache first
    const cached = this.contextCache.get(workspaceId)
    if (cached && (Date.now() - cached.lastUpdated) < this.CACHE_TTL * 1000) {
      return cached
    }

    // Check Redis cache
    const redisCache = await safeRedis.get(cacheKey)
    if (redisCache) {
      const parsedCache = JSON.parse(redisCache)
      this.contextCache.set(workspaceId, parsedCache)
      return parsedCache
    }

    // Generate fresh context
    const context = await this.generateWorkspaceContext(workspaceId)
    
    // Cache in both memory and Redis
    this.contextCache.set(workspaceId, context)
    await safeRedis.set(cacheKey, JSON.stringify(context), 'EX', this.CACHE_TTL)
    
    return context
  }

  /**
   * Generate comprehensive workspace context
   */
  private async generateWorkspaceContext(workspaceId: string): Promise<WorkspaceContext> {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    try {
      // Parallel data fetching for performance
      const [
        recentTasks,
        updatedTasks,
        completedTasks,
        kanbans,
        projects,
        upcomingTasks,
        recentNotes,
        activityData
      ] = await Promise.all([
        // Recent task creation
        prisma.task.findMany({
          where: {
            createdAt: { gte: last24Hours },
            project: { workspaceId }
          },
          select: { id: true, title: true, priority: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),

        // Recently updated tasks
        prisma.task.findMany({
          where: {
            updatedAt: { gte: last24Hours },
            project: { workspaceId }
          },
          select: { id: true, title: true, status: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 10
        }),

        // Recently completed tasks
        prisma.task.findMany({
          where: {
            status: 'COMPLETED',
            updatedAt: { gte: last7Days },
            project: { workspaceId }
          },
          select: { id: true, title: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 10
        }),

        // Active Kanban boards
        prisma.kanban.findMany({
          where: { workspaceId },
          include: {
            columns: {
              include: { _count: { select: { tasks: true } } }
            }
          }
        }),

        // Projects with task counts
        prisma.project.findMany({
          where: { workspaceId },
          include: {
            _count: { select: { tasks: true } },
            tasks: {
              where: { status: 'COMPLETED' },
              select: { id: true }
            }
          }
        }),

        // Upcoming deadlines
        prisma.task.findMany({
          where: {
            dueDate: { 
              gte: now,
              lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
            },
            project: { workspaceId }
          },
          select: { id: true, title: true, dueDate: true, priority: true },
          orderBy: { dueDate: 'asc' },
          take: 10
        }),

        // Recent notes
        prisma.note.findMany({
          where: { workspaceId },
          select: { id: true, title: true, updatedAt: true, authorId: true },
          orderBy: { updatedAt: 'desc' },
          take: 5
        }),

        // Productivity data for insights
        this.getProductivityData(workspaceId, last7Days)
      ])

      // Calculate AI insights
      const totalTasks = await prisma.task.count({
        where: { project: { workspaceId } }
      })

      const completedTasksCount = completedTasks.length
      const completionRate = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0

      const context: WorkspaceContext = {
        workspaceId,
        lastUpdated: Date.now(),
        recentTasks: {
          created: recentTasks,
          updated: updatedTasks,
          completed: completedTasks.map(task => ({
            ...task,
            completedAt: task.updatedAt
          }))
        },
        activeKanbans: kanbans.map(kanban => ({
          id: kanban.id,
          title: kanban.title,
          columnCount: kanban.columns.length,
          taskCount: kanban.columns.reduce((sum, col) => sum + col._count.tasks, 0)
        })),
        teamActivity: {
          activeUsers: [], // Will be populated from WebSocket connections
          recentActions: [] // Will be populated from activity tracking
        },
        projects: projects.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          taskCount: project._count.tasks,
          progressPercentage: project._count.tasks > 0 
            ? (project.tasks.length / project._count.tasks) * 100 
            : 0
        })),
        upcomingDeadlines: upcomingTasks.map(task => ({
          taskId: task.id,
          title: task.title,
          dueDate: task.dueDate!,
          priority: task.priority
        })),
        recentNotes,
        aiInsights: {
          suggestedTasks: 0, // Placeholder for future ML suggestions
          completionRate,
          averageTaskDuration: activityData.averageTaskDuration,
          productivityTrends: activityData.trends
        }
      }

      logger.debug(`Generated AI context for workspace ${workspaceId}:`, {
        recentTasksCount: recentTasks.length,
        kanbanCount: kanbans.length,
        projectCount: projects.length,
        completionRate: Math.round(completionRate)
      })

      return context
    } catch (error) {
      logger.error('Failed to generate workspace context:', error)
      throw error
    }
  }

  /**
   * Get productivity analytics data
   */
  private async getProductivityData(workspaceId: string, since: Date) {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          project: { workspaceId },
          createdAt: { gte: since }
        },
        select: {
          createdAt: true,
          updatedAt: true,
          status: true
        }
      })

      // Calculate trends by day
      const trends = []
      const now = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dayStart = new Date(date.setHours(0, 0, 0, 0))
        const dayEnd = new Date(date.setHours(23, 59, 59, 999))

        const created = tasks.filter(task => 
          task.createdAt >= dayStart && task.createdAt <= dayEnd
        ).length

        const completed = tasks.filter(task => 
          task.status === 'COMPLETED' && 
          task.updatedAt >= dayStart && 
          task.updatedAt <= dayEnd
        ).length

        trends.push({
          date: dayStart.toISOString().split('T')[0],
          tasksCreated: created,
          tasksCompleted: completed
        })
      }

      // Calculate average task duration (placeholder logic)
      const completedTasks = tasks.filter(task => task.status === 'COMPLETED')
      const averageTaskDuration = completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => {
            const duration = task.updatedAt.getTime() - task.createdAt.getTime()
            return sum + duration
          }, 0) / completedTasks.length / (1000 * 60 * 60) // Convert to hours
        : 0

      return {
        averageTaskDuration: Math.round(averageTaskDuration * 10) / 10, // Round to 1 decimal
        trends
      }
    } catch (error) {
      logger.error('Failed to get productivity data:', error)
      return {
        averageTaskDuration: 0,
        trends: []
      }
    }
  }

  /**
   * Track activity event and update context
   */
  async trackActivity(event: ActivityEvent) {
    try {
      // Store activity event
      await this.storeActivityEvent(event)
      
      // Invalidate context cache for the workspace
      this.invalidateWorkspaceContext(event.workspaceId)
      
      // Broadcast update to WebSocket clients
      broadcastAiWorkspaceUpdate(event.workspaceId, event.type, {
        entityId: event.entityId,
        userId: event.userId,
        data: event.data
      })

      logger.debug(`Tracked activity: ${event.type} in workspace ${event.workspaceId}`)
    } catch (error) {
      logger.error('Failed to track activity:', error)
    }
  }

  /**
   * Store activity event for historical tracking
   */
  private async storeActivityEvent(event: ActivityEvent) {
    const cacheKey = `activity:${event.workspaceId}`
    
    try {
      // Get existing activity buffer
      const existing = await safeRedis.get(cacheKey)
      const activities = existing ? JSON.parse(existing) : []
      
      // Add new event and maintain buffer size
      activities.unshift(event)
      if (activities.length > this.ACTIVITY_BUFFER_SIZE) {
        activities.splice(this.ACTIVITY_BUFFER_SIZE)
      }
      
      // Store back to Redis
      await safeRedis.set(cacheKey, JSON.stringify(activities), 'EX', 3600) // 1 hour TTL
    } catch (error) {
      logger.error('Failed to store activity event:', error)
    }
  }

  /**
   * Invalidate workspace context cache
   */
  private invalidateWorkspaceContext(workspaceId: string) {
    this.contextCache.delete(workspaceId)
    safeRedis.del(`ai-context:${workspaceId}`)
  }

  /**
   * Get workspace context summary for AI system prompts
   */
  async getContextSummary(workspaceId: string): Promise<string> {
    const context = await this.getWorkspaceContext(workspaceId)
    
    const summary = [
      `**Workspace Context (${new Date().toLocaleString()}):**`,
      `• ${context.recentTasks.created.length} tasks created today`,
      `• ${context.recentTasks.completed.length} tasks completed recently`,
      `• ${context.activeKanbans.length} active Kanban boards`,
      `• ${context.projects.length} projects (${Math.round(context.aiInsights.completionRate)}% completion rate)`,
      `• ${context.upcomingDeadlines.length} upcoming deadlines`,
      `• Recent focus: ${context.recentTasks.created.slice(0, 3).map(t => t.title).join(', ')}`
    ]

    return summary.join('\n')
  }

  /**
   * Enhanced context injection for AI requests
   */
  async injectWorkspaceContext(workspaceId: string, userMessage: string): Promise<string> {
    const contextSummary = await this.getContextSummary(workspaceId)
    
    return `${contextSummary}\n\n**User Request:** ${userMessage}`
  }
}

// Export singleton instance
export const aiContextManager = AiContextManager.getInstance()

// Utility functions for common activity tracking
export const trackTaskActivity = (type: 'created' | 'updated' | 'completed', workspaceId: string, userId: string, taskId: string, data: any) => {
  aiContextManager.trackActivity({
    type: `task-${type}` as ActivityEvent['type'],
    workspaceId,
    userId,
    entityId: taskId,
    data,
    timestamp: new Date()
  })
}

export const trackNoteActivity = (workspaceId: string, userId: string, noteId: string, data: any) => {
  aiContextManager.trackActivity({
    type: 'note-updated',
    workspaceId,
    userId,
    entityId: noteId,
    data,
    timestamp: new Date()
  })
}

export const trackKanbanActivity = (workspaceId: string, userId: string, kanbanId: string, data: any) => {
  aiContextManager.trackActivity({
    type: 'kanban-updated',
    workspaceId,
    userId,
    entityId: kanbanId,
    data,
    timestamp: new Date()
  })
}

export const trackProjectActivity = (workspaceId: string, userId: string, projectId: string, data: any) => {
  aiContextManager.trackActivity({
    type: 'project-updated',
    workspaceId,
    userId,
    entityId: projectId,
    data,
    timestamp: new Date()
  })
}