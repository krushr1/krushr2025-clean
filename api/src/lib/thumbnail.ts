/**
 * Robust Thumbnail Generation System
 * Multiple fallback strategies for reliable thumbnail creation
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import { createCanvas, loadImage } from 'canvas'
import { logger } from '../utils/logger'

export interface ThumbnailOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export interface ThumbnailResult {
  buffer: Buffer
  format: string
  size: number
  success: boolean
  method: 'sharp' | 'canvas' | 'fallback'
  error?: string
}

/**
 * Primary thumbnail generation using Sharp
 */
async function generateWithSharp(
  buffer: Buffer, 
  options: ThumbnailOptions
): Promise<ThumbnailResult> {
  try {
    logger.info(`🔧 Attempting Sharp thumbnail generation...`)
    
    // Validate input
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid input buffer')
    }
    
    // Get metadata
    const metadata = await sharp(buffer).metadata()
    logger.info(`📊 Image metadata:`, {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length
    })
    
    // Generate thumbnail with multiple fallback approaches
    let thumbnail: Buffer
    
    try {
      // Primary approach: Direct conversion
      thumbnail = await sharp(buffer)
        .resize(options.width || 150, options.height || 150, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: options.quality || 85,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer()
        
    } catch (primaryError) {
      logger.warn(`⚠️  Sharp primary method failed: ${primaryError.message}`)
      
      // Fallback approach: Convert to raw first
      const { data, info } = await sharp(buffer)
        .raw()
        .toBuffer({ resolveWithObject: true })
      
      thumbnail = await sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: info.channels
        }
      })
      .resize(options.width || 150, options.height || 150, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: options.quality || 85 })
      .toBuffer()
    }
    
    // Validate output
    if (thumbnail.length < 1000) {
      throw new Error(`Generated thumbnail too small: ${thumbnail.length} bytes`)
    }
    
    return {
      buffer: thumbnail,
      format: 'jpeg',
      size: thumbnail.length,
      success: true,
      method: 'sharp'
    }
    
  } catch (error) {
    logger.error(`❌ Sharp thumbnail generation failed:`, error)
    return {
      buffer: Buffer.alloc(0),
      format: 'jpeg',
      size: 0,
      success: false,
      method: 'sharp',
      error: error.message
    }
  }
}

/**
 * Fallback thumbnail generation using Canvas
 */
async function generateWithCanvas(
  buffer: Buffer,
  options: ThumbnailOptions
): Promise<ThumbnailResult> {
  try {
    logger.info(`🎨 Attempting Canvas thumbnail generation...`)
    
    // Load image with Canvas
    const img = await loadImage(buffer)
    
    const canvas = createCanvas(options.width || 150, options.height || 150)
    const ctx = canvas.getContext('2d')
    
    // Calculate aspect ratio and positioning
    const { width: targetWidth, height: targetHeight } = canvas
    const aspectRatio = img.width / img.height
    const targetAspectRatio = targetWidth / targetHeight
    
    let drawWidth = targetWidth
    let drawHeight = targetHeight
    let offsetX = 0
    let offsetY = 0
    
    if (aspectRatio > targetAspectRatio) {
      // Image is wider - fit height and crop width
      drawWidth = targetHeight * aspectRatio
      offsetX = (targetWidth - drawWidth) / 2
    } else {
      // Image is taller - fit width and crop height
      drawHeight = targetWidth / aspectRatio
      offsetY = (targetHeight - drawHeight) / 2
    }
    
    // Draw image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    
    // Convert to buffer
    const thumbnail = canvas.toBuffer('image/jpeg', { quality: (options.quality || 85) / 100 })
    
    return {
      buffer: thumbnail,
      format: 'jpeg',
      size: thumbnail.length,
      success: true,
      method: 'canvas'
    }
    
  } catch (error) {
    logger.error(`❌ Canvas thumbnail generation failed:`, error)
    return {
      buffer: Buffer.alloc(0),
      format: 'jpeg',
      size: 0,
      success: false,
      method: 'canvas',
      error: error.message
    }
  }
}

