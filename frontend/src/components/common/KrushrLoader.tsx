
import React from 'react'
import { cn } from '../../lib/utils'
import KrushrLogo from './KrushrLogo'

interface KrushrLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function KrushrLoader({ 
  size = 'md', 
  text = 'Loading...', 
  className 
}: KrushrLoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20', 
    lg: 'w-24 h-24'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* Animated Logo */}
      <div className={cn(
        "relative",
        sizeClasses[size]
      )}>
        {/* Spinning Ring */}
        <div className="absolute inset-0 border-4 border-muted rounded-full border-t-primary animate-spin"></div>
        
        {/* Logo in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-bold text-blue-600 text-sm">
            K
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <div className={cn(
        "text-muted-foreground font-medium",
        textSizeClasses[size]
      )}>
        {text}
      </div>
    </div>
  )
}