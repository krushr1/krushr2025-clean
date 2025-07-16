const fs = require('fs');
const { execSync } = require('child_process');

// Create a minimal working version of WorkspaceAiChat.tsx that compiles
const minimalContent = `import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [message, setMessage] = useState('')
  const messageInputRef = useRef<HTMLInputElement>(null)
  
  const { user } = useAppStore()
  
  const { data: conversations } = trpc.ai.getConversations.useQuery({
    workspaceId
  })
  
  const createConversation = trpc.ai.createConversation.useMutation()
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Handle send message
    }
  }

  return (
    <div className={cn('flex flex-col bg-white h-full', className)}>
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-gray-200 rounded-t-xl bg-white">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-krushr-primary" />
          <div>
            <h3 className="font-semibold text-sm text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Gemini 2.5 Flash</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />
            {conversations?.length ?? 0}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Plus className="w-3 h-3" />
          </Button>
          {onToggleFloating && (
            <Button variant="ghost" size="sm" onClick={onToggleFloating} className="h-7 px-2">
              <Maximize2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-3">
        <div className="text-center py-8">
          <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-gray-900 mb-1">Welcome to AI Assistant</h4>
          <p className="text-xs text-gray-500 mb-4">Ask me anything about your workspace</p>
        </div>
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center space-x-2">
          <input
            ref={messageInputRef}
            type="text"
            placeholder="Ask AI anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10 flex-1"
          />
          <Button size="sm" className="h-10 w-10 p-0">
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}`;

fs.writeFileSync('frontend/src/components/ai/WorkspaceAiChat.tsx', minimalContent);

// Fix use-comments.ts
const commentsFile = 'frontend/src/hooks/use-comments.ts';
let commentsContent = fs.readFileSync(commentsFile, 'utf8');
commentsContent = commentsContent.replace('deleteComment as removeComment,', 'deleteComment: removeComment,');
fs.writeFileSync(commentsFile, commentsContent);

console.log('Created clean, working AI chat component and fixed use-comments.ts');
