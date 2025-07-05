import React from 'react'
import { LAYOUT_BUILDER_CONTENT } from '../content/layoutBuilderContent'

/**
 * Layout Builder Section Component
 * Simple header section introducing the layout building capabilities
 * Uses a unique structure that doesn't fit the standard layout patterns
 */
export const LayoutBuilderSection: React.FC = () => {
  return (
    <div id="section" className="section-copy bg-neutral-200">
      <div className="container-default-prev position-relative---z-index-1 no-btm-margin w-container">
        <div className="inner-container _540px-mbl center">
          <div className="grid-2-columns-copy _1-5fr---1fr mg-bottom-40px">
            <div>
              <h2 className="title-h2">{LAYOUT_BUILDER_CONTENT.title}</h2>
              <h2 className="heading">{LAYOUT_BUILDER_CONTENT.heading}</h2>
              <p className="mg-bottom-0-dark">{LAYOUT_BUILDER_CONTENT.description}</p>
            </div>
            <div>
              <a 
                href={LAYOUT_BUILDER_CONTENT.button.href} 
                className="btn-secondary w-button"
                aria-label={LAYOUT_BUILDER_CONTENT.button.ariaLabel}
              >
                {LAYOUT_BUILDER_CONTENT.button.text}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="section bg-coral"></div>
      <div className="section bg-coral"></div>
    </div>
  )
}