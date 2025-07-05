import React from 'react'
import { 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileArchive,
  Download,
  Trash2,
  Eye
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
  onDelete?: (attachmentId: string) => void
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
  if (!mimeType || typeof mimeType !== 'string') return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
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

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  canDelete = false,
  onDelete,
  className,
  compact = false
}) => {
  if (attachments.length === 0) {
    return null
  }

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a')
    link.href = attachment.downloadUrl
    link.download = attachment.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = (attachment: Attachment) => {
    if (onDelete) {
      onDelete(attachment.id)
    }
  }

  const handlePreview = (attachment: Attachment) => {
    if (!attachment.mimeType) {
      toast.info('Preview not available for this file type')
      return
    }
    
    if (attachment.mimeType.startsWith('image/')) {
      // Open image in new tab for preview
      window.open(attachment.downloadUrl, '_blank')
    } else if (attachment.mimeType === 'application/pdf') {
      // Open PDF in new tab
      window.open(attachment.downloadUrl, '_blank')
    } else {
      toast.info('Preview not available for this file type')
    }
  }

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {attachments.map((attachment) => {
          const FileIcon = getFileIcon(attachment.mimeType)
          const isImage = attachment.mimeType && attachment.mimeType.startsWith('image/')
          
          return (
            <div
              key={attachment.id}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
            >
              {/* Show thumbnail for images, icon for other files */}
              {isImage && attachment.thumbnailUrl ? (
                <img 
                  src={attachment.thumbnailUrl}
                  alt={attachment.filename}
                  className="h-8 w-8 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <FileIcon className={cn("h-4 w-4 text-gray-500", isImage && attachment.thumbnailUrl ? "hidden fallback-icon" : "")} />
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
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleDownload(attachment)}
                title="Download"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Attachments ({attachments.length})
      </h4>
      
      <div className="space-y-2">
        {attachments.map((attachment) => {
          const FileIcon = getFileIcon(attachment.mimeType)
          const typeColor = getFileTypeColor(attachment.mimeType)
          
          return (
            <Card key={attachment.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* Show thumbnail for images, icon for other files */}
                {attachment.mimeType && attachment.mimeType.startsWith('image/') && attachment.thumbnailUrl ? (
                  <div className="relative">
                    <img 
                      src={attachment.thumbnailUrl}
                      alt={attachment.filename}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.parentElement?.querySelector('.thumbnail-fallback')
                        if (fallback) fallback.classList.remove('hidden')
                      }}
                    />
                    <div className={cn('hidden p-2 rounded-lg w-16 h-16 flex items-center justify-center thumbnail-fallback', typeColor)}>
                      <FileIcon className="h-5 w-5" />
                    </div>
                  </div>
                ) : (
                  <div className={cn('p-2 rounded-lg', typeColor)}>
                    <FileIcon className="h-5 w-5" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
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
                      {attachment.mimeType && (attachment.mimeType.startsWith('image/') || attachment.mimeType === 'application/pdf') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handlePreview(attachment)}
                          title="Preview"
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

export default AttachmentList