/**
 * Upload Router
 * Handles file uploads for tasks, projects, and profiles
 */

import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { prisma } from '../../lib/database'
import fs from 'fs/promises'
import path from 'path'
import { pipeline } from 'stream/promises'
import { createHash } from 'crypto'
import zlib from 'zlib'
import { promisify } from 'util'
import sharp from 'sharp'

const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)

const UPLOAD_DIR = path.resolve(__dirname, '../../../../uploads')
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
  // Google Docs (exported formats)
  'application/vnd.google-apps.document', 'application/vnd.google-apps.spreadsheet', 'application/vnd.google-apps.presentation',
  // Archives
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip',
  // Code files
  'text/javascript', 'text/typescript', 'application/json', 'text/html', 'text/css',
  'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++src',
  // Audio/Video
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm', 'video/ogg',
  // Other
  'application/octet-stream' // Fallback for unknown types
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
  }
}

// Generate file hash for deduplication
function generateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

// Generate thumbnail for images with optimization
async function generateThumbnail(buffer: Buffer, mimeType: string): Promise<Buffer | null> {
  if (!mimeType.startsWith('image/')) {
    console.log(`Skipping thumbnail for non-image type: ${mimeType}`)
    return null
  }
  
  try {
    console.log(`🖼️  Starting thumbnail generation for ${mimeType}, buffer size: ${buffer.length} bytes`)
    
    // Validate input buffer
    if (!buffer || buffer.length === 0) {
      console.error('❌ Invalid buffer for thumbnail generation')
      return null
    }
    
    // Get image metadata first to avoid processing very large images
    const metadata = await sharp(buffer).metadata()
    console.log(`📊 Image metadata:`, {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels,
      density: metadata.density
    })
    
    // Skip thumbnail generation for extremely large images to prevent memory issues
    if (metadata.width && metadata.height && metadata.width * metadata.height > 50000000) { // 50MP limit
      console.warn(`⚠️  Skipping thumbnail for large image: ${metadata.width}x${metadata.height}`)
      return null
    }
    
    // Generate a 150x150 thumbnail with smart cropping and optimization
    console.log(`🔄 Processing thumbnail...`)
    
    let thumbnail: Buffer
    try {
      // Try standard approach first
      thumbnail = await sharp(buffer)
        .resize(150, 150, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 85,
          progressive: true
        })
        .toBuffer()
    } catch (primaryError) {
      console.warn(`⚠️  Primary thumbnail generation failed: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`)
      
      try {
        // Fallback: Convert to raw first, then process
        console.log(`🔄 Trying fallback approach...`)
        const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true })
        
        thumbnail = await sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: info.channels
          }
        })
        .resize(150, 150, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer()
        
        console.log(`✅ Fallback thumbnail generation succeeded`)
      } catch (fallbackError) {
        console.error(`❌ Fallback thumbnail generation also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`)
        throw new Error(`Both primary and fallback thumbnail generation failed: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`)
      }
    }
    
    console.log(`✅ Thumbnail generated successfully, size: ${thumbnail.length} bytes`)
    
    // Validate output
    if (thumbnail.length < 1000) { // Sanity check - valid PNG should be larger
      console.error(`❌ Generated thumbnail suspiciously small: ${thumbnail.length} bytes`)
      return null
    }
    
    return thumbnail
  } catch (error) {
    console.error('❌ Thumbnail generation failed:', error instanceof Error ? error.message : error)
    return null
  }
}

