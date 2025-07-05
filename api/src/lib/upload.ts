/**
 * File Upload Utilities
 * Simple file upload system for tasks and projects
 */

import { FastifyRequest } from 'fastify'
import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create upload directory:', error)
  }
}

/**
 * Generate unique filename with security validation
 */
export function generateFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  
  // Sanitize extension - only allow safe characters and known extensions
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'doc', 'docx']
  const extension = originalName.split('.').pop()?.toLowerCase() || ''
  
  // Remove any path separators and dangerous characters
  const safeExtension = extension.replace(/[^a-z0-9]/g, '')
  
  // Validate extension is in allowed list
  if (!allowedExtensions.includes(safeExtension)) {
    throw new Error(`File extension '${extension}' is not allowed`)
  }
  
  return `${timestamp}-${random}.${safeExtension}`
}

/**
 * Save uploaded file
 */
export async function saveFile(data: any, filename: string): Promise<string> {
  const filepath = join(UPLOAD_DIR, filename)
  const writeStream = createWriteStream(filepath)
  
  await pipeline(data.file, writeStream)
  return filepath
}

/**
 * Get file URL
 */
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`
}

/**
 * File upload validation
 */
export function validateFile(data: any): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (data.file.bytesRead > maxSize) {
    return { valid: false, error: 'File too large (max 10MB)' }
  }

  if (!allowedTypes.includes(data.mimetype)) {
    return { valid: false, error: 'File type not allowed' }
  }

  return { valid: true }
}