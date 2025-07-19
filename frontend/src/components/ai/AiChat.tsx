import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { 
  Send, 
  Bot, 
  User,
  MessageSquare,
  Zap,
  Clock,
  DollarSign,
  Trash2,
  Edit3,
  Plus,
  Settings
} from 'lucide-react'
import { trpc } from '../../lib/trpc'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../stores/app-store'

interface AiChatProps {
  workspaceId: string
  className?: string
}

export default function AiChat({ workspaceId, className }: AiChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [thinkingBudget, setThinkingBudget] = useState(8000)
  const [isLoading, setIsLoading] = useState(false)
  
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
    }
  })
  
  const utils = trpc.useUtils()
  
  const sendMessage = trpc.ai.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('')
      setIsLoading(false)
      // Invalidate current conversation to show new messages immediately
      if (selectedConversation) {
        utils.ai.getConversation.invalidate({ conversationId: selectedConversation })
      }
      // Also refresh conversations list to update last message preview
      utils.ai.getConversations.invalidate({ workspaceId })
    },
    onError: () => {
      setIsLoading(false)
    }
  })
  
  const deleteConversation = trpc.ai.deleteConversation.useMutation({
    onSuccess: () => {
      setSelectedConversation(null)
      refetchConversations()
    }
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    let conversationId = selectedConversation
    
    // Create new conversation if none selected
    if (!conversationId) {
      setIsLoading(true)
      const newConversation = await createConversation.mutateAsync({
        workspaceId,
        title: undefined,
        context: 'General AI assistance'
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
    <div className={cn('h-full flex bg-krushr-panel-bg', className)}>
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r border-krushr-panel-border flex flex-col">
        {/* Sidebar Header */}
        <div className="px-6 py-4 border-b border-krushr-panel-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-krushr-coral-red" />
              <h2 className="font-brand font-semibold text-krushr-gray-dark">AI Assistant</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => createConversation.mutate({ workspaceId })}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Usage Stats */}
          {usageStats && (
            <div className="bg-krushr-sidebar-bg p-3 rounded-card">
              <div className="text-xs text-krushr-gray mb-2">Monthly Usage</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-krushr-gray-dark font-medium">
                    {formatTokens(usageStats.totalStats.totalTokens)}
                  </div>
                  <div className="text-krushr-gray">tokens</div>
                </div>
                <div>
                  <div className="text-krushr-gray-dark font-medium">
                    {formatCost(usageStats.totalStats.totalCost)}
                  </div>
                  <div className="text-krushr-gray">cost</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations?.map((conversation) => (
              <Button
                key={conversation.id}
                variant={selectedConversation === conversation.id ? 'secondary' : 'ghost'}
                className="w-full justify-start h-auto p-3"
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">
                      {conversation.title || 'New Conversation'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {conversation.messages[0]?.content || 'No messages yet'}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-gray-400">
                        {conversation.messages.length} messages
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatCost(conversation.totalCost)}
                      </div>
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-krushr-coral-red" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {currentConversation?.title || 'AI Assistant'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Powered by Gemini 2.5 Flash
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {formatTokens(currentConversation?.totalTokens || 0)} tokens
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatCost(currentConversation?.totalCost || 0)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteConversation.mutate({ conversationId: selectedConversation })}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentConversation?.messages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
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
                        <span className="font-medium text-sm text-gray-900">
                          {msg.role === 'user' ? user?.name : 'AI Assistant'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleTimeString()}
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
                        'prose prose-sm max-w-none',
                        msg.role === 'user' ? 'bg-krushr-primary/5 p-3 rounded-lg' : ''
                      )}>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-krushr-primary"></div>
                          <span className="text-sm text-gray-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-xs text-gray-500">Thinking Budget:</label>
                <input
                  type="range"
                  min="0"
                  max="24576"
                  value={thinkingBudget}
                  onChange={(e) => setThinkingBudget(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-16">
                  {thinkingBudget === 0 ? 'Fast' : formatTokens(thinkingBudget)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  ref={messageInputRef}
                  placeholder="Ask AI anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to AI Assistant
              </h3>
              <p className="text-gray-500 mb-6">
                Start a new conversation or select an existing one to continue
              </p>
              <Button
                onClick={() => createConversation.mutate({ workspaceId })}
                className="bg-krushr-primary hover:bg-krushr-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}