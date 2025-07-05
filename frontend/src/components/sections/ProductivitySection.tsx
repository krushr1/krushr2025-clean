import React from 'react'
import { SectionLayout } from '../layout/SectionLayout'
import { SectionHeader } from '../layout/SectionHeader'
import { SectionBody } from '../layout/SectionBody'
import { PRODUCTIVITY_CONTENT } from '../content/productivityContent'

// Convert content to new format
const productivitySectionData = {
  title: PRODUCTIVITY_CONTENT.title,
  features: PRODUCTIVITY_CONTENT.features,
  buttons: PRODUCTIVITY_CONTENT.buttons
}

// Mobile-focused productivity section with unique layout
const ProductivityImage: React.FC = () => {
  const { image } = PRODUCTIVITY_CONTENT
  
  return (
    <div className="top-section-imgs-right---imgs-container landing mobile">
      <div className="position-relative---z-index-1 remove-btm-margin">
        <img 
          className={image.className}
          src={image.src}
          alt={image.alt}
          sizes={image.sizes}
          srcSet={image.srcSet}
          loading="eager"
        />
      </div>
    </div>
  )
}

const ProductivityContent: React.FC = () => (
  <>
    <SectionHeader 
      title={productivitySectionData.title}
      variant="productivity"
    />
    <SectionBody 
      features={productivitySectionData.features}
      buttons={productivitySectionData.buttons}
      variant="productivity"
    />
    <ProductivityImage />
  </>
)

/**
 * Productivity Section Component - Refactored for Modern Architecture
 * Mobile-focused section showcasing productivity features
 * Now uses shared layout components with custom mobile layout
 */
export const ProductivitySection: React.FC = () => {
  return (
    <SectionLayout 
      variant="productivity"
      className="mobile-wrapper-section-with-images"
    >
      <div className="top-section---images-right remove-btm-margin">
        <div className="container-default-prev position-relative---z-index-1 btm-padding w-container">
          <div className="inner-container _48 _100-tablet width-constraint">
            <ProductivityContent />
          </div>
        </div>
      </div>
    </SectionLayout>
  )
}