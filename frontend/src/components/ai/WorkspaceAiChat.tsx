import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
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
  Sparkles,
  Brain,
  Maximize2,
  Minimize2,
  X,
  Move
} from 'lucide-react'
import { trpc } from '../../lib/trpc'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../stores/app-store'

interface WorkspaceAiChatProps {
  workspaceId: string
  className?: string
  isFloating?: boolean
  onToggleFloating?: () => void
  onClose?: () => void
}

export default function WorkspaceAiChat({ 
  workspaceId, 
  className, 
  isFloating = false, 
  onToggleFloating, 
  onClose 
}: WorkspaceAiChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [thinkingBudget, setThinkingBudget] = useState(8000)
  const [autoThinkingBudget, setAutoThinkingBudget] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showConversations, setShowConversations] = useState(false)
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAppStore()
  
  // tRPC queries and mutations
  const { data: conversations, refetch: refetchConversations } = trpc.ai.getConversations.useQuery({
    workspaceId
  })
  
  const { data: currentConversation, refetch: refetchConversation } = trpc.ai.getConversation.useQuery({
    conversationId: selectedConversation!
  }, {
    enabled: !!selectedConversation
  })
  
  const { data: usageStats, refetch: refetchUsageStats } = trpc.ai.getUsageStats.useQuery({
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
      setOptimisticMessage(null)
      // Refetch conversation to show new messages (both user and AI response)
      refetchConversation()
      refetchUsageStats()
      // Keep focus after AI response for continued conversation
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus()
        }
      }, 100)
    },
    onError: () => {
      setIsLoading(false)
      setOptimisticMessage(null)
      // Keep focus even on error for user to retry
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus()
        }
      }, 100)
    }
  })

  const parseAndCreateActionsMutation = trpc.ai.parseAndCreateActions.useMutation({
    onSuccess: () => {
      setMessage('')
      setIsLoading(false)
      setOptimisticMessage(null)
      refetchConversation()
      refetchUsageStats()
      // Keep focus after actions are parsed for continued conversation
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus()
        }
      }, 100)
    },
    onError: () => {
      setIsLoading(false)
      setOptimisticMessage(null)
      // Keep focus even on error for user to retry
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus()
        }
      }, 100)
    }
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages, optimisticMessage, isLoading])

  useEffect(() => {
    // Auto-select first conversation if none selected
    if (!selectedConversation && conversations && conversations.length > 0) {
      setSelectedConversation(conversations[0].id)
    }
  }, [conversations, selectedConversation])

  // Load saved position for floating mode
  useEffect(() => {
    if (isFloating) {
      const savedPosition = localStorage.getItem('ai-chat-position')
      if (savedPosition) {
        setPosition(JSON.parse(savedPosition))
      }
    }
  }, [isFloating])

  // Save position when it changes
  useEffect(() => {
    if (isFloating) {
      localStorage.setItem('ai-chat-position', JSON.stringify(position))
    }
  }, [position, isFloating])

  // Handle drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFloating) return
    
    e.stopPropagation()
    setIsDragging(true)
    const rect = floatingRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !isFloating) return
      
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 400 // Assuming 400px width
      const maxY = window.innerHeight - 300 // Assuming 300px height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp, { passive: false })
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, isFloating])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    let conversationId = selectedConversation
    const currentMessage = message.trim()
    
    // Show user message immediately (optimistic update)
    setOptimisticMessage(currentMessage)
    setMessage('')
    setIsLoading(true)
    
    // Keep focus after sending message since user is actively chatting
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus()
      }
    }, 10)
    
    // Create new conversation if none selected
    if (!conversationId) {
      try {
        const newConversation = await createConversation.mutateAsync({
          workspaceId,
          title: undefined,
          context: 'Workspace AI assistant'
        })
        conversationId = newConversation.id
      } catch (error) {
        setIsLoading(false)
        setOptimisticMessage(null)
        setMessage(currentMessage) // Restore message on error
        return
      }
    }
    
    // Check if message seems actionable and try intelligent parsing first
    const shouldParseActions = /(?:need to|have to|must|should|todo|task|create|build|fix|update|review|test|deploy|note|remember|jot down|write down|document|project|initiative|campaign|feature|milestone|meeting|call|appointment|schedule|book)/i.test(currentMessage)
    
    if (shouldParseActions) {
      try {
        const parseResult = await parseAndCreateActionsMutation.mutateAsync({
          workspaceId,
          message: currentMessage,
          autoCreate: true,
          conversationId
        })
        
        // Show notification if items were created
        if (parseResult.createdItems.length > 0) {
          console.log('Created actionable items:', parseResult.createdItems)
        }
        return
      } catch (parseError) {
        console.warn('Failed to parse actions, falling back to regular chat:', parseError)
      }
    }
    
    // Fallback to regular chat message
    try {
      await sendMessage.mutateAsync({
        conversationId: conversationId!,
        message: currentMessage,
        thinkingBudget: autoThinkingBudget ? undefined : thinkingBudget
      })
    } catch (error) {
      // Restore message on error
      setMessage(currentMessage)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  const renderMarkdown = (content: string) => {
    // Simple markdown parsing for AI responses
    let formatted = content
    
    // First handle bold text (must come before italic to avoid conflicts)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    
    // Then handle italic text, but avoid already processed bold text
    formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em class="italic">$1</em>')
    
    // Convert bullet points (lines starting with * or -) to proper list items
    const lines = formatted.split('\n')
    let inList = false
    const processedLines = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Check for bullet points (but not already processed bold/italic)
      if (trimmed.startsWith('*') && !trimmed.includes('<strong>') && !trimmed.includes('<em>')) {
        if (!inList) {
          processedLines.push('<ul class="list-disc list-inside space-y-1 ml-4 mt-2">')
          inList = true
        }
        processedLines.push(`<li class="text-sm">${trimmed.substring(1).trim()}</li>`)
      } else if (trimmed.startsWith('-') && !trimmed.includes('<strong>') && !trimmed.includes('<em>')) {
        if (!inList) {
          processedLines.push('<ul class="list-disc list-inside space-y-1 ml-4 mt-2">')
          inList = true
        }
        processedLines.push(`<li class="text-sm">${trimmed.substring(1).trim()}</li>`)
      } else {
        if (inList) {
          processedLines.push('</ul>')
          inList = false
        }
        if (trimmed) {
          processedLines.push(`<p class="mb-2">${trimmed}</p>`)
        }
      }
    }
    
    if (inList) {
      processedLines.push('</ul>')
    }
    
    return processedLines.join('\n')
  }

  // Floating window wrapper - temporarily disabled to debug input issues
  const FloatingWrapper = ({ children }: { children: React.ReactNode }) => {
    // Temporarily disable floating mode to test input field
    return <>{children}</>
    
    // if (!isFloating) return <>{children}</>
    
    // return (
    //   <div 
    //     ref={floatingRef}
    //     className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl z-[9999] transition-all duration-200"
    //     style={{
    //       left: position.x,
    //       top: position.y,
    //       width: isMinimized ? '320px' : '400px',
    //       height: isMinimized ? '60px' : '600px',
    //       maxHeight: '80vh',
    //       cursor: isDragging ? 'grabbing' : 'default',
    //       pointerEvents: 'auto' // Ensure pointer events are enabled
    //     }}
    //   >
    //     {children}
    //   </div>
    // )
  }

  return (
    <FloatingWrapper>
      <div className={cn(
        'flex flex-col bg-white',
        isFloating ? 'h-full rounded-lg' : 'h-full',
        className
      )}>
        {/* Header with floating controls */}
        <div className="relative flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-krushr-primary/5 to-transparent rounded-t-lg">
          {/* Drag handle - only this area enables dragging */}
          {isFloating && (
            <div 
              className={cn(
                "absolute left-1/2 top-1 w-8 h-1 bg-gray-300 rounded-full cursor-grab transform -translate-x-1/2",
                isDragging && "cursor-grabbing"
              )}
              onMouseDown={handleMouseDown}
              title="Drag to move"
            />
          )}
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
          {/* Thinking budget controls - compact header version */}
          {!isMinimized && (
            <div className="flex items-center space-x-1 mr-2">
              <Brain className="w-3 h-3 text-gray-400" />
              <button
                onClick={() => setAutoThinkingBudget(!autoThinkingBudget)}
                className={`px-1.5 py-0.5 text-xs rounded ${
                  autoThinkingBudget
                    ? 'bg-krushr-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={autoThinkingBudget ? 'Auto thinking budget' : 'Manual thinking budget'}
              >
                {autoThinkingBudget ? 'Auto' : 'Manual'}
              </button>
              {!autoThinkingBudget && (
                <>
                  <input
                    type="range"
                    min="0"
                    max="24576"
                    value={thinkingBudget}
                    onChange={(e) => setThinkingBudget(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    title={`Thinking budget: ${thinkingBudget === 0 ? 'Fast' : formatTokens(thinkingBudget)}`}
                  />
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {thinkingBudget === 0 ? 'Fast' : formatTokens(thinkingBudget)}
                  </span>
                </>
              )}
            </div>
          )}
          
          {/* Floating window controls */}
          {isFloating && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              {onToggleFloating && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFloating}
                  className="h-6 w-6 p-0"
                  title="Dock to panel"
                >
                  <Move className="w-3 h-3" />
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
          
          {/* Standard panel controls */}
          {!isFloating && (
            <>
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
              {onToggleFloating && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFloating}
                  className="h-7 px-2"
                  title="Pop out to floating window"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Conversation selector (collapsible) */}
      {!isMinimized && showConversations && conversations && conversations.length > 0 && (
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
      {!isMinimized && (
        <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {selectedConversation && currentConversation ? (
            <>
              {currentConversation.messages.map((msg) => (
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
                          {msg.thinkingBudget && msg.thinkingBudget > 0 && (
                            <>
                              <Brain className="w-3 h-3 ml-1" />
                              <span>{formatTokens(msg.thinkingBudget)}</span>
                            </>
                          )}
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
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div 
                          className="max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Optimistic user message */}
              {optimisticMessage && (
                <div className="flex items-start space-x-3 opacity-70">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-xs text-gray-900">
                        {user?.name || 'You'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="text-sm bg-krushr-primary/10 p-2 rounded-lg border border-krushr-primary/20">
                      <p className="whitespace-pre-wrap">{optimisticMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading AI response */}
              {isLoading && optimisticMessage && (
                <div className="flex items-start space-x-3 opacity-70">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-xs text-gray-900">AI</span>
                      <span className="text-xs text-gray-500">thinking...</span>
                    </div>
                    <div className="text-sm text-gray-500 animate-pulse">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
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
      )}

      {/* Input area - compact design */}
      {!isMinimized && (
        <div className="p-3 border-t border-gray-200 bg-gray-50/50">
        {/* Message input */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              ref={messageInputRef}
              type="text"
              id="floating_ai_message"
              placeholder=" "
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => {
                e.stopPropagation()
                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
              disabled={isLoading}
              style={{ pointerEvents: 'auto' }}
              className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:border-krushr-primary peer transition-all duration-200 font-manrope h-10"
            />
            <label
              htmlFor="floating_ai_message"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-manrope"
            >
              Ask AI anything...
            </label>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            size="sm"
            className="h-10 w-10 p-0"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
      )}
    </div>
    </FloatingWrapper>
  )
}