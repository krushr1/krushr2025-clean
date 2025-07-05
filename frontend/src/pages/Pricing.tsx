import React from 'react';
import { Check, ArrowRight, Shield, Calendar, Zap } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      description: 'Ideal for individuals, or a quick test drive',
      price: '$0',
      period: 'mo',
      features: [
        'Unlimited customizable panels',
        'Basic ChatGPT integration',
        'Google & Outlook calendars',
        'Up to 3 workspaces',
        'Basic task management'
      ],
      buttonText: 'Start Free',
      buttonClass: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      popular: false
    },
    {
      name: 'Lite',
      description: 'Put your full productivity stack on one page',
      price: '$39',
      originalPrice: '$49',
      period: 'mo',
      savings: 'Save $10/mo',
      features: [
        '250 Automations/month',
        '1 Connected email & calendar account',
        'Unlimited panels',
        'Customizable layout',
        'Unlimited contacts',
        'Unlimited teams'
      ],
      buttonText: 'Start Now',
      buttonClass: 'bg-figma-secondary text-white hover:bg-red-600',
      popular: false
    },
    {
      name: 'Full Suite',
      description: "Everything + your tailored o1 model, OpenAI's most advanced model",
      price: '$49',
      originalPrice: '$99',
      period: 'mo',
      savings: 'Save $50/mo',
      features: [
        'ChatGPT o1 precise user style model',
        '750 Automations/month',
        '2 Connected email & calendar accounts',
        'Unlimited panels',
        'Customizable layout',
        'Unlimited contacts',
        'Unlimited teams',
        '40% beta discount (through 2025)'
      ],
      buttonText: 'Start Now',
      buttonClass: 'bg-figma-primary text-white hover:bg-blue-800',
      popular: true
    }
  ];

  const valueProps = [
    {
      icon: Zap,
      title: 'Latest AI Technology',
      description: "Powered by OpenAI's most advanced o1 model, delivering human-like reasoning for your workflows."
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SOC 2 compliance, and complete data privacy. Your information stays yours.'
    },
    {
      icon: Calendar,
      title: 'Massive Time Savings',
      description: 'Save 15+ hours per week by consolidating all your work tools into one intelligent workspace.'
    }
  ];

  const faqs = [
    {
      question: 'Can I upgrade or downgrade anytime?',
      answer: 'Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at your next billing cycle.'
    },
    {
      question: "What's included in the free trial?",
      answer: 'The Free plan is completely free forever. The Full Suite plan includes a 14-day free trial with full access to all premium features.'
    },
    {
      question: 'How does the early bird pricing work?',
      answer: 'The Full Suite includes a special beta discount. This pricing is designed to provide maximum value as we continue to enhance our AI capabilities.'
    },
    {
      question: 'Do you offer refunds?',
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-manrope">
      {/* Hero Section */}
      <div className="bg-figma-gray-bg-light py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-figma-primary font-medium mb-4">2025 Pricing</p>
            <h1 className="text-5xl font-bold text-figma-black mb-6">
              Choose Your AI Productivity Plan
            </h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-figma-gray mb-0">
                Start free and upgrade when you're ready to unlock the full power of AI-driven productivity. 
                No hidden fees, cancel anytime.
              </p>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                    plan.popular ? 'ring-2 ring-figma-primary transform scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-figma-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-figma-black mb-2">{plan.name}</h3>
                    <p className="text-figma-gray">{plan.description}</p>
                  </div>

                  <div className="border-t border-figma-gray-border pt-6 mb-6">
                    <div className="flex flex-col mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start mb-3">
                          <Check className="w-5 h-5 text-figma-success mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-figma-gray-dark font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-figma-black">{plan.price}</span>
                      <span className="text-figma-gray ml-1">/{plan.period}</span>
                      {plan.originalPrice && (
                        <span className="text-figma-gray ml-2 line-through text-lg">
                          {plan.originalPrice}/mo
                        </span>
                      )}
                    </div>
                    {plan.savings && (
                      <p className="text-figma-success font-semibold mt-1">{plan.savings}</p>
                    )}
                  </div>

                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${plan.buttonClass}`}
                    onClick={() => window.open('https://task.krushr.io/auth/register', '_blank')}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-figma-black mb-8">Why Choose Krushr in 2025?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {valueProps.map((prop, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                  <prop.icon className="w-12 h-12 text-figma-primary mb-6" />
                  <h3 className="text-xl font-bold text-figma-black mb-4">{prop.title}</h3>
                  <p className="text-figma-gray">{prop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-figma-gray-bg-light py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-figma-black">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-figma-black mb-3">{faq.question}</h3>
                <p className="text-figma-gray">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div 
              className="bg-gradient-to-br from-figma-primary to-figma-purple rounded-2xl p-16 text-white"
            >
              <h2 className="text-4xl font-bold mb-6">Ready to 10x Your Productivity?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of professionals who've already transformed their workflow with Krushr's AI-powered platform.
              </p>
              <button
                className="bg-white text-figma-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center"
                onClick={() => window.open('https://task.krushr.io/auth/register', '_blank')}
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;