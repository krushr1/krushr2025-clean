export interface ChatMessage {
  id: string
  content: string
  type: 'text' | 'file' | 'system'
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
  }>
  replyTo?: {
    id: string
    content: string
    sender: string
  }
}

export interface ChatProps {
  threadId?: string
  className?: string
}