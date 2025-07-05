import React from 'react'

interface ImageConfig {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  className: string
}

interface ImageGalleryProps {
  images: ImageConfig[]
  containerClassName: string
}

/**
 * Reusable Image Gallery Component
 * Maintains exact Webflow styling and responsive behavior
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  containerClassName
}) => {
  return (
    <div className={containerClassName}>
      {images.map((image, index) => (
        <img
          key={index}
          src={image.src}
          loading="lazy"
          sizes={image.sizes}
          srcSet={image.srcSet}
          alt={image.alt}
          className={image.className}
        />
      ))}
    </div>
  )
}