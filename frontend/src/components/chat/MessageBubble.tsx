import React from 'react'
import { Reply, Smile } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ChatMessage } from './types'

interface MessageBubbleProps {
  message: ChatMessage
  isOutgoing: boolean
  onReaction: (messageId: string, emoji: string) => void
  onReply: (message: ChatMessage) => void
  showEmojiPicker: string | null
  setShowEmojiPicker: (messageId: string | null) => void
  quickReactions: string[]
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOutgoing,
  onReaction,
  onReply,
  showEmojiPicker,
  setShowEmojiPicker,
  quickReactions
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="relative inline-block">
      <div className={cn(
        "rounded-lg p-3 shadow-sm",
        isOutgoing 
          ? "bg-krushr-primary text-white rounded-tr-none" 
          : "bg-gray-100 rounded-tl-none"
      )}>
        <p className={cn(
          "text-sm",
          isOutgoing ? "text-white" : "text-krushr-gray-dark"
        )}>
          {message.content}
        </p>
        
        {/* File attachment for incoming messages */}
        {message.type === 'file' && !isOutgoing && (
          <div className="bg-krushr-gray-bg border border-krushr-gray-200 rounded p-2 flex items-center space-x-2 mt-2">
            <div className="w-8 h-8 bg-krushr-info rounded flex items-center justify-center">
              <span className="text-white text-xs">File</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">dashboard-mockups.fig</div>
              <div className="text-xs text-krushr-gray">2.4 MB • Figma File</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="absolute -top-2 right-2 flex items-center gap-1">
          {message.reactions.map((reaction, index) => (
            <button
              key={index}
              onClick={() => onReaction(message.id, reaction.emoji)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white hover:bg-krushr-primary-50 border border-krushr-gray-200 hover:border-krushr-primary-200 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-sm">{reaction.emoji}</span>
              <span className="font-medium text-krushr-gray">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Message Actions */}
      <div className={cn(
        "absolute -top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-white border border-krushr-gray-200 rounded-lg px-2 py-1 shadow-sm",
        isOutgoing ? "left-2" : "left-2"
      )}>
        {!isOutgoing && (
          <button
            onClick={() => onReply(message)}
            className="p-1 hover:bg-krushr-primary-50 hover:text-krushr-primary-600 rounded transition-colors duration-200"
            title="Reply to message"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
            className="p-1 hover:bg-krushr-warning-50 hover:text-krushr-warning-600 rounded transition-colors duration-200"
            title="Add reaction"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          
          {/* Quick Emoji Picker */}
          {showEmojiPicker === message.id && (
            <div className={cn(
              "absolute bottom-full mb-2 bg-white border border-krushr-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-50",
              isOutgoing ? "left-0" : "right-0"
            )}>
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(message.id, emoji)}
                  className="p-1 hover:bg-krushr-gray-100 rounded text-lg leading-none"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}