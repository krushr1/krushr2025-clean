import React, { useState } from 'react'
import { trpc } from '../../lib/trpc'
import FileUpload from './FileUpload'
import { toast } from 'sonner'

interface AttachmentUploadProps {
  type: 'task' | 'chat' | 'note'
  targetId: string // taskId, messageId, or noteId
  onUploadComplete?: (attachments: any[]) => void
  className?: string
}

const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tiff'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
  
  // Microsoft Office
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  'application/gzip': ['.gz'],
  
  // Code files
  'text/javascript': ['.js'],
  'text/typescript': ['.ts'],
  'application/json': ['.json'],
  'text/html': ['.html'],
  'text/css': ['.css'],
  
  // Audio/Video
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/ogg': ['.ogv']
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  type,
  targetId,
  onUploadComplete,
  className
}) => {
  const [isUploading, setIsUploading] = useState(false)

  // Get the appropriate upload mutation based on type
  const uploadTaskFile = trpc.upload.uploadTaskFile.useMutation()
  const uploadChatFile = trpc.upload.uploadChatFile.useMutation()
  const uploadNoteFile = trpc.upload.uploadNoteFile.useMutation()

  const handleUpload = async (files: File[]) => {
    setIsUploading(true)
    const uploadedAttachments: any[] = []

    try {
      for (const file of files) {
        // Convert file to ArrayBuffer for tRPC
        const arrayBuffer = await fileToArrayBuffer(file)
        const buffer = Array.from(new Uint8Array(arrayBuffer))
        
        const fileData = {
          filename: file.name,
          mimetype: file.type,
          size: file.size,
          buffer
        }

        let result
        switch (type) {
          case 'task':
            result = await uploadTaskFile.mutateAsync({
              taskId: targetId,
              file: fileData
            })
            break
          case 'chat':
            result = await uploadChatFile.mutateAsync({
              messageId: targetId,
              file: fileData
            })
            break
          case 'note':
            result = await uploadNoteFile.mutateAsync({
              noteId: targetId,
              file: fileData
            })
            break
          default:
            throw new Error(`Unsupported upload type: ${type}`)
        }

        uploadedAttachments.push(result)
        
        // Show progress toast
        toast.success(`${file.name} uploaded successfully`, {
          description: `File compressed and saved (${formatFileSize(file.size)})`
        })
      }

      // Notify parent component
      onUploadComplete?.(uploadedAttachments)
      
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <FileUpload
      onUpload={handleUpload}
      accept={ALLOWED_FILE_TYPES}
      maxSize={15 * 1024 * 1024} // 15MB
      maxFiles={10}
      className={className}
    />
  )
}

// Helper function to convert File to ArrayBuffer (browser compatible)
const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default AttachmentUpload