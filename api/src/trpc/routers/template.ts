/**
 * Template Router
 * Handles form template operations
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const templateRouter = router({
  list: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
    }))
    .query(async ({ input }) => {
      // Template functionality not yet implemented
      // Return empty array to prevent 404 errors
      return []
    }),
})