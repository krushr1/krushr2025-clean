/**
 * Complete Robust Upload Router
 * Full-featured file upload with bulletproof thumbnail generation
 */

import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { prisma } from '../../lib/database'
import { generateThumbnail, saveThumbnail } from '../../lib/thumbnail'
import { logger } from '../../utils/logger'
import fs from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'
import zlib from 'zlib'
import { promisify } from 'util'

const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)

const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads')
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

const ALLOWED_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
  // Documents  
  'application/pdf', 'text/plain', 'text/markdown', 'text/csv',
  // Microsoft Office
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archives
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip',
  // Code files
  'text/javascript', 'text/typescript', 'application/json', 'text/html', 'text/css',
  // Audio/Video
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm', 'video/ogg',
  // Other
  'application/octet-stream'
]

const COMPRESSIBLE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff',
  'application/pdf', 'text/plain', 'text/markdown', 'application/json',
  'text/html', 'text/css', 'text/javascript'
]

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    logger.info(`📁 Created upload directory: ${UPLOAD_DIR}`)
  }
}

// Generate file hash for deduplication  
function generateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

// Check if file already exists by hash
async function findExistingFile(hash: string, size: number): Promise<string | null> {
  try {
    const files = await fs.readdir(UPLOAD_DIR)
    for (const file of files) {
      if (file.startsWith(hash.slice(0, 16))) {
        const filePath = path.join(UPLOAD_DIR, file)
        const stat = await fs.stat(filePath)
        if (stat.size === size) {
          return file
        }
      }
    }
  } catch (error) {
    logger.warn('Error checking for existing files:', error)
  }
  return null
}

// Compress file if beneficial
async function compressFile(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; compressed: boolean }> {
  if (!COMPRESSIBLE_TYPES.includes(mimeType)) {
    return { buffer, compressed: false }
  }

  try {
    // For text-based files, use gzip
    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      const compressed = await gzip(buffer)
      // Only use compression if it reduces size by at least 10%
      if (compressed.length < buffer.length * 0.9) {
        return { buffer: compressed, compressed: true }
      }
    }
    
    // For PDFs, use gzip  
    if (mimeType === 'application/pdf') {
      const compressed = await gzip(buffer)
      if (compressed.length < buffer.length * 0.85) {
        return { buffer: compressed, compressed: true }
      }
    }
    
    return { buffer, compressed: false }
  } catch (error) {
    logger.warn('Compression failed:', error)
    return { buffer, compressed: false }
  }
}

