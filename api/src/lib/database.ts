/**
 * Database Connection
 * Prisma client initialization and connection management
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'
import { config } from '../config'

// Global Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Database connection test
export async function connectDatabase() {
  try {
    await prisma.$connect()
    logger.success('🗄️ Database connected successfully')
  } catch (error) {
    logger.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

// Graceful database disconnect
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    logger.info('🗄️ Database disconnected')
  } catch (error) {
    logger.error('❌ Database disconnect error:', error)
  }
}