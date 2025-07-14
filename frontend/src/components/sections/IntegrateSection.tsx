import React from 'react'
import { INTEGRATE_CONTENT } from '../content/integrateContent'

/**
 * Integrate Section Component
 * Showcases integrations with a slider of integration cards
 * Pixel-perfect recreation of the original HTML structure
 * Note: Contains Webflow dynamic content (w-dyn-list) with empty state
 */
export const IntegrateSection: React.FC = () => {
  const renderSlideItem = (dataWId: string, hasViewIntegration = false) => (
    <div className="slide-item-mg w-slide">
      <div className="w-dyn-list">
        <div role="list" className="w-dyn-items">
          <div role="listitem" className="w-dyn-item">
            <a data-w-id={dataWId} href="#" className="card integrations-slider-link-card w-inline-block">
              <img src="" loading="eager" alt="" className="max-w-70px mg-bottom-24px w-dyn-bind-empty" />
              <h3 className="card-link-title---hover-primary w-dyn-bind-empty"></h3>
              <p className="color-neutral-600 w-dyn-bind-empty"></p>
              {hasViewIntegration && (
                <div className="link-wrapper">
                  <div className="link-text text-200 bold">
                    <span className="color-accent-1">View integration</span>
                  </div>
                  <div className="line-rounded-icon link-icon-right color-accent-1"></div>
                </div>
              )}
              <div className="badge-secondary light integrations-slider-card-badge w-dyn-bind-empty"></div>
            </a>
          </div>
        </div>
        <div className="empty-state w-dyn-empty">
          <div>No items found.</div>
        </div>
      </div>
    </div>
  )

  return (
    <div data-w-id="9f0b8505-99cb-9825-916c-c3e9dff5462f" style={{opacity: 1, display: 'none'}} className="section pd-top-210px overflow-hidden hide">
      <div className="container-default-prev w-container">
        <div className="grid-2-columns _1-5fr---1fr mg-bottom-40px">
          <div id="w-node-_9f0b8505-99cb-9825-916c-c3e9dff54632-e69b16b1" className="inner-container _648px">
            <h2 className="title-h2">{INTEGRATE_CONTENT.title}</h2>
            <h2 className="left-indent-subtitle mg-bottom-0-copy">
              {INTEGRATE_CONTENT.subtitle}
            </h2>
          </div>
          <div 
            id="w-node-_9f0b8505-99cb-9825-916c-c3e9dff54637-e69b16b1" 
            data-w-id="9f0b8505-99cb-9825-916c-c3e9dff54637" 
            style={{
              WebkitTransform: 'translate3d(0, 10%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
              MozTransform: 'translate3d(0, 10%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
              msTransform: 'translate3d(0, 10%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
              transform: 'translate3d(0, 10%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
              opacity: 1
            }}
          >
            <a href={INTEGRATE_CONTENT.button.href} className="btn-secondary w-button">
              {INTEGRATE_CONTENT.button.text}
            </a>
          </div>
        </div>
        <div 
          data-delay="4000" 
          data-animation="slide" 
          className="slider-wrapper mg-bottom-56px w-slider" 
          data-autoplay="false" 
          data-easing="ease" 
          data-hide-arrows="false" 
          data-disable-swipe="false" 
          data-autoplay-limit="0" 
          data-nav-spacing="3" 
          data-duration="500" 
          data-infinite="true"
        >
          <div className="slider-mask width-388px w-slider-mask">
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff54640", false)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff54652", false)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff54664", false)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff54676", false)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff54688", true)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff5469a", true)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff546ac", true)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff546be", true)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff546d0", true)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff546e2", true)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff546f4", true)}
            {renderSlideItem("9f0b8505-99cb-9825-916c-c3e9dff54706", true)}
          </div>
          <div className="btn-circle-secondary slider-button-middle-left w-slider-arrow-left">
            <div className="line-rounded-icon"></div>
          </div>
          <div className="btn-circle-primary slider-button-middle-right w-slider-arrow-right">
            <div className="line-rounded-icon"></div>
          </div>
          <div className="hidden-on-desktop w-slider-nav w-round"></div>
        </div>
      </div>
    </div>
  )
}