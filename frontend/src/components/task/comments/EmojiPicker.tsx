
import React, { useRef, useEffect } from 'react'
import { Button } from '../../ui/button'
import { cn } from '../../../lib/utils'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
  className?: string
}

const EMOJI_CATEGORIES = {
  reactions: ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉'],
  people: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩'],
  objects: ['💡', '❓', '❗', '⭐', '🔥', '💯', '✅', '❌', '⚠️', '🚀', '💼', '📝', '📊', '🎯'],
  nature: ['🌟', '⚡', '🌈', '🌸', '🌺', '🍀', '🌿', '🌱', '🌲', '🌊', '🌙', '☀️', '⭐', '💫']
}

export function EmojiPicker({ onEmojiSelect, onClose, className }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      ref={pickerRef}
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[280px] max-h-[300px] overflow-y-auto",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 font-manrope">Pick an emoji</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          ×
        </Button>
      </div>

      {/* Emoji categories */}
      <div className="space-y-3">
        {/* Quick reactions */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2 font-manrope uppercase tracking-wide">
            Quick Reactions
          </h5>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_CATEGORIES.reactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => onEmojiSelect(emoji)}
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100 rounded"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* People & faces */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2 font-manrope uppercase tracking-wide">
            People & Faces
          </h5>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_CATEGORIES.people.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => onEmojiSelect(emoji)}
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100 rounded"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Objects & symbols */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2 font-manrope uppercase tracking-wide">
            Objects & Symbols
          </h5>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_CATEGORIES.objects.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => onEmojiSelect(emoji)}
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100 rounded"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Nature */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2 font-manrope uppercase tracking-wide">
            Nature
          </h5>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_CATEGORIES.nature.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => onEmojiSelect(emoji)}
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100 rounded"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-manrope">
          Click an emoji to add it to your comment
        </p>
      </div>
    </div>
  )
}