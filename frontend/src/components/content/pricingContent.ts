/**
 * Pricing Section Content Data
 * Centralized content management for the pricing section
 */

export const PRICING_CONTENT = {
  title: 'Pick the plan that\'s right for you',
  
  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'Ideal for individuals, or a quick test drive',
      price: '$0/mo',
      background: 'images/lindsay-johnson-testimonial-card-bg-techcloud-webflow-ecommerce-template.svg',
      features: [
        'Customizable layout',
        '3 Concurrent chat panels',
        '3 Panels (Kanban, Gantt, Notes)',
        'Unlimited contacts',
        'Unlimited teams'
      ],
      buttonText: 'Start Now',
      buttonClass: 'btn-secondary-free-plan',
      href: '#',
      nodeId: '9f0b8505-99cb-9825-916c-c3e9dff547ce',
      marginClass: 'mg-top-60px mg-top-0-tablet'
    },
    {
      id: 'lite',
      name: 'Lite', 
      description: 'Put your full productivity stack on one page',
      price: '$39/mo',
      background: 'images/john-carter-testimonial-card-bg-techcloud-webflow-ecommerce-template.svg',
      features: [
        '',
        '250 Automations/month',
        '1 Connected email & calendar account',
        'Unlimited panels',
        'Customizable layout',
        'Unlimited contacts',
        'Unlimited teams'
      ],
      buttonText: 'Start Now',
      buttonClass: 'btn-secondary-essentials-plan',
      href: '#',
      nodeId: '9f0b8505-99cb-9825-916c-c3e9dff547ef',
      marginClass: 'mg-top-60px mg-top-0-tablet middle'
    },
    {
      id: 'fullSuite',
      name: 'Full Suite',
      description: 'Everything + your tailored o1 model, OpenAI\'s most advanced model',
      price: '$49/mo',
      originalPrice: '$99/mo',
      savings: '40% beta discount',
      background: 'images/sophie-moore-testimonial-card-bg-techcloud-webflow-ecommerce-template.svg',
      features: [
        'ChatGPT o1 precise user style model',
        '750 Automations/month',
        '2 Connected email & calendar accounts',
        'Unlimited panels',
        'Customizable layout',
        'Unlimited contacts',
        'Unlimited teams',
        '40% beta discount (through 2023)'
      ],
      buttonText: 'Start Now',
      buttonClass: 'btn-secondary-fully-loaded-plan',
      href: '#',
      nodeId: '9f0b8505-99cb-9825-916c-c3e9dff54814',
      marginClass: 'mg-top-60px mg-top-0-tablet'
    }
  ],

  socialProof: [
    {
      src: 'images/google-logo-light-techcloud-webflow-ecommerce-template.svg',
      alt: 'Google - Techcloud X Webflow Template',
      nodeId: '9f0b8505-99cb-9825-916c-c3e9dff548b6'
    },
    {
      src: 'images/facebook-logo-light-techcloud-webflow-ecommerce-template.svg',
      alt: 'Facebook - Techcloud X Webflow Template',
      nodeId: '9f0b8505-99cb-9825-916c-c3e9dff548b7'
    },
    {
      src: 'images/youtube-logo-light-techcloud-webflow-ecommerce-template.svg',
      alt: 'YouTube - Techcloud X Webflow Template',
      nodeId: '9f0b8505-99cb-9825-916c-c3e9dff548b8'
    },
    {
      src: 'images/pinterest-logo-light-techcloud-webflow-ecommerce-template.svg',
      alt: 'Pinterest - Techcloud X Webflow Template',
      nodeId: '9f0b8505-99cb-9825-916c-c3e9dff548b9'
    }
  ],

  cta: {
    buttonText: 'Try It Now',
    href: '/#/workspace',
    nodeId: '9f0b8505-99cb-9825-916c-c3e9dff548bb'
  },

  statistics: {
    title: 'You have to see it to believe it',
    subtitle: 'Experience an instant surge in productivity.',
    metrics: [
      {
        value: '30%',
        plus: true,
        label: 'Click reduction',
        nodeId: '9f0b8505-99cb-9825-916c-c3e9dff548c6',
        valueNodeId: '9f0b8505-99cb-9825-916c-c3e9dff548c7'
      },
      {
        value: '40%',
        plus: true,
        label: 'Output gain',
        nodeId: '9f0b8505-99cb-9825-916c-c3e9dff548cd',
        valueNodeId: '9f0b8505-99cb-9825-916c-c3e9dff548ce'
      },
      {
        value: '0',
        plus: false,
        label: 'App switching',
        nodeId: '9f0b8505-99cb-9825-916c-c3e9dff548d4',
        valueNodeId: '9f0b8505-99cb-9825-916c-c3e9dff548d5'
      }
    ]
  }
} as const

export type PricingContent = typeof PRICING_CONTENT