/**
 * Emergency fallback - generate a placeholder thumbnail
 */
async function generatePlaceholder(options: ThumbnailOptions): Promise<ThumbnailResult> {
  try {
    logger.info(`📝 Generating placeholder thumbnail...`)
    
    const canvas = createCanvas(options.width || 150, options.height || 150)
    const ctx = canvas.getContext('2d')
    
    // Create a simple placeholder
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Image', canvas.width / 2, canvas.height / 2 - 10)
    ctx.fillText('Preview', canvas.width / 2, canvas.height / 2 + 10)
    
    // Add border
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
    const thumbnail = canvas.toBuffer('image/jpeg', { quality: 0.8 })
    
    return {
      buffer: thumbnail,
      format: 'jpeg',
      size: thumbnail.length,
      success: true,
      method: 'fallback'
    }
    
  } catch (error) {
    logger.error(`❌ Placeholder generation failed:`, error)
    return {
      buffer: Buffer.alloc(0),
      format: 'jpeg',
      size: 0,
      success: false,
      method: 'fallback',
      error: error.message
    }
  }
}

/**
 * Main thumbnail generation function with multiple fallback strategies
 */
export async function generateThumbnail(
  buffer: Buffer,
  mimeType: string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  
  logger.info(`🖼️  Starting robust thumbnail generation for ${mimeType}`)
  
  // Only process images
  if (!mimeType.startsWith('image/')) {
    return {
      buffer: Buffer.alloc(0),
      format: 'jpeg',
      size: 0,
      success: false,
      method: 'sharp',
      error: 'Not an image file'
    }
  }
  
  // Strategy 1: Try Sharp (fastest, best quality)
  const sharpResult = await generateWithSharp(buffer, options)
  if (sharpResult.success) {
    logger.info(`✅ Sharp thumbnail generated: ${sharpResult.size} bytes`)
    return sharpResult
  }
  
  // Strategy 2: Try Canvas (more compatible)
  logger.warn(`⚠️  Sharp failed, trying Canvas fallback...`)
  const canvasResult = await generateWithCanvas(buffer, options)
  if (canvasResult.success) {
    logger.info(`✅ Canvas thumbnail generated: ${canvasResult.size} bytes`)
    return canvasResult
  }
  
  // Strategy 3: Generate placeholder (always works)
  logger.warn(`⚠️  Canvas failed, generating placeholder...`)
  const placeholderResult = await generatePlaceholder(options)
  if (placeholderResult.success) {
    logger.info(`✅ Placeholder thumbnail generated: ${placeholderResult.size} bytes`)
    return placeholderResult
  }
  
  // Complete failure (should never happen)
  logger.error(`❌ All thumbnail generation strategies failed`)
  return {
    buffer: Buffer.alloc(0),
    format: 'jpeg',
    size: 0,
    success: false,
    method: 'fallback',
    error: 'All thumbnail generation methods failed'
  }
}

/**
 * Validate and save thumbnail to filesystem
 */
export async function saveThumbnail(
  thumbnailBuffer: Buffer,
  filepath: string
): Promise<boolean> {
  try {
    // Validate thumbnail
    if (!thumbnailBuffer || thumbnailBuffer.length < 100) {
      throw new Error('Invalid thumbnail buffer')
    }
    
    // Save to filesystem
    await fs.writeFile(filepath, thumbnailBuffer)
    
    // Verify file was written correctly
    const stats = await fs.stat(filepath)
    if (stats.size !== thumbnailBuffer.length) {
      throw new Error('File size mismatch after write')
    }
    
    logger.info(`💾 Thumbnail saved successfully: ${filepath} (${stats.size} bytes)`)
    return true
    
  } catch (error) {
    logger.error(`❌ Failed to save thumbnail:`, error)
    return false
  }
}