import React from 'react'
import { SectionLayoutProps, SectionVariant, LAYOUT_CONFIGS } from '../types/sectionTypes'

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