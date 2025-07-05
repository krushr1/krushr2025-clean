import React from 'react'
import { SectionLayoutWithGrid } from '../layout/SectionLayout'
import { SectionHeader } from '../layout/SectionHeader'
import { SectionBody } from '../layout/SectionBody'
import { EnhancedImageGallery } from '../shared/EnhancedImageGallery'
import { TEAM_COMMUNICATION_CONTENT } from '../content/teamCommunicationContent'

// Convert content to new format
const teamCommSectionData = {
  title: TEAM_COMMUNICATION_CONTENT.title,
  subtitle: TEAM_COMMUNICATION_CONTENT.subtitle,
  description: TEAM_COMMUNICATION_CONTENT.description,
  buttons: TEAM_COMMUNICATION_CONTENT.buttons
}

const teamCommImages = [
  TEAM_COMMUNICATION_CONTENT.images.contactsView,
  TEAM_COMMUNICATION_CONTENT.images.fullDesktop,
  TEAM_COMMUNICATION_CONTENT.images.meetingInterface
]

/**
 * Team Communication Section Component - Refactored for Reusability
 * Showcases communication and collaboration features
 * Now uses shared layout components for consistency and maintainability
 */
export const TeamCommunicationSection: React.FC = () => {
  const leftContent = (
    <>
      <SectionHeader 
        title={teamCommSectionData.title}
        subtitle={teamCommSectionData.subtitle}
        description={teamCommSectionData.description}
        variant="communication"
      />
      <SectionBody 
        buttons={teamCommSectionData.buttons}
        variant="communication"
      />
    </>
  )
  
  const rightContent = (
    <EnhancedImageGallery
      images={teamCommImages}
      layout="stacked"
      variant="communication"
    />
  )
  
  return (
    <SectionLayoutWithGrid
      variant="communication"
      leftContent={leftContent}
      rightContent={rightContent}
    />
  )
}