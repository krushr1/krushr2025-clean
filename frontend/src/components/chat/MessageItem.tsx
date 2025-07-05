import React from 'react'
import { MessageBubble } from './MessageBubble'
import { ReplyIndicator } from './ReplyIndicator'
import { ChatMessage } from './types'

interface MessageItemProps {
  message: ChatMessage
  currentUserId: string
  onReaction: (messageId: string, emoji: string) => void
  onReply: (message: ChatMessage) => void
  showEmojiPicker: string | null
  setShowEmojiPicker: (messageId: string | null) => void
  quickReactions: string[]
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  onReaction,
  onReply,
  showEmojiPicker,
  setShowEmojiPicker,
  quickReactions
}) => {
  const isOutgoing = message.sender.id === currentUserId
  const isSystem = message.type === 'system'

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (isSystem) {
    return (
      <div className="text-center">
        <div className="bg-krushr-gray-100 text-krushr-gray px-3 py-1 rounded-full text-xs inline-block">
          {message.content}
        </div>
      </div>
    )
  }

  if (isOutgoing) {
    return (
      <div className="group">
        {message.replyTo && (
          <ReplyIndicator replyTo={message.replyTo} isOutgoing={true} />
        )}
        
        <div className="flex items-start justify-end space-x-3">
          <div className="flex-1 text-right">
            <MessageBubble
              message={message}
              isOutgoing={true}
              onReaction={onReaction}
              onReply={onReply}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              quickReactions={quickReactions}
            />
            
            <div className="flex items-center justify-end space-x-2 mt-1">
              <span className="text-xs text-krushr-gray-light">{formatTime(message.timestamp)}</span>
              <span className="text-xs text-krushr-gray-light">•</span>
              <span className="text-xs text-krushr-gray-light">Read</span>
            </div>
          </div>
          <div className="w-8 h-8 bg-krushr-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">
            ME
          </div>
        </div>
      </div>
    )
  }

  // Incoming message
  return (
    <div className="group">
      {message.replyTo && (
        <ReplyIndicator replyTo={message.replyTo} isOutgoing={false} />
      )}
      
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-krushr-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
          {message.sender.avatar || message.sender.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <MessageBubble
            message={message}
            isOutgoing={false}
            onReaction={onReaction}
            onReply={onReply}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            quickReactions={quickReactions}
          />
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-krushr-gray-light">{message.sender.name}</span>
            <span className="text-xs text-krushr-gray-light">•</span>
            <span className="text-xs text-krushr-gray-light">{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}