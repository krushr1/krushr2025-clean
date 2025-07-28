import React from 'react'
import { cn } from '../../lib/utils'

interface KeyboardHintProps {
  keys: string[]
  className?: string
  show?: boolean
}

export function KeyboardHint({ keys, className, show = true }: KeyboardHintProps) {
  if (!show) return null

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const renderKey = (key: string) => {
    // Replace modifier symbols based on platform
    if (key === '⌘' && !isMac) return 'Ctrl'
    if (key === 'Ctrl' && isMac) return '⌘'
    return key
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-0.5 ml-2",
      className
    )}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="min-w-[20px] h-5 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100/80 border border-gray-200/50 rounded flex items-center justify-center shadow-sm">
            {renderKey(key)}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-[10px] text-gray-400 mx-0.5">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Tooltip component for hover hints
interface KeyboardTooltipProps {
  children: React.ReactNode
  keys: string[]
  description?: string
}

export function KeyboardTooltip({ children, keys, description }: KeyboardTooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true)
    }, 500) // Show after 500ms hover
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowTooltip(false)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative inline-flex" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
          <div className="bg-gray-900 text-white px-2 py-1.5 rounded-md shadow-lg text-xs whitespace-nowrap">
            <div className="flex items-center gap-2">
              {description && <span>{description}</span>}
              <KeyboardHint keys={keys} className="ml-0" />
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}