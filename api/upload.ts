/**
 * File Upload API for Vercel
 * Note: Will need external storage (S3, Cloudinary) for production
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { IncomingForm } from 'formidable'
import { validateSession } from './src/lib/auth'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Authentication check
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const token = authHeader.slice(7)
    const session = await validateSession(token)
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // TODO: Integrate with cloud storage (S3, Cloudinary, etc.)
    // For now, return error indicating external storage needed
    return res.status(501).json({ 
      error: 'File upload requires external storage configuration',
      message: 'Please configure S3 or Cloudinary for production file uploads'
    })

  } catch (error) {
    console.error('File upload error:', error)
    return res.status(500).json({ error: 'Upload failed' })
  }
}