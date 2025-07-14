import React from 'react'

interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  gridClassName?: string
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = "unified-form bg-neutral-200 overflow-hidden",
  containerClassName = "container-default-prev w-container",
  gridClassName = "w-layout-grid details-grid"
}) => {
  return (
    <div className={className}>
      <div className={containerClassName}>
        <div className={gridClassName}>
          {children}
        </div>
      </div>
    </div>
  )
}