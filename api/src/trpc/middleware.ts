/**
 * tRPC Middleware
 * Authentication and authorization middleware
 */

import { TRPCError } from '@trpc/server'
import { middleware } from './base'

/**
 * Authentication middleware - requires valid user session
 */
export const isAuthenticated = middleware(({ ctx, next }) => {
  if (!ctx.isAuthenticated || !ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Type assertion - we know user exists
    },
  })
})

/**
 * Optional authentication middleware - user may or may not be logged in
 */
export const optionalAuth = middleware(({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

/**
 * Rate limiting middleware (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const rateLimit = (maxRequests: number, windowMs: number) =>
  middleware(({ ctx, next }) => {
    const key = ctx.user?.id || 'anonymous'
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < windowStart) {
        rateLimitMap.delete(k)
      }
    }

    const current = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs }

    if (current.count >= maxRequests && current.resetTime > now) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded',
      })
    }

    current.count += 1
    rateLimitMap.set(key, current)

    return next()
  })