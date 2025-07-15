/**
 * Activity Router
 * Activity logs and audit trail
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'

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
      // TODO: Implement activity logging when Activity model is added to schema
      return []
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
      // TODO: Implement when Activity model exists - return mock data for now
      return []
    }),

  /**
   * Create activity log entry
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        action: z.string(),
        entityType: z.string(),
        entityId: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement activity logging when Activity model is added to schema
      return { success: true, message: 'Activity logging not yet implemented' }
    }),
})