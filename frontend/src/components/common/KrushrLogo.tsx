/**
 * Krushr Logo Component - Fast loading cached SVG
 */

import React from 'react'
import { cn } from '../../lib/utils'

interface KrushrLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

export default function KrushrLogo({ 
  size = 'md', 
  className, 
  showText = true 
}: KrushrLogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12',
    xl: 'h-16'
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/krushr.svg" 
        alt="Krushr"
        className={cn("object-contain", sizeClasses[size])}
      />
    </div>
  )
}