// Compress file if beneficial
async function compressFile(buffer: Buffer, mimeType: string, filename: string): Promise<{ buffer: Buffer; compressed: boolean }> {
  if (!COMPRESSIBLE_TYPES.includes(mimeType)) {
    return { buffer, compressed: false }
  }

  try {
    // Image compression using Sharp
    if (mimeType.startsWith('image/')) {
      return await compressImage(buffer, mimeType)
    }
    
    // Text-based file compression using gzip
    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      const compressed = await gzip(buffer)
      // Only use compression if it reduces size by at least 10%
      if (compressed.length < buffer.length * 0.9) {
        return { buffer: compressed, compressed: true }
      }
    }
    
    // PDF compression (basic optimization)
    if (mimeType === 'application/pdf') {
      // For now, we'll use gzip on PDFs
      // Could add PDF-specific optimization later
      const compressed = await gzip(buffer)
      if (compressed.length < buffer.length * 0.85) {
        return { buffer: compressed, compressed: true }
      }
    }
    
    return { buffer, compressed: false }
  } catch (error) {
    console.warn('Compression failed:', error)
    return { buffer, compressed: false }
  }
}

// Lossless image compression
async function compressImage(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; compressed: boolean }> {
  try {
    let compressedBuffer: Buffer
    
    switch (mimeType) {
      case 'image/jpeg':
        // Optimize JPEG without quality loss
        compressedBuffer = await sharp(buffer)
          .jpeg({ 
            quality: 95, // High quality but with optimization
            progressive: true,
            mozjpeg: true // Use mozjpeg encoder for better compression
          })
          .toBuffer()
        break
        
      case 'image/png':
        // Lossless PNG optimization
        compressedBuffer = await sharp(buffer)
          .png({ 
            compressionLevel: 9, // Maximum compression
            adaptiveFiltering: true,
            palette: true // Use palette when beneficial
          })
          .toBuffer()
        break
        
      case 'image/webp':
        // WebP lossless compression
        compressedBuffer = await sharp(buffer)
          .webp({ 
            lossless: true,
            effort: 6 // Maximum effort for better compression
          })
          .toBuffer()
        break
        
      case 'image/tiff':
        // Convert TIFF to PNG for better compression
        compressedBuffer = await sharp(buffer)
          .png({ 
            compressionLevel: 9,
            adaptiveFiltering: true
          })
          .toBuffer()
        break
        
      case 'image/bmp':
        // Convert BMP to PNG for much better compression
        compressedBuffer = await sharp(buffer)
          .png({ 
            compressionLevel: 9,
            adaptiveFiltering: true
          })
          .toBuffer()
        break
        
      default:
        // For other image types, try converting to WebP lossless
        compressedBuffer = await sharp(buffer)
          .webp({ 
            lossless: true,
            effort: 6
          })
          .toBuffer()
    }
    
    // Only use compressed version if it's actually smaller
    if (compressedBuffer.length < buffer.length) {
      return { buffer: compressedBuffer, compressed: true }
    }
    
    return { buffer, compressed: false }
  } catch (error) {
    console.warn('Image compression failed:', error)
    return { buffer, compressed: false }
  }
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
    console.warn('Error checking for existing files:', error)
  }
  return null
}

