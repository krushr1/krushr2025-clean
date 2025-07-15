import React from 'react';

interface FeatureItem {
  text: string;
  highlight?: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  features: FeatureItem[];
  buttonText: string;
  buttonClass: string;
  backgroundImage: string;
  isPopular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Ideal for individuals, or a quick test drive",
    price: "$0/mo",
    features: [
      { text: "Customizable layout", highlight: true },
      { text: "3 Concurrent chat panels", highlight: true },
      { text: "3 Panels (Kanban, Gantt, Notes)", highlight: true },
      { text: "Unlimited contacts", highlight: true },
      { text: "Unlimited teams", highlight: true }
    ],
    buttonText: "Start Now",
    buttonClass: "btn-secondary-free-plan",
    backgroundImage: "images/lindsay-johnson-testimonial-card-bg-techcloud-webflow-ecommerce-template.svg"
  },
  {
    name: "Lite",
    description: "Put your full productivity stack on one page",
    price: "$39/mo",
    originalPrice: "$49/mo",
    savings: "Save $10/mo",
    features: [
      { text: "Core productivity tools", highlight: true },
      { text: "250 Automations/month", highlight: true },
      { text: "1 Connected email & calendar account", highlight: true },
      { text: "Unlimited panels", highlight: true },
      { text: "Customizable layout" },
      { text: "Unlimited contacts" },
      { text: "Unlimited teams" }
    ],
    buttonText: "Start Now",
    buttonClass: "btn-secondary-essentials-plan",
    backgroundImage: "images/john-carter-testimonial-card-bg-techcloud-webflow-ecommerce-template.svg",
    isPopular: true
  },
  {
    name: "Full Suite",
    description: "Everything + your tailored o1 model, OpenAI's most advanced model",
    price: "$49/mo",
    originalPrice: "$99/mo",
    savings: "Save $50/mo",
    features: [
      { text: "ChatGPT o1 precise user style model", highlight: true },
      { text: "750 Automations/month", highlight: true },
      { text: "2 Connected email & calendar accounts", highlight: true },
      { text: "Unlimited panels", highlight: true },
      { text: "Customizable layout" },
      { text: "Unlimited contacts" },
      { text: "Unlimited teams" },
      { text: "40% beta discount (through 2023)", highlight: true }
    ],
    buttonText: "Start Now",
    buttonClass: "btn-secondary-fully-loaded-plan",
    backgroundImage: "images/sophie-moore-testimonial-card-bg-techcloud-webflow-ecommerce-template.svg"
  }
];

interface PricingCardsProps {
  showTitle?: boolean;
  title?: string;
  subtitle?: string;
}

export const PricingCards: React.FC<PricingCardsProps> = ({ 
  showTitle = false,
  title = "Choose Your Plan",
  subtitle = "Find the perfect plan for your productivity needs"
}) => {
  return (
    <div className="mg-bottom-90px">
      {showTitle && (
        <div className="inner-container _400px-tablet center mg-bottom-60px">
          <h2 className="title-h2 center">{title}</h2>
          {subtitle && <p className="text-200 center color-neutral-600">{subtitle}</p>}
        </div>
      )}
      <div className="inner-container _400px-tablet center">
        <div className="grid-3-columns _1-col-tablet gap-row-48px">
          {pricingTiers.map((tier, index) => (
            <div 
              key={tier.name}
              id={`pricing-card-${index}`}
              data-w-id={`pricing-card-${index}`}
              style={{
                WebkitTransform: "translate3d(0, 10%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                MozTransform: "translate3d(0, 10%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                msTransform: "translate3d(0, 10%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                transform: "translate3d(0, 10%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                opacity: 0
              }}
              className={`mg-top-60px mg-top-0-tablet ${tier.isPopular ? 'middle' : ''}`}
            >
              <div className="card testimonial-slider-card-small krushr-pricing-card">
                <img 
                  src={tier.backgroundImage} 
                  loading="eager" 
                  alt="" 
                  className="testimonials-slider-card---bg-banner" 
                />
                <h2 className="pricing-card-heading">{tier.name}</h2>
                <div className="text-200 medium">{tier.description}</div>
                <div className="divider _24px bg-neutral-300"></div>
                <div className="grid-1-column-3 gap-row-16px mg-bottom-40px">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex align-top">
                      <img 
                        src="images/LightRedCircleDarkCheck.svg" 
                        loading="eager" 
                        alt="" 
                        className="mg-right-16px-2" 
                      />
                      <div className={`text-200 medium color-neutral-800 ${feature.highlight ? 'pricing-gpt-color' : ''}`}>
                        {feature.highlight ? <strong>{feature.text}</strong> : feature.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="display-5 mg-bottom-16px">
                  <span className={tier.originalPrice ? 'text-span-23' : ''}>{tier.price}</span>
                  {tier.originalPrice && (
                    <>
                      {' '}
                      <span className="text-span-14">{tier.originalPrice}</span>
                      <span className="text-span-22"> <strong className="bold-text-11">{tier.savings}</strong></span>
                    </>
                  )}
                </div>
                <a href="#" className={`${tier.buttonClass} w-button`}>
                  {tier.buttonText}
                  <span className="line-rounded-icon link-icon-right"></span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingCards;