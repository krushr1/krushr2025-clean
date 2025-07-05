import React from 'react'
import { FeatureItem } from './FeatureItem'
import { EnhancedFeaturesListProps, FEATURE_LIST_CONFIGS } from '../types/sectionTypes'

/**
 * Enhanced Features List Component
 * Unified component for displaying feature lists across all sections
 * Supports multiple variants while maintaining pixel-perfect appearance
 */
export const EnhancedFeaturesList: React.FC<EnhancedFeaturesListProps> = ({ 
  features, 
  variant, 
  className = '' 
}) => {
  const containerClass = FEATURE_LIST_CONFIGS[variant]
  
  // Handle nested structure for certain variants
  if (variant === 'nested') {
    return (
      <div className={`grid-1-column-list gap-row-32px-copy ${className}`}>
        <div className={containerClass}>
          {features.map((feature, index) => (
            <FeatureItem 
              key={index} 
              text={feature} 
              className="heading-h4-size mg-bottom-8px"
            />
          ))}
        </div>
      </div>
    )
  }
  
  // Standard layout for most variants
  return (
    <div className={`${containerClass} ${className}`}>
      {features.map((feature, index) => (
        <FeatureItem 
          key={index} 
          text={feature} 
          className="heading-h4-size mg-bottom-8px"
        />
      ))}
    </div>
  )
}