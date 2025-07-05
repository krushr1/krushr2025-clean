/**
 * tRPC Context
 * Request context for authentication and database access
 */

import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { prisma } from '../lib/database'
import { validateSession } from '../lib/auth'
import type { User } from '@prisma/client'

export interface Context {
  prisma: typeof prisma
  user: User | null
  isAuthenticated: boolean
}

/**
 * Create tRPC context from Fastify request
 */
export async function createContext({ req }: CreateFastifyContextOptions): Promise<Context> {
  let user: User | null = null
  let isAuthenticated = false

  // Extract token from Authorization header
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    
    try {
      const session = await validateSession(token)
      if (session) {
        user = session.user
        isAuthenticated = true
      }
    } catch (error) {
      // Invalid token - user remains null
    }
  }

  return {
    prisma,
    user,
    isAuthenticated,
  }
}

export type CreateContext = typeof createContext