
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FloatingInput } from '../ui/floating-input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Hash, 
  Users, 
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Pin,
  Reply,
  Edit,
  Trash2,
  Download,
  ExternalLink
} from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import { useWebSocket } from '../../stores/app-store'
import { formatDateTime } from '../../../../shared/utils'
import { cn } from '../../lib/utils'
import AttachmentUpload from '../common/AttachmentUpload'
import AttachmentList from '../common/AttachmentList'

interface ChatMessage {
  id: string
  content: string
  type: 'text' | 'file' | 'system' | 'task_reference'
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  attachments?: Array<{
    id: string
    filename: string
    size: number
    mimeType: string
    downloadUrl: string
    uploadedAt: string
  }>
  reactions?: Array<{
    emoji: string
    users: string[]
    count: number
  }>
  replyTo?: string
  editedAt?: string
  taskReference?: {
    id: string
    title: string
    status: string
  }
}

interface ChatChannel {
  id: string
  name: string
  type: 'project' | 'team' | 'direct'
  description?: string
  members: number
  isPrivate: boolean
  projectId?: string
}

interface ChatInterfaceProps {
  className?: string
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false)
  
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAppStore()
  const { connected, sendMessage } = useWebSocket()

  const channels: ChatChannel[] = [
    {
      id: 'general',
      name: 'general',
      type: 'team',
      description: 'General team discussion',
      members: 12,
      isPrivate: false
    },
    {
      id: 'project-alpha',
      name: 'project-alpha',
      type: 'project',
      description: 'Alpha project coordination',
      members: 5,
      isPrivate: false,
      projectId: 'alpha-123'
    },
    {
      id: 'design-team',
      name: 'design-team',
      type: 'team',
      description: 'Design team collaboration',
      members: 4,
      isPrivate: false
    }
  ]

  const messages: ChatMessage[] = [
    {
      id: '1',
      content: 'Hey team! Just finished the design mockups for the new dashboard',
      type: 'text',
      sender: { id: '1', name: 'Sarah Chen', avatar: '' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      reactions: [
        { emoji: '👍', users: ['2', '3'], count: 2 },
        { emoji: '🎉', users: ['4'], count: 1 }
      ]
    },
    {
      id: '2',
      content: 'Awesome work! Could you share the files?',
      type: 'text',
      sender: { id: '2', name: 'Mike Johnson', avatar: '' },
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      replyTo: '1'
    },
    {
      id: '3',
      content: 'dashboard-mockups-v2.fig',
      type: 'file',
      sender: { id: '1', name: 'Sarah Chen', avatar: '' },
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      attachments: [
        {
          id: 'file-1',
          name: 'dashboard-mockups-v2.fig',
          size: 2458000,
          type: 'application/figma',
          url: '#'
        }
      ]
    },
    {
      id: '4',
      content: 'I\'ve updated the API documentation task with the new endpoints',
      type: 'task_reference',
      sender: { id: '3', name: 'Emma Davis', avatar: '' },
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      taskReference: {
        id: 'task-123',
        title: 'Update API Documentation',
        status: 'in_progress'
      }
    }
  ]

  const currentChannel = channels.find(c => c.id === selectedChannel) || channels[0]

  useEffect(() => {
    if (!selectedChannel && channels.length > 0) {
      setSelectedChannel(channels[0].id)
    }
  }, [selectedChannel, channels])

  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.closest('[data-radix-scroll-area-viewport]')
    if (scrollContainer && messagesEndRef.current) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || !connected) return

    const newMessage = {
      content: message,
      channelId: selectedChannel,
      replyTo: replyingTo,
      timestamp: new Date().toISOString()
    }

    sendMessage('chat-message', newMessage)
    setMessage('')
    setReplyingTo(null)
  }

  const handleFileUpload = () => {
    setShowAttachmentUpload(!showAttachmentUpload)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const addReaction = (messageId: string, emoji: string) => {
    // TODO: Send reaction to backend
    console.log('Adding reaction:', messageId, emoji)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getChannelIcon = (type: ChatChannel['type']) => {
    switch (type) {
      case 'project':
        return <Hash className="w-4 h-4" />
      case 'team':
        return <Users className="w-4 h-4" />
      case 'direct':
        return <Avatar className="w-4 h-4" />
      default:
        return <Hash className="w-4 h-4" />
    }
  }

  return (
    <div className={cn('h-full flex bg-white', className)}>
      {/* Sidebar - Channels */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Channels</h2>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8"
              />
            </div>
          </div>
        </div>

        {/* Channels List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {channels
              .filter(channel => 
                channel.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel === channel.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setSelectedChannel(channel.id)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    {getChannelIcon(channel.type)}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">#{channel.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {channel.members} members
                      </div>
                    </div>
                    {channel.isPrivate && (
                      <Badge variant="outline" className="text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getChannelIcon(currentChannel.type)}
              <div>
                <h3 className="font-semibold text-gray-900">#{currentChannel.name}</h3>
                <p className="text-sm text-gray-500">{currentChannel.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-700 border-green-200">
                {connected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="group">
                {msg.replyTo && (
                  <div className="ml-12 mb-1 text-xs text-gray-500 flex items-center space-x-1">
                    <Reply className="w-3 h-3" />
                    <span>Replying to previous message</span>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.sender.avatar} />
                    <AvatarFallback className="text-xs">
                      {msg.sender.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {msg.sender.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(msg.timestamp)}
                      </span>
                      {msg.editedAt && (
                        <Badge variant="outline" className="text-xs">
                          edited
                        </Badge>
                      )}
                    </div>

                    {/* Message Content */}
                    {msg.type === 'text' && (
                      <p className="text-sm text-gray-900">{msg.content}</p>
                    )}

                    {/* Show attachments for any message type */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2">
                        <AttachmentList
                          attachments={msg.attachments}
                          compact={true}
                          canDelete={false}
                        />
                      </div>
                    )}

                    {msg.type === 'task_reference' && msg.taskReference && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            Task
                          </Badge>
                          <span className="font-medium text-sm">{msg.taskReference.title}</span>
                          <Badge 
                            variant="outline"
                            className={cn(
                              'text-xs',
                              msg.taskReference.status === 'completed' && 'text-green-700 border-green-300',
                              msg.taskReference.status === 'in_progress' && 'text-blue-700 border-blue-300',
                              msg.taskReference.status === 'todo' && 'text-gray-700 border-gray-300'
                            )}
                          >
                            {msg.taskReference.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                      </div>
                    )}

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        {msg.reactions.map((reaction, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => addReaction(msg.id, reaction.emoji)}
                          >
                            {reaction.emoji} {reaction.count}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setReplyingTo(msg.id)}
                    >
                      <Reply className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Pin className="w-3 h-3" />
                    </Button>
                    {msg.sender.id === user?.id && (
                      <>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          {replyingTo && (
            <div className="mb-2 p-2 bg-gray-50 rounded text-sm text-gray-600 flex items-center justify-between">
              <span>Replying to message...</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setReplyingTo(null)}
              >
                ×
              </Button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFileUpload}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 relative">
              <FloatingInput
                ref={messageInputRef}
                label={`Message #${currentChannel.name}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!connected}
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !connected}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Attachment Upload Interface */}
          {showAttachmentUpload && currentChannel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Upload Attachments</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAttachmentUpload(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              <AttachmentUpload
                type="chat"
                targetId={currentChannel.id} // This would need to be a message ID in real implementation
                onUploadComplete={(attachments) => {
                  console.log('Chat attachments uploaded:', attachments)
                  setShowAttachmentUpload(false)
                  // TODO: Create message with attachments or add to existing message
                }}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}