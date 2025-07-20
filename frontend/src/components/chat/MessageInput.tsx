import React from 'react'
import { Send } from 'lucide-react'
import { FloatingInput } from '../ui/floating-input'

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
    <div className="flex-shrink-0 flex items-center space-x-3 p-4 pt-3 border-t border-krushr-gray-200">
      <div className="flex-1">
        <FloatingInput
          ref={inputRef}
          label="Type a message..."
          value={message}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          className="font-manrope"
        />
      </div>
      <button 
        onClick={onSend}
        disabled={!message.trim()}
        className="bg-krushr-primary text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-krushr-primary-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        title="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}