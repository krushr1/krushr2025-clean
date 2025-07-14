import React from 'react'
import { DESIGN_TOKENS } from './designTokens'

interface ResponsiveImageProps {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  loading?: 'lazy' | 'eager'
  className?: string
  variant?: 'dashboard' | 'assistant'
  priority?: boolean
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  srcSet,
  sizes,
  alt,
  loading = 'lazy',
  className = '',
  variant,
  priority = false
}) => {
  // Performance optimization for above-the-fold images
  const imageLoading = priority ? 'eager' : loading
  
  const variantStyles = {
    dashboard: {
      borderRadius: DESIGN_TOKENS.borderRadius.lg,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    assistant: {
      borderRadius: DESIGN_TOKENS.borderRadius.md,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
  }

  const imageStyle = variant ? variantStyles[variant] : {}

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={imageLoading}
      className={className}
      style={{
        maxWidth: '100%',
        height: 'auto',
        ...imageStyle
      }}
      // Performance hint for browsers
      decoding="async"
      {...(priority && { fetchPriority: 'high' as any })}
    />
  )
}