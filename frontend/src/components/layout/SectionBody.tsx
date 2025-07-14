import React from 'react'
import { EnhancedFeaturesList } from '../shared/EnhancedFeaturesList'
import { ButtonGroup } from '../shared/ButtonGroup'
import { StatsCard } from '../shared/StatsCard'
import { SectionBodyProps } from '../types/sectionTypes'

export const SectionBody: React.FC<SectionBodyProps> = ({ 
  features, 
  stats, 
  buttons, 
  variant 
}) => {
  const getFeatureListVariant = () => {
    switch (variant) {
      case 'hero':
        return 'hero' as const
      case 'ai':
        return 'nested' as const
      case 'superform':
        return 'compact' as const
      default:
        return 'standard' as const
    }
  }

  return (
    <>
      {/* Features List */}
      {features && (
        <EnhancedFeaturesList 
          features={features} 
          variant={getFeatureListVariant()} 
        />
      )}
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid-2-columns _2-col-mbl mg-bottom-48px max-width">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              number={stat.number}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      )}
      
      {/* Buttons */}
      <ButtonGroup
        primaryButton={buttons.primary}
        secondaryButton={buttons.secondary}
      />
    </>
  )
}