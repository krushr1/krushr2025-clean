/**
 * tRPC Context
 * Request context for authentication and database access
 */

import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { prisma } from '../lib/database'
import { validateSession } from '../lib/auth'
import { isDevelopment } from '../config'
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
    
    // DEV MODE: Accept development token only in development environment
    if (token === 'dev-token-123' && isDevelopment) {
      // Return Alice user from database
      user = await prisma.user.findUnique({
        where: { email: 'alice@krushr.dev' }
      })
      if (user) {
        isAuthenticated = true
      }
    } else {
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
  }

  return {
    prisma,
    user,
    isAuthenticated,
  }
}

export type CreateContext = typeof createContext