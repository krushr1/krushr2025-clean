import React from 'react'
import { EnhancedImageGalleryProps, ImageConfig } from '../types/sectionTypes'

export const EnhancedImageGallery: React.FC<EnhancedImageGalleryProps> = ({
  images,
  layout,
  variant,
  containerClassName = ''
}) => {
  const getContainerClass = () => {
    switch (variant) {
      case 'hero':
        return '_3-graph-cards---container-right'
      case 'features':
        return '_3-graph-cards---container-right rmv-right-margin top-margin'
      case 'ai':
        return '_3-graph-cards---container-right rmv-right-margin top-margin'
      case 'superform':
        return '_3-graph-cards---container-right no-left-margin'
      case 'communication':
        return '_3-graph-cards---container-right rmv-right-margin top-margin'
      default:
        return '_3-graph-cards---container-right'
    }
  }

  const getInnerContainerClass = () => {
    switch (variant) {
      case 'hero':
        return '_634px width-100'
      case 'features':
        return 'inner-container _634px width-100'
      case 'ai':
        return 'inner-container _634px width-100 _2-card-gpt'
      case 'superform':
        return '_3-graph-cards---container-right-copy rmv-right-margin top-margin'
      case 'communication':
        return '' // No inner container for communication
      default:
        return 'inner-container _634px width-100'
    }
  }

  const containerClass = getContainerClass()
  const innerContainerClass = getInnerContainerClass()

  const renderImages = (imageConfigs: ImageConfig[]) => {
    return imageConfigs.map((image, index) => (
      <img
        key={index}
        src={image.src}
        loading="lazy"
        sizes={image.sizes}
        srcSet={image.srcSet}
        alt={image.alt}
        className={image.className}
      />
    ))
  }

  if (variant === 'communication') {
    return (
      <div className={`${containerClass} ${containerClassName}`}>
        {renderImages(images)}
      </div>
    )
  }

  if (variant === 'superform') {
    return (
      <div className={`${containerClass} ${containerClassName}`}>
        <div className={innerContainerClass}>
          {renderImages(images)}
        </div>
      </div>
    )
  }

  return (
    <div className={`${containerClass} ${containerClassName}`}>
      <div className={innerContainerClass}>
        {renderImages(images)}
      </div>
    </div>
  )
}