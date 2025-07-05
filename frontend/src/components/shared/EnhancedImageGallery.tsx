import React from 'react'
import { EnhancedImageGalleryProps, ImageConfig } from '../types/sectionTypes'

/**
 * Enhanced Image Gallery Component
 * Unified component for displaying images across all sections
 * Supports multiple variants and layouts while maintaining pixel-perfect appearance
 */
export const EnhancedImageGallery: React.FC<EnhancedImageGalleryProps> = ({
  images,
  layout,
  variant,
  containerClassName = ''
}) => {
  // Get container class based on variant and layout
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

  // Get inner container class for certain variants
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

  // Render images array
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

  // Handle different layout patterns
  if (variant === 'communication') {
    // Communication section has no inner container
    return (
      <div className={`${containerClass} ${containerClassName}`}>
        {renderImages(images)}
      </div>
    )
  }

  if (variant === 'superform') {
    // Superform has a special nested structure
    return (
      <div className={`${containerClass} ${containerClassName}`}>
        <div className={innerContainerClass}>
          {renderImages(images)}
        </div>
      </div>
    )
  }

  // Standard structure for most variants
  return (
    <div className={`${containerClass} ${containerClassName}`}>
      <div className={innerContainerClass}>
        {renderImages(images)}
      </div>
    </div>
  )
}