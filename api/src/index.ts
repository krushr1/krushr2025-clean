/**
 * Krushr API Server
 * Modern Node.js + TypeScript backend with Fastify, tRPC, and WebSockets
 */

import { fastify } from 'fastify'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastifyWebsocket from '@fastify/websocket'
import fastifyCors from '@fastify/cors'
import fastifyJWT from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fastifyCSRF from '@fastify/csrf-protection'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
// import fastifyRedis from '@fastify/redis'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import path from 'path'

import { appRouter } from './trpc/router'
import { createContext } from './trpc/context'
import { connectDatabase } from './lib/database'
import { ensureUploadDir, saveFile, generateFilename, validateFile } from './lib/upload'
import { webhookManager } from './lib/webhooks'
import { websocketHandler } from './websocket/handler'
import { config } from './config'
import { logger } from './utils/logger'
import { validateSession } from './lib/auth'

/**
 * Build Fastify server with all plugins and routes
 */
async function buildServer() {
  const server = fastify({
    logger: config.NODE_ENV === 'development',
    bodyLimit: config.MAX_FILE_SIZE,
  })

  try {
    // Security headers
    await server.register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          fontSrc: ["'self'", "https:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false // Disable for development
    })

    // Register core plugins
    await server.register(fastifyCors, {
      origin: config.CORS_ORIGIN.split(','),
      credentials: true,
    })

    await server.register(fastifyJWT, {
      secret: config.JWT_SECRET,
    })

    await server.register(fastifyMultipart, {
      limits: {
        fileSize: config.MAX_FILE_SIZE,
      },
    })

    // Cookie support for CSRF
    await server.register(fastifyCookie, {
      secret: config.JWT_SECRET,
      parseOptions: {}
    })

    // CSRF Protection (temporarily disabled for development)
    // await server.register(fastifyCSRF, {
    //   sessionPlugin: '@fastify/cookie',
    //   cookieOpts: {
    //     signed: true,
    //     httpOnly: true,
    //     sameSite: 'strict',
    //     secure: config.NODE_ENV === 'production'
    //   }
    // })

    // Static file serving for uploads
    const uploadsPath = path.resolve(__dirname, '../uploads')
    logger.info(`📁 Serving static files from: ${uploadsPath}`)
    
    await server.register(fastifyStatic, {
      root: uploadsPath,
      prefix: '/api/files/',
      setHeaders: (res, pathname) => {
        // Set CORS headers for static files
        res.setHeader('Access-Control-Allow-Origin', config.CORS_ORIGIN.split(',').join(' '))
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      }
    })

    // Redis is disabled for development - uncomment when needed
    // await server.register(fastifyRedis, {
    //   url: config.REDIS_URL,
    // })

    // API Documentation
    await server.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Krushr API',
          description: 'Modern project management platform API',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://${config.HOST}:${config.PORT}`,
            description: 'Development server',
          },
        ],
      },
    })

    // Temporarily disabled due to decorator conflict
    // await server.register(fastifySwaggerUI, {
    //   routePrefix: '/docs',
    // })

    // WebSocket support
    await server.register(fastifyWebsocket)

    // tRPC API routes
    await server.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: appRouter,
        createContext,
        onError: (opts: any) => {
          logger.error(`❌ tRPC failed on ${opts.path ?? '<no-path>'}: ${opts.error.message}`)
        },
      },
    })

    // WebSocket endpoint
    server.register(async function (fastify) {
      fastify.get('/ws', { websocket: true }, (socket: any, request: any) => {
        websocketHandler(socket, request)
      })
    })

    // Health check
    server.get('/health', async () => {
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      }
    })

    // File upload endpoint
    server.post('/upload', async (request, reply) => {
      const data = await request.file()
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' })
      }

      // Validate file
      const validation = validateFile(data)
      if (!validation.valid) {
        return reply.code(400).send({ error: validation.error })
      }

      try {
        // Generate unique filename
        const filename = generateFilename(data.filename)
        
        // Save file
        const filepath = await saveFile(data, filename)
        
        // Return file info
        return {
          success: true,
          filename,
          originalName: data.filename,
          mimetype: data.mimetype,
          size: data.file.bytesRead,
          url: `/uploads/${filename}`
        }
      } catch (error) {
        logger.error('File upload failed:', error)
        return reply.code(500).send({ error: 'Upload failed' })
      }
    })

    // Webhook management endpoints  
    server.post('/webhooks', async (request, reply) => {
      // Authentication check
      const authHeader = request.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Authentication required' })
      }
      
      const token = authHeader.slice(7)
      const session = await validateSession(token)
      if (!session) {
        return reply.code(401).send({ error: 'Invalid or expired token' })
      }
      const { url, events, secret, workspace_id } = request.body as any
      
      if (!url || !events || !Array.isArray(events)) {
        return reply.code(400).send({ error: 'URL and events array required' })
      }

      const id = `webhook_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      webhookManager.register({
        id,
        url,
        events,
        secret,
        active: true,
        workspace_id
      })

      return { id, message: 'Webhook registered successfully' }
    })

    server.get('/webhooks', async (request, reply) => {
      // Authentication check
      const authHeader = request.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Authentication required' })
      }
      
      const token = authHeader.slice(7)
      const session = await validateSession(token)
      if (!session) {
        return reply.code(401).send({ error: 'Invalid or expired token' })
      }
      return { webhooks: webhookManager.getEndpoints() }
    })

    server.delete('/webhooks/:id', async (request, reply) => {
      // Authentication check
      const authHeader = request.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Authentication required' })
      }
      
      const token = authHeader.slice(7)
      const session = await validateSession(token)
      if (!session) {
        return reply.code(401).send({ error: 'Invalid or expired token' })
      }
      const { id } = request.params as any
      webhookManager.unregister(id)
      return { message: 'Webhook unregistered successfully' }
    })

    return server
  } catch (error) {
    logger.error('❌ Error building server:', error)
    process.exit(1)
  }
}

/**
 * Start the server
 */
async function start() {
  try {
    // Connect to database first
    await connectDatabase()
    
    // Ensure upload directory exists
    await ensureUploadDir()
    
    const server = await buildServer()

    await server.listen({
      port: config.PORT,
      host: config.HOST,
    })

    logger.info(`🚀 Krushr API Server running on http://${config.HOST}:${config.PORT}`)
    logger.info(`📚 API Documentation: http://${config.HOST}:${config.PORT}/docs`)
    logger.info(`🔌 WebSocket endpoint: ws://${config.HOST}:${config.PORT}/ws`)
    logger.info(`⚡ tRPC endpoint: http://${config.HOST}:${config.PORT}/trpc`)

  } catch (error) {
    logger.error('❌ Error starting server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Start the server
if (require.main === module) {
  start()
}