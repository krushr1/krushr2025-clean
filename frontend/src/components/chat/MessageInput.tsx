import React from 'react'
import { Send } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MessageInputProps {
  message: string
  onChange: (message: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement>
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  onChange,
  onSend,
  onKeyPress,
  inputRef
}) => {
  return (
    <div className="flex-shrink-0 p-4 pt-3 border-t border-krushr-gray-200">
      {/* Match AI assistant chat box styling exactly */}
      <div className="relative flex items-center bg-white border border-gray-300 rounded-3xl shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-krushr-primary h-[60px]">
        {/* Main input area */}
        <div className="flex-1 min-w-0 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder=""
            className="w-full min-h-[46px] h-[46px] text-sm resize-none border-0 bg-transparent focus:ring-0 focus:outline-none px-3 py-3 placeholder-transparent peer leading-relaxed font-manrope"
          />
          {/* Floating label */}
          <label className={cn(
            "absolute left-3 text-gray-500 duration-300 transform origin-[0] bg-white px-1 pointer-events-none select-none z-10",
            message.trim()
              ? "-top-2 text-xs scale-75 text-krushr-primary"
              : "top-1/2 -translate-y-1/2 text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-75 peer-focus:text-krushr-primary"
          )}>
            Type a message...
          </label>
        </div>
        
        {/* Send button - inside input */}
        <div className="flex items-center pr-3">
          <button 
            onClick={onSend}
            disabled={!message.trim()}
            className="h-8 w-8 rounded-full flex items-center justify-center transition-all p-0 bg-krushr-primary text-white hover:bg-krushr-primary/90 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}