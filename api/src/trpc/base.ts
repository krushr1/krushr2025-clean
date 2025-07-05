/**
 * Base tRPC Configuration
 * Core tRPC setup without middleware dependencies
 */

import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'
import type { Context } from './context'

/**
 * Initialize tRPC with context
 */
export const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Base router
 */
export const router = t.router

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure

/**
 * Middleware export for use in other files
 */
export const middleware = t.middleware

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.isAuthenticated || !ctx.user) {
    throw new Error('UNAUTHORIZED')
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})