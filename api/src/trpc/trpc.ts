/**
 * tRPC Configuration
 * Complete tRPC setup with procedures
 */

import { router, publicProcedure } from './base'
import { isAuthenticated } from './middleware'

/**
 * Export base items from base.ts
 */
export { t, router, publicProcedure } from './base'

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = publicProcedure.use(isAuthenticated)