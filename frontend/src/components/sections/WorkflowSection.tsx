import React from 'react'
import { SectionLayoutWithGrid } from '../layout/SectionLayout'
import { SectionHeader } from '../layout/SectionHeader'
import { SectionBody } from '../layout/SectionBody'
import { EnhancedImageGallery } from '../shared/EnhancedImageGallery'
import { WORKFLOW_CONTENT } from '../content/workflowContent'

const workflowSectionData = {
  title: WORKFLOW_CONTENT.title,
  description: WORKFLOW_CONTENT.description,
  features: WORKFLOW_CONTENT.features,
  stats: WORKFLOW_CONTENT.stats,
  buttons: WORKFLOW_CONTENT.buttons
}

const workflowImages = [
  WORKFLOW_CONTENT.images.dualChats,
  WORKFLOW_CONTENT.images.customMovement,
  WORKFLOW_CONTENT.images.dashboard
]

export const WorkflowSection: React.FC = () => {
  const leftContent = (
    <>
      <SectionHeader 
        title={workflowSectionData.title}
        description={workflowSectionData.description}
        variant="workflow"
      />
      <SectionBody 
        features={workflowSectionData.features}
        stats={workflowSectionData.stats}
        buttons={workflowSectionData.buttons}
        variant="workflow"
      />
    </>
  )
  
  const rightContent = (
    <EnhancedImageGallery
      images={workflowImages}
      layout="stacked"
      variant="workflow"
    />
  )

  return (
    <SectionLayoutWithGrid
      variant="workflow"
      leftContent={leftContent}
      rightContent={rightContent}
      className="tasks bg-neutral-200 overflow-hidden"
    />
  )
}