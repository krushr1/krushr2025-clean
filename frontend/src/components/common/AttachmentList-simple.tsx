
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
  AlertTriangle
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
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
  onRefresh?: () => void
  className?: string
  compact?: boolean
}

const getFileIcon = (mimeType: string | null | undefined) => {
  if (!mimeType || typeof mimeType !== 'string') return File
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.startsWith('video/')) return FileVideo
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return FileArchive
  return File
}

const getFileTypeColor = (mimeType: string | null | undefined) => {
  if (!mimeType || typeof mimeType !== 'string') return 'bg-gray-100 text-gray-700'
  if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-700'
  if (mimeType.startsWith('video/')) return 'bg-purple-100 text-purple-700'
  if (mimeType.startsWith('audio/')) return 'bg-pink-100 text-pink-700'
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-700'
  if (mimeType.includes('document') || mimeType.includes('text')) return 'bg-blue-100 text-blue-700'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'bg-orange-100 text-orange-700'
  return 'bg-gray-100 text-gray-700'
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

const ThumbnailDisplay: React.FC<{
  attachment: Attachment
  className?: string
}> = ({ attachment, className }) => {
  const [imageError, setImageError] = useState(false)

  if (!attachment.thumbnailUrl || imageError) {
    const FileIcon = getFileIcon(attachment.mimeType)
    const typeColor = getFileTypeColor(attachment.mimeType)
    return (
      <div className={cn('flex items-center justify-center rounded-lg p-2', typeColor, className)}>
        <FileIcon className="h-8 w-8" />
      </div>
    )
  }

  return (
    <img
      src={attachment.thumbnailUrl}
      alt={attachment.filename}
      className={cn('rounded-lg object-cover', className)}
      onError={() => setImageError(true)}
      onLoad={() => console.log(`✅ Thumbnail loaded: ${attachment.thumbnailUrl}`)}
    />
  )
}

export const AttachmentListSimple: React.FC<AttachmentListProps> = ({
  attachments,
  canDelete = false,
  onRefresh,
  className,
  compact = false
}) => {
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

  const handleDownload = (attachment: Attachment) => {
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
      window.open(attachment.downloadUrl, '_blank', 'noopener,noreferrer')
    } else if (attachment.mimeType === 'application/pdf') {
      window.open(attachment.downloadUrl, '_blank', 'noopener,noreferrer')
    } else {
      toast.info('Preview not available for this file type')
    }
  }

  const handleDelete = (attachment: Attachment) => {
    if (deleting) return
    setDeleting(attachment.id)
    deleteAttachmentMutation.mutate({ attachmentId: attachment.id })
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
                'flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm',
                isDeleting && 'opacity-50'
              )}
            >
              <ThumbnailDisplay
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
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Attachments ({attachments.length})
        </h4>
      </div>
      
      <div className="space-y-2">
        {attachments.map((attachment) => {
          const isDeleting = deleting === attachment.id
          
          return (
            <Card key={attachment.id} className={cn('p-4', isDeleting && 'opacity-50')}>
              <div className="flex items-start gap-3">
                <ThumbnailDisplay
                  attachment={attachment}
                  className="w-16 h-16 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.filename}
                        <span className="text-xs text-gray-500 font-normal ml-2">
                          • {formatFileSize(attachment.size)} • {formatDate(attachment.uploadedAt)}
                          {attachment.compressed && (
                            <>
                              {' '}• <Badge variant="secondary" className="text-xs inline">Compressed</Badge>
                            </>
                          )}
                        </span>
                      </p>
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
    </div>
  )
}

export default AttachmentListSimple