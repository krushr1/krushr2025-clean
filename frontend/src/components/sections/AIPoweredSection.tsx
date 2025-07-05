import React from 'react'
import { SectionLayoutWithGrid } from '../layout/SectionLayout'
import { SectionHeader } from '../layout/SectionHeader'
import { SectionBody } from '../layout/SectionBody'
import { EnhancedImageGallery } from '../shared/EnhancedImageGallery'
import { AI_POWERED_CONTENT } from '../content/aiPoweredContent'

// Convert content to new format
const aiPoweredSectionData = {
  title: AI_POWERED_CONTENT.title,
  description: AI_POWERED_CONTENT.description,
  features: AI_POWERED_CONTENT.features,
  stats: AI_POWERED_CONTENT.stats,
  buttons: AI_POWERED_CONTENT.buttons
}

const aiPoweredImages = [
  AI_POWERED_CONTENT.images.aiInterface,
  AI_POWERED_CONTENT.images.aiAssistant
]

/**
 * AI Powered Section Component - Refactored for Modern Architecture
 * Showcases ChatGPT AI capabilities with features and stats
 * Now uses shared layout components for consistency and maintainability
 */
export const AIPoweredSection: React.FC = () => {
  const leftContent = (
    <>
      <SectionHeader 
        title={aiPoweredSectionData.title}
        description={aiPoweredSectionData.description}
        variant="aiPowered"
      />
      <SectionBody 
        features={aiPoweredSectionData.features}
        stats={aiPoweredSectionData.stats}
        buttons={aiPoweredSectionData.buttons}
        variant="aiPowered"
      />
    </>
  )
  
  const rightContent = (
    <EnhancedImageGallery
      images={aiPoweredImages}
      layout="stacked"
      variant="aiPowered"
    />
  )

  return (
    <SectionLayoutWithGrid
      variant="aiPowered"
      leftContent={leftContent}
      rightContent={rightContent}
      className="messages bg-neutral-200 overflow-hidden"
    />
  )
}