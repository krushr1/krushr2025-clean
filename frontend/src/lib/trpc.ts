
import { createTRPCReact } from '@trpc/react-query'
import { httpLink, loggerLink } from '@trpc/client'
import type { AppRouter } from '../../../api/src/trpc/router'
import { isDemoMode, demoResponses, extractProcedure } from './demo-mode'

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

// Get API URL based on environment
function getApiUrl(): string {
  // Production: Use Vercel deployment URL
  if (typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for Vercel deployment
    return `${window.location.origin}/api/trpc`
  }
  
  // Development: Use localhost
  return 'http://127.0.0.1:3002/trpc'
}

// Custom fetch function that intercepts requests in demo mode
const demoFetch: typeof fetch = async (input, init) => {
  if (isDemoMode() && typeof input === 'string') {
    const procedure = extractProcedure(input)
    const handler = demoResponses[procedure]
    
    if (handler) {
      console.log(`[Demo Mode] Intercepting ${procedure}`)
      const data = await handler()
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  // Fallback to regular fetch
  return fetch(input, init)
}

export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: () => process.env.NODE_ENV === 'development',
    }),
    httpLink({
      url: getApiUrl(),
      fetch: demoFetch,
      headers() {
        const token = getAuthToken()
        const apiUrl = getApiUrl()
        const origin = apiUrl.includes('localhost') ? 'http://127.0.0.1:8001' : window.location.origin
        
        return {
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          'Origin': origin
        }
      },
    }),
  ],
})

export type { AppRouter }