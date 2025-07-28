import React, { useState, useRef, useEffect } from 'react'
import { useOptimisticDelete } from '@/hooks/use-optimistic-delete'
import { useOptimisticAction } from '@/hooks/use-optimistic-action'
import ReactMarkdown from 'react-markdown'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FloatingTextarea } from '../ui/floating-textarea'
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
  BookOpen,
  Mic,
  MicOff,
  Square,
  Paperclip,
  Upload,
  FileImage,
  FileText,
  File
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
  const [showThinkingControls, setShowThinkingControls] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [enableRealTimeData, setEnableRealTimeData] = useState(false)
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  
  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  // Real-time data queries
  const { data: queryClassification } = trpc.ai.classifyQuery.useQuery(
    { query: message },
    { enabled: message.length > 3 }
  )

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

  const processVoiceCommand = trpc.ai.processVoiceCommand.useMutation({
    onSuccess: (result) => {
      setIsProcessingVoice(false)
      setVoiceError(null)
      
      // Add the voice result as a message
      if (result.success && result.naturalResponse) {
        // Add transcript as user message
        if (result.transcript) {
          setMessage(result.transcript)
        }
        
        // If conversation exists, refresh it to show any created tasks/actions
        if (selectedConversation) {
          refetchCurrentConversation()
          refetchConversations()
        }
        
        // Show success message with natural response
        console.log('🎤 Voice command processed:', result.naturalResponse)
      }
    },
    onError: (error) => {
      setIsProcessingVoice(false)
      setVoiceError(error.message || 'Voice processing failed')
      console.error('Voice processing error:', error)
    }
  })

  // We'll handle file upload differently - pass file data directly to the AI message
  // No need for separate upload mutation

  useEffect(() => {
    // Scroll to bottom of messages container, not the whole page
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
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

  // Recording timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const handleSendMessage = async () => {
    if (!message.trim() && attachedFiles.length === 0) return
    
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
    
    try {
      // Prepare message content with file information
      let messageContent = message
      
      if (attachedFiles.length > 0) {
        // Convert files to base64 for AI processing
        const fileData = await Promise.all(
          attachedFiles.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer()
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
            return {
              filename: file.name,
              mimetype: file.type,
              size: file.size,
              base64Data: base64
            }
          })
        )
        
        // Add file information to message
        const fileList = attachedFiles.map(f => f.name).join(', ')
        messageContent += `\n\n📎 Attached files: ${fileList}`
        
        // For now, just mention the files - in the future, the AI could process them
        messageContent += `\n\n[Note: File processing functionality will be implemented soon]`
      }
        
      await sendMessage.mutateAsync({
        conversationId: conversationId!,
        message: messageContent,
        thinkingBudget,
        enableRealTimeData
      })
      
      // Clear attached files after successful send
      setAttachedFiles([])
      setUploadError(null)
      
    } catch (error) {
      console.error('Send message error:', error)
    }
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
    },
    {
      id: 'voice-create-task',
      title: '🎤 Create Task',
      prompt: 'create task for user authentication system',
      category: 'Voice'
    },
    {
      id: 'voice-assign-task',
      title: '🎤 Assign Task',
      prompt: 'assign the frontend work to Alice',
      category: 'Voice'
    },
    {
      id: 'voice-update-status',
      title: '🎤 Update Status',
      prompt: 'mark the database task as done',
      category: 'Voice'
    },
    {
      id: 'voice-schedule-meeting',
      title: '🎤 Schedule Meeting',
      prompt: 'schedule meeting with the team tomorrow',
      category: 'Voice'
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

  const { deleteItem } = useOptimisticDelete()
  const { execute } = useOptimisticAction()

  // Voice recording functions
  const startRecording = async () => {
    try {
      setVoiceError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      })
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const audioChunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' })
        await processVoiceInput(audioBlob)
        
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setVoiceError('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      setIsProcessingVoice(true)
      setVoiceError(null)
      
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const base64Audio = btoa(String.fromCharCode(...uint8Array))
      
      // Process the voice command
      await processVoiceCommand.mutateAsync({
        audioData: base64Audio,
        workspaceId,
        conversationId: selectedConversation || undefined
      })
      
    } catch (error) {
      console.error('Error processing voice input:', error)
      setVoiceError('Failed to process voice input')
      setIsProcessingVoice(false)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // File upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      
      // Validate file size (15MB limit)
      const maxSize = 15 * 1024 * 1024
      const validFiles = fileArray.filter(file => {
        if (file.size > maxSize) {
          setUploadError(`File "${file.name}" is too large. Maximum size is 15MB.`)
          return false
        }
        return true
      })
      
      setAttachedFiles(prev => [...prev, ...validFiles])
      setUploadError(null)
    }
    
    // Clear the input so the same file can be selected again
    if (event.target) {
      event.target.value = ''
    }
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-4 h-4" />
    } else if (file.type.includes('text/') || file.type.includes('application/pdf')) {
      return <FileText className="w-4 h-4" />
    } else {
      return <File className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent conversation selection
    
    const conversationToDelete = conversations?.find(c => c.id === conversationId)
    if (!conversationToDelete) return
    
    await deleteItem({
      type: 'conversation',
      item: conversationToDelete,
      itemName: conversationToDelete.title || 'Untitled conversation',
      deleteAction: async () => {
        await deleteConversation.mutateAsync({ conversationId })
      },
      onOptimisticRemove: () => {
        // Clear if active conversation
        if (selectedConversation === conversationId) {
          setSelectedConversation(null)
        }
        // Conversation will disappear from list due to refetch
      },
      onRestore: () => {
        // Just trigger a refetch to show the conversation again
        refetchConversations()
      }
    })
  }

  const handleAddToFavorites = async (messageContent: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Get first line or truncate for title
    const title = messageContent.split('\n')[0].substring(0, 50)
    const prompt = messageContent.length > 200 ? messageContent.substring(0, 200) + '...' : messageContent
    
    // Immediately add to favorites without confirmation
    await execute({
      type: 'conversation',
      action: async () => {
        // TODO: Implement actual saving to favorites
        console.log('Adding to favorites:', title)
      },
      undoAction: async () => {
        // TODO: Remove from favorites
        console.log('Removing from favorites:', title)
      },
      item: { title, content: messageContent },
      getMessage: () => 'Added to favorites',
      getUndoMessage: () => 'Removed from favorites',
      showUndo: true
    })
  }

  return (
    <div className={cn('h-full flex flex-col bg-white', className)}>
      {/* Minimal header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {/* AI Assistant title */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-krushr-primary to-krushr-secondary rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Powered by GPT-4 & Claude</p>
            </div>
          </div>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Usage indicator */}
          {usageStats && (
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              <span>{formatTokens(usageStats.totalStats.totalTokens)}</span>
              <span>•</span>
              <span>{formatCost(usageStats.totalStats.totalCost)}</span>
            </div>
          )}
          
          {/* Settings menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowThinkingControls(!showThinkingControls)}
            className={cn(
              "h-8 w-8 p-0 rounded-full",
              showThinkingControls ? "bg-gray-100" : "hover:bg-gray-100"
            )}
            title="AI settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          {/* New conversation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => createConversation.mutate({ workspaceId })}
            className="h-8 w-8 p-0 rounded-full bg-krushr-primary text-white hover:bg-krushr-primary/90"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>



      {/* Enhanced settings panel */}
      {showThinkingControls && (
        <div className="border-b border-gray-100 bg-white shadow-sm">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">AI Settings</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThinkingControls(false)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Thinking Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Thinking Depth</label>
                <div className="text-sm text-krushr-primary font-medium">
                  {getCurrentThinkingLevel().label}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 w-12">Quick</span>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={thinkingSliderValue}
                  onChange={(e) => handleThinkingSliderChange(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      #e5e7eb 0%, 
                      #d1d5db ${(thinkingSliderValue / 6) * 100}%, 
                      #143197 ${(thinkingSliderValue / 6) * 100}%, 
                      #143197 100%)`
                  }}
                />
                <span className="text-xs text-gray-500 w-12">Expert</span>
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                {getCurrentThinkingLevel().description}
              </p>
            </div>
            
            {/* Real-time Data Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Live Data Access</label>
                <p className="text-xs text-gray-500">Current weather, news, and web information</p>
              </div>
              <button
                onClick={() => setEnableRealTimeData(!enableRealTimeData)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:ring-offset-2",
                  enableRealTimeData ? "bg-krushr-primary" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    enableRealTimeData ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            
            {/* Conversation History */}
            {conversations && conversations.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Recent Conversations</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {conversations.slice(0, 3).map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation.id)
                        setShowThinkingControls(false)
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded-lg text-xs hover:bg-gray-50 transition-colors",
                        selectedConversation === conversation.id ? "bg-krushr-primary/10 border border-krushr-primary/20" : "border border-gray-200"
                      )}
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {conversation.title || 'New Conversation'}
                      </div>
                      <div className="text-gray-500 truncate">
                        {conversation.messages[0]?.content || 'No messages yet'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {selectedConversation && currentConversation ? (
            currentConversation.messages.map((msg) => (
              <div key={msg.id} className="group">
                {msg.role === 'user' ? (
                  /* User message - right aligned */
                  <div className="flex justify-end">
                    <div className="max-w-xl">
                      <div className="bg-krushr-primary/10 text-gray-900 border border-krushr-primary/20 px-3 py-2 rounded-2xl rounded-br-md">
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="flex items-center justify-end mt-1 space-x-2 text-xs text-gray-500">
                        <span>{user?.name || 'You'}</span>
                        <span>•</span>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AI message - left aligned with avatar */
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-krushr-primary to-krushr-secondary rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 px-3 py-2 rounded-2xl rounded-bl-md">
                        <ReactMarkdown 
                          className="prose prose-xs max-w-none prose-gray prose-strong:text-gray-900 prose-code:text-krushr-primary prose-code:bg-white prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-800 leading-relaxed text-xs">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            code: ({ children }) => <code className="text-krushr-primary bg-white px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                            ul: ({ children }) => <ul className="list-disc pl-3 mb-2 space-y-0.5 text-xs">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-3 mb-2 space-y-0.5 text-xs">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-800 text-xs">{children}</li>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>AI Assistant</span>
                          <span>•</span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {msg.responseTime && (
                            <>
                              <span>•</span>
                              <span>{msg.responseTime}ms</span>
                            </>
                          )}
                        </div>
                        
                        {/* Message Actions */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyMessage(msg.content, msg.id)}
                            className="h-7 w-7 p-0 rounded-full hover:bg-gray-200"
                            title="Copy message"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-krushr-primary to-krushr-secondary rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to AI Assistant</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Start a conversation to get help with tasks, questions, or creative projects. 
                I can understand text, voice, and file uploads.
              </p>
              <Button
                onClick={() => createConversation.mutate({ workspaceId })}
                className="bg-krushr-primary hover:bg-krushr-primary/90"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Your First Conversation
              </Button>
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-krushr-primary to-krushr-secondary rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 px-3 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area - optimized design */}
      <div className="border-t border-gray-200 bg-gray-50/50">
        {/* Real-time data suggestion bar */}
        {queryClassification?.needsRealTime && !enableRealTimeData && (
          <div className="px-3 py-2 text-xs text-krushr-primary bg-blue-50 border-b border-blue-200 flex items-center justify-between">
            <span>💡 This query might benefit from real-time data</span>
            <button
              onClick={() => setEnableRealTimeData(true)}
              className="text-krushr-primary hover:underline font-medium"
            >
              Enable
            </button>
          </div>
        )}
        
        {/* Voice error display */}
        {voiceError && (
          <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border-b border-red-200 flex items-center justify-between">
            <span>🎤 {voiceError}</span>
            <button
              onClick={() => setVoiceError(null)}
              className="text-red-600 hover:underline font-medium"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Upload error display */}
        {uploadError && (
          <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border-b border-red-200 flex items-center justify-between">
            <span>📎 {uploadError}</span>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-600 hover:underline font-medium"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Voice recording indicator */}
        {isRecording && (
          <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border-b border-red-200 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording... {formatRecordingTime(recordingTime)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopRecording}
                className="h-6 px-2 bg-red-100 hover:bg-red-200 text-red-700"
              >
                <Square className="w-3 h-3 mr-1" />
                Stop
              </Button>
            </div>
          </div>
        )}
        
        {/* Voice processing indicator */}
        {isProcessingVoice && (
          <div className="px-3 py-2 text-xs text-blue-600 bg-blue-50 border-b border-blue-200 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Processing voice command...</span>
            </div>
          </div>
        )}
        
        {/* Attached files display */}
        {attachedFiles.length > 0 && (
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                Attached Files ({attachedFiles.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAttachedFiles([])}
                className="h-5 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {getFileIcon(file)}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachedFile(index)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* File uploading indicator */}
        {isUploadingFiles && (
          <div className="px-3 py-2 text-xs text-blue-600 bg-blue-50 border-b border-blue-200 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Uploading files...</span>
            </div>
          </div>
        )}
        
        {/* Main input area - Optimized ChatGPT-style layout */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="relative"
            >
              {/* Enhanced input container with inline controls */}
              <div className="relative flex items-center bg-white border border-gray-300 rounded-3xl shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-krushr-primary h-[60px]">
              {/* Left action buttons - inside input */}
              <div className="flex items-center pl-3 space-x-1">
                {/* Add/Plus button */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isRecording || isProcessingVoice}
                  className="h-8 w-8 rounded-full flex items-center justify-center transition-colors p-0 bg-transparent text-gray-600 hover:bg-gray-100"
                  title="Attach files"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                
                {/* Agent/Sources selector */}
                <div className="flex items-center space-x-1">
                  {/* Real-time data toggle */}
                  {enableRealTimeData && (
                    <div className="flex items-center text-xs text-krushr-primary bg-blue-100 px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3 mr-1" />
                      <span className="text-xs font-medium">Live</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main textarea - centered and expandable with floating label */}
              <div className="flex-1 min-w-0 relative">
                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder=""
                  className="w-full min-h-[46px] h-[46px] text-sm resize-none border-0 bg-transparent focus:ring-0 focus:outline-none px-3 py-3 placeholder-transparent peer leading-relaxed"
                  rows={1}
                />
                {/* Floating label - proper brandkit-style behavior */}
                <label 
                  htmlFor={messageInputRef.current?.id}
                  className={cn(
                    "absolute left-3 text-gray-500 duration-300 transform origin-[0] bg-white px-1 pointer-events-none select-none z-10",
                    message.trim()
                      ? "-top-2 text-xs scale-75 text-krushr-primary"
                      : "top-1/2 -translate-y-1/2 text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-75 peer-focus:text-krushr-primary"
                  )}
                >
                  Describe a task...
                </label>
              </div>

              {/* Right action buttons - inside input */}
              <div className="flex items-center pr-3 space-x-1">
                {/* Voice button */}
                <Button
                  type="button"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessingVoice || isLoading}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-colors p-0",
                    isRecording 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  )}
                  title={isRecording ? "Stop recording" : "Start voice recording"}
                >
                  {isProcessingVoice ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-gray-400 border-t-transparent border-2"></div>
                  ) : isRecording ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                
                {/* Send button - prominent */}
                <Button
                  type="submit"
                  size="sm"
                  disabled={isRecording || isProcessingVoice || (!message.trim() && attachedFiles.length === 0)}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all p-0",
                    (!message.trim() && attachedFiles.length === 0)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-krushr-primary text-white hover:bg-krushr-primary/90 shadow-sm hover:shadow"
                  )}
                  title="Send message"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-white border-t-transparent border-2"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx,.json,.md"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}