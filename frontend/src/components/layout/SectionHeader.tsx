import React from 'react'
import { SectionHeaderProps } from '../types/sectionTypes'

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  description, 
  variant 
}) => {
  const getLayoutClass = () => {
    switch (variant) {
      case 'hero':
        return 'grid-1-column overflow-visible'
      case 'superform':
        return 'grid-1-column max-width-updated'
      case 'communication':
        return 'grid-1-column max-width-updated'
      default:
        return 'grid-1-column overflow-visible'
    }
  }

  return (
    <div className={getLayoutClass()}>
      <h2 className="title-h2">{title}</h2>
      {subtitle && (
        <div className="subtitle mg-bottom-8px">{subtitle}</div>
      )}
      {description && (
        <p className="mg-bottom-20px">
          {/* Handle line breaks in description */}
          {description.split('<br>').map((part, index, array) => (
            <React.Fragment key={index}>
              {part}
              {index < array.length - 1 && <br />}
            </React.Fragment>
          ))}
          {/* Add extra line break for certain variants */}
          {(variant === 'superform' || variant === 'communication') && <><br /><br /></>}
        </p>
      )}
    </div>
  )
}