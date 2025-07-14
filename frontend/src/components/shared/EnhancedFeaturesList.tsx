import React from 'react'
import { FeatureItem } from './FeatureItem'
import { EnhancedFeaturesListProps, FEATURE_LIST_CONFIGS } from '../types/sectionTypes'

export const EnhancedFeaturesList: React.FC<EnhancedFeaturesListProps> = ({ 
  features, 
  variant, 
  className = '' 
}) => {
  const containerClass = FEATURE_LIST_CONFIGS[variant]
  
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