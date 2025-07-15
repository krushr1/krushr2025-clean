
import { createTRPCReact } from '@trpc/react-query'
import { httpLink, loggerLink } from '@trpc/client'
import type { AppRouter } from '../../../api/src/trpc/router'

export const trpc = createTRPCReact<AppRouter>()

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token')
    // Only provide dev token in development environment
    if (!token && process.env.NODE_ENV === 'development') {
      localStorage.setItem('auth-token', 'dev-token-123')
      return 'dev-token-123'
    }
    return token
  }
  return null
}

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

export type { AppRouter }