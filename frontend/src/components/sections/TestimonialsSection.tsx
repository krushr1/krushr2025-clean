import React from 'react'
import { TESTIMONIALS_CONTENT } from '../content/testimonialsContent'
import { PricingSection } from './PricingSection'

/**
 * Testimonials Section Component
 * Displays customer testimonials in a slider format
 * Includes pricing section as part of the same container
 * Pixel-perfect recreation of the original HTML structure
 */
export const TestimonialsSection: React.FC = () => {
  return (
    <div 
      data-w-id="9f0b8505-99cb-9825-916c-c3e9dff5471c" 
      style={{opacity: 1}} 
      className="section overflow-hidden"
    >
      <div className="container-default-prev btm-pad w-container">
        <div 
          data-w-id="9f0b8505-99cb-9825-916c-c3e9dff5471e" 
          style={{
            WebkitTransform: 'translate3d(0, 0%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
            MozTransform: 'translate3d(0, 0%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
            msTransform: 'translate3d(0, 0%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
            transform: 'translate3d(0, 0%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
            opacity: 1
          }}
          className="text-center mg-bottom-56px"
        >
          <div className="inner-container _780px center">
            <div className="display-3">{TESTIMONIALS_CONTENT.title}</div>
            <h2 className="display-3 mg-bottom-0 red-subhead">
              {TESTIMONIALS_CONTENT.subtitle}
            </h2>
          </div>
        </div>
        <div 
          data-delay="4000" 
          data-animation="slide" 
          className="slider-wrapper mg-bottom-56px w-slider" 
          data-autoplay="false" 
          data-easing="ease" 
          style={{opacity: 1}}
          data-hide-arrows="false" 
          data-disable-swipe="false" 
          data-w-id="9f0b8505-99cb-9825-916c-c3e9dff54724"
          data-autoplay-limit="0" 
          data-nav-spacing="3" 
          data-duration="500" 
          data-infinite="true"
        >
          <div className="slider-mask w-slider-mask">
            {TESTIMONIALS_CONTENT.testimonials.map((testimonial, index) => (
              <div key={index} className="slide-item-mg w-slide">
                <div className="w-dyn-list">
                  <div role="list" className="w-dyn-items">
                    <div role="listitem" className="w-dyn-item">
                      <div className="card testimonial-slider-card-small">
                        <img 
                          src={testimonial.background} 
                          loading="eager" 
                          alt="" 
                          className="testimonials-slider-card---bg-banner" 
                        />
                        <img 
                          src={testimonial.avatar} 
                          loading="eager" 
                          alt={testimonial.altText} 
                          className="testimonials-slider-card---avatar" 
                        />
                        <div className="testimonials-slider-card---name-and-stars-container">
                          <div className="text-300 bold color-neutral-800">
                            {testimonial.quote}
                          </div>
                          <img 
                            src="images/five-stars-techcloud-webflow-ecommerce-template.svg" 
                            loading="eager" 
                            alt="" 
                          />
                        </div>
                        <div className="text-200 medium">
                          {testimonial.role}
                        </div>
                        <div className="text-200 medium color-neutral-600">
                          {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="btn-circle-secondary slider-button-middle-left w-slider-arrow-left">
            <div className="line-rounded-icon"></div>
          </div>
          <div className="btn-circle-primary slider-button-middle-right w-slider-arrow-right">
            <div className="line-rounded-icon"></div>
          </div>
          <div className="hidden-on-desktop w-slider-nav w-round"></div>
        </div>

        {/* Pricing Section */}
        <PricingSection />
      </div>
    </div>
  )
}