
export const FOOTER_CONTENT = {
  logo: {
    src: 'images/krushr-logo-for-dark-pages.svg',
    alt: 'Krushr Logo',
    href: '#'
  },

  newsletter: {
    title: 'Subscribe to our newsletter',
    placeholder: 'Enter your email address',
    buttonText: 'Subscribe',
    successMessage: 'Thanks for joining our newsletter.',
    errorMessage: 'Oops! Something went wrong while submitting the form.'
  },

  navigation: {
    pages: {
      title: 'Pages',
      links: [
        { text: 'Home V1', href: '#' },
        { text: 'Home V2', href: '#' },
        { text: 'Home V3', href: '#' },
        { text: 'About us', href: '#' },
        { text: 'Integrations', href: '#' },
        { text: 'Integrations single', href: 'https://techcloudtemplate.webflow.io/integrations/facebook' },
        { text: 'Pricing', href: '#' },
        { text: 'Pricing single', href: 'https://techcloudtemplate.webflow.io/product/growth' }
      ]
    },
    support: {
      title: 'Support',
      links: [
        { text: 'Help center', href: '#' },
        { text: 'Help center category', href: '#' },
        { text: 'Help center single', href: '#' },
        { text: 'Blog V1', href: '#' },
        { text: 'Blog V2', href: '#' },
        { text: 'Blog V3', href: '#' },
        { text: 'Blog post', href: '#' },
        { text: 'Careers', href: '#' },
        { text: 'Job post', href: '#' },
        { text: 'Features V1', href: '#' },
        { text: 'Features V2', href: '#' },
        { text: 'Features V3', href: '#' },
        { text: 'More Webflow Templates', href: '#' }
      ]
    },
    utility: {
      title: 'Utility pages',
      links: [
        { text: 'Sign in', href: '#' },
        { text: 'Sign up', href: '#' },
        { text: 'Forgot password', href: '#' },
        { text: 'Reset password', href: '#' },
        { text: 'Terms & conditions', href: '#' },
        { text: 'Confirm your email', href: '#' },
        { text: 'Demo', href: '#' },
        { text: 'Landing page', href: '#' },
        { text: 'Contact us', href: '#' }
      ]
    }
  },

  contact: {
    phone: {
      label: 'Phone',
      value: '(482) 504 - 3207'
    },
    email: {
      label: 'Email',
      value: 'contact@techcloud'
    },
    location: {
      label: 'Location',
      value: '1535 Pacific Ave San Francisco, CA'
    }
  },

  copyright: 'Copyright © krushr.io'
} as const

export type FooterContent = typeof FOOTER_CONTENT