import React from 'react'
import { SectionLayoutWithGrid } from '../layout/SectionLayout'
import { SectionHeader } from '../layout/SectionHeader'
import { SectionBody } from '../layout/SectionBody'
import { EnhancedImageGallery } from '../shared/EnhancedImageGallery'
import { AI_CONTENT } from '../content/aiContent'

const aiSectionData = {
  title: AI_CONTENT.title,
  description: AI_CONTENT.description,
  features: AI_CONTENT.features,
  stats: AI_CONTENT.stats,
  buttons: AI_CONTENT.buttons
}

const aiImages = [
  AI_CONTENT.images.emailSection,
  AI_CONTENT.images.chatGPT
]

export const AISection: React.FC = () => {
  const leftContent = (
    <>
      <SectionHeader 
        title={aiSectionData.title}
        description={aiSectionData.description}
        variant="ai"
      />
      <SectionBody 
        features={aiSectionData.features}
        stats={aiSectionData.stats}
        buttons={aiSectionData.buttons}
        variant="ai"
      />
    </>
  )
  
  const rightContent = (
    <EnhancedImageGallery
      images={aiImages}
      layout="stacked"
      variant="ai"
    />
  )
  
  return (
    <SectionLayoutWithGrid
      variant="ai"
      leftContent={leftContent}
      rightContent={rightContent}
    />
  )
}