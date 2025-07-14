import React from 'react'

interface FeatureItemProps {
  text: string
  className?: string
}

export const FeatureItem: React.FC<FeatureItemProps> = ({ 
  text, 
  className = "heading-h4-size mg-bottom-8px" 
}) => {
  return (
    <div className="flex align-top">
      <img 
        src="images/LightRedCircleDarkCheck.svg" 
        loading="eager" 
        alt="Feature checkmark" 
        className="mg-right-24px" 
      />
      <div>
        <h3 className={className}>{text}</h3>
      </div>
    </div>
  )
}