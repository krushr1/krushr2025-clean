
import React, { useState } from 'react'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { 
  File, 
  Image, 
  Video, 
  FileText, 
  Download, 
  Eye, 
  X,
  Paperclip,
  ExternalLink
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog'

interface Attachment {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  compressed?: boolean
  thumbnailUrl?: string
  uploadedAt: string
}

interface CommentAttachmentProps {
  attachments: Attachment[]
  className?: string
  showTitle?: boolean
  maxDisplayCount?: number
}

export function CommentAttachment({
  attachments,
  className,
  showTitle = true,
  maxDisplayCount = 5
}: CommentAttachmentProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)
  const [showAll, setShowAll] = useState(false)

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const canPreview = (mimeType: string) => {
    return mimeType.startsWith('image/') || 
           mimeType.startsWith('video/') || 
           mimeType === 'application/pdf' ||
           mimeType.startsWith('text/')
  }

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = (attachment: Attachment) => {
    if (canPreview(attachment.mimeType)) {
      setPreviewAttachment(attachment)
    } else {
      handleDownload(attachment)
    }
  }

  if (!attachments || attachments.length === 0) {
    return null
  }

  const displayedAttachments = showAll ? attachments : attachments.slice(0, maxDisplayCount)
  const hasMore = attachments.length > maxDisplayCount

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {showTitle && (
          <div className="flex items-center gap-2 text-sm text-gray-600 font-manrope">
            <Paperclip className="h-4 w-4" />
            <span>{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="space-y-2">
          {displayedAttachments.map((attachment) => {
            const IconComponent = getFileIcon(attachment.mimeType)
            const isImage = attachment.mimeType.startsWith('image/')
            
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                {/* Thumbnail or icon */}
                <div className="flex-shrink-0">
                  {isImage && attachment.thumbnailUrl ? (
                    <img
                      src={attachment.thumbnailUrl}
                      alt={attachment.filename}
                      className="w-10 h-10 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate font-manrope">
                      {attachment.filename}
                    </span>
                    {attachment.compressed && (
                      <Badge variant="secondary" className="text-xs">
                        Compressed
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-manrope">
                    {formatFileSize(attachment.size)} • {attachment.mimeType}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {canPreview(attachment.mimeType) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(attachment)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}

          {/* Show more/less toggle */}
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-krushr-primary hover:text-krushr-primary/80"
            >
              {showAll 
                ? `Show less (${attachments.length - maxDisplayCount} hidden)`
                : `Show ${attachments.length - maxDisplayCount} more attachment${attachments.length - maxDisplayCount !== 1 ? 's' : ''}`
              }
            </Button>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold font-manrope">
                {previewAttachment?.filename}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewAttachment && handleDownload(previewAttachment)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewAttachment(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {previewAttachment && (
              <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
                {previewAttachment.mimeType.startsWith('image/') ? (
                  <img
                    src={previewAttachment.url}
                    alt={previewAttachment.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : previewAttachment.mimeType.startsWith('video/') ? (
                  <video
                    src={previewAttachment.url}
                    controls
                    className="max-w-full max-h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : previewAttachment.mimeType === 'application/pdf' ? (
                  <iframe
                    src={previewAttachment.url}
                    className="w-full h-96 border-0"
                    title={previewAttachment.filename}
                  />
                ) : previewAttachment.mimeType.startsWith('text/') ? (
                  <iframe
                    src={previewAttachment.url}
                    className="w-full h-96 border border-gray-200 rounded"
                    title={previewAttachment.filename}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <File className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-manrope">Preview not available for this file type</p>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(previewAttachment)}
                      className="mt-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File details */}
          {previewAttachment && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 font-manrope">File size:</span>
                  <span className="ml-2 font-manrope">{formatFileSize(previewAttachment.size)}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-manrope">Type:</span>
                  <span className="ml-2 font-manrope">{previewAttachment.mimeType}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}