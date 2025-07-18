import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
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
  Copy,
  Reply,
  Check,
  ClipboardPaste,
  Settings,
  Brain,
  Trash2,
  X,
  Star,
  BookOpen
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
  const [thinkingSliderValue, setThinkingSliderValue] = useState(3) // 0-6 scale
  const [isLoading, setIsLoading] = useState(false)
  const [showConversations, setShowConversations] = useState(false)
  const [showThinkingControls, setShowThinkingControls] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAppStore()
  
  // tRPC utils for invalidation
  const utils = trpc.useUtils()
  
  // tRPC queries and mutations
  const { data: conversations, refetch: refetchConversations } = trpc.ai.getConversations.useQuery({
    workspaceId
  })
  
  const { data: currentConversation, refetch: refetchCurrentConversation } = trpc.ai.getConversation.useQuery({
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
      // Invalidate and refetch the current conversation to show new messages
      if (selectedConversation) {
        utils.ai.getConversation.invalidate({ conversationId: selectedConversation })
        refetchCurrentConversation()
      }
      // Also refresh conversations list to update message counts
      utils.ai.getConversations.invalidate({ workspaceId })
    },
    onError: () => {
      setIsLoading(false)
    }
  })

  const deleteConversation = trpc.ai.deleteConversation.useMutation({
    onSuccess: (_, variables) => {
      refetchConversations()
      // If we deleted the currently selected conversation, select another or clear
      if (selectedConversation === variables.conversationId) {
        const remainingConversations = conversations?.filter(c => c.id !== variables.conversationId)
        if (remainingConversations && remainingConversations.length > 0) {
          setSelectedConversation(remainingConversations[0].id)
        } else {
          setSelectedConversation(null)
        }
      }
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

  useEffect(() => {
    // Auto-resize textarea
    if (messageInputRef.current && message) {
      messageInputRef.current.style.height = '32px'
      const newHeight = Math.max(32, Math.min(messageInputRef.current.scrollHeight, 96))
      messageInputRef.current.style.height = `${newHeight}px`
    } else if (messageInputRef.current && !message) {
      messageInputRef.current.style.height = '32px'
    }
  }, [message])

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey || (e.metaKey && e.shiftKey)) {
        // Shift+Enter or Cmd+Shift+Enter: Allow new line
        return
      } else {
        // Plain Enter: Send message
        e.preventDefault()
        handleSendMessage()
      }
    }
  }

  const formatCost = (cost: number) => {
    return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(3)}`
  }

  const formatTokens = (tokens: number) => {
    return tokens > 1000 ? `${(tokens / 1000).toFixed(1)}K` : tokens.toString()
  }

  // Intelligent thinking budget mapping
  const thinkingLevels = [
    { value: 0, tokens: 0, label: 'Instant', description: 'Fastest, no thinking' },
    { value: 1, tokens: 2000, label: 'Quick', description: 'Simple questions' },
    { value: 2, tokens: 4000, label: 'Standard', description: 'Most queries' },
    { value: 3, tokens: 8000, label: 'Thoughtful', description: 'Complex problems' },
    { value: 4, tokens: 12000, label: 'Deep', description: 'Analysis & planning' },
    { value: 5, tokens: 18000, label: 'Careful', description: 'Critical decisions' },
    { value: 6, tokens: 24576, label: 'Maximum', description: 'Expert reasoning' }
  ]

  const handleThinkingSliderChange = (sliderValue: number) => {
    setThinkingSliderValue(sliderValue)
    const level = thinkingLevels[sliderValue]
    setThinkingBudget(level.tokens)
  }

  const getCurrentThinkingLevel = () => {
    return thinkingLevels[thinkingSliderValue]
  }

  // Predefined favorite prompts and contexts
  const favoritePrompts = [
    {
      id: 'project-planning',
      title: 'Project Planning',
      prompt: 'Help me plan a new project. I need to break down tasks, set priorities, and create a timeline.',
      category: 'Planning'
    },
    {
      id: 'code-review',
      title: 'Code Review',
      prompt: 'Please review this code for best practices, potential bugs, and improvements:\n\n',
      category: 'Development'
    },
    {
      id: 'meeting-prep',
      title: 'Meeting Preparation',
      prompt: 'Help me prepare for an upcoming meeting. Create an agenda and key discussion points.',
      category: 'Meetings'
    },
    {
      id: 'bug-analysis',
      title: 'Bug Analysis',
      prompt: 'I\'m experiencing a bug. Help me analyze the issue and suggest debugging steps:\n\n',
      category: 'Development'
    },
    {
      id: 'task-breakdown',
      title: 'Task Breakdown',
      prompt: 'Break down this large task into smaller, manageable subtasks with estimated time:',
      category: 'Planning'
    },
    {
      id: 'documentation',
      title: 'Documentation Helper',
      prompt: 'Help me write clear documentation for this feature or process:\n\n',
      category: 'Documentation'
    },
    {
      id: 'retrospective',
      title: 'Sprint Retrospective',
      prompt: 'Let\'s do a sprint retrospective. What went well, what could be improved, and action items:',
      category: 'Agile'
    }
  ]

  const handleUseFavorite = (prompt: string) => {
    setMessage(prompt)
    setShowFavorites(false)
    messageInputRef.current?.focus()
  }

  const handleCopyMessage = async (messageContent: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(messageContent)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const handleReplyToMessage = (messageContent: string) => {
    const replyText = `> ${messageContent.split('\n')[0]}...\n\n`
    setMessage(replyText)
    messageInputRef.current?.focus()
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setMessage(prev => prev + text)
        messageInputRef.current?.focus()
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error)
    }
  }

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent conversation selection
    if (confirm('Delete this conversation? This action cannot be undone.')) {
      deleteConversation.mutate({ conversationId })
    }
  }

  const handleAddToFavorites = (messageContent: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Get first line or truncate for title
    const title = messageContent.split('\n')[0].substring(0, 50)
    const prompt = messageContent.length > 200 ? messageContent.substring(0, 200) + '...' : messageContent
    
    // For now, just show confirmation - in a real app you'd save to backend
    if (confirm(`Add "${title}" to favorites?`)) {
      // TODO: Implement actual saving to favorites
      alert('Favorite saved! (Note: This is a demo - real implementation would save to database)')
    }
  }

  return (
    <div className={cn('h-full flex flex-col bg-white', className)}>
      {/* Header similar to chat panel */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gradient-to-r from-krushr-primary/5 to-transparent">
        <div className="flex items-center space-x-2">
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
            onClick={() => setShowFavorites(!showFavorites)}
            className="h-7 px-2"
            title="Favorite prompts"
          >
            <Star className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowThinkingControls(!showThinkingControls)}
            className="h-7 px-2"
            title="Thinking settings"
          >
            <Brain className="w-3 h-3" />
          </Button>
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
              <div
                key={conversation.id}
                className={cn(
                  "group relative rounded border p-2 text-left cursor-pointer hover:bg-gray-100",
                  selectedConversation === conversation.id ? 'bg-gray-100 border-krushr-primary' : 'border-gray-200'
                )}
                onClick={() => {
                  setSelectedConversation(conversation.id)
                  setShowConversations(false)
                }}
              >
                <div className="flex-1 min-w-0 pr-6">
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
                
                {/* Delete button - shows on hover */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites panel (collapsible) */}
      {showFavorites && (
        <div className="border-b border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-700">Quick Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFavorites(false)}
                className="h-5 w-5 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {favoritePrompts.map((favorite) => (
                <Button
                  key={favorite.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUseFavorite(favorite.prompt)}
                  className="h-auto p-2 text-left justify-start hover:bg-white hover:border hover:border-krushr-primary"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs text-gray-900 truncate">
                        {favorite.title}
                      </span>
                      <span className="text-xs text-krushr-primary bg-krushr-primary/10 px-1.5 py-0.5 rounded text-xs font-medium">
                        {favorite.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {favorite.prompt.length > 60 
                        ? `${favorite.prompt.substring(0, 60)}...` 
                        : favorite.prompt
                      }
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Thinking controls (collapsible) */}
      {showThinkingControls && (
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">Thinking Level</label>
              <div className="text-xs text-krushr-primary font-medium">
                {getCurrentThinkingLevel().label}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500 w-10">Fast</span>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={thinkingSliderValue}
                onChange={(e) => handleThinkingSliderChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, 
                    #e5e7eb 0%, 
                    #d1d5db ${(thinkingSliderValue / 6) * 100}%, 
                    #143197 ${(thinkingSliderValue / 6) * 100}%, 
                    #143197 100%)`
                }}
              />
              <span className="text-xs text-gray-500 w-10">Deep</span>
            </div>
            <div className="text-xs text-gray-600 text-center bg-white px-2 py-1 rounded border">
              {getCurrentThinkingLevel().description}
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {selectedConversation && currentConversation ? (
            currentConversation.messages.map((msg) => (
              <div key={msg.id} className="group flex items-start space-x-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-krushr-coral-red" />
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
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
                    
                    {/* Message Action Buttons */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                        title="Copy message"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      
                      {msg.role === 'user' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleAddToFavorites(msg.content, e)}
                          className="h-6 w-6 p-0 hover:bg-yellow-100 hover:text-yellow-600"
                          title="Add to favorites"
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {msg.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReplyToMessage(msg.content)}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                          title="Reply to this message"
                        >
                          <Reply className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className={cn(
                    'text-sm',
                    msg.role === 'user' 
                      ? 'bg-krushr-primary/10 p-2 rounded-lg border border-krushr-primary/20' 
                      : 'text-gray-900'
                  )}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown 
                        className="prose prose-sm max-w-none prose-gray prose-strong:text-gray-900 prose-code:text-krushr-primary prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          code: ({ children }) => <code className="text-krushr-primary bg-gray-100 px-1 rounded text-xs">{children}</code>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
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
                  <Bot className="w-4 h-4 text-krushr-coral-red" />
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
        {/* Message input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-end space-x-2"
        >
          <div className="flex-1 relative">
            <Textarea
              ref={messageInputRef}
              placeholder="Ask AI anything... (Shift+Enter for new line)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="h-8 min-h-8 max-h-24 text-sm pr-8 resize-none overflow-hidden leading-tight py-1.5 px-3"
              rows={1}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePasteFromClipboard}
              className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-gray-200"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3 h-3" />
            </Button>
          </div>
          <Button
            type="submit"
            size="sm"
            className="w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-colors p-0"
            onClick={(e) => {
              if (!message.trim() || isLoading) {
                e.preventDefault()
                return
              }
            }}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-white border-t-transparent border-2"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}