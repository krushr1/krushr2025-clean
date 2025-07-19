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
              <div className="card testimonial-slider-card-small krushr-pricing-card relative">
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Most Popular
                    </span>
                  </div>
                )}
                <img 
                  src={tier.backgroundImage} 
                  loading="eager" 
                  alt="" 
                  className="testimonials-slider-card---bg-banner" 
                />
                <h2 className="pricing-card-heading text-xl md:text-2xl font-bold tracking-tight">{tier.name}</h2>
                <div className="text-200 medium text-base md:text-lg leading-relaxed color-neutral-600 mg-bottom-24px">{tier.description}</div>
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
                <div className="mg-bottom-24px">
                  <div className="flex items-baseline flex-wrap gap-2 mg-bottom-8px">
                    <span className="display-5 text-3xl md:text-4xl font-bold tracking-tight color-neutral-900">{tier.price}</span>
                    {tier.originalPrice && (
                      <span className="text-span-14 text-lg line-through color-neutral-500 opacity-60">{tier.originalPrice}</span>
                    )}
                  </div>
                  {tier.savings && (
                    <div className="mg-top-8px">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200 inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {tier.savings}
                      </span>
                    </div>
                  )}
                </div>
                <a href="#" className={`${tier.buttonClass} w-button py-4 px-6 text-base md:text-lg font-bold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center justify-center`}>
                  {tier.buttonText}
                  <span className="line-rounded-icon link-icon-right ml-2"></span>
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