import React from 'react'
import { Button } from './Button'

interface ButtonConfig {
  text: string
  href: string
  dataWId?: string
  ariaLabel?: string
}

interface ButtonGroupProps {
  primaryButton: ButtonConfig
  secondaryButton: ButtonConfig
  className?: string
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  primaryButton,
  secondaryButton,
  className = "buttons-row mg-bottom-80px mg-bottom-48px-tablet"
}) => {
  return (
    <div className={className}>
      <Button
        variant="primary"
        href={primaryButton.href}
        dataWId={primaryButton.dataWId}
        ariaLabel={primaryButton.ariaLabel}
        icon={
          <span 
            className="line-rounded-icon link-icon-right" 
            style={{
              transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            →
          </span>
        }
      >
        {primaryButton.text}
      </Button>
      
      <Button
        variant="secondary"
        href={secondaryButton.href}
        ariaLabel={secondaryButton.ariaLabel}
      >
        {secondaryButton.text}
      </Button>
    </div>
  )
}