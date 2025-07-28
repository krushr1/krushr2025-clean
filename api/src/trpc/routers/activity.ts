/**
 * Activity Router
 * Activity logs and audit trail
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'
import { broadcastAiWorkspaceUpdate } from '../../websocket/handler'

export const activityRouter = router({
  /**
   * List activities for a task
   */
  list: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        taskId: z.string().optional(),
        projectId: z.string().optional(),
        workspaceId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: any = {}
      
      if (input.taskId) {
        where.entityType = 'task'
        where.entityId = input.taskId
      }
      
      if (input.projectId) {
        where.entityType = 'project'
        where.entityId = input.projectId
      }
      
      if (input.workspaceId) {
        where.workspaceId = input.workspaceId
      }
      
      const activities = await ctx.prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: input.limit
      })
      
      return activities
    }),

  /**
   * Get recent activities for workspace
   */
  getRecent: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        workspaceId: z.string(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      // First verify workspace access (single query)
      const hasAccess = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } }
          ]
        },
        select: { id: true }
      })

      if (!hasAccess) {
        return []
      }

      // Then fetch activities (simplified query)
      const activities = await ctx.prisma.activity.findMany({
        where: {
          workspaceId: input.workspaceId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: input.limit
      })
      
      return activities
    }),

  /**
   * Create activity log entry
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        type: z.string(),
        action: z.string(),
        workspaceId: z.string(),
        entityType: z.string().optional(),
        entityId: z.string().optional(),
        entityName: z.string().optional(),
        targetUserId: z.string().optional(),
        priority: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const activity = await ctx.prisma.activity.create({
        data: {
          type: input.type,
          action: input.action,
          userId: ctx.user.id,
          workspaceId: input.workspaceId,
          entityType: input.entityType,
          entityId: input.entityId,
          entityName: input.entityName,
          targetUserId: input.targetUserId,
          priority: input.priority,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          }
        }
      })
      
      // Broadcast activity to workspace members via WebSocket
      broadcastAiWorkspaceUpdate(input.workspaceId, 'activity-created', activity)
      
      return activity
    }),
})