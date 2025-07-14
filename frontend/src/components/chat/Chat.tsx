
import React from 'react'
import { cn } from '../../lib/utils'
import { ChatProps } from './types'
import { MessageItem } from './MessageItem'
import { ReplyBanner } from './ReplyBanner'
import { MessageInput } from './MessageInput'
import { useChatMessages } from './useChatMessages'
import { useChatActions } from './useChatActions'
import { quickReactions } from './mockData'

export default function Chat({ threadId, className }: ChatProps) {
  const { messages, messagesEndRef } = useChatMessages(threadId)
  const {
    message,
    setMessage,
    replyingTo,
    setReplyingTo,
    showEmojiPicker,
    setShowEmojiPicker,
    messageInputRef,
    handleSendMessage,
    handleReaction,
    handleReply,
    handleKeyPress
  } = useChatActions(threadId)

  const currentUserId = '2' // Mock current user ID

  return (
    <div className={cn('bg-white h-full flex flex-col', className)}>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 p-4 pb-0 overflow-y-auto">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            onReaction={handleReaction}
            onReply={handleReply}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            quickReactions={quickReactions}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <ReplyBanner
          replyingTo={replyingTo}
          onCancel={() => setReplyingTo(null)}
        />
      )}

      {/* Message Input */}
      <MessageInput
        message={message}
        onChange={setMessage}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        inputRef={messageInputRef}
      />
    </div>
  )
}