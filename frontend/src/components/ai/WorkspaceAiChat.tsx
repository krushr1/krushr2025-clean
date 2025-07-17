import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ScrollArea } from '../ui/scroll-area'
import { 
  Send, 
  Bot, 
  User,
  Zap,
  Clock,
  Plus,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import { trpc } from '../../lib/trpc'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../stores/app-store'

interface WorkspaceAiChatProps {
  workspaceId: string
  className?: string
}

export default function WorkspaceAiChat({ workspaceId, className }: WorkspaceAiChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [thinkingBudget, setThinkingBudget] = useState(8000)
  const [isLoading, setIsLoading] = useState(false)
  const [showConversations, setShowConversations] = useState(false)
  
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAppStore()
  
  // tRPC queries and mutations
  const { data: conversations, refetch: refetchConversations } = trpc.ai.getConversations.useQuery({
    workspaceId
  })
  
  const { data: currentConversation } = trpc.ai.getConversation.useQuery({
    conversationId: selectedConversation!
  }, {
    enabled: !!selectedConversation
  })
  
  const { data: usageStats } = trpc.ai.getUsageStats.useQuery({
    workspaceId,
    days: 30
  })
  
  const createConversation = trpc.ai.createConversation.useMutation({
    onSuccess: (conversation) => {
      setSelectedConversation(conversation.id)
      refetchConversations()
      setShowConversations(false)
    }
  })
  
  const sendMessage = trpc.ai.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('')
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages])

  useEffect(() => {
    // Auto-select first conversation if none selected
    if (!selectedConversation && conversations && conversations.length > 0) {
      setSelectedConversation(conversations[0].id)
    }
  }, [conversations, selectedConversation])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    let conversationId = selectedConversation
    
    // Create new conversation if none selected
    if (!conversationId) {
      setIsLoading(true)
      const newConversation = await createConversation.mutateAsync({
        workspaceId,
        title: undefined,
        context: 'Workspace AI assistant'
      })
      conversationId = newConversation.id
    }
    
    setIsLoading(true)
    await sendMessage.mutateAsync({
      conversationId: conversationId!,
      message,
      thinkingBudget
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatCost = (cost: number) => {
    return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(3)}`
  }

  const formatTokens = (tokens: number) => {
    return tokens > 1000 ? `${(tokens / 1000).toFixed(1)}K` : tokens.toString()
  }

  return (
    <div className={cn('h-full flex flex-col bg-white', className)}>
      {/* Header similar to chat panel */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-krushr-primary/5 to-transparent">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="w-5 h-5 text-krushr-primary" />
              <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Gemini 2.5 Flash</p>
            </div>
          </div>
          {usageStats && (
            <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>{formatTokens(usageStats.totalStats.totalTokens)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{formatCost(usageStats.totalStats.totalCost)}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {conversations && conversations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConversations(!showConversations)}
              className="h-7 px-2 text-xs"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              {conversations.length}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => createConversation.mutate({ workspaceId })}
            className="h-7 px-2"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Conversation selector (collapsible) */}
      {showConversations && conversations && conversations.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50 max-h-32 overflow-y-auto">
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={selectedConversation === conversation.id ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start h-auto p-2 text-left"
                onClick={() => {
                  setSelectedConversation(conversation.id)
                  setShowConversations(false)
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs truncate">
                    {conversation.title || 'New Conversation'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {conversation.messages[0]?.content || 'No messages yet'}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {conversation.messages.length} messages
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatCost(conversation.totalCost)}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {selectedConversation && currentConversation ? (
            currentConversation.messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-3">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-xs text-gray-900">
                      {msg.role === 'user' ? user?.name || 'You' : 'AI'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Zap className="w-3 h-3" />
                        <span>{formatTokens(msg.tokenCount)}</span>
                        {msg.responseTime && (
                          <>
                            <Clock className="w-3 h-3 ml-1" />
                            <span>{msg.responseTime}ms</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    'text-sm',
                    msg.role === 'user' 
                      ? 'bg-krushr-primary/10 p-2 rounded-lg border border-krushr-primary/20' 
                      : 'text-gray-900'
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Welcome to AI Assistant
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                Ask me anything about your workspace or get help with tasks
              </p>
              <Button
                onClick={() => createConversation.mutate({ workspaceId })}
                size="sm"
                className="bg-krushr-primary hover:bg-krushr-primary/90"
              >
                <Plus className="w-3 h-3 mr-1" />
                Start Conversation
              </Button>
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-krushr-primary"></div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area - compact design */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/50">
        {/* Thinking budget slider - simplified */}
        <div className="flex items-center space-x-2 mb-2">
          <label className="text-xs text-gray-500 flex-shrink-0">Thinking:</label>
          <input
            type="range"
            min="0"
            max="24576"
            value={thinkingBudget}
            onChange={(e) => setThinkingBudget(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-12 text-right">
            {thinkingBudget === 0 ? 'Fast' : formatTokens(thinkingBudget)}
          </span>
        </div>
        
        {/* Message input */}
        <div className="flex items-center space-x-2">
          <Input
            ref={messageInputRef}
            placeholder="Ask AI anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 h-8 text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}