export const uploadRouter = router({
  /**
   * Upload file for task attachment
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

      // Convert received buffer data to Buffer for server-side processing
      console.log(`📥 Received file data:`, {
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        bufferType: typeof file.buffer,
        bufferLength: file.buffer?.length || 'undefined'
      })
      
      const fileBuffer = Buffer.from(file.buffer)
      console.log(`🔄 Converted to Buffer: ${fileBuffer.length} bytes`)
      
      // Validate buffer conversion
      if (fileBuffer.length !== file.size) {
        console.warn(`⚠️  Buffer size mismatch: received ${file.size}, converted to ${fileBuffer.length}`)
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
      
      // Check if file already exists
      const existingFile = await findExistingFile(fileHash, file.size)
      let finalFilename: string
      let finalBuffer: Buffer
      let wasCompressed = false
      let thumbnailFilename: string | null = null

      try {
        if (existingFile) {
          // File already exists, reuse it
          finalFilename = existingFile
          finalBuffer = fileBuffer
          
          // Check if thumbnail already exists for deduplicated file
          const thumbnailName = existingFile.replace(/\.[^/.]+$/, '_thumb.jpg')
          const thumbnailPath = path.join(UPLOAD_DIR, thumbnailName)
          try {
            await fs.access(thumbnailPath)
            thumbnailFilename = thumbnailName
          } catch {
            // Thumbnail doesn't exist, generate it for deduplicated file
            if (file.mimetype.startsWith('image/')) {
              const thumbnail = await generateThumbnail(fileBuffer, file.mimetype)
              if (thumbnail) {
                await fs.writeFile(thumbnailPath, thumbnail)
                thumbnailFilename = thumbnailName
              }
            }
          }
        } else {
          // Compress file if beneficial
          const { buffer: processedBuffer, compressed } = await compressFile(fileBuffer, file.mimetype, file.filename)
          finalBuffer = processedBuffer
          wasCompressed = compressed

          // Generate unique filename with hash prefix
          const timestamp = Date.now()
          const ext = path.extname(file.filename)
          const name = path.basename(file.filename, ext)
          const hashPrefix = fileHash.slice(0, 16)
          finalFilename = `${hashPrefix}_${name}_${timestamp}${ext}${compressed ? '.gz' : ''}`
          
          // Save file
          const filePath = path.join(UPLOAD_DIR, finalFilename)
          await fs.writeFile(filePath, finalBuffer)
          
          // Verify file was written successfully
          await fs.access(filePath)
          
          // Generate and save thumbnail for images
          console.log(`🖼️  Attempting thumbnail generation for: ${file.filename}`)
          const thumbnail = await generateThumbnail(fileBuffer, file.mimetype)
          if (thumbnail) {
            thumbnailFilename = `${hashPrefix}_${name}_${timestamp}_thumb.jpg`
            const thumbnailPath = path.join(UPLOAD_DIR, thumbnailFilename)
            console.log(`💾 Saving thumbnail to: ${thumbnailPath}`)
            
            await fs.writeFile(thumbnailPath, thumbnail)
            console.log(`✅ Thumbnail file written`)
            
            // Verify thumbnail was written successfully
            await fs.access(thumbnailPath)
            const stats = await fs.stat(thumbnailPath)
            console.log(`📁 Thumbnail file stats: ${stats.size} bytes`)
            
            if (stats.size < 1000) {
              console.error(`❌ Thumbnail file too small after write: ${stats.size} bytes`)
              thumbnailFilename = null
            }
          } else {
            console.log(`❌ Thumbnail generation returned null for: ${file.filename}`)
          }
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }

      // Create database record
      const attachment = await prisma.taskAttachment.create({
        data: {
          taskId,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype,
          compressed: wasCompressed,
          url: finalFilename, // Store relative path
          thumbnailUrl: thumbnailFilename, // Store thumbnail path
        }
      })

      return {
        id: attachment.id,
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
        thumbnailUrl: attachment.thumbnailUrl ? `http://localhost:3002/api/files/${encodeURIComponent(attachment.thumbnailUrl)}` : null,
        uploadedAt: attachment.uploadedAt
      }
    }),

  /**
   * Get file URL for download
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

      return {
        id: attachment.id,
        filename: attachment.filename,
        downloadUrl: `/api/files/${attachment.url}`,
        size: attachment.size,
        mimeType: attachment.mimeType,
        uploadedAt: attachment.uploadedAt
      }
    }),

  /**
   * Delete file attachment
   */
  deleteFile: publicProcedure
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
          message: 'File not found or access denied'
        })
      }

      // Delete file from filesystem
      try {
        const url = path.join(UPLOAD_DIR, attachment.url)
        await fs.unlink(url)
      } catch (error) {
        console.warn('Failed to delete file from filesystem:', error)
      }

      // Delete database record
      await prisma.taskAttachment.delete({
        where: { id: input.attachmentId }
      })

      return { success: true }
    }),

  /**
   * Get task attachments
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

      return attachments.map(attachment => ({
        id: attachment.id,
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
        compressed: attachment.compressed,
        downloadUrl: `/api/files/${attachment.url}`,
        thumbnailUrl: attachment.thumbnailUrl ? `http://localhost:3002/api/files/${encodeURIComponent(attachment.thumbnailUrl)}` : null,
        uploadedAt: attachment.uploadedAt
      }))
    }),

  /**
   * Upload file for chat message
   */
  uploadChatFile: publicProcedure
    .input(z.object({
      messageId: z.string(),
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

      const { messageId, file } = input

      // Convert received buffer data to Buffer for server-side processing
      const fileBuffer = Buffer.from(file.buffer)

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

      // Verify message exists and user has access
      const message = await prisma.chatMessage.findFirst({
        where: {
          id: messageId,
          senderId: ctx.user.id
        }
      })

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found or access denied'
        })
      }

      await ensureUploadDir()

      // Generate file hash for deduplication
      const fileHash = generateFileHash(fileBuffer)
      
      // Check if file already exists
      const existingFile = await findExistingFile(fileHash, file.size)
      let finalFilename: string
      let finalBuffer: Buffer
      let wasCompressed = false

      if (existingFile) {
        finalFilename = existingFile
        finalBuffer = fileBuffer
      } else {
        // Compress file if beneficial
        const { buffer: processedBuffer, compressed } = await compressFile(fileBuffer, file.mimetype, file.filename)
        finalBuffer = processedBuffer
        wasCompressed = compressed

        // Generate unique filename with hash prefix
        const timestamp = Date.now()
        const ext = path.extname(file.filename)
        const name = path.basename(file.filename, ext)
        const hashPrefix = fileHash.slice(0, 16)
        finalFilename = `${hashPrefix}_${name}_${timestamp}${ext}${compressed ? '.gz' : ''}`
        
        // Save file
        const filePath = path.join(UPLOAD_DIR, finalFilename)
        await fs.writeFile(filePath, finalBuffer)
      }

      // Create database record
      const attachment = await prisma.chatAttachment.create({
        data: {
          messageId,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype,
          compressed: wasCompressed,
          url: finalFilename,
        }
      })

      return {
        id: attachment.id,
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
        uploadedAt: attachment.uploadedAt
      }
    }),

  /**
   * Upload file for note
   */
  uploadNoteFile: publicProcedure
    .input(z.object({
      noteId: z.string(),
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

      const { noteId, file } = input

      // Convert received buffer data to Buffer for server-side processing
      const fileBuffer = Buffer.from(file.buffer)

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

      // Verify note exists and user has access
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          OR: [
            { authorId: ctx.user.id },
            { workspace: { 
              OR: [
                { ownerId: ctx.user.id },
                { members: { some: { userId: ctx.user.id } } }
              ]
            }}
          ]
        }
      })

      if (!note) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Note not found or access denied'
        })
      }

      await ensureUploadDir()

      // Generate file hash for deduplication
      const fileHash = generateFileHash(fileBuffer)
      
      // Check if file already exists
      const existingFile = await findExistingFile(fileHash, file.size)
      let finalFilename: string
      let finalBuffer: Buffer
      let wasCompressed = false

      if (existingFile) {
        finalFilename = existingFile
        finalBuffer = fileBuffer
      } else {
        // Compress file if beneficial
        const { buffer: processedBuffer, compressed } = await compressFile(fileBuffer, file.mimetype, file.filename)
        finalBuffer = processedBuffer
        wasCompressed = compressed

        // Generate unique filename with hash prefix
        const timestamp = Date.now()
        const ext = path.extname(file.filename)
        const name = path.basename(file.filename, ext)
        const hashPrefix = fileHash.slice(0, 16)
        finalFilename = `${hashPrefix}_${name}_${timestamp}${ext}${compressed ? '.gz' : ''}`
        
        // Save file
        const filePath = path.join(UPLOAD_DIR, finalFilename)
        await fs.writeFile(filePath, finalBuffer)
      }

      // Create database record
      const attachment = await prisma.noteAttachment.create({
        data: {
          noteId,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype,
          compressed: wasCompressed,
          url: finalFilename,
        }
      })

      return {
        id: attachment.id,
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
        uploadedAt: attachment.uploadedAt
      }
    })
})