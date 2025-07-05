/**
 * Enhanced AttachmentUpload Component
 * Robust file upload with drag-and-drop, progress tracking, and error handling
 */

import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { toast } from 'sonner'

interface UploadFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface AttachmentUploadProps {
  taskId?: string
  onUploadComplete?: () => void
  className?: string
  multiple?: boolean
  maxSize?: number // in bytes
  acceptedTypes?: string[]
}

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
  'image/bmp', 'image/tiff', 'application/pdf', 'text/plain', 
  'text/markdown', 'text/csv', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip', 'application/x-rar-compressed', 
  'application/x-7z-compressed', 'text/javascript', 'text/typescript',
  'application/json', 'text/html', 'text/css'
]

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return Image
  if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return FileText
  return File
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const AttachmentUploadNew: React.FC<AttachmentUploadProps> = ({
  taskId,
  onUploadComplete,
  className,
  multiple = true,
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_TYPES
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = trpc.upload.uploadTaskFile.useMutation({
    onSuccess: (data, variables) => {
      const fileId = variables.file.name + variables.file.size // Simple way to match
      setUploadFiles(prev => prev.map(f => 
        f.file.name + f.file.size === fileId
          ? { ...f, status: 'success', progress: 100 }
          : f
      ))
      
      toast.success(`${variables.file.filename} uploaded successfully`)
      
      // Check if all uploads are complete
      setUploadFiles(prev => {
        const allComplete = prev.every(f => f.status === 'success' || f.status === 'error')
        if (allComplete) {
          setIsUploading(false)
          onUploadComplete?.()
          // Clear completed uploads after a delay
          setTimeout(() => {
            setUploadFiles(current => current.filter(f => f.status === 'error'))
          }, 2000)
        }
        return prev
      })
    },
    onError: (error, variables) => {
      const fileId = variables.file.name + variables.file.size
      setUploadFiles(prev => prev.map(f => 
        f.file.name + f.file.size === fileId
          ? { ...f, status: 'error', error: error.message }
          : f
      ))
      
      toast.error(`Failed to upload ${variables.file.filename}: ${error.message}`)
    }
  })

  const processFiles = useCallback(async (files: File[]) => {
    if (!taskId) {
      toast.error('No task selected for attachment')
      return
    }

    // Validate files
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max ${formatFileSize(maxSize)})`)
        continue
      }

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`)
        continue
      }

      validFiles.push(file)
    }

    // Show errors
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (validFiles.length === 0) {
      return
    }

    // Add files to upload queue
    const newUploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: generateId(),
      status: 'pending',
      progress: 0
    }))

    setUploadFiles(prev => [...prev, ...newUploadFiles])
    setIsUploading(true)

    // Start uploading files
    for (const uploadFile of newUploadFiles) {
      try {
        // Update status to uploading
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading', progress: 10 }
            : f
        ))

        // Convert file to buffer
        const arrayBuffer = await uploadFile.file.arrayBuffer()
        const buffer = Array.from(new Uint8Array(arrayBuffer))

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id && f.progress < 90
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ))
        }, 200)

        // Upload file
        await uploadMutation.mutateAsync({
          taskId,
          file: {
            filename: uploadFile.file.name,
            mimetype: uploadFile.file.type,
            size: uploadFile.file.size,
            buffer
          }
        })

        clearInterval(progressInterval)

      } catch (error) {
        // Error is handled by mutation onError
        console.error('Upload error:', error)
      }
    }
  }, [taskId, maxSize, acceptedTypes, uploadMutation, onUploadComplete])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles)
  }, [processFiles])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    disabled: isUploading
  })

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const retryUpload = (fileId: string) => {
    const uploadFile = uploadFiles.find(f => f.id === fileId)
    if (uploadFile) {
      processFiles([uploadFile.file])
      removeFile(fileId)
    }
  }

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'))
  }

  const hasFiles = uploadFiles.length > 0
  const hasErrors = uploadFiles.some(f => f.status === 'error')
  const hasCompleted = uploadFiles.some(f => f.status === 'success')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-blue-500 bg-blue-50',
          isDragReject && 'border-red-500 bg-red-50',
          isUploading && 'pointer-events-none opacity-50',
          !isDragActive && !isDragReject && 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="flex flex-col items-center gap-2">
          <Upload className={cn(
            'h-8 w-8',
            isDragActive && !isDragReject && 'text-blue-500',
            isDragReject && 'text-red-500',
            !isDragActive && 'text-gray-400'
          )} />
          
          <div>
            <p className="text-sm font-medium">
              {isDragActive 
                ? isDragReject 
                  ? 'Some files are not supported'
                  : 'Drop files here'
                : 'Drag files here or click to browse'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max {formatFileSize(maxSize)} • Images, PDFs, Documents, Archives
            </p>
          </div>
          
          {!isDragActive && (
            <Button variant="outline" size="sm" disabled={isUploading}>
              Choose Files
            </Button>
          )}
        </div>
      </div>

      {/* Upload Queue */}
      {hasFiles && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">
              Upload Queue ({uploadFiles.length})
            </h4>
            
            <div className="flex items-center gap-2">
              {hasCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompleted}
                  className="text-xs"
                >
                  Clear Completed
                </Button>
              )}
              
              {hasErrors && (
                <Badge variant="destructive" className="text-xs">
                  {uploadFiles.filter(f => f.status === 'error').length} Failed
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {uploadFiles.map((uploadFile) => {
              const FileIcon = getFileIcon(uploadFile.file)
              
              return (
                <div key={uploadFile.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {uploadFile.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : uploadFile.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : uploadFile.status === 'uploading' ? (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatFileSize(uploadFile.file.size)}
                      </span>
                    </div>
                    
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-1 mt-1" />
                    )}
                    
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {uploadFile.status === 'error' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryUpload(uploadFile.id)}
                        className="h-6 w-6 p-0"
                        title="Retry"
                      >
                        <Upload className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {uploadFile.status !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        className="h-6 w-6 p-0"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AttachmentUploadNew