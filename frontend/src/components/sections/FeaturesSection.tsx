import React from 'react'
import { FeatureItem } from '../shared/FeatureItem'
import { ButtonGroup } from '../shared/ButtonGroup'
import { ImageGallery } from '../shared/ImageGallery'
import { SectionContainer } from '../shared/SectionContainer'
import { FEATURES_CONTENT } from '../content/featuresContent'

const FeaturesList: React.FC = () => (
  <div className="grid-1-column-2 gap-row-32px">
    {FEATURES_CONTENT.features.map((feature, index) => (
      <FeatureItem 
        key={index} 
        text={feature} 
        className="heading-h4-size mg-bottom-8px"
      />
    ))}
  </div>
)

const FeaturesImages: React.FC = () => {
  const images = [
    FEATURES_CONTENT.images.dualChats,
    FEATURES_CONTENT.images.taskBoard,
    FEATURES_CONTENT.images.taskDetail
  ]
  
  return (
    <ImageGallery 
      images={images}
      containerClassName="_3-graph-cards---container-right rmv-right-margin top-margin"
    />
  )
}

const FeaturesButtons: React.FC = () => (
  <ButtonGroup
    primaryButton={FEATURES_CONTENT.buttons.primary}
    secondaryButton={FEATURES_CONTENT.buttons.secondary}
  />
)

export const FeaturesSection: React.FC = () => {
  return (
    <SectionContainer>
      <div className="inner-details">
        <h2 className="title-h2">{FEATURES_CONTENT.title}</h2>
        <p className="paragraph-18px">{FEATURES_CONTENT.description}</p>
        <FeaturesList />
        <FeaturesButtons />
      </div>
      <FeaturesImages />
    </SectionContainer>
  )
}