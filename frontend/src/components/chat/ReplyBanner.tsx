import React from 'react'
import { Reply, X } from 'lucide-react'
import { ChatMessage } from './types'

interface ReplyBannerProps {
  replyingTo: ChatMessage
  onCancel: () => void
}

export const ReplyBanner: React.FC<ReplyBannerProps> = ({
  replyingTo,
  onCancel
}) => {
  return (
    <div className="flex-shrink-0 px-4 py-2 bg-krushr-info-50 border-t border-krushr-info-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Reply className="w-3 h-3 text-krushr-info-600" />
          <span className="text-sm text-krushr-info-700 font-medium">
            Replying to {replyingTo.sender.name}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 text-krushr-info-600 hover:text-krushr-info-800 hover:bg-krushr-info-100 rounded transition-colors duration-200"
          title="Cancel reply"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs text-krushr-info-600 mt-1 truncate pl-5">
        {replyingTo.content}
      </p>
    </div>
  )
}