import React from 'react'
import { FeatureItem } from '../shared/FeatureItem'
import { ButtonGroup } from '../shared/ButtonGroup'
import { ImageGallery } from '../shared/ImageGallery'
import { EnhancedFeaturesList } from '../shared/EnhancedFeaturesList'
import { HERO_CONTENT } from '../content/heroContent'
import { DESIGN_TOKENS } from '../content/designTokens'

const NoticeBar: React.FC = () => (
  <div className="pricing-template-notice">
    <div className="text-block-6">
      {HERO_CONTENT.notice.icon} <span className="text-span-18">{HERO_CONTENT.notice.highlight}</span> - {HERO_CONTENT.notice.text}
    </div>
  </div>
)

const FeatureList: React.FC = () => (
  <div className="pricing-template-review">
    <div className="grid-1-column-1-copy gap-row-32px-copy">
      {HERO_CONTENT.features.map((feature, index) => (
        <FeatureItem 
          key={index} 
          text={feature} 
          className={`heading-h4-size-copy${index === 0 ? '-copy' : ''} mg-bottom-8px-copy${index === 0 ? '-copy' : ''}`}
        />
      ))}
    </div>
  </div>
)

const HeroImages: React.FC = () => {
  const images = [
    HERO_CONTENT.images.dashboard,
    HERO_CONTENT.images.assistant
  ]
  
  return (
    <ImageGallery 
      images={images}
      containerClassName="mob-3-graph-cards---container-right-2-copy"
    />
  )
}

const ActionButtons: React.FC = () => (
  <ButtonGroup
    primaryButton={HERO_CONTENT.buttons.primary}
    secondaryButton={HERO_CONTENT.buttons.secondary}
  />
)

export const HeroSection: React.FC = () => {
  return (
    <div className="desktop-wrapper-section-with-images">
      <div className="tasks bg-neutral-200 overflow-hidden no-btm-pad">
        <div className="pricing-template-hero">
          <div className="pricing-template-body">
            <div className="pricing-template-heading">
              <NoticeBar />
              <h1 className="title-h2 white font-satoshi">{HERO_CONTENT.title}</h1>
              <FeatureList />
              <HeroImages />
              <ActionButtons />
            </div>
          </div>
          {/* Desktop Images Container */}
          <div className="position-relative---z-index-1 remove-btm-margin">
            <ImageGallery 
              images={[HERO_CONTENT.images.dashboard, HERO_CONTENT.images.assistant]}
              containerClassName="des-3-graph-cards---container-right-2-copy"
            />
          </div>
        </div>
      </div>
    </div>
  )
}