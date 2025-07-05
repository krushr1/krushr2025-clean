import React from 'react'
import { Send } from 'lucide-react'

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
      <div className="relative flex-1">
        <input 
          ref={inputRef}
          type="text" 
          id="floating_chat" 
          className="block px-4 pb-2 pt-3 w-full text-sm text-krushr-gray-900 bg-white rounded-lg border border-krushr-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-krushr-primary focus:border-transparent peer font-manrope transition-all duration-200" 
          placeholder=" "
          value={message}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
        />
        <label 
          htmlFor="floating_chat" 
          className="absolute text-sm text-krushr-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-5 font-manrope"
        >
          Type a message...
        </label>
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