export const uploadRouterNew = router({
  /**
   * Upload file for task attachment with robust thumbnail generation
   */
  uploadTaskFile: publicProcedure
    .input(z.object({
      taskId: z.string(),
      file: z.object({
        filename: z.string(),
        mimetype: z.string(),
        size: z.number(),
        buffer: z.any()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        })
      }

      const { taskId, file } = input
      
      logger.info(`📥 Starting file upload: ${file.filename}`, {
        size: file.size,
        type: file.mimetype,
        user: ctx.user.email
      })

      // Convert and validate buffer
      let fileBuffer: Buffer
      try {
        fileBuffer = Buffer.from(file.buffer)
        logger.info(`🔄 Buffer converted: ${fileBuffer.length} bytes`)
        
        if (fileBuffer.length !== file.size) {
          logger.warn(`⚠️  Buffer size mismatch: expected ${file.size}, got ${fileBuffer.length}`)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid file data: ${error.message}`
        })
      }

      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File size exceeds 15MB limit'
        })
      }

      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File type not allowed'
        })
      }

      // Verify task exists and user has access
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          OR: [
            { createdById: ctx.user.id },
            { assigneeId: ctx.user.id },
            { project: { team: { members: { some: { userId: ctx.user.id } } } } }
          ]
        }
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found or access denied'
        })
      }

      await ensureUploadDir()

      // Generate file hash for deduplication
      const fileHash = generateFileHash(fileBuffer)
      logger.info(`🔐 File hash generated: ${fileHash.slice(0, 16)}...`)
      
      // Check if file already exists
      const existingFile = await findExistingFile(fileHash, file.size)
      let finalFilename: string
      let finalBuffer: Buffer
      let wasCompressed = false
      let thumbnailFilename: string | null = null

      try {
        if (existingFile) {
          logger.info(`♻️  File already exists, reusing: ${existingFile}`)
          finalFilename = existingFile
          finalBuffer = fileBuffer
          
          // Check if thumbnail already exists for deduplicated file
          const thumbnailName = existingFile.replace(/\.[^/.]+$/, '_thumb.jpg')
          const thumbnailPath = path.join(UPLOAD_DIR, thumbnailName)
          try {
            await fs.access(thumbnailPath)
            thumbnailFilename = thumbnailName
            logger.info(`✅ Existing thumbnail found: ${thumbnailName}`)
          } catch {
            // Generate thumbnail for deduplicated file
            if (file.mimetype.startsWith('image/')) {
              const thumbnailResult = await generateThumbnail(fileBuffer, file.mimetype)
              if (thumbnailResult.success) {
                const saved = await saveThumbnail(thumbnailResult.buffer, thumbnailPath)
                if (saved) {
                  thumbnailFilename = thumbnailName
                  logger.info(`✅ Thumbnail generated for existing file: ${thumbnailName}`)
                }
              }
            }
          }
        } else {
          // Compress file if beneficial
          const compressionResult = await compressFile(fileBuffer, file.mimetype)
          finalBuffer = compressionResult.buffer
          wasCompressed = compressionResult.compressed
          
          if (wasCompressed) {
            logger.info(`🗜️  File compressed: ${file.size} → ${finalBuffer.length} bytes`)
          }

          // Generate unique filename with hash prefix
          const timestamp = Date.now()
          const ext = path.extname(file.filename)
          const name = path.basename(file.filename, ext)
          const hashPrefix = fileHash.slice(0, 16)
          finalFilename = `${hashPrefix}_${name}_${timestamp}${ext}${wasCompressed ? '.gz' : ''}`
          
          // Save file
          const filePath = path.join(UPLOAD_DIR, finalFilename)
          await fs.writeFile(filePath, finalBuffer)
          logger.info(`💾 File saved: ${finalFilename}`)
          
          // Verify file was written correctly
          const stats = await fs.stat(filePath)
          if (stats.size !== finalBuffer.length) {
            throw new Error(`File size mismatch after write: expected ${finalBuffer.length}, got ${stats.size}`)
          }
          
          // Generate thumbnail for images using robust system
          if (file.mimetype.startsWith('image/')) {
            logger.info(`🖼️  Generating thumbnail for: ${file.filename}`)
            
            const thumbnailResult = await generateThumbnail(fileBuffer, file.mimetype, {
              width: 150,
              height: 150,
              quality: 85
            })
            
            if (thumbnailResult.success) {
              thumbnailFilename = `${hashPrefix}_${name}_${timestamp}_thumb.jpg`
              const thumbnailPath = path.join(UPLOAD_DIR, thumbnailFilename)
              
              const saved = await saveThumbnail(thumbnailResult.buffer, thumbnailPath)
              if (saved) {
                logger.info(`✅ Thumbnail generated using ${thumbnailResult.method}: ${thumbnailFilename} (${thumbnailResult.size} bytes)`)
              } else {
                logger.error(`❌ Failed to save thumbnail: ${thumbnailFilename}`)
                thumbnailFilename = null
              }
            } else {
              logger.error(`❌ Thumbnail generation failed: ${thumbnailResult.error}`)
            }
          }
        }

        // Create database record
        const attachment = await prisma.taskAttachment.create({
          data: {
            taskId,
            filename: file.filename,
            size: file.size,
            mimeType: file.mimetype,
            compressed: wasCompressed,
            url: finalFilename,
            thumbnailUrl: thumbnailFilename,
          }
        })

        logger.info(`✅ Upload completed successfully: ${attachment.id}`)

        return {
          id: attachment.id,
          filename: attachment.filename,
          size: attachment.size,
          mimeType: attachment.mimeType,
          compressed: attachment.compressed,
          downloadUrl: `/api/files/${attachment.url}`,
          thumbnailUrl: attachment.thumbnailUrl ? `/api/files/${attachment.thumbnailUrl}` : null,
          uploadedAt: attachment.uploadedAt
        }

      } catch (error) {
        logger.error(`❌ Upload failed for ${file.filename}:`, error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Upload failed: ${error.message}`
        })
      }
    }),

  /**
   * Get task attachments with enhanced error handling
   */
  getTaskAttachments: publicProcedure
    .input(z.object({
      taskId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        })
      }

      const attachments = await prisma.taskAttachment.findMany({
        where: {
          taskId: input.taskId,
          task: {
            OR: [
              { createdById: ctx.user.id },
              { assigneeId: ctx.user.id },
              { project: { team: { members: { some: { userId: ctx.user.id } } } } }
            ]
          }
        },
        orderBy: { uploadedAt: 'desc' }
      })

      // Validate that files actually exist and clean up orphaned records
      const validAttachments = []
      
      for (const attachment of attachments) {
        try {
          const filePath = path.join(UPLOAD_DIR, attachment.url)
          await fs.access(filePath)
          
          // Check thumbnail exists if specified
          if (attachment.thumbnailUrl) {
            const thumbnailPath = path.join(UPLOAD_DIR, attachment.thumbnailUrl)
            try {
              await fs.access(thumbnailPath)
            } catch {
              // Thumbnail file missing, remove reference
              logger.warn(`⚠️  Thumbnail missing for ${attachment.filename}, removing reference`)
              await prisma.taskAttachment.update({
                where: { id: attachment.id },
                data: { thumbnailUrl: null }
              })
              attachment.thumbnailUrl = null
            }
          }
          
          validAttachments.push({
            id: attachment.id,
            filename: attachment.filename,
            size: attachment.size,
            mimeType: attachment.mimeType,
            compressed: attachment.compressed,
            downloadUrl: `/api/files/${attachment.url}`,
            thumbnailUrl: attachment.thumbnailUrl ? `/api/files/${attachment.thumbnailUrl}` : null,
            uploadedAt: attachment.uploadedAt
          })
          
        } catch {
          // File missing, remove database record
          logger.warn(`⚠️  File missing for ${attachment.filename}, removing database record`)
          await prisma.taskAttachment.delete({
            where: { id: attachment.id }
          })
        }
      }

      return validAttachments
    }),

  /**
   * Delete attachment with proper cleanup
   */
  deleteAttachment: publicProcedure
    .input(z.object({
      attachmentId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        })
      }

      const attachment = await prisma.taskAttachment.findFirst({
        where: {
          id: input.attachmentId,
          task: {
            OR: [
              { createdById: ctx.user.id },
              { assigneeId: ctx.user.id },
              { project: { team: { members: { some: { userId: ctx.user.id } } } } }
            ]
          }
        }
      })

      if (!attachment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Attachment not found or access denied'
        })
      }

      try {
        // Delete main file
        const filePath = path.join(UPLOAD_DIR, attachment.url)
        try {
          await fs.unlink(filePath)
          logger.info(`🗑️  Deleted file: ${attachment.url}`)
        } catch (error) {
          logger.warn(`⚠️  Could not delete file ${attachment.url}:`, error)
        }

        // Delete thumbnail if exists
        if (attachment.thumbnailUrl) {
          const thumbnailPath = path.join(UPLOAD_DIR, attachment.thumbnailUrl)
          try {
            await fs.unlink(thumbnailPath)
            logger.info(`🗑️  Deleted thumbnail: ${attachment.thumbnailUrl}`)
          } catch (error) {
            logger.warn(`⚠️  Could not delete thumbnail ${attachment.thumbnailUrl}:`, error)
          }
        }

        // Delete database record
        await prisma.taskAttachment.delete({
          where: { id: input.attachmentId }
        })

        logger.info(`✅ Attachment deleted successfully: ${attachment.filename}`)

        return { success: true }

      } catch (error) {
        logger.error(`❌ Failed to delete attachment:`, error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Delete failed: ${error.message}`
        })
      }
    }),

  /**
   * Get file URL for download with validation
   */
  getFileUrl: publicProcedure
    .input(z.object({
      attachmentId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        })
      }

      const attachment = await prisma.taskAttachment.findFirst({
        where: {
          id: input.attachmentId,
          task: {
            OR: [
              { createdById: ctx.user.id },
              { assigneeId: ctx.user.id },
              { project: { team: { members: { some: { userId: ctx.user.id } } } } }
            ]
          }
        }
      })

      if (!attachment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found or access denied'
        })
      }

      // Verify file still exists
      const filePath = path.join(UPLOAD_DIR, attachment.url)
      try {
        await fs.access(filePath)
      } catch {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File no longer exists'
        })
      }

      return {
        id: attachment.id,
        filename: attachment.filename,
        downloadUrl: `/api/files/${attachment.url}`,
        size: attachment.size,
        mimeType: attachment.mimeType,
        uploadedAt: attachment.uploadedAt
      }
    })
})