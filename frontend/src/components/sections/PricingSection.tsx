import React from 'react'
import { PRICING_CONTENT } from '../content/pricingContent'

/**
 * Pricing Section Component
 * Displays pricing plans, social proof logos, and CTA
 * Pixel-perfect recreation of the original HTML structure
 */
export const PricingSection: React.FC = () => {
  const renderPricingCard = (plan: typeof PRICING_CONTENT.plans[0], index: number) => (
    <div 
      id={`w-node-_${plan.nodeId}-e69b16b1`}
      data-w-id={plan.nodeId}
      style={{
        WebkitTransform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
        MozTransform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
        msTransform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
        transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
        opacity: 1
      }}
      className={plan.marginClass}
    >
      <div className="card testimonial-slider-card-small krushr-pricing-card">
        <img 
          src={plan.background}
          loading="eager" 
          alt=""
          className="testimonials-slider-card---bg-banner" 
        />
        <h2 className="pricing-card-heading font-manrope">{plan.name}</h2>
        <div className="text-200 medium font-manrope">{plan.description}</div>
        <div className="divider _24px bg-neutral-300"></div>
        <div className="grid-1-column-3 gap-row-16px mg-bottom-40px">
          {plan.features.map((feature, index) => {
            // Special handling for empty features (first feature in Lite plan)
            if (feature === '') {
              return (
                <div key={index} className="flex align-top">
                  <img src="images/LightRedCircleDarkCheck.svg" loading="eager" alt="" className="mg-right-16px-2" />
                </div>
              )
            }

            // Special styling for certain features
            const isSpecialFeature = feature.includes('ChatGPT o1')
            const isBoldFeature = feature.includes('Automations') || feature.includes('Connected email') || feature.includes('beta discount')

            return (
              <div key={index} className="flex align-top">
                <img src="images/LightRedCircleDarkCheck.svg" loading="eager" alt="" className="mg-right-16px-2" />
                <div>
                  <div className={`text-200 ${isBoldFeature ? 'bold' : 'medium'} font-manrope`}>
                    {isSpecialFeature ? (
                      <>
                        <span className="bold">ChatGPT o1</span>
                        <span className="font-manrope"> preview access</span>
                      </>
                    ) : (
                      feature
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="divider _24px bg-neutral-300"></div>
        <div className="pricing-template-card-pricing">
          <div className="pricing-template-price-final display-3 font-manrope">
            <span>{plan.price}</span>
            <span className="text-500 medium font-manrope color-neutral-600">
              {plan.originalPrice && (
                <div className="text-100 medium font-manrope color-neutral-600">
                  <span className="strikethrough">{plan.originalPrice}</span>
                  {plan.savings && (
                    <span className="mg-left-8px text-success">{plan.savings}</span>
                  )}
                </div>
              )}
            </span>
          </div>
        </div>
        <a href={plan.href} className={`${plan.buttonClass} w-button`}>
          {plan.buttonText}
        </a>
      </div>
    </div>
  )

  return (
    <div 
      data-w-id="9f0b8505-99cb-9825-916c-c3e9dff548b0" 
      style={{opacity: 1}} 
      className="section overflow-hidden"
    >
      <div className="container-default-prev overflow-yes w-container">
        <div className="text-center mg-bottom-56px">
          <div className="inner-container _780px center">
            <div className="display-3">Pick the plan that's right for you</div>
            <h2 className="display-3 mg-bottom-0 red-subhead">
              Get started today
            </h2>
          </div>
        </div>
        <div className="grid-1-column gap-row-32px mg-bottom-80px">
          {PRICING_CONTENT.plans.map((plan, index) => renderPricingCard(plan, index))}
        </div>
        <div className="testimonials-section---logo-list-wrapper">
          <div className="text-center mg-bottom-40px">
            <div className="text-300 bold color-neutral-800">
              Trusted by leading companies
            </div>
          </div>
          <div className="testimonials-logos-list">
            <div className="testimonials-slider-company-logo-wrapper">
              <img 
                src="images/google-logo-light-techcloud-webflow-ecommerce-template.svg" 
                loading="lazy" 
                alt="Google" 
                className="testimonials-slider-company-logo" 
              />
            </div>
            <div className="testimonials-slider-company-logo-wrapper">
              <img 
                src="images/facebook-logo-light-techcloud-webflow-ecommerce-template.svg" 
                loading="lazy" 
                alt="Facebook" 
                className="testimonials-slider-company-logo" 
              />
            </div>
            <div className="testimonials-slider-company-logo-wrapper">
              <img 
                src="images/youtube-logo-light-techcloud-webflow-ecommerce-template.svg" 
                loading="lazy" 
                alt="YouTube" 
                className="testimonials-slider-company-logo" 
              />
            </div>
            <div className="testimonials-slider-company-logo-wrapper">
              <img 
                src="images/pinterest-logo-light-techcloud-webflow-ecommerce-template.svg" 
                loading="lazy" 
                alt="Pinterest" 
                className="testimonials-slider-company-logo" 
              />
            </div>
          </div>
        </div>
        <div 
          data-w-id="9f0b8505-99cb-9825-916c-c3e9dff54a11" 
          style={{opacity: 1}} 
          className="testimonials-section---logo-list-wrapper mg-bottom-0"
        >
          <div 
            className="card pd-40px---32px mg-bottom-40px offer-banner"
            style={{
              WebkitTransform: 'translate3d(0, 20px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
              MozTransform: 'translate3d(0, 20px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
              msTransform: 'translate3d(0, 20px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
              transform: 'translate3d(0, 20px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
              opacity: 1
            }}
          >
            <div className="text-center">
              <div className="text-300 bold color-neutral-800 mg-bottom-16px">
                Limited Time Offer
              </div>
              <div className="text-200 medium color-neutral-600">
                Get started with our Full Suite plan and save 50% for the first year
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}