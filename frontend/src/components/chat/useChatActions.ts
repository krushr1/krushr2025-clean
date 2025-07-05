import { useState, useRef } from 'react'
import { trpc } from '../../lib/trpc'
import { ChatMessage } from './types'

export const useChatActions = (threadId?: string) => {
  const [message, setMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  const sendChatMessage = trpc.chat.sendMessage.useMutation({
    // onSuccess: () => refetch messages
  })

  const addReaction = trpc.chat.addReaction.useMutation({
    // onSuccess: () => refetch messages
  })

  const removeReaction = trpc.chat.removeReaction.useMutation({
    // onSuccess: () => refetch messages
  })

  const handleSendMessage = () => {
    if (!message.trim()) return

    if (threadId) {
      sendChatMessage.mutate({
        threadId,
        content: message,
        type: 'TEXT',
        replyToId: replyingTo?.id
      })
    }

    setMessage('')
    setReplyingTo(null)
  }

  const handleReaction = (messageId: string, emoji: string) => {
    if (threadId) {
      addReaction.mutate({ messageId, emoji })
    } else {
      console.log(`Adding reaction ${emoji} to message ${messageId}`)
    }
    setShowEmojiPicker(null)
  }

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message)
    messageInputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return {
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
  }
}