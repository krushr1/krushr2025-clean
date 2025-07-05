import React from 'react'
import { CUSTOMIZATION_CONTENT } from '../content/customizationContent'
import { DirectMessagesSection } from './DirectMessagesSection'

// Reusable components following established patterns
const CustomizationFeaturesList: React.FC = () => (
  <div className="w-clearfix">
    <div className="grid-1-column gap-row-32px">
      {CUSTOMIZATION_CONTENT.features.map((feature, index) => (
        <div key={index} className="flex align-top">
          <img 
            src="images/LightRedCircleDarkCheck.svg" 
            loading="eager" 
            alt="Feature checkmark" 
            className="mg-right-24px" 
          />
          <div>
            <h3 className="heading-h4-size-copy-copy mg-bottom-8px-copy combo-bullet">
              {feature.title}
            </h3>
            <p className="mg-bottom-0-copy-copy mg-bottom-0-dark">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const CustomizationImage: React.FC = () => {
  const { image } = CUSTOMIZATION_CONTENT
  
  return (
    <div className="inner-container _634px width-100">
      <img 
        src={image.src}
        loading="eager" 
        sizes={image.sizes}
        srcSet={image.srcSet}
        alt={image.alt}
        className={image.className}
      />
    </div>
  )
}

/**
 * Customization Section Component
 * Showcases layout customization capabilities with 3 key features
 * Also includes the DirectMessagesSection within the same container
 * Uses a unique container structure that differs from standard sections
 */
export const CustomizationSection: React.FC = () => {
  return (
    <div className="container-light-contrast reduce-btm-margin w-container">
      <div className="inner-container _608px-tablet center">
        <h2 className="display-3-copy mg-bottom-32px-copy display-3-smaller-copy">
          {CUSTOMIZATION_CONTENT.title}
        </h2>
        <div className="mg-bottom-174px">
          <div className="grid-2-columns _1fr---1-2fr gap-row-64px">
            <div>
              <CustomizationFeaturesList />
            </div>
            <CustomizationImage />
          </div>
        </div>
      </div>
      <DirectMessagesSection />
    </div>
  )
}