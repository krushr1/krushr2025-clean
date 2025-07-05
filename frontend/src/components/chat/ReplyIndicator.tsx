import React from 'react'
import { Reply } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ReplyIndicatorProps {
  replyTo: {
    id: string
    content: string
    sender: string
  }
  isOutgoing: boolean
}

export const ReplyIndicator: React.FC<ReplyIndicatorProps> = ({
  replyTo,
  isOutgoing
}) => {
  return (
    <div className={cn(
      "mb-2 border-l-2 border-krushr-primary pl-3 py-2",
      isOutgoing 
        ? "mr-11 bg-krushr-primary-50 rounded-l-lg ml-16"
        : "ml-11 bg-krushr-gray-bg-light rounded-r-lg"
    )}>
      <div className="flex items-center gap-1 mb-1">
        <Reply className="w-3 h-3 text-krushr-primary" />
        <span className="text-xs text-krushr-gray font-medium">{replyTo.sender}</span>
      </div>
      <p className="text-xs text-krushr-gray-light truncate">{replyTo.content}</p>
    </div>
  )
}