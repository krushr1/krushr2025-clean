/**
 * tRPC Client Configuration
 * Type-safe API client for Krushr backend
 */

import { createTRPCReact } from '@trpc/react-query'
import { httpLink, loggerLink } from '@trpc/client'
import type { AppRouter } from '../../../api/src/trpc/router'

/**
 * Create tRPC React client
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token')
  }
  return null
}

/**
 * tRPC client configuration
 */
export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: () => process.env.NODE_ENV === 'development',
    }),
    httpLink({
      url: 'http://127.0.0.1:3002/trpc',
      headers() {
        const token = getAuthToken()
        return {
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          'Origin': 'http://127.0.0.1:8001'
        }
      },
    }),
  ],
})

/**
 * Export AppRouter type for use in other files
 */
export type { AppRouter }