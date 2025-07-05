/**
 * Application Configuration
 * Environment variables and settings
 */

import { z } from 'zod'
import { config as loadEnv } from 'dotenv'

// Load environment variables from .env file
loadEnv()

const configSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3002),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:8001,http://127.0.0.1:8001'),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // WebSocket
  WS_PORT: z.coerce.number().default(3002),

  // External Services (optional)
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  EMAIL_SERVICE_URL: z.string().optional(),
})

function loadConfig() {
  const env = {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    WS_PORT: process.env.WS_PORT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL,
  }

  try {
    return configSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`❌ Invalid environment configuration:\n${missingVars}`)
    }
    throw error
  }
}

export const config = loadConfig()

export const isDevelopment = config.NODE_ENV === 'development'
export const isProduction = config.NODE_ENV === 'production'
export const isTest = config.NODE_ENV === 'test'