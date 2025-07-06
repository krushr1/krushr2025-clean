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
    
    // DEV MODE: Accept development token
    if (token === 'dev-token-123') {
      // Return development user
      user = {
        id: 'dev-user-123',
        name: 'Development User',
        email: 'dev@krushr.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
        createdAt: new Date(),
        updatedAt: new Date(),
        hashedPassword: '', // Not needed for dev
        provider: 'development',
        providerId: 'dev-123'
      } as User
      isAuthenticated = true
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