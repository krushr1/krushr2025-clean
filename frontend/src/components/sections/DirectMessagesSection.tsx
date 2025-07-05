import React from 'react'
import { ButtonGroup } from '../shared/ButtonGroup'
import { DIRECT_MESSAGES_CONTENT } from '../content/directMessagesContent'

// Reusable components following established patterns
const DirectMessagesFeaturesList: React.FC = () => (
  <div className="w-clearfix">
    <div className="grid-1-column gap-row-32px">
      {DIRECT_MESSAGES_CONTENT.features.map((feature, index) => (
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
      <div className="buttons-row-copy mg-bottom-80px mg-bottom-48px-tablet">
        <ButtonGroup
          primaryButton={DIRECT_MESSAGES_CONTENT.buttons.primary}
          secondaryButton={DIRECT_MESSAGES_CONTENT.buttons.secondary}
        />
      </div>
    </div>
  </div>
)

const DirectMessagesImage: React.FC = () => {
  const { image } = DIRECT_MESSAGES_CONTENT
  
  return (
    <div className="inner-container _634px width-100">
      <div className="inner-container _634px width-100">
        <img 
          src={image.src}
          loading="eager" 
          alt={image.alt}
          className={image.className}
        />
      </div>
    </div>
  )
}

/**
 * Direct Messages Section Component
 * Showcases direct messaging and chat capabilities
 * Uses the same container structure as customization section
 */
export const DirectMessagesSection: React.FC = () => {
  return (
    <div className="grid-2-columns _1fr---1-2fr gap-row-64px box-2">
      <div>
        <h2 className="display-3-copy mg-bottom-32px-copy display-3-smaller-copy">
          {DIRECT_MESSAGES_CONTENT.title}
        </h2>
        <DirectMessagesFeaturesList />
      </div>
      <DirectMessagesImage />
    </div>
  )
}