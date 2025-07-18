import React from 'react'
import { SectionLayoutWithGrid } from '../layout/SectionLayout'
import { SectionHeader } from '../layout/SectionHeader'
import { SectionBody } from '../layout/SectionBody'
import { EnhancedImageGallery } from '../shared/EnhancedImageGallery'
import { SUPERFORM_CONTENT } from '../content/superformContent'

const superformSectionData = {
  title: SUPERFORM_CONTENT.title,
  subtitle: SUPERFORM_CONTENT.subtitle,
  description: SUPERFORM_CONTENT.description,
  features: SUPERFORM_CONTENT.features,
  buttons: SUPERFORM_CONTENT.buttons
}

const superformImages = [
  SUPERFORM_CONTENT.images.kanbanBoard,
  SUPERFORM_CONTENT.images.formInterface
]

export const SuperformSection: React.FC = () => {
  const leftContent = (
    <>
      <SectionHeader 
        title={superformSectionData.title}
        subtitle={superformSectionData.subtitle}
        description={superformSectionData.description}
        variant="superform"
      />
      <SectionBody 
        features={superformSectionData.features}
        buttons={superformSectionData.buttons}
        variant="superform"
      />
    </>
  )
  
  const rightContent = (
    <EnhancedImageGallery
      images={superformImages}
      layout="stacked"
      variant="superform"
    />
  )
  
  return (
    <SectionLayoutWithGrid
      variant="superform"
      leftContent={leftContent}
      rightContent={rightContent}
    />
  )
}