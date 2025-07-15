import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  onPopoutStateChange?: (isFloating: boolean) => void
}

export default function WorkspaceAiChat({ 
  workspaceId, 
  className, 
  isFloating = false, 
  onToggleFloating, 
  onClose,
  onPopoutStateChange
}: WorkspaceAiChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [thinkingBudget, setThinkingBudget] = useState(8000)
  const [autoThinkingBudget, setAutoThinkingBudget] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showConversations, setShowConversations] = useState(false)
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [snapZone, setSnapZone] = useState<'none' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('none')
  
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
      // After creating new conversation, user likely wants to start typing
      setTimeout(() => messageInputRef.current?.focus(), 100)
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
      // After successful message send, user likely wants to continue typing
      setTimeout(() => messageInputRef.current?.focus(), 50)
    },
    onError: () => {
      setIsLoading(false)
      setOptimisticMessage(null)
    }
  })

  const parseAndCreateActionsMutation = trpc.ai.parseAndCreateActions.useMutation({
    onSuccess: () => {
      setMessage('')
      setIsLoading(false)
      setOptimisticMessage(null)
      refetchConversation()
      refetchUsageStats()
      // After successful action parsing, user likely wants to continue typing
      setTimeout(() => messageInputRef.current?.focus(), 50)
    },
    onError: () => {
      setIsLoading(false)
      setOptimisticMessage(null)
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

  // Initialize floating position with smart default
  useEffect(() => {
    if (isFloating) {
      // Smart default position: center of viewport with slight offset to right
      const centerX = (window.innerWidth - 400) / 2 + 100 // Center + 100px offset to right
      const centerY = (window.innerHeight - 600) / 2 // Perfect center vertically
      
      const defaultPosition = {
        x: Math.max(20, Math.min(centerX, window.innerWidth - 420)), // Ensure it's on screen
        y: Math.max(20, Math.min(centerY, window.innerHeight - 620)) // Ensure it's on screen
      }
      
      setPosition(defaultPosition)
      setSnapZone('none') // Let the system determine the correct snap zone
      setIsMinimized(false) // Reset minimized state
    } else {
      // Reset position when not floating
      setPosition({ x: 0, y: 0 })
      setSnapZone('none')
      setIsMinimized(false)
    }
  }, [isFloating])

  // Debug: log position changes (remove after testing)
  useEffect(() => {
    if (isFloating) {
      console.log('AI Chat floating position:', { position, isMinimized, snapZone, windowSize: { width: window.innerWidth, height: window.innerHeight } })
    }
  }, [position, isMinimized, snapZone, isFloating])

  // Keyboard shortcuts for floating mode
  useEffect(() => {
    if (!isFloating) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to minimize/restore
      if (e.key === 'Escape') {
        e.stopPropagation()
        setIsMinimized(!isMinimized)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 300)
      }
      
      // Cmd/Ctrl + M to minimize/restore
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault()
        e.stopPropagation()
        setIsMinimized(!isMinimized)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 300)
      }
      
      // Cmd/Ctrl + D to dock back to panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        e.stopPropagation()
        onToggleFloating?.()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFloating, isMinimized, onToggleFloating])

  // Auto-hide when clicking outside (optional UX enhancement)
  useEffect(() => {
    if (!isFloating || isMinimized) return
    
    const handleClickOutside = (e: MouseEvent) => {
      if (floatingRef.current && !floatingRef.current.contains(e.target as Node)) {
        // Optional: Auto-minimize when clicking outside
        // setIsMinimized(true)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isFloating, isMinimized])

  // Smart snap zone detection
  const getSnapZone = (x: number, y: number): typeof snapZone => {
    const threshold = 100
    const width = 400
    const height = 600
    
    if (x < threshold && y < threshold) return 'top-left'
    if (x > window.innerWidth - width - threshold && y < threshold) return 'top-right'
    if (x < threshold && y > window.innerHeight - height - threshold) return 'bottom-left'
    if (x > window.innerWidth - width - threshold && y > window.innerHeight - height - threshold) return 'bottom-right'
    
    return 'none'
  }

  // Handle drag functionality with intelligent snapping
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFloating) return
    
    e.stopPropagation()
    setIsDragging(true)
    setIsAnimating(false)
    const rect = floatingRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  useEffect(() => {
    if (!isDragging || !isFloating) return

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep within viewport bounds with smart constraints
      const width = isMinimized ? 320 : 400
      const height = isMinimized ? 60 : 600
      const maxX = window.innerWidth - width
      const maxY = window.innerHeight - height
      
      const constrainedX = Math.max(0, Math.min(newX, maxX))
      const constrainedY = Math.max(0, Math.min(newY, maxY))
      
      setPosition({ x: constrainedX, y: constrainedY })
      
      // Update snap zone preview during drag
      const currentSnapZone = getSnapZone(constrainedX, constrainedY)
      setSnapZone(currentSnapZone)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsAnimating(true)
      
      // Snap to intelligent positions
      const currentSnapZone = getSnapZone(position.x, position.y)
      if (currentSnapZone !== 'none') {
        const width = isMinimized ? 320 : 400
        const height = isMinimized ? 60 : 600
        const padding = 20
        
        let snapPosition = { ...position }
        
        switch (currentSnapZone) {
          case 'top-left':
            snapPosition = { x: padding, y: padding }
            break
          case 'top-right':
            snapPosition = { x: window.innerWidth - width - padding, y: padding }
            break
          case 'bottom-left':
            snapPosition = { x: padding, y: window.innerHeight - height - padding }
            break
          case 'bottom-right':
            snapPosition = { x: window.innerWidth - width - padding, y: window.innerHeight - height - padding }
            break
        }
        
        setPosition(snapPosition)
        setSnapZone(currentSnapZone)
      }
      
      // Stop animation after transition
      setTimeout(() => setIsAnimating(false), 300)
    }

    document.addEventListener('mousemove', handleMouseMove, { capture: true })
    document.addEventListener('mouseup', handleMouseUp, { capture: true })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true })
      document.removeEventListener('mouseup', handleMouseUp, { capture: true })
    }
  }, [isDragging, dragOffset, isFloating, position, isMinimized, getSnapZone])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    let conversationId = selectedConversation
    const currentMessage = message.trim()
    
    // Show user message immediately (optimistic update)
    setOptimisticMessage(currentMessage)
    setMessage('')
    setIsLoading(true)
    
    
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setMessage(e.target.value)
  }

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleInputFocus = (e: React.FocusEvent) => {
    e.stopPropagation()
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

  // Modern floating window wrapper with intelligent behavior
  const FloatingWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isFloating) return <>{children}</>
    
    const getSnapZoneStyle = () => {
      if (isDragging && snapZone !== 'none') {
        return {
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 0.5)'
        }
      }
      return {}
    }
    
    // Ensure position is within viewport bounds
    const constrainedPosition = {
      x: Math.max(0, Math.min(position.x, window.innerWidth - (isMinimized ? 320 : 400))),
      y: Math.max(0, Math.min(position.y, window.innerHeight - (isMinimized ? 60 : 600)))
    }
    
    const floatingContent = (
      <div 
        ref={floatingRef}
        className={`fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] 
          ${isAnimating ? 'transition-all duration-300 ease-out' : ''} 
          ${isDragging ? 'scale-105 shadow-3xl' : 'shadow-2xl'}
          ${isMinimized ? 'backdrop-blur-sm' : ''}
          overflow-hidden`}
        style={{
          left: constrainedPosition.x,
          top: constrainedPosition.y,
          width: isMinimized ? '320px' : '400px',
          height: isMinimized ? '60px' : '600px',
          maxHeight: '80vh',
          cursor: isDragging ? 'grabbing' : 'default',
          transform: `scale(${isDragging ? 1.02 : 1})`,
          ...getSnapZoneStyle()
        }}
      >
        {/* Snap zone indicator */}
        {isDragging && snapZone !== 'none' && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl pointer-events-none" />
        )}
        
        {children}
      </div>
    )
    
    // Render floating window directly to document.body to escape panel container positioning
    return createPortal(floatingContent, document.body)
  }

  // Notify parent when popout state changes
  useEffect(() => {
    onPopoutStateChange?.(isFloating)
  }, [isFloating, onPopoutStateChange])

  return (
    <FloatingWrapper>
      <div className={cn(
        'flex flex-col bg-white',
        isFloating ? 'h-full rounded-lg' : 'h-full',
        className
      )}>
        {/* Header with floating controls */}
        <div className={cn(
          "relative flex items-center justify-between p-3 border-b border-gray-200 rounded-t-xl",
          isFloating ? "bg-gradient-to-r from-krushr-primary/5 to-transparent" : "bg-white"
        )}>
          {/* Modern drag handle for floating mode */}
          {isFloating && (
            <div 
              className={cn(
                "absolute left-1/2 top-1 w-12 h-1 bg-gray-300 rounded-full cursor-grab transform -translate-x-1/2 hover:bg-gray-400 transition-colors",
                isDragging && "cursor-grabbing bg-krushr-primary"
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
          
          {/* Modern floating window controls */}
          {isFloating && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMinimized(!isMinimized)
                  setIsAnimating(true)
                  setTimeout(() => setIsAnimating(false), 300)
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full transition-colors"
                title={isMinimized ? 'Restore' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              {onToggleFloating && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFloating}
                  className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
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
                  className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
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

      {/* Minimized state - compact notification bar with drag handle */}
      {isMinimized && isFloating && (
        <div className="flex items-center justify-between px-3 py-2 h-full">
          {/* Draggable handle for minimized state */}
          <div 
            className={cn(
              "flex items-center space-x-2 flex-1 min-w-0 cursor-grab hover:cursor-grab",
              isDragging && "cursor-grabbing"
            )}
            onMouseDown={handleMouseDown}
            title="Drag to move"
          >
            <div className="w-2 h-2 bg-krushr-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700 truncate">
              {isLoading ? 'AI is thinking...' : 'AI Assistant'}
            </span>
            {usageStats && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>{formatTokens(usageStats.totalStats.totalTokens)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMinimized(false)
                setIsAnimating(true)
                setTimeout(() => setIsAnimating(false), 300)
              }}
              className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
              title="Restore"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
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
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              disabled={isLoading}
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