import React from 'react'

interface IconProps {
  name: 'arrow-right' | 'check' | 'close' | 'menu'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
}

const iconPaths = {
  'arrow-right': 'M8.25 4.5l4.5 4.5-4.5 4.5',
  'check': 'M4.5 12.75l6 6 9-13.5',
  'close': 'M6 18L18 6M6 6l12 12',
  'menu': 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
} as const

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24
} as const

/**
 * Scalable Icon Component
 * SVG-based icons for consistent, accessible visual elements
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
  style = {}
}) => {
  const iconSize = sizeMap[size]
  const path = iconPaths[name]

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}