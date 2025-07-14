import { useEffect, useRef } from 'react'
import { trpc } from '../../lib/trpc'
import { mockMessages } from './mockData'

export const useChatMessages = (threadId?: string) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messagesData } = trpc.chat.getMessages.useQuery(
    { threadId: threadId || 'default' },
    { enabled: !!threadId }
  )
  
  const messages = messagesData?.messages || []
  const displayMessages = threadId ? messages : mockMessages

  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.closest('[data-radix-scroll-area-viewport]')
    if (scrollContainer && messagesEndRef.current) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [displayMessages])

  return {
    messages: displayMessages,
    messagesEndRef
  }
}