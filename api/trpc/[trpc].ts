/**
 * Vercel tRPC API Handler
 * Converts Fastify-based tRPC server to Vercel Functions
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../src/trpc/router'
import { createContext } from '../src/trpc/context'

export default async function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: async (opts) => {
      return await createContext({
        req: opts.req as any,
        res: null as any,
      })
    },
    onError: (opts) => {
      console.error(`❌ tRPC failed on ${opts.path ?? '<no-path>'}: ${opts.error.message}`)
    },
  })
}

export const config = {
  runtime: 'nodejs18.x',
}