import React from 'react'
import { SectionLayoutProps, SectionVariant, LAYOUT_CONFIGS } from '../types/sectionTypes'

/**
 * Unified Section Layout Component
 * Provides consistent layout structure across all landing page sections
 * Eliminates code duplication while maintaining pixel-perfect appearance
 */
export const SectionLayout: React.FC<SectionLayoutProps> = ({ 
  variant, 
  children, 
  className = '' 
}) => {
  const config = LAYOUT_CONFIGS[variant]
  
  return (
    <div className={`${config.containerClass} ${className}`}>
      <div className="container-default-prev overflow-yes w-container">
        <div className={config.gridClass}>
          <div className={config.innerClass}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Section Layout with Custom Grid Structure
 * For sections that need the full grid structure exposed
 */
interface SectionLayoutWithGridProps {
  variant: SectionVariant
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  className?: string
}

export const SectionLayoutWithGrid: React.FC<SectionLayoutWithGridProps> = ({ 
  variant, 
  leftContent, 
  rightContent, 
  className = '' 
}) => {
  const config = LAYOUT_CONFIGS[variant]
  
  return (
    <div className={`${config.containerClass} ${className}`}>
      <div className="container-default-prev overflow-yes w-container">
        <div className={config.gridClass}>
          <div className={config.innerClass}>
            {leftContent}
          </div>
          {rightContent}
        </div>
      </div>
    </div>
  )
}