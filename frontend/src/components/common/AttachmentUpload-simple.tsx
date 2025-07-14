
import React, { useState, useRef } from 'react'
import { Upload, X, File, Image, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { toast } from 'sonner'

interface AttachmentUploadProps {
  taskId?: string
  onUploadComplete?: () => void
  className?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return Image
  if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return FileText
  return File
}

export const AttachmentUploadSimple: React.FC<AttachmentUploadProps> = ({
  taskId,
  onUploadComplete,
  className
}) => {
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = trpc.upload.uploadTaskFile.useMutation({
    onSuccess: () => {
      toast.success('File uploaded successfully')
      setUploading(false)
      setSelectedFiles([])
      onUploadComplete?.()
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`)
      setUploading(false)
    }
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleUpload = async () => {
    if (!taskId || selectedFiles.length === 0) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)

    try {
      for (const file of selectedFiles) {
        // Validate file size (15MB limit)
        if (file.size > 15 * 1024 * 1024) {
          toast.error(`${file.name}: File too large (max 15MB)`)
          continue
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Array.from(new Uint8Array(arrayBuffer))

        await uploadMutation.mutateAsync({
          taskId,
          file: {
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            buffer
          }
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt,.md"
        disabled={uploading}
      />

      {/* Upload Area */}
      <Card className="p-6">
        <div className="text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-medium mb-1">Upload Attachments</p>
          <p className="text-xs text-gray-500 mb-4">Images, PDFs, Documents (max 15MB)</p>
          
          <Button 
            variant="outline" 
            onClick={openFileDialog}
            disabled={uploading}
          >
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">
              Selected Files ({selectedFiles.length})
            </h4>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              size="sm"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </Button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file)
              
              return (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <FileIcon className="h-5 w-5 text-gray-500" />
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AttachmentUploadSimple