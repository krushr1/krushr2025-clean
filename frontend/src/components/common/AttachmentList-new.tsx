
import React, { useState } from 'react'
import { 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileArchive,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { toast } from 'sonner'

interface Attachment {
  id: string
  filename: string
  size: number
  mimeType: string
  uploadedAt: string | Date
  compressed?: boolean
  downloadUrl: string
  thumbnailUrl?: string | null
}

interface AttachmentListProps {
  attachments: Attachment[]
  canDelete?: boolean
  onDelete?: (attachmentId: string) => void
  onRefresh?: () => void
  className?: string
  compact?: boolean
}

interface ThumbnailState {
  loading: boolean
  error: boolean
  retryCount: number
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.startsWith('video/')) return FileVideo
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return FileArchive
  return File
}

const getFileTypeColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  if (mimeType.startsWith('video/')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  if (mimeType.startsWith('audio/')) return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  if (mimeType.includes('document') || mimeType.includes('text')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Today'
  if (diffDays === 2) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays} days ago`
  
  return d.toLocaleDateString()
}

const ThumbnailImage: React.FC<{
  attachment: Attachment
  className?: string
  onError?: () => void
}> = ({ attachment, className, onError }) => {
  const [state, setState] = useState<ThumbnailState>({
    loading: true,
    error: false,
    retryCount: 0
  })

  const handleLoad = () => {
    setState(prev => ({ ...prev, loading: false, error: false }))
  }

  const handleError = () => {
    setState(prev => ({ 
      ...prev, 
      loading: false, 
      error: true, 
      retryCount: prev.retryCount + 1 
    }))
    onError?.()
  }

  const handleRetry = () => {
    if (state.retryCount < 3) {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: false,
        retryCount: prev.retryCount + 1 
      }))
    }
  }

  if (!attachment.thumbnailUrl) {
    const FileIcon = getFileIcon(attachment.mimeType)
    const typeColor = getFileTypeColor(attachment.mimeType)
    return (
      <div className={cn('flex items-center justify-center rounded-lg', typeColor, className)}>
        <FileIcon className="h-8 w-8" />
      </div>
    )
  }

  if (state.error) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center rounded-lg bg-gray-100 text-gray-500',
        className
      )}>
        <AlertTriangle className="h-6 w-6 mb-1" />
        <span className="text-xs">Failed</span>
        {state.retryCount < 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 mt-1"
            onClick={handleRetry}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}
      <img
        src={`${attachment.thumbnailUrl}?v=${state.retryCount}`}
        alt={attachment.filename}
        className={cn(
          'rounded-lg object-cover',
          state.loading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

export const AttachmentListNew: React.FC<AttachmentListProps> = ({
  attachments,
  canDelete = false,
  onDelete,
  onRefresh,
  className,
  compact = false
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const deleteAttachmentMutation = trpc.upload.deleteAttachment.useMutation({
    onSuccess: () => {
      toast.success('Attachment deleted successfully')
      setDeleting(null)
      onRefresh?.()
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`)
      setDeleting(null)
    }
  })

  if (attachments.length === 0) {
    return null
  }

  const handleDownload = async (attachment: Attachment) => {
    try {
      const link = document.createElement('a')
      link.href = attachment.downloadUrl
      link.download = attachment.filename
      link.target = '_blank'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Download started')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handlePreview = (attachment: Attachment) => {
    if (attachment.mimeType.startsWith('image/')) {
      setImagePreview(attachment.downloadUrl)
    } else if (attachment.mimeType === 'application/pdf') {
      window.open(attachment.downloadUrl, '_blank', 'noopener,noreferrer')
    } else {
      toast.info('Preview not available for this file type')
    }
  }

  const handleDelete = async (attachment: Attachment) => {
    if (deleting) return
    
    setDeleting(attachment.id)
    
    if (onDelete) {
      onDelete(attachment.id)
    } else {
      deleteAttachmentMutation.mutate({ attachmentId: attachment.id })
    }
  }

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {attachments.map((attachment) => {
          const isDeleting = deleting === attachment.id
          
          return (
            <div
              key={attachment.id}
              className={cn(
                'flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm',
                isDeleting && 'opacity-50'
              )}
            >
              <ThumbnailImage
                attachment={attachment}
                className="h-8 w-8"
              />
              
              <span className="font-medium truncate max-w-[150px]">
                {attachment.filename}
              </span>
              
              <span className="text-gray-500">
                {formatFileSize(attachment.size)}
              </span>
              
              {attachment.compressed && (
                <Badge variant="secondary" className="text-xs">
                  Compressed
                </Badge>
              )}
              
              <div className="flex items-center gap-1">
                {/* Preview button for images and PDFs */}
                {(attachment.mimeType.startsWith('image/') || attachment.mimeType === 'application/pdf') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handlePreview(attachment)}
                    title="Preview"
                    disabled={isDeleting}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                
                {/* Download button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDownload(attachment)}
                  title="Download"
                  disabled={isDeleting}
                >
                  <Download className="h-3 w-3" />
                </Button>
                
                {/* Delete button */}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(attachment)}
                    title="Delete"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        
        {/* Image Preview Modal */}
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            {imagePreview && (
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-96 max-w-full object-contain rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Attachments ({attachments.length})
        </h4>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {attachments.map((attachment) => {
          const isDeleting = deleting === attachment.id
          
          return (
            <Card key={attachment.id} className={cn('p-4', isDeleting && 'opacity-50')}>
              <div className="flex items-start gap-3">
                <ThumbnailImage
                  attachment={attachment}
                  className="w-16 h-16 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {attachment.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(attachment.size)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(attachment.uploadedAt)}
                        </span>
                        {attachment.compressed && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <Badge variant="secondary" className="text-xs">
                              Compressed
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {/* Preview button for images and PDFs */}
                      {(attachment.mimeType.startsWith('image/') || attachment.mimeType === 'application/pdf') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handlePreview(attachment)}
                          title="Preview"
                          disabled={isDeleting}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Download button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(attachment)}
                        title="Download"
                        disabled={isDeleting}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {/* Delete button */}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(attachment)}
                          title="Delete"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      
      {/* Image Preview Modal */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {imagePreview && (
            <div className="flex justify-center">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-96 max-w-full object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AttachmentListNew